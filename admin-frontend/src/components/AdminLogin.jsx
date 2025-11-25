import React, { useState } from 'react';
import axios from 'axios';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        adminUser: '',
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
            // Transform data to match your backend expectations
            const loginData = {
                email: formData.adminUser,
                password: formData.password
            };
            
            const response = await axios.post('http://localhost:5000/api/admin/login', loginData);
            onLogin(response.data.user);
        } catch (error) {
            setError(error.response?.data?.error || 'Admin login failed');
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        window.history.back();
    };

    return (
        <div className="admin-login-page">
            <div className="welcome-text center-text">WELCOME TO</div>
            <div className="brand-name center-text">VENUEASE</div>
            
            <div className="container">
                <div className="header">
                    {/* Back Button */}
                    <a href="#" className="back-button" onClick={(e) => { e.preventDefault(); goBack(); }}>
                        ←
                    </a>
                </div>

                <div className="form-container">
                    {error && <div className="admin-error center-text">{error}</div>}
                    
                    <form id="adminLoginForm" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input 
                                type="text" 
                                id="admin-user"
                                name="adminUser"
                                value={formData.adminUser}
                                onChange={handleChange}
                                placeholder="Admin User" 
                                required 
                                className="center-block"
                            />
                        </div>


                        <div className="input-group">
                            <input 
                                type="password" 
                                id="admin-password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password" 
                                required 
                                className="center-block"
                            />
                        </div>

                        <button type="submit" className="btn center-block" disabled={loading}>
                            {loading ? 'LOGGING IN...' : 'LOG-IN'}
                        </button>
                    </form>

                    <div className="help-section center-text">
                        <div className="help-title">Something's wrong?</div>
                        <a href="mailto:developer@venueease.com" className="help-link">Contact the developer</a>
                    </div>

                    <div className="admin-login-note center-text">
                        <h4>Default Admin Accounts:</h4>
                        <p>Email: <strong>admin@venuease.com</strong> | Password: <strong>admin123</strong></p>
                        <p>Email: <strong>staff@venuease.com</strong> | Password: <strong>staff123</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;