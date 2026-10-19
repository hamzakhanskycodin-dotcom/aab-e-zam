const { MongoClient } = require('mongodb');

// MongoDB Global Singleton Connection Caching for Serverless Functions
const uri = process.env.MONGODB_URI || "mongodb+srv://hamzakhanskycodin_db_user:hamza12345@cluster0.mongodb.net/aabezam?retryWrites=true&w=majority";

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Set pool options safely to survive within serverless execution limits
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  });

  await client.connect();
  const db = client.db("aabezam_db");

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

module.exports = async (req, res) => {
  // Global Cross-Origin CORS validation layers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { db } = await connectToDatabase();
    const logsCollection = db.collection("monthly_logs");
    const customersCollection = db.collection("customers_ledger");

    const { url } = req;

    // 1. ROUTE: GET /api/logs
    if (url.includes('/api/logs') && req.method === 'GET') {
      const data = await logsCollection.findOne({ type: "main_chart" });
      if (data) {
        return res.status(200).json(data.rows);
      } else {
        const initialRows = Array.from({ length: 31 }, (_, i) => ({
          date: `Day ${i + 1}`, counterSale: '', hamzaSupplier: '', arsalanBhai: '', makkahPlant: '', juttPlant: '', totalSupplyField: '', borrowBottles: '', fuelExp: '', otherExp: ''
        }));
        return res.status(200).json(initialRows);
      }
    }

    // 2. ROUTE: POST /api/logs
    if (url.includes('/api/logs') && req.method === 'POST') {
      const updatedRows = req.body;
      await logsCollection.updateOne(
        { type: "main_chart" },
        { $set: { type: "main_chart", rows: updatedRows, lastUpdated: new Date() } },
        { upsert: true }
      );
      return res.status(200).json({ success: true, message: "Logs Array Synced" });
    }

    // 3. ROUTE: GET /api/customers
    if (url.includes('/api/customers') && req.method === 'GET') {
      const data = await customersCollection.findOne({ type: "attendance_ledger" });
      if (data) {
        return res.status(200).json(data.list);
      } else {
        return res.status(200).json([]);
      }
    }

    // 4. ROUTE: POST /api/customers
    if (url.includes('/api/customers') && req.method === 'POST') {
      const updatedCustomers = req.body;
      await customersCollection.updateOne(
        { type: "attendance_ledger" },
        { $set: { type: "attendance_ledger", list: updatedCustomers, lastUpdated: new Date() } },
        { upsert: true }
      );
      return res.status(200).json({ success: true, message: "Ledger Array Synced" });
    }

    return res.status(404).json({ error: "Route configuration target mismatch" });

  } catch (error) {
    console.error("MongoDB Instance Runtime Error:", error);
    return res.status(500).json({ error: "Internal Database Pool Breakdown", details: error.message });
  }
};
