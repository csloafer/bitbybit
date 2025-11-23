import React, { useState } from 'react';
import './BookingManagement.css';

const BookingManagement = ({ admin, onBack, onLogout }) => {
    const [bookings, setBookings] = useState([]);

    return (
        <div className="booking-management">
            <div className="admin-header">
                <h2>Booking Management</h2>
                <div className="header-buttons">
                    <button onClick={onBack} className="btn-secondary">Back to Dashboard</button>
                    <button onClick={onLogout} className="btn-logout">Logout</button>
                </div>
            </div>

            <div className="booking-content">
                <div className="bookings-stats">
                    <div className="stat-card">
                        <h3>Total Bookings</h3>
                        <p>{bookings.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Pending</h3>
                        <p>{bookings.filter(booking => booking.status === 'pending').length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Confirmed</h3>
                        <p>{bookings.filter(booking => booking.status === 'confirmed').length}</p>
                    </div>
                </div>

                <div className="bookings-list">
                    <h3>All Bookings</h3>
                    <p>Booking management functionality coming soon...</p>
                    {/* Add booking approval, cancellation, viewing functionality here */}
                </div>
            </div>
        </div>
    );
};

export default BookingManagement;