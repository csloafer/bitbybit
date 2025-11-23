import React, { useState } from 'react';
import axios from 'axios';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
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

        try {
            const response = await axios.post('http://localhost:5000/api/admin/login', formData);
            onLogin(response.data.user);
        } catch (error) {
            setError(error.response?.data?.error || 'Admin login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <div className="admin-login-header">
                    <div className="admin-logo">
                        <span className="admin-icon">🔒</span>
                        <h1>VenuEase Admin</h1>
                    </div>
                    <p className="admin-subtitle">System Administration Panel</p>
                </div>

                <div className="admin-login-form">
                    {error && <div className="admin-error">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Admin Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@venuease.com"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter admin password"
                                required
                            />
                        </div>
                        
                        <button type="submit" className="admin-login-btn" disabled={loading}>
                            {loading ? 'Signing In...' : 'Access Admin Panel'}
                        </button>
                    </form>

                    <div className="admin-login-note">
                        <h4>Default Admin Accounts:</h4>
                        <p>Email: <strong>admin@venuease.com</strong> | Password: <strong>admin123</strong></p>
                        <p>Email: <strong>staff@venuease.com</strong> | Password: <strong>staff123</strong></p>
                    </div>
                </div>

                <div className="admin-login-footer">
                    <p>Customer website: <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;