import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

const UserManagement = ({ admin, onBack, onLogout, onViewDashboard, onViewQueryBuilder, onViewVenues }) => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        active: 0,
        inactive: 0,
        total: 0,
        recent: 0
    });

    useEffect(() => {
        fetchUsers();
        fetchUserStats();
    }, []);

    // Fetch users from backend
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/admin/users');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch user statistics
    const fetchUserStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/users/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    // Handle search with debounce
    const handleSearch = async (searchValue) => {
        setSearchTerm(searchValue);
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/admin/users', {
                params: { search: searchValue }
            });
            setCustomers(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Toggle user active status
    const toggleUserStatus = async (customerId, currentStatus) => {
        const newStatus = !currentStatus;
        const confirmMessage = newStatus 
            ? 'Are you sure you want to activate this user?'
            : 'Are you sure you want to deactivate this user?';
        
        if (!window.confirm(confirmMessage)) return;
        
        try {
            await axios.put(`http://localhost:5000/api/admin/users/${customerId}/status`, {
                is_Active: newStatus
            });
            
            // Update local state
            setCustomers(prevCustomers => 
                prevCustomers.map(customer => 
                    customer.customer_ID === customerId 
                        ? { ...customer, is_Active: newStatus }
                        : customer
                )
            );
            
            // Refresh stats
            fetchUserStats();
            
            alert(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        } catch (error) {
            console.error('Error updating user status:', error);
            alert('Failed to update user status. Please try again.');
        }
    };

    // Delete user (optional - be careful!)
    const deleteUser = async (customerId, customerName) => {
        if (!window.confirm(`Are you sure you want to delete ${customerName}? This action cannot be undone!`)) {
            return;
        }
        
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${customerId}`);
            
            // Remove from local state
            setCustomers(prevCustomers => 
                prevCustomers.filter(customer => customer.customer_ID !== customerId)
            );
            
            // Refresh stats
            fetchUserStats();
            
            alert('User deleted successfully!');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.error || 'Failed to delete user. Please try again.');
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="user-management">
            <div className="admin-layout">
                {/* Sidebar */}
                <aside className="admin-sidebar">
                    <div className="sidebar-logo">
                        <h1 className="brand-name">VenuEase</h1>
                        <div className="brand-subtitle">ADMIN PANEL</div>
                    </div>
                    
                    <nav className="admin-nav">
                        <div className="nav-title">MAIN NAVIGATION</div>
                        <ul className="nav-list">
                            <li className="nav-item">
                                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onViewDashboard(); }}>
                                    <span className="nav-icon">📊</span>
                                    <span>Dashboard</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#" className="nav-link active">
                                    <span className="nav-icon">👥</span>
                                    <span>Users</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onViewQueryBuilder(); }}>
                                    <span className="nav-icon">🔍</span>
                                    <span>Query Editor</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onViewVenues(); }}>
                                    <span className="nav-icon">🏢</span>
                                    <span>Venues</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="admin-content">
                    <div className="admin-main">
                        {/* Header */}
                        <header className="user-header">
                            <div className="header-left">
                                <h1>USER MANAGEMENT</h1>
                                <p>Manage {stats.total} customer accounts • {stats.active} active • {stats.inactive} inactive</p>
                            </div>
                            
                            <div className="header-right">
                                <div className="admin-info">
                                    <div className="admin-avatar">
                                        {getInitials(admin.full_Name)}
                                    </div>
                                    <div className="admin-details">
                                        <h3>{admin.full_Name}</h3>
                                        <p>{admin.role.toUpperCase()}</p>
                                    </div>
                                </div>
                                <button className="logout-btn" onClick={onLogout}>
                                    <span>🚪</span>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </header>

                        {/* Search Section */}
                        <div className="search-section">
                            <div className="search-box">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="users-container">
                            {loading ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>Loading users...</p>
                                </div>
                            ) : customers.length === 0 ? (
                                <div className="empty-state">
                                    <p>{searchTerm ? 'No users found matching your search' : 'No users found in the system'}</p>
                                </div>
                            ) : (
                                <table className="user-table">
                                    <thead className="table-header">
                                        <tr>
                                            <th>Customer</th>
                                            <th>Email</th>
                                            <th>Joined Date</th>
                                            <th>status</th>
                                            <th>Log</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map(customer => (
                                            <tr key={customer.customer_ID} className="table-row">
                                                <td>
                                                    <div className="user-info-cell">
                                                        <div className="user-avatar">
                                                            {getInitials(customer.full_Name)}
                                                        </div>
                                                        <div className="user-details">
                                                            <div className="user-name">{customer.full_Name || 'Unknown'}</div>
                                                            <div className="user-email">{customer.phone || 'No phone'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="user-email">{customer.email || 'No email'}</div>
                                                </td>
                                                <td>
                                                    <div className="user-date">
                                                        {formatDate(customer.date_Created)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${customer.is_Active ? 'status-active' : 'status-inactive'}`}>
                                                        {customer.is_Active ? 'active' : 'inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className={`action-btn ${customer.is_Active ? 'deactivate-btn' : 'activate-btn'}`}
                                                        onClick={() => toggleUserStatus(customer.customer_ID, customer.is_Active)}
                                                    >
                                                        {customer.is_Active ? 'deactivate' : 'activate'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            
                            {/* Pagination or summary */}
                            {!loading && customers.length > 0 && (
                                <div style={{ 
                                    padding: '15px 20px', 
                                    background: '#EEEBED', 
                                    borderTop: '1px solid #CEAB96',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ color: '#6E4F3F', fontSize: '14px' }}>
                                        Showing {customers.length} of {stats.total} users
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            style={{ 
                                                padding: '6px 12px',
                                                background: '#6E4F3F',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                            onClick={fetchUsers}
                                        >
                                            ↻ Refresh
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserManagement;