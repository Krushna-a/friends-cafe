const mongoose = require("mongoose");
const dns = require('dns');

async function testDNSResolution(hostname) {
  return new Promise((resolve) => {
    dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
      if (err) {
        console.log(`DNS SRV resolution failed for ${hostname}:`, err.message);
        resolve(null);
      } else {
        console.log(`DNS SRV resolution successful for ${hostname}:`, addresses.length, 'records found');
        addresses.forEach((addr, i) => {
          console.log(`   ${i + 1}. ${addr.name}:${addr.port} (priority: ${addr.priority})`);
        });
        resolve(addresses);
      }
    });
  });
}

function convertSrvToStandard(srvUri, srvRecords) {
  if (!srvRecords || srvRecords.length === 0) return null;
  
  // Extract components from SRV URI
  const match = srvUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/\?]+)\/?(.*)/);
  if (!match) return null;
  
  const [, username, password, , pathAndQuery] = match;
  
  // Build host list from SRV records
  const hosts = srvRecords.map(record => `${record.name}:${record.port}`).join(',');
  
  // Reconstruct as standard URI
  const standardUri = `mongodb://${username}:${password}@${hosts}/${pathAndQuery}`;
  return standardUri.includes('ssl=true') ? standardUri : standardUri + (standardUri.includes('?') ? '&ssl=true' : '?ssl=true');
}

async function connectMongo(uri) {
  if (!uri) throw new Error("MONGO_URI is required");
  
  console.log("Attempting to connect to:", uri);
  
  // If it's an SRV URI, try to resolve and convert to standard format
  if (uri.includes('mongodb+srv://')) {
    const match = uri.match(/mongodb\+srv:\/\/[^@]+@([^\/\?]+)/);
    if (match) {
      const hostname = match[1];
      console.log("Testing DNS resolution for:", hostname);
      const srvRecords = await testDNSResolution(hostname);
      
      if (srvRecords) {
        // Try standard format first
        const standardUri = convertSrvToStandard(uri, srvRecords);
        if (standardUri) {
          console.log("Trying standard connection format...");
          try {
            await mongoose.connect(standardUri, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
              serverSelectionTimeoutMS: 5000,
              socketTimeoutMS: 45000,
              ssl: true,
              authSource: 'admin'
            });
            console.log("MongoDB connection successful with standard format");
            return mongoose;
          } catch (error) {
            console.log("Standard format failed:", error.message);
          }
        }
      }
    }
  }
  
  // Try SRV format with multiple strategies
  const strategies = [
    {
      name: "IPv4 with fast timeout",
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
        retryWrites: true
      }
    },
    {
      name: "Standard with longer timeout",
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true
      }
    }
  ];
  
  for (const strategy of strategies) {
    try {
      console.log(`Trying SRV connection strategy: ${strategy.name}`);
      await mongoose.connect(uri, strategy.options);
      console.log("MongoDB connection successful with strategy:", strategy.name);
      return mongoose;
    } catch (error) {
      console.log(`Strategy "${strategy.name}" failed:`, error.message);
      if (strategy === strategies[strategies.length - 1]) {
        throw error;
      }
    }
  }
}

module.exports = { connectMongo };
