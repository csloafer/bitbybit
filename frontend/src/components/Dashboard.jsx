import React from 'react';

const Dashboard = ({ user, onLogout }) => {
    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="container">
                    <h1>Welcome to VenuEase, {user.full_Name}!</h1>
                    <div className="header-actions">
                        <span className="user-info-brief">
                            Welcome, <strong>{user.full_Name}</strong>
                        </span>
                        <button className="logout-btn" onClick={onLogout}>Logout</button>
                    </div>
                </div>
            </header>
            
            <div className="dashboard-content">
                <div className="user-info">
                    <h2>Your Profile</h2>
                    <p><strong>Name:</strong> {user.full_Name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Account Type:</strong> Customer</p>
                </div>
                
                <div className="dashboard-features">
                    <h2>Available Features</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">📅</div>
                            <h3>Book Venue</h3>
                            <p>Reserve venues for your events and meetings</p>
                            <button className="feature-btn">Book Now</button>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">📋</div>
                            <h3>My Bookings</h3>
                            <p>View and manage your existing reservations</p>
                            <button className="feature-btn">View Bookings</button>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">💰</div>
                            <h3>Payments</h3>
                            <p>Track your payment history and invoices</p>
                            <button className="feature-btn">View Payments</button>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">👤</div>
                            <h3>Profile Settings</h3>
                            <p>Update your personal information and preferences</p>
                            <button className="feature-btn">Edit Profile</button>
                        </div>
                    </div>
                </div>

                <div className="recent-activity">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                        <div className="activity-item">
                            <span className="activity-icon">📅</span>
                            <div className="activity-details">
                                <p>No recent bookings</p>
                                <small>Make your first venue reservation</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;