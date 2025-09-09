const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


// 1. Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1); // Stop app if DB fails
    }
};

connectDB();

// 2. Define a schema
const shipUpdateSchema = new mongoose.Schema({
    shipName: { type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const ShipUpdate = mongoose.model("ShipUpdate", shipUpdateSchema);

// 3. API routes
app.get("/api/updates", async (req, res) => {
    try {
        const updates = await ShipUpdate.find().sort({ createdAt: -1 }).limit(20);
        res.json(updates);
    } catch (err) {
        console.error("Error fetching updates:", err);
        res.status(500).json({ error: "Failed to fetch updates" });
    }
});

app.post("/api/updates", async (req, res) => {
    try {
        const { shipName, status } = req.body;
        if (!shipName || !status) {
            return res.status(400).json({ error: "Ship name and status required" });
        }

        const update = new ShipUpdate({ shipName, status });
        await update.save();

        res.json(update);
    } catch (err) {
        console.error("Error posting update:", err);
        res.status(500).json({ error: "Failed to save update" });
    }
});

// 4. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
});