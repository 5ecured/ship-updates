import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL

function App() {
  const [updates, setUpdates] = useState([]);
  const [shipName, setShipName] = useState("");
  const [status, setStatus] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUpdates();

    const interval = setInterval(fetchUpdates, 300_000);
    return () => clearInterval(interval);
  }, []);

  // Fetch updates
  const fetchUpdates = async () => {
    console.log('fetched')
    try {
      const response = await axios.get(API_URL);
      setUpdates(response.data);
    } catch (err) {
      console.error("Error fetching updates:", err);
    }
  };


  // Create or update
  const submitUpdate = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, {
          shipName,
          status,
        });
        setEditingId(null);
      } else {
        const res = await axios.post(API_URL, { shipName, status });
        setUpdates([res.data, ...updates]);
      }

      setShipName("");
      setStatus("");
      fetchUpdates()
    } catch (err) {
      console.error("Error posting update:", err);
    }
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchUpdates();
  };

  const handleEdit = (update) => {
    setEditingId(update._id);
    setShipName(update.shipName);
    setStatus(update.status);
  };

  return (
    <div style={{ textAlign: "center", maxWidth: "600px", margin: "auto" }}>
      <h1>🚢 Ship Status Updates</h1>
      <h3>Auto refresh setiap 5 minutes</h3>
      {/* Form */}
      <form onSubmit={submitUpdate} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Ship Name"
          value={shipName}
          onChange={(e) => setShipName(e.target.value)}
          required
        />
        <input
          placeholder="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
        />
        <button type="submit">{editingId ? "Update" : "Add"}</button>
        {editingId && <button onClick={() => setEditingId(null)}>Cancel</button>}
      </form>

      {/* Updates */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {updates.map((u) => (
          <li key={u._id} style={{ borderBottom: "1px solid #ccc", margin: "10px 0" }}>
            <strong>{u.shipName}</strong>: {u.status}
            <br />
            <button onClick={() => handleEdit(u)}>Edit</button>
            <button onClick={() => handleDelete(u._id)}>Delete</button>
            <br />
            <small>{new Date(u.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
