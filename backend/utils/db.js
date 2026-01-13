const fs = require("fs").promises;
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

async function readDB() {
  try {
    const txt = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(txt);
  } catch (e) {
    // return basic structure if missing or invalid
    return { users: [], products: [], orders: [] };
  }
}

async function writeDB(data) {
  const txt = JSON.stringify(data, null, 2);
  await fs.writeFile(DB_PATH, txt, "utf8");
}

module.exports = { readDB, writeDB };
