// C:\VenuEase\frontend\src\components\Login.jsx
import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ switchToRegister, switchToLanding, onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',  // Backend expects email, not username
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
            console.log('🔄 Attempting login:', { email: formData.email });
            
            const response = await axios.post('http://localhost:5000/api/customer/login', formData);
            
            console.log('✅ Login successful:', response.data);
            onLogin(response.data.user);
        } catch (error) {
            console.error('❌ Login failed:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Login failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <nav className="auth-nav">
                <div className="auth-nav-container">
                    <button className="back-btn" onClick={switchToLanding}>← Back</button>
                    <div className="auth-brand">VenuEase</div>
                    <div className="auth-nav-spacer"></div>
                </div>
            </nav>

            <div className="auth-content">
                <div className="auth-form-container">
                    <div className="auth-form">
                        <h2 className="auth-title">Log In</h2>
                        
                        {error && <div className="auth-error">{error}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-field">
                                <label className="field-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="field-input"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            
                            <div className="form-field">
                                <label className="field-label">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="field-input"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                className="auth-submit-btn" 
                                disabled={loading}
                            >
                                {loading ? 'Logging In...' : 'LOG IN'}
                            </button>
                        </form>
                        
                        <div className="auth-switch">
                            <span>Don't have an account? </span>
                            <button onClick={switchToRegister} className="switch-link">Sign-Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;