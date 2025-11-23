import React, { useState } from 'react';
import './EventManagement.css';

const EventManagement = ({ admin, onBack, onLogout }) => {
    const [events, setEvents] = useState([]);

    return (
        <div className="event-management">
            <div className="admin-header">
                <h2>Event Management</h2>
                <div className="header-buttons">
                    <button onClick={onBack} className="btn-secondary">Back to Dashboard</button>
                    <button onClick={onLogout} className="btn-logout">Logout</button>
                </div>
            </div>

            <div className="event-content">
                <div className="events-stats">
                    <div className="stat-card">
                        <h3>Total Events</h3>
                        <p>{events.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Active Events</h3>
                        <p>{events.filter(event => event.status === 'active').length}</p>
                    </div>
                </div>

                <div className="events-list">
                    <h3>Events Management</h3>
                    <p>Event management functionality coming soon...</p>
                    {/* Add event creation, editing, deletion functionality here */}
                </div>
            </div>
        </div>
    );
};

export default EventManagement;