import React, { useEffect, useState } from "react";
import getUserInfo from "../utilities/decodeJwt";

function UserProfile() {

  const [profile, setProfile] = useState({
    bio: "",
    avatarUrl: "",
    coins: 0
  });

  const user = getUserInfo();

  // load profile info
  useEffect(() => {

    if (!user) return;

    fetch(`/api/userProfile/${user.username}`)
      .then(res => res.json())
      .then(data => {

        if (data.profile) {
          setProfile(data.profile);
        }

      });

  }, [user]);

  // update profile
  const handleSubmit = async (e) => {

    e.preventDefault();

    const response = await fetch(`/api/userProfile/${user.username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bio: profile.bio,
        avatarUrl: profile.avatarUrl
      })
    });

    const data = await response.json();

    alert(data.message);
  };

  return (

    <div style={{ padding: "30px" }}>

      <h1>User Profile</h1>

      <img
        src={profile.avatarUrl || "https://via.placeholder.com/150"}
        alt="avatar"
        width="150"
        height="150"
      />

      <p><strong>Coins:</strong> {profile.coins}</p>

      <form onSubmit={handleSubmit}>

        <div>

          <label>Avatar URL</label>

          <input
            type="text"
            value={profile.avatarUrl}
            onChange={(e) =>
              setProfile({ ...profile, avatarUrl: e.target.value })
            }
          />

        </div>

        <div>

          <label>Bio</label>

          <textarea
            value={profile.bio}
            onChange={(e) =>
              setProfile({ ...profile, bio: e.target.value })
            }
          />

        </div>

        <button type="submit">
          Save Profile
        </button>

      </form>

    </div>
  );
}

export default UserProfile;