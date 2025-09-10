import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from 'dotenv'
dotenv.config()
import Ship from "./models/Ship.js";

const app = express();
app.use(cors());
app.use(express.json());

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

// Get all ships
app.get("/api/ships", async (req, res) => {
    try {
        const ships = await Ship.find();
        res.json(ships);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch ships" });
    }
});

// Add a new ship
app.post("/api/ships", async (req, res) => {
    try {
        const ship = new Ship({ name: req.body.name, updates: [] });
        await ship.save();
        res.json(ship);
    } catch (err) {
        res.status(500).json({ error: "Failed to add ship" });
    }
});

// Add status update to a ship
app.post("/api/ships/:id/updates", async (req, res) => {
    try {
        const ship = await Ship.findById(req.params.id);
        if (!ship) return res.status(404).json({ error: "Ship not found" });

        // Push the new update
        ship.updates.push({ status: req.body.status });

        // Keep only the last 100 updates
        if (ship.updates.length > 100) {
            ship.updates = ship.updates.slice(-100)
        }

        // Then save to mongoDB
        await ship.save();

        res.json(ship);
    } catch (err) {
        res.status(500).json({ error: "Failed to add update" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
});