import React, { useEffect, useState } from "react";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [game, setGame] = useState("hilo");

// Get all users
  const fetchUsers = async () => {
    const res = await fetch("http://localhost:8081/users");
    const data = await res.json();
    setUsers(data);
  };

// Get leaderboard for selected game
  const fetchLeaderboard = async () => {
    const res = await fetch(`http://localhost:8081/leaderboard/${game}`);
    const data = await res.json();
    setLeaderboard(data);
  };

  useEffect(() => {
    fetchUsers();
    fetchLeaderboard();
  }, [game]);

// delete user by id
  const deleteUser = async (id) => {
    await fetch(`http://localhost:8081/users/${id}`, {
      method: "DELETE",
    });
    fetchUsers();
  };

// delete score by id
  const deleteScore = async (id) => {
    await fetch(`http://localhost:8081/leaderboard/${game}/${id}`, {
      method: "DELETE",
    });
    fetchLeaderboard();
  };

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>

      {/* USERS */}
      <h2>Users</h2>
      {users.map((user) => (
        <div key={user._id}>
          {user.username} ({user.email})
          <button onClick={() => deleteUser(user._id)}>Delete</button>
        </div>
      ))}

      {/* GAME SWITCH */}
      <h2>Leaderboard</h2>
      <select value={game} onChange={(e) => setGame(e.target.value)}>
        <option value="hilo">Hilo</option>
        <option value="guessr">Guessr</option>
      </select>

      {/* LEADERBOARD */}
      {leaderboard.map((entry) => (
        <div key={entry._id}>
          {entry.username} - {entry.score}
          <button onClick={() => deleteScore(entry._id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

export default AdminPage;
