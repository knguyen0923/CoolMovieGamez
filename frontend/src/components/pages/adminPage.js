import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [hiloData, setHiloData] = useState([]);
  const [guessrData, setGuessrData] = useState([]);

  // chart states
  const [allTimeData, setAllTimeData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

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

  // fetch users and leaderboards on mount and when game changes
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8081/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(
        `http://localhost:8081/leaderboard/${game}`
      );
      const data = await res.json();

      const clean = Array.isArray(data)
        ? data
            .map((item) => ({
              ...item,
              score: Number(item.score) || 0,
            }))
            .sort((a, b) => b.score - a.score)
        : [];

      setLeaderboard(clean);
    } catch (err) {
      console.error(err);
      setLeaderboard([]);
    }
  };

  const fetchAllLeaderboards = async () => {
    try {
      const [hiloRes, guessrRes] = await Promise.all([
        fetch("http://localhost:8081/leaderboard/hilo"),
        fetch("http://localhost:8081/leaderboard/guessr"),
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

  // Time tested fetch for both all-time and daily data
  const fetchChartData = async () => {
    try {
      const [allRes, dailyRes] = await Promise.all([
        fetch(`http://localhost:8081/leaderboard/${game}`),
        fetch(`http://localhost:8081/leaderboard/${game}?todayOnly=true`),
      ]);

      const all = await allRes.json();
      const daily = await dailyRes.json();

      setAllTimeData(
        (Array.isArray(all) ? all : []).map((i) => ({
          name: i.username || "Unknown",
          score: Number(i.score) || 0,
        }))
      );

      setDailyData(
        (Array.isArray(daily) ? daily : []).map((i) => ({
          name: i.username || "Unknown",
          score: Number(i.score) || 0,
        }))
      );
    } catch (err) {
      console.error("Chart error:", err);
      setAllTimeData([]);
      setDailyData([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLeaderboard();
    fetchAllLeaderboards();
    fetchChartData(); // 🔥 ADDED
  }, [game]);

  // Admin actions
  const toggleRole = async (u) => {
    const newRole = u.role === "admin" ? "user" : "admin";

    await fetch(`http://localhost:8081/users/${u._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });

    fetchUsers();
  };

  const deleteUser = async (id) => {
    await fetch(`http://localhost:8081/users/${id}`, {
      method: "DELETE",
    });
    fetchUsers();
  };

  const deleteScore = async (id) => {
    await fetch(
      `http://localhost:8081/leaderboard/${game}/${id}`,
      { method: "DELETE" }
    );
    fetchLeaderboard();
  };

  // filter users based on search
  const filteredUsers = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  // Stat for card display - calculates average score for given data
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
          <li onClick={() => setTab("leaderboard")}>Leaderboard</li>
        </ul>
      </div>

      {/* Main */}
      <div className="dashboard-main">
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1>
            {tab === "dashboard" && "Dashboard"}
            {tab === "users" && "User Management"}
            {tab === "leaderboard" && "Leaderboard"}
          </h1>
          <p style={{ opacity: 0.6 }}>
            Manage your platform data
          </p>
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
              <h3>All-Time Scores ({game})</h3>

              <select
                value={game}
                onChange={(e) => setGame(e.target.value)}
              >
                <option value="hilo">Hilo</option>
                <option value="guessr">Guessr</option>
              </select>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={allTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    angle={-30}
                    textAnchor="end"
                    label={{
                      value: "Players",
                      position: "insideBottom",
                      offset: -10,
                    }}
                  />

                  <YAxis
                    label={{
                      value: "Score",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#22c55e"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3>Today's Scores ({game})</h3>

              {dailyData.length === 0 ? (
                <p>No scores today</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="name"
                      angle={-30}
                      textAnchor="end"
                      label={{
                        value: "Players",
                        position: "insideBottom",
                        offset: -10,
                      }}
                    />

                    <YAxis
                      label={{
                        value: "Score",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={3}
                    />
                  </LineChart>
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

                  <span
                    className={`role ${
                      u.role === "admin" ? "admin" : ""
                    }`}
                  >
                    {u.role || "user"}
                  </span>

                  <div className="actions">
                    <button onClick={() => toggleRole(u)}>
                      {u.role === "admin"
                        ? "Remove Admin"
                        : "Make Admin"}
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

        {/* Leaderboard */}
        {tab === "leaderboard" && (
          <div className="card">
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
            >
              <option value="hilo">Hilo</option>
              <option value="guessr">Guessr</option>
            </select>

            <div className="table">
              <div className="table-header">
                <span>User</span>
                <span>Score</span>
                <span>Actions</span>
              </div>

              {leaderboard.map((entry) => (
                <div key={entry._id} className="table-row">
                  <span>{entry.username}</span>
                  <span className="score">{entry.score}</span>

                  <button
                    className="danger"
                    onClick={() => deleteScore(entry._id)}
                  >
                    Delete
                  </button>
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