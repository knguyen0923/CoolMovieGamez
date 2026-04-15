import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";

// 📊 Recharts (NEW)
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
  // 🔹 STATE
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [game, setGame] = useState("hilo");
  const [search, setSearch] = useState("");

  // 🔹 AUTH
  let user = null;
  try {
    user = getUserInfo();
  } catch {
    localStorage.removeItem("accessToken");
  }

  // 🔹 FETCH USERS
  const fetchUsers = async () => {
    const res = await fetch("http://localhost:8081/users");
    const data = await res.json();
    setUsers(data);
  };

  // 🔹 FETCH LEADERBOARD
  const fetchLeaderboard = async () => {
    const res = await fetch(`http://localhost:8081/leaderboard/${game}`);
    const data = await res.json();
    setLeaderboard(data);
  };

  // 🔹 LOAD DATA
  useEffect(() => {
    fetchUsers();
    fetchLeaderboard();
  }, [game]);

  // 🔎 FILTER USERS
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  // 📊 LINE CHART DATA (RANK → SCORE)
  const lineData = leaderboard.map((entry, index) => ({
    rank: index + 1,
    score: entry.score,
  }));

  // 🔐 AUTH CHECK
  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <div className="dashboard-layout">

      {/* 🧭 SIDEBAR */}
      <div className="sidebar">
        <h2>Admin</h2>
        <ul>
          <li>Dashboard</li>
          <li>Users</li>
          <li>Leaderboard</li>
        </ul>
      </div>

      {/* 📦 MAIN */}
      <div className="dashboard-main">

        <h1>Dashboard</h1>

        {/* 🔎 SEARCH */}
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* 👥 USERS */}
        <div className="card">
          <h3>Users</h3>

          {filteredUsers.map((u) => (
            <div key={u._id} className="dashboard-row">
              <div>
                <strong>{u.username}</strong>
                <p>{u.email}</p>
                <span className="role">{u.role || "user"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 🏆 LEADERBOARD */}
        <div className="card">
          <h3>Leaderboard ({game})</h3>

          <select value={game} onChange={(e) => setGame(e.target.value)}>
            <option value="hilo">Hilo</option>
            <option value="guessr">Guessr</option>
          </select>

          {leaderboard.map((entry) => (
            <div key={entry._id} className="dashboard-row">
              <span>{entry.username}</span>
              <span className="score">{entry.score}</span>
            </div>
          ))}
        </div>

        {/* 📊 LINE CHART */}
        <div className="card">
          <h3>Score Trends</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rank" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

export default AdminPage;