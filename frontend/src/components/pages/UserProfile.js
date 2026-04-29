import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import API_BASE from "../../config";

function UserProfile() {
  const { user } = useContext(UserContext);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    avatarUrl: "",
    coins: 0,
  });

  useEffect(() => {
    if (!user) return;

    fetch(`${API_BASE}/api/userProfile/${user.username}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          firstName: data.user?.firstName || user.firstName || "",
          lastName: data.user?.lastName || user.lastName || "",
          email: data.user?.email || user.email || "",
          bio: data.profile?.bio || "",
          avatarUrl: data.profile?.avatarUrl || "",
          coins: data.profile?.coins || 0,
        });
      })
      .catch((error) => {
        console.error("Error loading profile:", error);
      });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/userProfile/${user.username}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
          }),
        }
      );

      const data = await response.json();
      alert(data.message || "Profile updated");
    } catch (error) {
      console.error(error);
      alert("Error updating profile");
    }
  };

  if (!user) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Please log in first.</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>User Profile</h1>

      <img
        src={profile.avatarUrl || "https://via.placeholder.com/150"}
        alt="avatar"
        width="150"
        height="150"
        style={styles.avatar}
      />

      <p>
        <strong>Coins:</strong> {profile.coins}
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div>
          <label>First Name</label>
          <br />
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) =>
              setProfile({ ...profile, firstName: e.target.value })
            }
            style={styles.input}
          />
        </div>

        <div>
          <label>Last Name</label>
          <br />
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) =>
              setProfile({ ...profile, lastName: e.target.value })
            }
            style={styles.input}
          />
        </div>

        <div>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile({ ...profile, email: e.target.value })
            }
            style={styles.input}
          />
        </div>

        <div>
          <label>Avatar URL</label>
          <br />
          <input
            type="text"
            value={profile.avatarUrl}
            onChange={(e) =>
              setProfile({ ...profile, avatarUrl: e.target.value })
            }
            style={styles.input}
          />
        </div>

        <div>
          <label>Bio</label>
          <br />
          <textarea
            value={profile.bio}
            onChange={(e) =>
              setProfile({ ...profile, bio: e.target.value })
            }
            style={styles.textarea}
          />
        </div>

        <button type="submit" style={styles.button}>
          Save Profile
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    padding: "30px",
    textAlign: "center",
  },
  avatar: {
    objectFit: "cover",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  form: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "400px",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "left",
  },
  input: {
    width: "100%",
    padding: "10px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    minHeight: "100px",
  },
  button: {
    padding: "10px",
    cursor: "pointer",
  },
};

export default UserProfile;