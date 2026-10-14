const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://username:password@cluster.mongodb.net/waterDB";
mongoose.connect(MONGO_URI).then(() => console.log("Cloud Database Connected"));

// FIXED SCHEMA: Isme ab totalSupplyField lazmi save hogi backend par
const LogSchema = new mongoose.Schema({
    date: String, 
    counterSale: Number, 
    hamzaSupplier: Number, 
    arsalanBhai: Number,
    makkahPlant: Number, 
    juttPlant: Number, 
    totalSupplyField: Number, // <-- Added securely
    borrowBottles: Number, 
    fuelExp: Number, 
    otherExp: Number
});
const Log = mongoose.model('Log', LogSchema);

app.get('/api/logs', async (req, res) => {
    try {
        const logs = await Log.find();
        let summary = { counterSales: 0, totalSupply: 0, borrowedBottles: 0, hamzaSupplier: 0, arsalanBhai: 0, makkahPlant: 0, juttPlant: 0, fuelExp: 0, otherExp: 0 };
        
        logs.forEach(log => {
            summary.counterSales += (log.counterSale || 0);
            summary.borrowedBottles += (log.borrowBottles || 0);
            summary.hamzaSupplier += (log.hamzaSupplier || 0);
            summary.arsalanBhai += (log.arsalanBhai || 0);
            summary.makkahPlant += (log.makkahPlant || 0);
            summary.juttPlant += (log.juttPlant || 0);
            summary.totalSupply += (log.totalSupplyField || 0); // <-- Sum calculations fixed
            summary.fuelExp += (log.fuelExp || 0);
            summary.otherExp += (log.otherExp || 0);
        });
        res.json({ logs, summary });
    } catch (err) {
        res.status(500).json(err);
    }
});

app.post('/api/logs', async (req, res) => {
    try {
        // Purane record ko update karein ya naya banayein takay data overwrite na ho refresh par
        await Log.findOneAndUpdate({ date: req.body.date }, req.body, { upsert: true, new: true });
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = app;
