import React, { useEffect, useState } from "react";
import salonApi from "../api";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const data = await salonApi.getCurrentUser();
      setUserData(data.user || data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch user profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile">
      <h2>Welcome, {userData?.firstName || "User"}!</h2>
      <p>Email: {userData?.email}</p>
      <p>Phone: {userData?.phone}</p>
    </div>
  );
};

export default Profile;
