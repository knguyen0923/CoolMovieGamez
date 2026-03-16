import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../App";

const API_BASE = "http://localhost:8081";

const buildImageUrl = (avatarUrl) => {
  if (!avatarUrl) return "https://via.placeholder.com/150";

  // already full url
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }

  // saved as /uploads/file.jpg
  if (avatarUrl.startsWith("/uploads/")) {
    return `${API_BASE}${avatarUrl}`;
  }

  // saved as uploads/file.jpg
  if (avatarUrl.startsWith("uploads/")) {
    return `${API_BASE}/${avatarUrl}`;
  }

  // saved as just filename like 1773631731209-dog.jpeg
  return `${API_BASE}/uploads/${avatarUrl}`;
};

const PrivateUserProfile = () => {
  const user = useContext(UserContext);

  const [profile, setProfile] = useState({
    bio: "",
    avatarUrl: "",
    coins: 0
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    fetch(`${API_BASE}/api/userProfile/${user.username}`)
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Could not load profile");
        }

        return data;
      })
      .then((data) => {
        console.log("GET PROFILE RESPONSE:", data);

        if (data.profile) {
          setProfile({
            bio: data.profile.bio || "",
            avatarUrl: data.profile.avatarUrl || "",
            coins: data.profile.coins || 0
          });
        }

        setMessage("");
      })
      .catch((error) => {
        console.error("LOAD PROFILE ERROR:", error);
        setMessage("Could not load profile");
      });
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    console.log("SELECTED FILE:", file);
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;

    const formData = new FormData();
    formData.append("bio", profile.bio || "");

    if (selectedFile) {
      formData.append("avatar", selectedFile, selectedFile.name);
    }

    try {
      const response = await fetch(`${API_BASE}/api/userProfile/${user.username}`, {
        method: "PUT",
        body: formData
      });

      const data = await response.json();

      console.log("PUT PROFILE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Could not update profile");
      }

      if (data.profile) {
        setProfile({
          bio: data.profile.bio || "",
          avatarUrl: data.profile.avatarUrl || "",
          coins: data.profile.coins || 0
        });
      }

      setSelectedFile(null);
      setMessage(data.message || "Profile updated");
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);
      setMessage(error.message || "Could not update profile");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/api/userProfile/account/${user.username}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem("token");
        alert(data.message || "Account deleted");
        window.location.href = "/";
      } else {
        setMessage(data.message || "Could not delete account");
      }
    } catch (error) {
      console.error("DELETE PROFILE ERROR:", error);
      setMessage("Could not delete account");
    }
  };

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Please log in to view your profile.</h2>
        </div>
      </div>
    );
  }

  const imageSrc = buildImageUrl(profile.avatarUrl);

  console.log("avatarUrl from db:", profile.avatarUrl);
  console.log("final imageSrc:", imageSrc);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>User Profile</h1>

        <img
          src={imageSrc}
          alt="avatar"
          style={styles.avatar}
          onError={() => {
            console.log("IMAGE FAILED TO LOAD:", imageSrc);
          }}
        />

        <p style={styles.text}>
          <strong>Name:</strong> {user.username}
        </p>

        <p style={styles.text}>
          <strong>Coins:</strong> {profile.coins}
        </p>

        <form onSubmit={handleSubmit} style={styles.form} encType="multipart/form-data">
          <label htmlFor="avatarUpload" style={styles.label}>
            Select Profile Picture
          </label>

          <input
            id="avatarUpload"
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={styles.input}
          />

          <label style={styles.label}>Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) =>
              setProfile({ ...profile, bio: e.target.value })
            }
            rows="4"
            style={styles.textarea}
            placeholder="Write something about yourself"
          />

          <button type="submit" style={styles.saveButton}>
            Save Profile
          </button>
        </form>

        <button
          type="button"
          onClick={handleDeleteAccount}
          style={styles.deleteButton}
        >
          Delete Account
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: "20px"
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    padding: "30px",
    textAlign: "center"
  },
  title: {
    marginBottom: "20px"
  },
  avatar: {
    display: "block",
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    objectFit: "cover",
    margin: "0 auto 20px auto",
    border: "3px solid #333"
  },
  text: {
    margin: "10px 0",
    fontSize: "18px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "20px"
  },
  label: {
    marginTop: "15px",
    marginBottom: "8px",
    fontWeight: "bold"
  },
  input: {
    width: "100%",
    maxWidth: "300px"
  },
  textarea: {
    width: "100%",
    maxWidth: "350px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    resize: "none"
  },
  saveButton: {
    marginTop: "20px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#222",
    color: "#fff",
    cursor: "pointer"
  },
  deleteButton: {
    marginTop: "15px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#b22222",
    color: "#fff",
    cursor: "pointer"
  },
  message: {
    marginTop: "15px",
    fontWeight: "bold"
  }
};

export default PrivateUserProfile;