const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Cloud Connection string (Replace with your actual MongoDB Atlas URI)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://username:password@cluster.mongodb.net/waterDB";
mongoose.connect(MONGO_URI).then(() => console.log("Cloud Database Connected"));

// DB Schema
const LogSchema = new mongoose.Schema({
    date: String, counterSale: Number, hamzaSupplier: Number, arsalanBhai: Number,
    makkahPlant: Number, juttPlant: Number, borrowBottles: Number, fuelExp: Number, otherExp: Number
});
const Log = mongoose.model('Log', LogSchema);

// Endpoint 1: Get Data & Automatically Calculate Totals for top 09 Cards
app.get('/api/logs', async (req, res) => {
    const logs = await Log.find();
    let summary = { counterSales: 0, totalSupply: 0, borrowedBottles: 0, hamzaSupplier: 0, arsalanBhai: 0, makkahPlant: 0, juttPlant: 0, fuelExp: 0, otherExp: 0 };
    
    logs.forEach(log => {
        summary.counterSales += (log.counterSale || 0);
        summary.borrowedBottles += (log.borrowBottles || 0);
        summary.hamzaSupplier += (log.hamzaSupplier || 0);
        summary.arsalanBhai += (log.arsalanBhai || 0);
        summary.makkahPlant += (log.makkahPlant || 0);
        summary.juttPlant += (log.juttPlant || 0);
        summary.fuelExp += (log.fuelExp || 0);
        summary.otherExp += (log.otherExp || 0);
    });
    summary.totalSupply = summary.hamzaSupplier + summary.arsalanBhai + summary.makkahPlant + summary.juttPlant;
    res.json({ logs, summary });
});

// Endpoint 2: Add dynamic entry
app.post('/api/logs', async (req, res) => {
    const newLog = new Log(req.body);
    await newLog.save();
    res.sendStatus(201);
});

module.exports = app;
