const mongoose = require("mongoose");
const dns = require("dns");

const connectDb = async () => {
  const uri = process.env.MONGODB_URL || process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("Database URI missing: set MONGODB_URL (or MONGO_URI / DATABASE_URL) in .env");
  }

  const dnsServers = process.env.DNS_SERVERS;
  if (dnsServers) {
    const servers = dnsServers
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);

    if (servers.length > 0) {
      dns.setServers(servers);
    }
  }

  await mongoose.connect(uri);
  return mongoose.connection;
};

module.exports = { connectDb };
