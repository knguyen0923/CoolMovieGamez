import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../App";

const API_BASE = "http://localhost:8081";

const buildImageUrl = (avatarUrl) => {
  if (!avatarUrl) return "https://via.placeholder.com/150";

  // supports S3 URLs
  if (avatarUrl.startsWith("http")) {
    return avatarUrl;
  }

  // supports old local uploads
  if (avatarUrl.startsWith("/uploads/")) {
    return `${API_BASE}${avatarUrl}`;
  }

  return `${API_BASE}/uploads/${avatarUrl}`;
};

const PrivateUserProfile = () => {
  const user = useContext(UserContext);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    avatarUrl: "",
    coins: 0
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: ""
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

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
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
      })
      .then((data) => {
        setProfile({
          firstName: data.user?.firstName || "",
          lastName: data.user?.lastName || "",
          email: data.user?.email || "",
          bio: data.profile?.bio || "",
          avatarUrl: data.profile?.avatarUrl || "",
          coins: data.profile?.coins || 0
        });
      })
      .catch((err) => {
        console.error(err);
        setMessage("Error loading profile");
      });
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("firstName", profile.firstName);
    formData.append("lastName", profile.lastName);
    formData.append("email", profile.email);
    formData.append("bio", profile.bio);

    if (selectedFile) {
      formData.append("avatar", selectedFile);
    }

    try {
      const res = await fetch(`${API_BASE}/api/userProfile/${user.username}`, {
        method: "PUT",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setProfile({
        firstName: data.user?.firstName || profile.firstName,
        lastName: data.user?.lastName || profile.lastName,
        email: data.user?.email || profile.email,
        bio: data.profile?.bio || "",
        avatarUrl: data.profile?.avatarUrl || "",
        coins: data.profile?.coins || 0
      });

      setMessage("Profile updated");
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      setMessage("Update failed");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("currentPassword", passwordData.currentPassword);
    formData.append("newPassword", passwordData.newPassword);

    try {
      const res = await fetch(`${API_BASE}/api/userProfile/${user.username}`, {
        method: "PUT",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: ""
      });
      setShowPasswordSection(false);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Password update failed");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Delete account permanently?")) return;

    const res = await fetch(
      `${API_BASE}/api/userProfile/account/${user.username}`,
      {
        method: "DELETE"
      }
    );

    const data = await res.json();

    if (res.ok) {
      localStorage.removeItem("accessToken");
      alert("Account deleted");
      window.location.href = "/";
    } else {
      setMessage(data.message);
    }
  };

  if (!user) {
    return (
      <h2 style={{ padding: "30px", textAlign: "center" }}>
        Please log in first.
      </h2>
    );
  }

  const imageSrc = buildImageUrl(profile.avatarUrl);

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: darkMode ? "#121212" : "#f4f4f4",
      color: darkMode ? "#ffffff" : "#000000",
      transition: "all 0.3s ease"
    },
    card: {
      background: darkMode ? "#1e1e1e" : "white",
      color: darkMode ? "#ffffff" : "#000000",
      padding: "30px",
      borderRadius: "10px",
      width: "400px",
      textAlign: "center",
      boxShadow: darkMode
        ? "0 0 12px rgba(255,255,255,0.08)"
        : "0 0 10px rgba(0,0,0,0.2)",
      transition: "all 0.3s ease"
    },
    avatar: {
      display: "block",
      width: "150px",
      height: "150px",
      borderRadius: "50%",
      objectFit: "cover",
      margin: "0 auto 20px auto",
      border: darkMode ? "3px solid #999" : "3px solid #333"
    },
    form: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "12px",
      marginTop: "15px"
    },
    label: {
      fontWeight: "bold",
      textAlign: "center",
      color: darkMode ? "#ffffff" : "#000000"
    },
    input: {
      padding: "10px",
      border: darkMode ? "1px solid #555" : "1px solid #ccc",
      borderRadius: "6px",
      width: "100%",
      maxWidth: "300px",
      textAlign: "center",
      backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
      color: darkMode ? "#ffffff" : "#000000"
    },
    fileInput: {
      width: "100%",
      maxWidth: "300px",
      textAlign: "center",
      color: darkMode ? "#ffffff" : "#000000"
    },
    textarea: {
      padding: "10px",
      minHeight: "80px",
      border: darkMode ? "1px solid #555" : "1px solid #ccc",
      borderRadius: "6px",
      width: "100%",
      maxWidth: "300px",
      textAlign: "center",
      backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
      color: darkMode ? "#ffffff" : "#000000"
    },
    saveButton: {
      background: darkMode ? "#2f2f2f" : "black",
      color: "white",
      padding: "10px",
      border: "none",
      marginTop: "10px",
      borderRadius: "6px",
      width: "200px",
      cursor: "pointer"
    },
    deleteButton: {
      background: darkMode ? "#8b0000" : "darkred",
      color: "white",
      padding: "10px",
      border: "none",
      marginTop: "15px",
      borderRadius: "6px",
      width: "200px",
      cursor: "pointer"
    },
    message: {
      marginTop: "15px",
      fontWeight: "bold",
      color: darkMode ? "#ffffff" : "#000000"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>User Profile</h1>

        <img src={imageSrc} alt="avatar" style={styles.avatar} />

        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Coins:</strong> {profile.coins}
        </p>

        <form
          onSubmit={handleSubmit}
          style={styles.form}
          encType="multipart/form-data"
        >
          <label style={styles.label}>First Name</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) =>
              setProfile({ ...profile, firstName: e.target.value })
            }
            style={styles.input}
          />

          <label style={styles.label}>Last Name</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) =>
              setProfile({ ...profile, lastName: e.target.value })
            }
            style={styles.input}
          />

          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            style={styles.input}
          />

          <label style={styles.label}>Change / Upload Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={styles.fileInput}
          />

          <label style={styles.label}>Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            style={styles.textarea}
          />

          <button type="submit" style={styles.saveButton}>
            Save Profile
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowPasswordSection(!showPasswordSection)}
          style={styles.saveButton}
        >
          Change Password
        </button>

        {showPasswordSection && (
          <form onSubmit={handlePasswordChange} style={styles.form}>
            <label style={styles.label}>Old Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value
                })
              }
              style={styles.input}
            />

            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value
                })
              }
              style={styles.input}
            />

            <button type="submit" style={styles.saveButton}>
              Submit New Password
            </button>
          </form>
        )}

        <button onClick={handleDeleteAccount} style={styles.deleteButton}>
          Delete Account
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default PrivateUserProfile;