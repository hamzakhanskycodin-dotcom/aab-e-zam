const { MongoClient } = require('mongodb');

// MongoDB Connection String (Atlas URI)
const uri = process.env.MONGODB_URI || "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.mongodb.net/aabezam?retryWrites=true&w=majority";
let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

module.exports = async (req, res) => {
  // Cross-Origin Settings for Laptop <-> Mobile validation
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const mongoClient = await clientPromise;
    const db = mongoClient.db("aabezam_db");
    const logsCollection = db.collection("monthly_logs");
    const customersCollection = db.collection("customers_ledger");

    const { url } = req;

    // 1. ROUTE: GET /api/logs (Fetch 31-Day full data chart)
    if (url.includes('/api/logs') && req.method === 'GET') {
      const data = await logsCollection.findOne({ type: "main_chart" });
      if (data) {
        return res.status(200).json(data.rows);
      } else {
        // Fallback initial data grid schema if empty
        const initialRows = Array.from({ length: 31 }, (_, i) => ({
          date: `Day ${i + 1}`, counterSale: '', hamzaSupplier: '', arsalanBhai: '', makkahPlant: '', juttPlant: '', totalSupplyField: '', borrowBottles: '', fuelExp: '', otherExp: ''
        }));
        return res.status(200).json(initialRows);
      }
    }

    // 2. ROUTE: POST /api/logs (Save complete 31-Day rows matrix)
    if (url.includes('/api/logs') && req.method === 'POST') {
      const updatedRows = req.body;
      await logsCollection.updateOne(
        { type: "main_chart" },
        { $set: { type: "main_chart", rows: updatedRows, lastUpdated: new Date() } },
        { upsert: true }
      );
      return res.status(200).json({ success: true, message: "Logs synced to Cloud MongoDB" });
    }

    // 3. ROUTE: GET /api/customers (Fetch all customer matrix nodes)
    if (url.includes('/api/customers') && req.method === 'GET') {
      const data = await customersCollection.findOne({ type: "attendance_ledger" });
      if (data) {
        return res.status(200).json(data.list);
      } else {
        return res.status(200).json([]);
      }
    }

    // 4. ROUTE: POST /api/customers (Save completely unified customers lists)
    if (url.includes('/api/customers') && req.method === 'POST') {
      const updatedCustomers = req.body;
      await customersCollection.updateOne(
        { type: "attendance_ledger" },
        { $set: { type: "attendance_ledger", list: updatedCustomers, lastUpdated: new Date() } },
        { upsert: true }
      );
      return res.status(200).json({ success: true, message: "Customer ledger synced directly" });
    }

    // Default API Fallback route pointer
    return res.status(404).json({ error: "Route configuration target mismatch" });

  } catch (error) {
    console.error("MongoDB Server Error:", error);
    return res.status(500).json({ error: "Internal Database Server Breakdown", details: error.message });
  }
};
