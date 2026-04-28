import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";


function LeaderboardPage() {
    const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8081";

    // State to store leaderboard data
    const [leaderboard, setLeaderboard] = useState([]);

    // State to track which game leaderboard is selected, default to "hilo"
    const [game, setGame] = useState("hilo");

    // loading state
    const [loading, setLoading] = useState(true);
    const currentLocation = useLocation();

    //Fetch leaderboard data from backend
    const fetchLeaderboard = async () => {
        try { 
            setLoading(true)
            const response = await fetch(`${API_BASE}/leaderboard/${game}`);
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            const data = await response.json();
            setLeaderboard(data);
        } catch (error) {
            console.error("Failed to load leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

// Call fetch when page first loads
// then poll every 3 seconds to update leaderboard in real-time. 
// Also refetch when game selection changes.
useEffect(() => {
    fetchLeaderboard();
    }, [game, currentLocation]);


//JSX returned by component (UI Layout)
    return (
        <div className="leaderboard-container">
            <div className="leaderboard-card">

                <h1>🏆 Leaderboard</h1>

                <h2 className="game-title">
                    {game.toUpperCase()}
                </h2>

                <div className="select-wrapper">
                    <select
                        value={game}
                        onChange={(e) => setGame(e.target.value)}
                    >
                        <option value="hilo">Hilo</option>
                        <option value="guessr">Guessr</option>
                    </select>
                </div>

                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Score</th>
                        </tr>
                    </thead>

                    <tbody>
                        {leaderboard.map((entry, index) => (
                            <tr
                                key={entry._id}
                                className={index < 3 ? "top-player" : ""}
                            >
                                <td>
                                    {index === 0 ? "🥇" :
                                     index === 1 ? "🥈" :
                                     index === 2 ? "🥉" :
                                     index + 1}
                                </td>

                                <td>{entry.username}</td>

                                <td className="score">
                                    {entry.score}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    );
}

export default LeaderboardPage;