import React, { useState } from 'react';
import './VenueManagement.css';

const VenueManagement = ({ admin, onBack, onLogout }) => {
    const [venues, setVenues] = useState([]);
    const [newVenue, setNewVenue] = useState({
        name: '',
        address: '',
        price: '',
        description: ''
    });

    const handleAddVenue = (e) => {
        e.preventDefault();
        const venue = {
            id: venues.length + 1,
            ...newVenue
        };
        setVenues([...venues, venue]);
        setNewVenue({ name: '', address: '', price: '', description: '' });
    };

    const handleDeleteVenue = (id) => {
        setVenues(venues.filter(venue => venue.id !== id));
    };

    return (
        <div className="venue-management">
            <div className="admin-header">
                <h2>Venue Management</h2>
                <div className="header-buttons">
                    <button onClick={onBack} className="btn-secondary">Back to Dashboard</button>
                    <button onClick={onLogout} className="btn-logout">Logout</button>
                </div>
            </div>

            <div className="venue-content">
                {/* Add New Venue Form */}
                <div className="add-venue-form">
                    <h3>Add New Venue</h3>
                    <form onSubmit={handleAddVenue}>
                        <input
                            type="text"
                            placeholder="Venue Name"
                            value={newVenue.name}
                            onChange={(e) => setNewVenue({...newVenue, name: e.target.value})}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Address"
                            value={newVenue.address}
                            onChange={(e) => setNewVenue({...newVenue, address: e.target.value})}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={newVenue.price}
                            onChange={(e) => setNewVenue({...newVenue, price: e.target.value})}
                            required
                        />
                        <textarea
                            placeholder="Description"
                            value={newVenue.description}
                            onChange={(e) => setNewVenue({...newVenue, description: e.target.value})}
                            required
                        />
                        <button type="submit" className="btn-primary">Add Venue</button>
                    </form>
                </div>

                {/* Venues List */}
                <div className="venues-list">
                    <h3>All Venues ({venues.length})</h3>
                    {venues.length === 0 ? (
                        <p>No venues added yet.</p>
                    ) : (
                        <div className="venues-grid">
                            {venues.map(venue => (
                                <div key={venue.id} className="venue-card">
                                    <h4>{venue.name}</h4>
                                    <p><strong>Address:</strong> {venue.address}</p>
                                    <p><strong>Price:</strong> ${venue.price}</p>
                                    <p><strong>Description:</strong> {venue.description}</p>
                                    <button 
                                        onClick={() => handleDeleteVenue(venue.id)}
                                        className="btn-danger"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VenueManagement;