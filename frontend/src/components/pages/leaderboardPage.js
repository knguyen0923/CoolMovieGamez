import React, { useEffect, useState } from "react";

function LeaderboardPage() {

    // State to store leaderboard data
    const [leaderboard, setLeaderboard] = useState([]);

    // State to track which game leaderboard is selected, default to "hilo"
    const [game, setGame] = useState("hilo");

    //Fetch leaderboard data from backend
    const fetchLeaderboard = async () => {
    try {
        const response = await fetch(`http://localhost:8081/leaderboard/${game}`);
        const data = await response.json();
        setLeaderboard(data);
    }catch (error) {
        console.error("Failed to load leaderboard:", error);
    }
};


// Call fetch when page first loads
// then poll every 3 seconds to update leaderboard in real-time. 
// Also refetch when game selection changes.
useEffect(() => {   
    fetchLeaderboard();
    const interval = setInterval(() => {
        fetchLeaderboard();
    }, 3000); 
    return () => clearInterval(interval);
}, [game]);


//JSX returned by component (UI Layout)
return (
    <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Leaderboard</h1>
        <div style={{ marginBottom: "20px" }}>
        <label>Game: </label>
        <select value={game} onChange={(e) => setGame(e.target.value)}>
        <option value="hilo">HiLo</option>
        <option value="guessr">Guessr</option>
        </select>
    </div>

    <table style={{
        margin: "auto",
        borderCollapse: "collapse",
        width: "60%",
    }}>
    <thead>
        <tr style={{ backgroundColor: "#333", color: "white" }}>
            <th style={{ padding: "10px" }}>Rank</th>
            <th style={{ padding: "10px" }}>Player</th>
            <th style={{ padding: "10px" }}>Score</th>
        </tr>
        </thead>

        <tbody>
        {leaderboard.map((entry, index) => (
            <tr key={entry._id} style={{ borderBottom: "1px solid #ddd" }}>
            <td style={{ padding: "10px" }}>{index + 1}</td>
            <td style={{ padding: "10px" }}>{entry.username}</td>
            <td style={{ padding: "10px" }}>{entry.score}</td>
            </tr>
        ))}
        </tbody>
    </table>
    </div>
);
}

export default LeaderboardPage;
