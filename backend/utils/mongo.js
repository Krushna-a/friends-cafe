const mongoose = require("mongoose");
const dns = require("dns");

async function testDNSResolution(hostname) {
  return new Promise((resolve) => {
    dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
      if (err) {
        resolve(null);
      } else {
        resolve(addresses);
      }
    });
  });
}

function convertSrvToStandard(srvUri, srvRecords) {
  if (!srvRecords || srvRecords.length === 0) return null;

  // Extract components from SRV URI
  const match = srvUri.match(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/\?]+)\/?(.*)/,
  );
  if (!match) return null;

  const [, username, password, , pathAndQuery] = match;

  // Build host list from SRV records
  const hosts = srvRecords
    .map((record) => `${record.name}:${record.port}`)
    .join(",");

  // Reconstruct as standard URI
  const standardUri = `mongodb://${username}:${password}@${hosts}/${pathAndQuery}`;
  return standardUri.includes("ssl=true")
    ? standardUri
    : standardUri + (standardUri.includes("?") ? "&ssl=true" : "?ssl=true");
}

async function connectMongo(uri) {
  if (!uri) throw new Error("MONGO_URI is required");

  // If it's an SRV URI, try to resolve and convert to standard format
  if (uri.includes("mongodb+srv://")) {
    const match = uri.match(/mongodb\+srv:\/\/[^@]+@([^\/\?]+)/);
    if (match) {
      const hostname = match[1];
      const srvRecords = await testDNSResolution(hostname);

      if (srvRecords) {
        // Try standard format first
        const standardUri = convertSrvToStandard(uri, srvRecords);
        if (standardUri) {
          try {
            await mongoose.connect(standardUri, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
              serverSelectionTimeoutMS: 5000,
              socketTimeoutMS: 45000,
              ssl: true,
              authSource: "admin",
            });
            return mongoose;
          } catch (error) {}
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
        retryWrites: true,
      },
    },
    {
      name: "Standard with longer timeout",
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true,
      },
    },
  ];

  for (const strategy of strategies) {
    try {
      await mongoose.connect(uri, strategy.options);
      return mongoose;
    } catch (error) {
      if (strategy === strategies[strategies.length - 1]) {
        throw error;
      }
    }
  }
}

module.exports = { connectMongo };
