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

// Read (GET): fetch all ship updates
app.get("/api/ship-updates", async (req, res) => {
    try {
        const updates = await ShipUpdate.find().sort({ createdAt: -1 }).limit(20); // Newest first
        res.json(updates);
    } catch (err) {
        console.error("Error fetching updates:", err);
        res.status(500).json({ error: "Failed to fetch updates" });
    }
});

// Create (POST): add a new ship update
app.post("/api/ship-updates", async (req, res) => {
    try {
        const { shipName, status } = req.body;
        if (!shipName || !status) {
            return res.status(400).json({ error: "Ship name and status required" });
        }

        const newUpdate = new ShipUpdate({ shipName, status });
        await newUpdate.save();

        res.status(201).json(newUpdate);
    } catch (err) {
        console.error("Error posting update:", err);
        res.status(500).json({ error: "Failed to save update" });
    }
});

// Update (PUT): edit an update by ID
app.put("/api/ship-updates/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { shipName, status } = req.body;

        const updated = await ShipUpdate.findByIdAndUpdate(
            id,
            { shipName, status },
            { new: true } // To return updated ship
        );

        if (!updated) return res.status(404).json({ error: "Update not found" });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update ship status" });
    }
});

// Delete (DELETE): remove an update by ID
app.delete("/api/ship-updates/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ShipUpdate.findByIdAndDelete(id);

        if (!deleted) return res.status(404).json({ error: "Update not found" });
        
        res.json({ message: "Ship update deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete ship status" });
    }
});


// 4. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
});