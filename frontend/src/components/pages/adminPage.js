import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";

import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [hiloData, setHiloData] = useState([]);
  const [guessrData, setGuessrData] = useState([]);

  const [bellCurveData, setBellCurveData] = useState([]);

  const [game, setGame] = useState("hilo");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("dashboard");
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8081";

  let user = null;
  try {
    user = getUserInfo();
  } catch {
    localStorage.removeItem("accessToken");
  }

  const token = localStorage.getItem("accessToken");

  // grab users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // fetch users and leaderboards on mount and when game changes
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  const fetchAllLeaderboards = async () => {
    try {
      const [hiloRes, guessrRes] = await Promise.all([
        fetch(`${API_BASE}/leaderboard/hilo`),
        fetch(`${API_BASE}/leaderboard/guessr`),
      ]);

      const hilo = await hiloRes.json();
      const guessr = await guessrRes.json();

      setHiloData(Array.isArray(hilo) ? hilo : []);
      setGuessrData(Array.isArray(guessr) ? guessr : []);
    } catch (err) {
      console.error(err);
      setHiloData([]);
      setGuessrData([]);
    }
  };

  // build bell curve data based on scores
  const buildBellCurveData = (scores) => {
    if (!scores.length) return [];

    const maxScore = Math.max(...scores);
    const binSize = maxScore ? Math.ceil(maxScore / 10) : 10;

    const bins = {};

    scores.forEach((score) => {
      const bin = Math.floor(score / binSize) * binSize;
      bins[bin] = (bins[bin] || 0) + 1;
    });

    return Object.keys(bins)
      .map((bin) => ({
        range: `${bin}-${Number(bin) + binSize}`,
        count: bins[bin],
      }))
      .sort((a, b) => parseInt(a.range) - parseInt(b.range));
  };

  // build gaussian curve data based on scores and bins
  const buildGaussianCurve = (scores, bins) => {
    if (!scores.length || !bins.length) return [];

    const mean = scores.reduce((sum, val) => sum + val, 0) / scores.length;

    const variance =
      scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      scores.length;

    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return bins; // prevent divide by zero

    return bins.map((bin) => {
      const [min, max] = bin.range.split("-").map(Number);
      const midpoint = (min + max) / 2;

      const exponent =
        -Math.pow(midpoint - mean, 2) / (2 * Math.pow(stdDev, 2));

      const gaussian =
        (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);

      return {
        ...bin,
        gaussian: gaussian * scores.length * 10, // scale line to bars
      };
    });
  };

  // fetch bell curve data
  const fetchBellCurve = async () => {
    try {
      const res = await fetch(`${API_BASE}/leaderboard/${game}`);
      const data = await res.json();

      const scores = (Array.isArray(data) ? data : []).map(
        (i) => Number(i.score) || 0,
      );

      const curve = buildBellCurveData(scores);
      setBellCurveData(curve);
    } catch (err) {
      console.error("Bell curve error:", err);
      setBellCurveData([]);
    }
  };

  //update data when game
  useEffect(() => {
    fetchBellCurve();
    fetchAllLeaderboards();
  }, [game]);

  // Admin actions
  const toggleRole = async (u) => {
    const newRole = u.role === "admin" ? "user" : "admin";

    await fetch(`${API_BASE}/users/${u._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });

    fetchUsers();
  };

  // delete user and update all data to reflect change
  const deleteUser = async (id) => {
    //confirm deletion
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await res.json();

      // refresh all data after deletion
      fetchUsers();
      fetchBellCurve();
      fetchAllLeaderboards();
    } catch (err) {
      console.error(err);
    }
  };

  // filter users based on search
  const filteredUsers = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase()),
  );

  // Stat for card display - calculates average score for given data
  const getAvg = (data) =>
    data.length > 0
      ? Math.round(
          data.reduce((sum, i) => sum + (Number(i.score) || 0), 0) /
            data.length,
        )
      : 0;

  const totalUsers = users.length;
  const hiloAvg = getAvg(hiloData);
  const guessrAvg = getAvg(guessrData);

  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Admin</h2>
        <ul>
          <li onClick={() => setTab("dashboard")}>Dashboard</li>
          <li onClick={() => setTab("users")}>Users</li>
        </ul>
      </div>

      {/* Main */}
      <div className="dashboard-main">
        <div style={{ marginBottom: 20 }}>
          <h1>
            {tab === "dashboard" && "Dashboard"}
            {tab === "users" && "User Management"}
          </h1>
          <p style={{ opacity: 0.6 }}>Manage your platform data</p>
        </div>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Users</h4>
                <p>{totalUsers}</p>
              </div>

              <div className="stat-card">
                <h4>Hilo Avg</h4>
                <p>{getAvg(hiloData)}</p>
              </div>

              <div className="stat-card">
                <h4>Guessr Avg</h4>
                <p>{getAvg(guessrData)}</p>
              </div>
            </div>

            <div className="card">
              <h3>Score Distribution (Bell Curve) - {game}</h3>

              <select value={game} onChange={(e) => setGame(e.target.value)}>
                <option value="hilo">Hilo</option>
                <option value="guessr">Guessr</option>
              </select>

              {bellCurveData.length === 0 ? (
                <p>No score data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bellCurveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" />
                    <Line
                      type="monotone"
                      dataKey="gaussian"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="card">
            <input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="table">
              <div className="table-header">
                <span>User</span>
                <span>Email</span>
                <span>Role</span>
                <span>Actions</span>
              </div>

              {filteredUsers.map((u) => (
                <div key={u._id} className="table-row">
                  <span>{u.username}</span>
                  <span>{u.email}</span>

                  <span className={`role ${u.role === "admin" ? "admin" : ""}`}>
                    {u.role || "user"}
                  </span>

                  <div className="actions">
                    <button onClick={() => toggleRole(u)}>
                      {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                    </button>

                    <button
                      className="danger"
                      onClick={() => deleteUser(u._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
