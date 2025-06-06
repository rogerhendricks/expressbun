import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const updateData = {};
    if (formData.name !== user.name) updateData.name = formData.name;
    if (formData.email !== user.email) updateData.email = formData.email;
    if (formData.password) updateData.password = formData.password;

    if (Object.keys(updateData).length === 0) {
      setError('No changes to save');
      setLoading(false);
      return;
    }

    const result = await updateProfile(updateData);
    
    if (result.success) {
      setMessage('Profile updated successfully');
      setIsEditing(false);
      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const resetForm = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setError('');
    setMessage('');
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || '?';
  };

  return (
    <div className="profile-container">
      <div className="container">
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary rounded mb-4">
          <div className="container-fluid">
            <span className="navbar-brand mb-0 h1">User Dashboard</span>
            <button 
              onClick={handleLogout} 
              className="btn btn-outline-light"
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </nav>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-header bg-white py-3">
                <div className="row align-items-center">
                  <div className="col">
                    <h3 className="card-title mb-0">
                      <i className="bi bi-person-circle me-2"></i>
                      Profile Information
                    </h3>
                  </div>
                  <div className="col-auto">
                    {!isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary"
                      >
                        <i className="bi bi-pencil-square me-2"></i>
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-body p-4">
                {/* User Avatar */}
                <div className="text-center mb-4">
                  <div className="profile-avatar">
                    {getInitials(user?.name)}
                  </div>
                  <h4 className="mb-1">{user?.name}</h4>
                  <p className="text-muted">@{user?.username}</p>
                </div>

                {/* Messages */}
                {message && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {message}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setMessage('')}
                    ></button>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError('')}
                    ></button>
                  </div>
                )}

                {!isEditing ? (
                  /* Display Mode */
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold text-muted">Username</label>
                      <p className="form-control-static fs-5">{user?.username}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold text-muted">Full Name</label>
                      <p className="form-control-static fs-5">{user?.name}</p>
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold text-muted">Email Address</label>
                      <p className="form-control-static fs-5">{user?.email}</p>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode */
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="edit-username" className="form-label">Username</label>
                        <input
                          type="text"
                          className="form-control"
                          id="edit-username"
                          value={user?.username}
                          disabled
                        />
                        <div className="form-text">Username cannot be changed</div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="edit-name" className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="edit-name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="edit-email" className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="edit-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <hr className="my-4" />

                    <h5 className="mb-3">Change Password <small className="text-muted">(optional)</small></h5>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="edit-password" className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          id="edit-password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Leave blank to keep current password"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="edit-confirm-password" className="form-label">Confirm New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          id="edit-confirm-password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                      <button 
                        type="submit" 
                        className="btn btn-success"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-2"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button 
                        type="button" 
                        onClick={resetForm}
                        className="btn btn-secondary"
                      >
                        <i className="bi bi-x-lg me-2"></i>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;