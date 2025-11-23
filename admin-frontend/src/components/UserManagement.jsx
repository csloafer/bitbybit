import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

const UserManagement = ({ admin, onBack, onLogout }) => {
    const [customers, setCustomers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('customers');
    const [showCreateStaff, setShowCreateStaff] = useState(false);
    const [newStaff, setNewStaff] = useState({
        full_Name: '',
        email: '',
        password: '',
        role: 'staff'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const [customersRes, staffRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/customers'),
                axios.get('http://localhost:5000/api/admin/staff')
            ]);

            setCustomers(customersRes.data);
            setStaff(staffRes.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/create', newStaff);
            alert('Staff account created successfully!');
            setShowCreateStaff(false);
            setNewStaff({ full_Name: '', email: '', password: '', role: 'staff' });
            fetchUsers(); // Refresh the list
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create staff account');
        }
    };

    const toggleCustomerStatus = async (customerId, currentStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/customers/${customerId}/status`, {
                is_Active: !currentStatus
            });
            fetchUsers(); // Refresh the list
        } catch (error) {
            alert('Failed to update customer status');
        }
    };

    return (
        <div className="user-management">
            <header className="admin-header">
                <div className="admin-header-content">
                    <div className="header-actions">
                        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
                        <h1>User Management</h1>
                    </div>
                    <button className="logout-btn" onClick={onLogout}>Logout</button>
                </div>
            </header>

            <div className="user-management-content">
                {/* Tabs */}
                <div className="management-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customers')}
                    >
                        Customers ({customers.length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
                        onClick={() => setActiveTab('staff')}
                    >
                        Staff ({staff.length})
                    </button>
                </div>

                {/* Create Staff Button (Admin only) */}
                {admin.role === 'admin' && activeTab === 'staff' && (
                    <div className="create-staff-section">
                        <button 
                            className="create-staff-btn"
                            onClick={() => setShowCreateStaff(!showCreateStaff)}
                        >
                            + Create New Staff Account
                        </button>

                        {showCreateStaff && (
                            <div className="create-staff-form">
                                <h3>Create Staff Account</h3>
                                <form onSubmit={handleCreateStaff}>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={newStaff.full_Name}
                                        onChange={(e) => setNewStaff({...newStaff, full_Name: e.target.value})}
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={newStaff.email}
                                        onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={newStaff.password}
                                        onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                                        required
                                    />
                                    <select
                                        value={newStaff.role}
                                        onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <div className="form-actions">
                                        <button type="submit">Create Account</button>
                                        <button type="button" onClick={() => setShowCreateStaff(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* Users List */}
                <div className="users-list">
                    {loading ? (
                        <div className="loading">Loading users...</div>
                    ) : activeTab === 'customers' ? (
                        <div className="customers-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Joined Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map(customer => (
                                        <tr key={customer.customer_ID}>
                                            <td>{customer.customer_ID}</td>
                                            <td>{customer.full_Name}</td>
                                            <td>{customer.email}</td>
                                            <td>{customer.phone || 'N/A'}</td>
                                            <td>{new Date(customer.date_Created).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status-badge ${customer.is_Active ? 'active' : 'inactive'}`}>
                                                    {customer.is_Active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className={`status-btn ${customer.is_Active ? 'deactivate' : 'activate'}`}
                                                    onClick={() => toggleCustomerStatus(customer.customer_ID, customer.is_Active)}
                                                >
                                                    {customer.is_Active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="staff-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.map(staffMember => (
                                        <tr key={staffMember.admin_ID}>
                                            <td>{staffMember.admin_ID}</td>
                                            <td>{staffMember.full_Name}</td>
                                            <td>{staffMember.email}</td>
                                            <td>
                                                <span className={`role-badge ${staffMember.role}`}>
                                                    {staffMember.role}
                                                </span>
                                            </td>
                                            <td>{new Date(staffMember.date_Created).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status-badge ${staffMember.is_Active ? 'active' : 'inactive'}`}>
                                                    {staffMember.is_Active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;