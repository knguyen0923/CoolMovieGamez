import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";

const API_BASE = "http://localhost:8081";

const ShopPage = () => {
  const user = useContext(UserContext);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [profile, setProfile] = useState({
    coins: 0,
    avatarUrl: "",
    usernameStyle: "",
    avatarBorder: "",
    profileBorder: "",
    ownedCosmetics: []
  });

  const [message, setMessage] = useState("");

  const shopItems = [
    {
      id: "gold-avatar-border",
      name: "Gold Avatar Border",
      price: 100,
      description: "Adds a gold border around your profile picture."
    },
    {
      id: "rainbow-username",
      name: "Rainbow Username",
      price: 150,
      description: "Makes your username appear in rainbow colors."
    },
    {
      id: "rainbow-profile-border",
      name: "Rainbow Profile Border",
      price: 200,
      description: "Adds a rainbow border around your profile card."
    }
  ];

  useEffect(() => {
    const syncDarkMode = () => {
      setDarkMode(localStorage.getItem("darkMode") === "true");
    };

    window.addEventListener("storage", syncDarkMode);

    const interval = setInterval(syncDarkMode, 200);

    return () => {
      window.removeEventListener("storage", syncDarkMode);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    fetch(`${API_BASE}/api/userProfile/${user.username}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          coins: data.profile?.coins || 0,
          avatarUrl: data.profile?.avatarUrl || "",
          usernameStyle: data.profile?.usernameStyle || "",
          avatarBorder: data.profile?.avatarBorder || "",
          profileBorder: data.profile?.profileBorder || "",
          ownedCosmetics: data.profile?.ownedCosmetics || []
        });
      })
      .catch((err) => {
        console.error(err);
        setMessage("Error loading shop data");
      });
  }, [user]);

  const buildImageUrl = (avatarUrl) => {
    if (!avatarUrl) return "https://via.placeholder.com/140";

    if (avatarUrl.startsWith("http")) {
      return avatarUrl;
    }

    if (avatarUrl.startsWith("/uploads/")) {
      return `${API_BASE}${avatarUrl}`;
    }

    return `${API_BASE}/uploads/${avatarUrl}`;
  };

  const handleBuy = async (item) => {
    const alreadyEquipped =
      (item.id === "gold-avatar-border" && profile.avatarBorder === "gold") ||
      (item.id === "rainbow-username" && profile.usernameStyle === "rainbow") ||
      (item.id === "rainbow-profile-border" && profile.profileBorder === "rainbow");

    if (alreadyEquipped) {
      setMessage("Already equipped");
      return;
    }

    const alreadyOwned = profile.ownedCosmetics.includes(item.id);

    let updatedCoins = profile.coins;
    let updatedOwned = [...profile.ownedCosmetics];

    if (!alreadyOwned) {
      if (profile.coins < item.price) {
        setMessage("Not enough coins");
        return;
      }

      updatedCoins = profile.coins - item.price;
      updatedOwned.push(item.id);
    }

    try {
      const formData = new FormData();
      formData.append("coins", updatedCoins);
      formData.append("ownedCosmetics", JSON.stringify(updatedOwned));

      if (item.id === "gold-avatar-border") {
        formData.append("avatarBorder", "gold");
      }

      if (item.id === "rainbow-username") {
        formData.append("usernameStyle", "rainbow");
      }

      if (item.id === "rainbow-profile-border") {
        formData.append("profileBorder", "rainbow");
      }

      const res = await fetch(`${API_BASE}/api/userProfile/${user.username}/shop`, {
        method: "PUT",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Purchase failed");
      }

      setProfile({
        coins: data.profile?.coins ?? updatedCoins,
        avatarUrl: data.profile?.avatarUrl || profile.avatarUrl,
        usernameStyle: data.profile?.usernameStyle || "",
        avatarBorder: data.profile?.avatarBorder || "",
        profileBorder: data.profile?.profileBorder || "",
        ownedCosmetics: data.profile?.ownedCosmetics || updatedOwned
      });

      setMessage(
        alreadyOwned
          ? `${item.name} equipped`
          : `${item.name} purchased successfully`
      );

      window.dispatchEvent(new Event("cosmeticsUpdated"));
    } catch (error) {
      console.error(error);
      setMessage("Purchase failed");
    }
  };

  const handleUnequipItem = async (item) => {
    try {
      const formData = new FormData();

      if (item.id === "gold-avatar-border") {
        formData.append("avatarBorder", "");
      }

      if (item.id === "rainbow-username") {
        formData.append("usernameStyle", "");
      }

      if (item.id === "rainbow-profile-border") {
        formData.append("profileBorder", "");
      }

      const res = await fetch(
        `${API_BASE}/api/userProfile/${user.username}/shop`,
        {
          method: "PUT",
          body: formData
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setProfile((prev) => ({
        ...prev,
        avatarBorder:
          item.id === "gold-avatar-border" ? "" : prev.avatarBorder,
        usernameStyle:
          item.id === "rainbow-username" ? "" : prev.usernameStyle,
        profileBorder:
          item.id === "rainbow-profile-border" ? "" : prev.profileBorder
      }));

      setMessage(`${item.name} unequipped`);
      window.dispatchEvent(new Event("cosmeticsUpdated"));
    } catch (err) {
      console.error(err);
      setMessage("Failed to unequip item");
    }
  };

  const handleEquipAll = async () => {
    try {
      const formData = new FormData();

      if (profile.ownedCosmetics.includes("gold-avatar-border")) {
        formData.append("avatarBorder", "gold");
      }

      if (profile.ownedCosmetics.includes("rainbow-username")) {
        formData.append("usernameStyle", "rainbow");
      }

      if (profile.ownedCosmetics.includes("rainbow-profile-border")) {
        formData.append("profileBorder", "rainbow");
      }

      const res = await fetch(
        `${API_BASE}/api/userProfile/${user.username}/shop`,
        {
          method: "PUT",
          body: formData
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setProfile((prev) => ({
        ...prev,
        avatarBorder: data.profile?.avatarBorder || "",
        usernameStyle: data.profile?.usernameStyle || "",
        profileBorder: data.profile?.profileBorder || ""
      }));

      setMessage("All owned cosmetics equipped");
      window.dispatchEvent(new Event("cosmeticsUpdated"));
    } catch (err) {
      console.error(err);
      setMessage("Failed to equip all");
    }
  };

  const handleUnequipAll = async () => {
    try {
      const formData = new FormData();
      formData.append("avatarBorder", "");
      formData.append("usernameStyle", "");
      formData.append("profileBorder", "");

      const res = await fetch(
        `${API_BASE}/api/userProfile/${user.username}/shop`,
        {
          method: "PUT",
          body: formData
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setProfile((prev) => ({
        ...prev,
        avatarBorder: "",
        usernameStyle: "",
        profileBorder: ""
      }));

      setMessage("All cosmetics unequipped");
      window.dispatchEvent(new Event("cosmeticsUpdated"));
    } catch (err) {
      console.error(err);
      setMessage("Failed to unequip all");
    }
  };

  if (!user) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        <h2>Please log in first.</h2>
      </div>
    );
  }

  const usernameStyle =
    profile.usernameStyle === "rainbow"
      ? {
          background:
            "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: "bold"
        }
      : {
          color: darkMode ? "#ffffff" : "#000000"
        };

  const avatarStyle = {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
    margin: "0 auto",
    border:
      profile.avatarBorder === "gold"
        ? "4px solid gold"
        : darkMode
        ? "4px solid #666"
        : "4px solid #ccc"
  };

  const pageStyle = {
    minHeight: "100vh",
    padding: "30px",
    backgroundImage:
      "url('https://coolmoviegamez-avatars.s3.us-east-2.amazonaws.com/shop.jpeg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    color: darkMode ? "#ffffff" : "#000000",
    transition: "all 0.3s ease"
  };

  const cardStyle = {
    maxWidth: "700px",
    margin: "30px auto",
    padding: "25px",
    borderRadius: "14px",
    background: darkMode ? "#1e1e1e" : "#fff",
    color: darkMode ? "#ffffff" : "#000000"
  };

  const itemCardStyle = {
    border: darkMode ? "1px solid #444" : "1px solid #ddd",
    borderRadius: "10px",
    padding: "15px",
    backgroundColor: darkMode ? "#2a2a2a" : "#ffffff"
  };

  const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: darkMode ? "#2f2f2f" : "black",
    color: "white",
    cursor: "pointer"
  };

  const popupOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  };

  const popupBoxStyle = {
    position: "relative",
    width: "300px",
    padding: "25px",
    borderRadius: "12px",
    backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
    color: darkMode ? "#ffffff" : "#000000",
    textAlign: "center"
  };

  const popupXStyle = {
    position: "absolute",
    top: "8px",
    right: "12px",
    border: "none",
    background: "transparent",
    color: darkMode ? "#ffffff" : "#000000",
    fontSize: "22px",
    cursor: "pointer"
  };

  const popupButtonStyle = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "8px",
    background: darkMode ? "#2f2f2f" : "black",
    color: "white",
    cursor: "pointer"
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ textAlign: "center" }}>Coin Shop</h1>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src={buildImageUrl(profile.avatarUrl)}
            alt="avatar"
            style={avatarStyle}
          />
          <h2 style={usernameStyle}>{user.username}</h2>
          <p><strong>Coins:</strong> {profile.coins}</p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "10px"
            }}
          >
            <button
  onClick={() => {
    const allEquipped =
      (profile.ownedCosmetics.includes("gold-avatar-border")
        ? profile.avatarBorder === "gold"
        : true) &&
      (profile.ownedCosmetics.includes("rainbow-username")
        ? profile.usernameStyle === "rainbow"
        : true) &&
      (profile.ownedCosmetics.includes("rainbow-profile-border")
        ? profile.profileBorder === "rainbow"
        : true);

    allEquipped ? handleUnequipAll() : handleEquipAll();
  }}
  style={buttonStyle}
>
  {
    (
      (profile.ownedCosmetics.includes("gold-avatar-border")
        ? profile.avatarBorder === "gold"
        : true) &&
      (profile.ownedCosmetics.includes("rainbow-username")
        ? profile.usernameStyle === "rainbow"
        : true) &&
      (profile.ownedCosmetics.includes("rainbow-profile-border")
        ? profile.profileBorder === "rainbow"
        : true)
    )
      ? "Unequip All"
      : "Equip All"
  }
</button>
          </div>
        </div>

        <div style={{ display: "grid", gap: "15px" }}>
          {shopItems.map((item) => {
            const owned = profile.ownedCosmetics.includes(item.id);

            const equipped =
              (item.id === "gold-avatar-border" && profile.avatarBorder === "gold") ||
              (item.id === "rainbow-username" && profile.usernameStyle === "rainbow") ||
              (item.id === "rainbow-profile-border" && profile.profileBorder === "rainbow");

            return (
              <div key={item.id} style={itemCardStyle}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p><strong>Price:</strong> {item.price} coins</p>
                {owned && <p><strong>Owned</strong></p>}
                <button
                  onClick={() =>
                    equipped ? handleUnequipItem(item) : handleBuy(item)
                  }
                  style={buttonStyle}
                >
                  {equipped ? "Unequip" : owned ? "Equip Cosmetic" : "Buy"}
                </button>
              </div>
            );
          })}
        </div>

        {message && (
          <div style={popupOverlayStyle}>
            <div style={popupBoxStyle}>
              <button onClick={() => setMessage("")} style={popupXStyle}>
                ×
              </button>

              <p style={{ margin: "20px 0", fontWeight: "bold" }}>
                {message}
              </p>

              <button onClick={() => setMessage("")} style={popupButtonStyle}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;