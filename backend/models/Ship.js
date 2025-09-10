import mongoose from "mongoose";

const updateSchema = new mongoose.Schema({
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const shipSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    updates: [updateSchema],
});

const Ship = mongoose.model("Ship", shipSchema);

export default Ship;
