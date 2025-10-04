// Example using the enhanced hook in a profile component
import React, { useEffect } from 'react';
import { salonApi } from '../../services/salonApi';
import { useApi } from '../../hooks/useApi';

const Profile = () => {
  const { loading, error, data: userData, callApi } = useApi();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    await callApi(() => salonApi.getCurrentUser());
    // No need for success callback since data is automatically set
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile">
      <h2>Welcome, {userData?.user?.firstName}!</h2>
      <p>Email: {userData?.user?.email}</p>
      <p>Phone: {userData?.user?.phone}</p>
      {/* Rest of profile content */}
    </div>
  );
};

export default Profile;