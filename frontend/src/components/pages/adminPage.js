import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import API_BASE from "../../config";

import {
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
} from "recharts";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [hiloData, setHiloData] = useState([]);
  const [guessrData, setGuessrData] = useState([]);
  const [bellCurveData, setBellCurveData] = useState([]);

  const [game, setGame] = useState("hilo");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("dashboard");

  let user = null;

  try {
    user = getUserInfo();
  } catch {
    localStorage.removeItem("accessToken");
  }

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchBellCurve();
    fetchAllLeaderboards();
  }, [game]);

  // Fixed old API route.
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`);

      if (!res.ok) {
        throw new Error(`Users fetch failed: HTTP ${res.status}`);
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Admin users fetch error:", err);
      setUsers([]);
    }
  };

  // Fixed leaderboard API routes.
  const fetchAllLeaderboards = async () => {
    try {
      const [hiloRes, guessrRes] = await Promise.all([
        fetch(`${API_BASE}/api/leaderboard/hilo`),
        fetch(`${API_BASE}/api/leaderboard/guessr`),
      ]);

      if (!hiloRes.ok) {
        throw new Error(`Hilo leaderboard failed: HTTP ${hiloRes.status}`);
      }

      if (!guessrRes.ok) {
        throw new Error(`Guessr leaderboard failed: HTTP ${guessrRes.status}`);
      }

      const hilo = await hiloRes.json();
      const guessr = await guessrRes.json();

      setHiloData(Array.isArray(hilo) ? hilo : []);
      setGuessrData(Array.isArray(guessr) ? guessr : []);
    } catch (err) {
      console.error("Admin leaderboard fetch error:", err);
      setHiloData([]);
      setGuessrData([]);
    }
  };

  // Safer score binning for the bell curve.
  const buildBellCurveData = (scores) => {
    const cleanScores = scores
      .map((score) => Number(score))
      .filter((score) => Number.isFinite(score) && score >= 0);

    if (cleanScores.length === 0) return [];

    const maxScore = Math.max(...cleanScores);
    const binSize = maxScore > 0 ? Math.ceil(maxScore / 10) : 10;

    const bins = {};

    cleanScores.forEach((score) => {
      const binStart = Math.floor(score / binSize) * binSize;
      bins[binStart] = (bins[binStart] || 0) + 1;
    });

    return Object.keys(bins)
      .map((bin) => {
        const start = Number(bin);
        const end = start + binSize;

        return {
          range: `${start}-${end}`,
          binStart: start,
          midpoint: (start + end) / 2,
          count: bins[bin],
        };
      })
      .sort((a, b) => a.binStart - b.binStart);
  };

  // Actually creates the gaussian line values.
  const buildGaussianCurve = (scores, bins) => {
    const cleanScores = scores
      .map((score) => Number(score))
      .filter((score) => Number.isFinite(score) && score >= 0);

    if (cleanScores.length === 0 || bins.length === 0) return [];

    const mean =
      cleanScores.reduce((sum, val) => sum + val, 0) / cleanScores.length;

    const variance =
      cleanScores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      cleanScores.length;

    const stdDev = Math.sqrt(variance);

    if (!Number.isFinite(stdDev) || stdDev === 0) {
      return bins.map((bin) => ({
        ...bin,
        gaussian: bin.count,
      }));
    }

    const maxCount = Math.max(...bins.map((bin) => bin.count));

    const gaussianValues = bins.map((bin) => {
      const exponent =
        -Math.pow(bin.midpoint - mean, 2) / (2 * Math.pow(stdDev, 2));

      return Math.exp(exponent);
    });

    const maxGaussian = Math.max(...gaussianValues);

    return bins.map((bin, index) => ({
      ...bin,
      gaussian:
        maxGaussian > 0
          ? Number(((gaussianValues[index] / maxGaussian) * maxCount).toFixed(2))
          : 0,
    }));
  };

  // Fixed bell curve fetch route and applies gaussian data.
  const fetchBellCurve = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/leaderboard/${game}`);

      if (!res.ok) {
        throw new Error(`Bell curve fetch failed: HTTP ${res.status}`);
      }

      const data = await res.json();

      const scores = (Array.isArray(data) ? data : [])
        .map((i) => Number(i.score))
        .filter((score) => Number.isFinite(score) && score >= 0);

      const bins = buildBellCurveData(scores);
      const curve = buildGaussianCurve(scores, bins);

      setBellCurveData(curve);
    } catch (err) {
      console.error("Bell curve error:", err);
      setBellCurveData([]);
    }
  };

  // Fixed update user route.
  const toggleRole = async (u) => {
    const newRole = u.role === "admin" ? "user" : "admin";

    try {
      const res = await fetch(`${API_BASE}/api/users/${u._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        throw new Error(`Toggle role failed: HTTP ${res.status}`);
      }

      fetchUsers();
    } catch (err) {
      console.error("Toggle role error:", err);
    }
  };

  // Fixed delete user route.
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Delete user failed: HTTP ${res.status}`);
      }

      fetchUsers();
      fetchBellCurve();
      fetchAllLeaderboards();
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const getAvg = (data) =>
    data.length > 0
      ? Math.round(
          data.reduce((sum, i) => sum + (Number(i.score) || 0), 0) /
            data.length
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

        {/* Dashboard */}
        {tab === "dashboard" && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Users</h4>
                <p>{totalUsers}</p>
              </div>

              <div className="stat-card">
                <h4>Hilo Avg</h4>
                <p>{hiloAvg}</p>
              </div>

              <div className="stat-card">
                <h4>Guessr Avg</h4>
                <p>{guessrAvg}</p>
              </div>
            </div>

            <div className="card">
              <h3>Score Distribution / Bell Curve - {game}</h3>

              <select value={game} onChange={(e) => setGame(e.target.value)}>
                <option value="hilo">Hilo</option>
                <option value="guessr">Guessr</option>
              </select>

              {bellCurveData.length === 0 ? (
                <p>No score data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  {/* CHANGE #8:
                      Use ComposedChart instead of BarChart.
                      ComposedChart supports Bar + Line together cleanly.
                  */}
                  <ComposedChart data={bellCurveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />

                    <Bar dataKey="count" name="Players" />

                    <Line
                      type="monotone"
                      dataKey="gaussian"
                      name="Bell Curve"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={false}
                    />
                  </ComposedChart>
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