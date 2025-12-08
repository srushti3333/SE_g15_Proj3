// restaurant/profile.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    cuisine: user?.profile?.cuisine || '',
    phone: user?.profile?.phone || '',
    street: user?.profile?.address?.street || '',
    city: user?.profile?.address?.city || '',
    state: user?.profile?.address?.state || '',
    zipCode: user?.profile?.address?.zipCode || ''
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
          cuisine: formData.cuisine,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          }
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
      <h1>Restaurant Profile</h1>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">🍽️</div>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-edit"
            />
          ) : (
            <h2>{user?.profile?.name || 'Restaurant'}</h2>
          )}
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <span className="label">Email:</span>
            <span className="value">{user?.email}</span>
          </div>

          <div className="detail-row">
            <span className="label">Cuisine:</span>
            {isEditing ? (
              <input
                type="text"
                name="cuisine"
                value={formData.cuisine}
                onChange={handleChange}
                className="input-edit"
              />
            ) : (
              <span className="value">{user?.profile?.cuisine || 'Not specified'}</span>
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

          <div className="detail-row">
            <span className="label">Address:</span>
            {isEditing ? (
              <div className="address-edit">
                <input type="text" name="street" placeholder="Street" value={formData.street} onChange={handleChange} className="input-edit" />
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="input-edit" />
                <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="input-edit" />
                <input type="text" name="zipCode" placeholder="ZIP Code" value={formData.zipCode} onChange={handleChange} className="input-edit" />
              </div>
            ) : (
              <span className="value">
                {user?.profile?.address
                  ? `${user.profile.address.street}, ${user.profile.address.city}, ${user.profile.address.state} ${user.profile.address.zipCode}`
                  : 'Not provided'}
              </span>
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
