import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDate } from "./utils";
import './app.css'
import { timeAgo } from "./utils";

const API_URL = process.env.REACT_APP_BACKEND_URL

const App = () => {
  const [ships, setShips] = useState([]);
  const [newShipName, setNewShipName] = useState("");
  const [statusInputs, setStatusInputs] = useState({});
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    fetchShips();
    const interval = setInterval(fetchShips, 300_000)
    return () => clearInterval(interval);
  }, []);

  // show button after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 800) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch all ships
  const fetchShips = async () => {
    console.log('test')
    try {
      const res = await axios.get(`${API_URL}/ships`);
      setShips(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch ships", err);
    }
  };

  // Add new ship
  const addShip = async (e) => {
    e.preventDefault()

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

      <div style={{ textAlign: 'center' }}>
        <h1>PT MIS Ship Status Tracker</h1>
        <h3>(App ini auto-refresh setiap 5 menit)</h3>

        {/* Add Ship */}

        {/* <form style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Add a new ship"
            value={newShipName}
            onChange={(e) => setNewShipName(e.target.value)}
          />
          <button onClick={addShip}>Add Ship</button>
        </form> */}

      </div>

      {/* Centered ship buttons */}
      <div style={{ textAlign: "center", margin: "20px 0" }}>
        {ships.map((ship) => (
          <button
            key={ship._id}
            onClick={() =>
              document
                .getElementById(`ship-${ship._id}`)
                .scrollIntoView({ behavior: "smooth" })
            }
            className="quicknav-buttons"
          >
            {ship.name}
          </button>
        ))}
      </div>

      <hr />

      {/* List ships and updates */}
      {ships.map((ship) => (
        <div
          key={ship._id}
          className="card"
          id={`ship-${ship._id}`}
        >
          <h2>{ship.name}</h2>

          {/* Status input */}
          <form>
            <input
              type="text"
              placeholder="New status..."
              value={statusInputs[ship._id] || ""}
              onChange={(e) =>
                setStatusInputs({ ...statusInputs, [ship._id]: e.target.value })
              }
            />
            <button onClick={e => {
              e.preventDefault()
              addUpdate(ship._id)
            }}>Add Status</button>
          </form>

          {/* Last 10 updates */}
          <ul>
            {ship.updates?.slice(-10)
              .reverse()
              .map((update, idx) => (
                <li key={idx} className="status-item">
                  <div className="status-text">{update.status}</div>
                  <div className="status-time" style={{ marginTop: '12px' }}>
                    {formatDate(update.createdAt)}
                    <span style={{ marginLeft: "20px" }}>({timeAgo(update.createdAt)})</span>
                  </div>
                </li>
              ))}
          </ul>

          {showScroll && (
            <button className="scrollTopBtn" onClick={scrollToTop}>
              ↑
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
