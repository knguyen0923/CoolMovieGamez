import React from "react";
// We use Route in order to define the different routes of our application
import { Route, Routes } from "react-router-dom";
import './css/card.css';
import './index.css';

// We import all the components we need in our app
import Navbar from "./components/navbar";
import LandingPage from "./components/pages/landingPage";
import HomePage from "./components/pages/homePage";
import Login from "./components/pages/loginPage";
import Signup from "./components/pages/registerPage";
import PrivateUserProfile from "./components/pages/privateUserProfilePage";
import { createContext, useState, useEffect } from "react";
import getUserInfo from "./utilities/decodeJwt";

import Hilo from "./components/pages/hilo";
import Guessr from "./components/pages/guessr";
import LeaderboardPage from "./components/pages/leaderboardPage";

export const UserContext = createContext();
//test change
//test again
const App = () => {

  //dark mode toggle 
  const [user, setUser] = useState();
  
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
  localStorage.setItem("darkMode", darkMode);
}, [darkMode]);

  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  

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
          <Route path="/guessr" element={<Guessr />} />
          <Route path="/hilo" element={<Hilo />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </UserContext.Provider> 
    </div>
    </>
  );
};



export default App
