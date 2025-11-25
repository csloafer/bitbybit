// C:\VenuEase\frontend\src\components\Register.jsx
import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ switchToLogin, switchToLanding }) => {
    const [formData, setFormData] = useState({
        full_Name: '',  // Changed from username
        email: '',
        password: '',
        confirmPassword: ''
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

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const userData = {
                full_Name: formData.full_Name,
                email: formData.email,
                password: formData.password
            };

            console.log('🔄 Sending registration:', userData);

            const response = await axios.post('http://localhost:5000/api/customer/register', userData);
            
            console.log('✅ Registration successful:', response.data);
            
            alert('Registration successful! Please login.');
            switchToLogin();
        } catch (error) {
            console.error('❌ Registration failed:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
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
                        <h2 className="auth-title">Sign Up</h2>
                        
                        {error && <div className="auth-error">{error}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-field">
                                <label className="field-label">Full Name</label>
                                <input
                                    type="text"
                                    name="full_Name"  // Changed from username
                                    value={formData.full_Name}
                                    onChange={handleChange}
                                    className="field-input"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            
                            <div className="form-field">
                                <label className="field-label">Email</label>
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
                                    placeholder="Create a password (min. 6 characters)"
                                    required
                                />
                            </div>
                            
                            <div className="form-field">
                                <label className="field-label">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="field-input"
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                className="auth-submit-btn" 
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'SIGN UP'}
                            </button>
                        </form>
                        
                        <div className="auth-switch">
                            <span>Already have an account? </span>
                            <button onClick={switchToLogin} className="switch-link">Log-in</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;