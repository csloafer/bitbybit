import React from 'react';
import './QueryBuilder.css';

const QueryBuilder = ({ admin, onBack, onLogout }) => {
    return (
        <div className="query-builder-page">
            <header className="admin-header">
                <div className="admin-header-content">
                    <div className="header-actions">
                        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
                        <h1>Database Query Builder</h1>
                    </div>
                    <button className="logout-btn" onClick={onLogout}>Logout</button>
                </div>
            </header>

            <div className="query-builder-content">
                <div className="query-builder-info">
                    <h2>SQL Query Builder</h2>
                    <p>Execute custom SQL queries on the VenuEase database</p>
                </div>

                <div className="coming-soon">
                    <div className="coming-soon-icon">🔧</div>
                    <h3>Query Builder Coming Soon</h3>
                    <p>This feature is currently under development and will be available in the next update.</p>
                    <p>For now, you can manage users and view system statistics from the dashboard.</p>
                </div>

                <div className="database-tables">
                    <h3>Available Database Tables</h3>
                    <div className="tables-grid">
                        <div className="table-card">
                            <h4>CUSTOMERS</h4>
                            <p>Customer accounts and information</p>
                        </div>
                        <div className="table-card">
                            <h4>ADMIN</h4>
                            <p>Staff and administrator accounts</p>
                        </div>
                        <div className="table-card">
                            <h4>VENUE</h4>
                            <p>Venue listings and details</p>
                        </div>
                        <div className="table-card">
                            <h4>EVENTS</h4>
                            <p>Event information and types</p>
                        </div>
                        <div className="table-card">
                            <h4>BOOKING</h4>
                            <p>Booking records and reservations</p>
                        </div>
                        <div className="table-card">
                            <h4>PAYMENT</h4>
                            <p>Payment transactions and history</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueryBuilder;