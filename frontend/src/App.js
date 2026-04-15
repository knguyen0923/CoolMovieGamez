import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./css/card.css";
import "./index.css";

import Navbar from "./components/navbar";
import LandingPage from "./components/pages/landingPage";
import HomePage from "./components/pages/homePage";
import Login from "./components/pages/loginPage";
import Signup from "./components/pages/registerPage";
import PrivateUserProfile from "./components/pages/privateUserProfilePage";
import ShopPage from "./components/pages/shopPage";
import { createContext, useState, useEffect } from "react";
import getUserInfo from "./utilities/decodeJwt";

import Hilo from "./components/pages/hilo";
import Guessr from "./components/pages/guessr";
import LeaderboardPage from "./components/pages/leaderboardPage";
import AdminPage from "./components/pages/adminPage";

export const UserContext = createContext();

const App = () => {
  const location = useLocation();

  const [user, setUser] = useState(null);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    try {
      const userData = getUserInfo();
      setUser(userData);
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  }, [location]);

  return (
    <>
      <div className={darkMode ? "app dark" : "app"}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <UserContext.Provider value={user}>
          <Routes>
            <Route exact path="/" element={<LandingPage />} />
            <Route exact path="/home" element={<HomePage />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/signup" element={<Signup />} />
            <Route path="/privateUserProfile" element={<PrivateUserProfile />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/guessr" element={<Guessr />} />
            <Route path="/hilo" element={<Hilo />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </UserContext.Provider>
      </div>
    </>
  );
};

export default App;