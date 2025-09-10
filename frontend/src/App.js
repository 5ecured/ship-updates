import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api"

function App() {
  const [ships, setShips] = useState([]);
  const [newShipName, setNewShipName] = useState("");
  const [statusInputs, setStatusInputs] = useState({});

  // Fetch all ships
  const fetchShips = async () => {
    console.log('halo')
    try {
      const res = await axios.get(`${API_URL}/ships`);
      setShips(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch ships", err);
    }
  };

  useEffect(() => {
    fetchShips();
    const interval = setInterval(fetchShips, 120_000)
    return () => clearInterval(interval);
  }, []);

  // Add new ship
  const addShip = async () => {
    if (!newShipName.trim()) return;
    try {
      await axios.post(`${API_URL}/ships`, { name: newShipName });
      setNewShipName("");
      fetchShips();
    } catch (err) {
      console.error("❌ Failed to add ship", err);
    }
  };

  // Add status update to a ship
  const addUpdate = async (shipId) => {
    const status = statusInputs[shipId];
    if (!status || !status.trim()) return;
    try {
      await axios.post(`${API_URL}/ships/${shipId}/updates`, { status });
      setStatusInputs({ ...statusInputs, [shipId]: "" });
      fetchShips();
    } catch (err) {
      console.error("❌ Failed to add update", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🚢 Ship Status Tracker</h1>
      <h3>Auto refresh setiap 5 minutes</h3>

      {/* Add Ship */}
      <div>
        <input
          type="text"
          placeholder="New ship name"
          value={newShipName}
          onChange={(e) => setNewShipName(e.target.value)}
        />
        <button onClick={addShip}>Add Ship</button>
      </div>

      <hr />

      {/* List ships and updates */}
      {ships.map((ship) => (
        <div
          key={ship._id}
          style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}
        >
          <h2>{ship.name}</h2>

          {/* Status input */}
          <div>
            <input
              type="text"
              placeholder="New status..."
              value={statusInputs[ship._id] || ""}
              onChange={(e) =>
                setStatusInputs({ ...statusInputs, [ship._id]: e.target.value })
              }
            />
            <button onClick={() => addUpdate(ship._id)}>Add Status</button>
          </div>

          {/* Last 10 updates */}
          <ul>
            {ship.updates?.slice(-10)
              .reverse()
              .map((update, idx) => (
                <li key={idx}>
                  {update.status} <small>({new Date(update.createdAt).toLocaleString()})</small>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;
