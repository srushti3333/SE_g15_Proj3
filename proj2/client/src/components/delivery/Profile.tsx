// delivery/profile.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    vehicleType: user?.profile?.vehicleType || '',
    licensePlate: user?.profile?.licensePlate || '',
    phone: user?.profile?.phone || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleSave = async () => {
    try {
      const response = await api.put('/auth/profile', {
        email: user?.email,
        profile: {
          name: formData.name,
          vehicleType: formData.vehicleType,
          licensePlate: formData.licensePlate,
          phone: formData.phone
        }
      });

      if (response.status === 200) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Profile updated successfully!');
        setIsEditing(false);
      } else {
        alert('Failed to update profile: ' + response.data.error);
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      alert('Error updating profile: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="profile">
      <h1>Delivery Partner Profile</h1>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">🚚</div>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-edit"
            />
          ) : (
            <h2>{user?.profile?.name || 'Delivery Partner'}</h2>
          )}
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <span className="label">Email:</span>
            <span className="value">{user?.email}</span>
          </div>

          <div className="detail-row">
            <span className="label">Vehicle Type:</span>
            {isEditing ? (
              <input
                type="text"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="input-edit"
              />
            ) : (
              <span className="value">{user?.profile?.vehicleType || 'Not specified'}</span>
            )}
          </div>

          <div className="detail-row">
            <span className="label">License Plate:</span>
            {isEditing ? (
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                className="input-edit"
              />
            ) : (
              <span className="value">{user?.profile?.licensePlate || 'Not provided'}</span>
            )}
          </div>

          <div className="detail-row">
            <span className="label">Phone:</span>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-edit"
              />
            ) : (
              <span className="value">{user?.profile?.phone || 'Not provided'}</span>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="btn btn-success" onClick={handleSave}>Save</button>
              <button className="btn btn-secondary" onClick={handleEditToggle}>Cancel</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleEditToggle}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
