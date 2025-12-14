import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './VenueManagement.css';

const VenueManagement = ({ admin, onLogout, onViewDashboard, onViewUsers, onViewQueryBuilder, onViewVenues }) => {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        unavailable: 0,
        recent: 0
    });
    
    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingVenue, setEditingVenue] = useState(null);
    const [formData, setFormData] = useState({
        venue_Name: '',
        address: '',
        capacity: '',
        price: '',
        contact_Email: '',
        contact_Phone: '',
        description: '',
        images: []
    });

    // Drag and drop states
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchVenues();
        fetchVenueStats();
    }, []);

    // Fetch all venues
    const fetchVenues = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/admin/venues');
            setVenues(response.data);
        } catch (error) {
            console.error('Error fetching venues:', error);
            alert('Failed to load venues. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch venue statistics
    const fetchVenueStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/venues/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching venue stats:', error);
        }
    };

    // Drag and drop handlers
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // Handle file drop
    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);

        if (formData.images.length >= 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => 
            file.type.startsWith('image/') && 
            ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
        );

        if (imageFiles.length === 0) {
            alert('Please drop only image files (JPEG, PNG, GIF, WebP)');
            return;
        }

        if (formData.images.length + imageFiles.length > 5) {
            alert(`You can only upload ${5 - formData.images.length} more images`);
            return;
        }

        await uploadImages(imageFiles);
    }, [formData.images.length]);

    // Handle file input change
    const handleFileInput = async (e) => {
        const files = Array.from(e.target.files);
        
        if (formData.images.length >= 5) {
            alert('Maximum 5 images allowed');
            e.target.value = '';
            return;
        }

        if (formData.images.length + files.length > 5) {
            alert(`You can only upload ${5 - formData.images.length} more images`);
            e.target.value = '';
            return;
        }

        await uploadImages(files);
        e.target.value = '';
    };

    // Upload images to server
    const uploadImages = async (files) => {
        if (files.length === 0) return;

        setUploading(true);
        
        try {
            const formDataObj = new FormData();
            files.forEach(file => {
                formDataObj.append('images', file);
            });

            const response = await axios.post('http://localhost:5000/api/admin/venues/upload', formDataObj, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Add uploaded images to form data
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...response.data.images]
            }));

        } catch (error) {
            console.error('Error uploading images:', error);
            alert(error.response?.data?.error || 'Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Remove image
    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle edit button click
    const handleEditClick = (venue) => {
        setEditingVenue(venue);
        setFormData({
            venue_Name: venue.venue_Name || '',
            address: venue.address || '',
            capacity: venue.capacity || '',
            price: venue.price || '',
            contact_Email: venue.contact_Email || '',
            contact_Phone: venue.contact_Phone || '',
            description: venue.description || '',
            images: venue.images || []
        });
    };

    // Clear form
    const clearForm = () => {
        setFormData({
            venue_Name: '',
            address: '',
            capacity: '',
            price: '',
            contact_Email: '',
            contact_Phone: '',
            description: '',
            images: []
        });
        setEditingVenue(null);
        setShowAddForm(false);
    };

    // Submit form (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.venue_Name || !formData.address || !formData.capacity || !formData.price) {
            alert('Please fill in all required fields: Name, Address, Capacity, and Price');
            return;
        }

        try {
            const venueData = {
                ...formData,
                capacity: parseInt(formData.capacity),
                price: parseFloat(formData.price)
            };

            if (editingVenue) {
                // Update existing venue
                await axios.put(`http://localhost:5000/api/admin/venues/${editingVenue.venue_ID}`, venueData);
                alert('Venue updated successfully!');
            } else {
                // Create new venue
                await axios.post('http://localhost:5000/api/admin/venues', venueData);
                alert('Venue created successfully!');
            }
            
            // Refresh data
            fetchVenues();
            fetchVenueStats();
            clearForm();
        } catch (error) {
            console.error('Error saving venue:', error);
            alert(error.response?.data?.error || 'Failed to save venue. Please try again.');
        }
    };

    // Delete venue
    const handleDeleteVenue = async (venueId, venueName) => {
        if (!window.confirm(`Are you sure you want to delete "${venueName}"? This action cannot be undone!`)) {
            return;
        }
        
        try {
            await axios.delete(`http://localhost:5000/api/admin/venues/${venueId}`);
            alert('Venue deleted successfully!');
            fetchVenues();
            fetchVenueStats();
        } catch (error) {
            console.error('Error deleting venue:', error);
            alert(error.response?.data?.error || 'Failed to delete venue. Please try again.');
        }
    };

    // Toggle venue availability
    const toggleAvailability = async (venue) => {
        const newStatus = !venue.is_Available;
        const message = newStatus 
            ? `Are you sure you want to make "${venue.venue_Name}" available?`
            : `Are you sure you want to make "${venue.venue_Name}" unavailable?`;
        
        if (!window.confirm(message)) return;
        
        try {
            await axios.put(`http://localhost:5000/api/admin/venues/${venue.venue_ID}`, {
                ...venue,
                is_Active: newStatus
            });
            alert(`Venue ${newStatus ? 'made available' : 'made unavailable'} successfully!`);
            fetchVenues();
            fetchVenueStats();
        } catch (error) {
            console.error('Error updating venue availability:', error);
            alert('Failed to update venue availability. Please try again.');
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

    // Get full image URL
    const getImageUrl = (imagePath) => {
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        return `http://localhost:5000${imagePath}`;
    };

    return (
        <div className="venue-management">
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
                                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onViewUsers(); }}>
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
                                <a href="#" className="nav-link active">
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
                        <header className="venue-header">
                            <div className="header-left">
                                <h1>REGISTERED VENUES</h1>
                                <p>Manage {stats.total} venues • {stats.available} available • {stats.unavailable} unavailable</p>
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
                                    <span>LOG OUT</span>
                                </button>
                            </div>
                        </header>

                        {/* Add Venue Button */}
                        <div className="add-venue-section">
                            <button 
                                className="add-venue-btn"
                                onClick={() => {
                                    setShowAddForm(true);
                                    setEditingVenue(null);
                                    setFormData({
                                        venue_Name: '',
                                        address: '',
                                        capacity: '',
                                        price: '',
                                        contact_Email: '',
                                        contact_Phone: '',
                                        description: '',
                                        images: []
                                    });
                                }}
                            >
                                <span>+</span> ADD VENUES
                            </button>
                        </div>

                        {/* Add/Edit Form */}
                        {(showAddForm || editingVenue) && (
                            <div className="venue-form-container">
                                <div className="venue-form-card">
                                    <h2>
                                        {editingVenue ? `EDITING VENUE: "${editingVenue.venue_Name}"` : 'CREATING NEW VENUE'}
                                    </h2>
                                    
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-grid">
                                            {/* Image Upload Section */}
                                            <div className="form-group full-width">
                                                <label>ADD IMAGES (Up to 5 images - JPEG, PNG, GIF, WebP)</label>
                                                
                                                {/* Drag and Drop Area */}
                                                <div 
                                                    className={`drop-zone ${dragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
                                                    onDragEnter={handleDragEnter}
                                                    onDragLeave={handleDragLeave}
                                                    onDragOver={handleDragOver}
                                                    onDrop={handleDrop}
                                                >
                                                    {uploading ? (
                                                        <div className="uploading-state">
                                                            <div className="upload-spinner"></div>
                                                            <p>Uploading images...</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="drop-icon">📁</div>
                                                            <p className="drop-text">
                                                                {dragging ? 'Drop images here' : 'Drag & drop images here'}
                                                            </p>
                                                            <p className="drop-subtext">
                                                                or click to browse (Max 5 images, 5MB each)
                                                            </p>
                                                            <input
                                                                type="file"
                                                                id="image-upload"
                                                                multiple
                                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                                onChange={handleFileInput}
                                                                className="file-input"
                                                            />
                                                            <label htmlFor="image-upload" className="browse-btn">
                                                                Browse Files
                                                            </label>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Uploaded Images Preview */}
                                                {formData.images.length > 0 && (
                                                    <div className="uploaded-images">
                                                        <h4>Uploaded Images ({formData.images.length}/5):</h4>
                                                        <div className="image-preview-grid">
                                                            {formData.images.map((image, index) => (
                                                                <div key={index} className="image-preview-item">
                                                                    <img 
                                                                        src={getImageUrl(image)} 
                                                                        alt={`Venue ${index + 1}`}
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                                                                        }}
                                                                    />
                                                                    <button 
                                                                        type="button"
                                                                        className="remove-image-btn"
                                                                        onClick={() => removeImage(index)}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                    <span className="image-number">{index + 1}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="form-group">
                                                <label>Name:</label>
                                                <input
                                                    type="text"
                                                    name="venue_Name"
                                                    value={formData.venue_Name}
                                                    onChange={handleInputChange}
                                                    placeholder="Venue name"
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label>Contact:</label>
                                                <input
                                                    type="text"
                                                    name="contact_Phone"
                                                    value={formData.contact_Phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Phone number"
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label>Email:</label>
                                                <input
                                                    type="email"
                                                    name="contact_Email"
                                                    value={formData.contact_Email}
                                                    onChange={handleInputChange}
                                                    placeholder="Contact email"
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label>Price ($):</label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                    placeholder="Price per event"
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label>Capacity:</label>
                                                <input
                                                    type="number"
                                                    name="capacity"
                                                    value={formData.capacity}
                                                    onChange={handleInputChange}
                                                    placeholder="Maximum capacity"
                                                    required
                                                    min="1"
                                                />
                                            </div>
                                            
                                            <div className="form-group full-width">
                                                <label>Address:</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="Full address"
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="form-group full-width">
                                                <label>Write about your venue.....</label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    placeholder="Describe your venue..."
                                                    rows="4"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="form-actions">
                                            <button 
                                                type="button" 
                                                className="clear-btn"
                                                onClick={clearForm}
                                            >
                                                CLEAR
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="submit-btn"
                                                disabled={uploading}
                                            >
                                                {uploading ? 'UPLOADING...' : (editingVenue ? 'UPDATE' : 'ADD')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Venues Grid */}
                        <div className="venues-container">
                            {loading ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>Loading venues...</p>
                                </div>
                            ) : venues.length === 0 ? (
                                <div className="empty-state">
                                    <p>No venues found. Click "ADD VENUES" to create your first venue.</p>
                                </div>
                            ) : (
                                <div className="venues-grid">
                                    {venues.map(venue => (
                                        <div key={venue.venue_ID} className="venue-card">
                                            {/* Venue Images */}
                                            <div className="venue-images">
                                                {venue.images && venue.images.length > 0 ? (
                                                    <div className="image-carousel">
                                                        <img 
                                                            src={getImageUrl(venue.images[0])} 
                                                            alt={venue.venue_Name}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/400x250?text=No+Image';
                                                            }}
                                                        />
                                                        {venue.images.length > 1 && (
                                                            <div className="image-count">
                                                                +{venue.images.length - 1} more
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="no-image-placeholder">
                                                        <span>No Images</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Venue Info */}
                                            <div className="venue-info">
                                                <div className="venue-header-info">
                                                    <h3>{venue.venue_Name}</h3>
                                                    <span className={`status-badge ${venue.is_Available ? 'status-available' : 'status-unavailable'}`}>
                                                        {venue.is_Available ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </div>
                                                
                                                <div className="venue-details">
                                                    <p className="venue-address">
                                                        <strong>📍</strong> {venue.address}
                                                    </p>
                                                    <div className="venue-stats">
                                                        <span className="venue-stat">
                                                            <strong>Capacity:</strong> {venue.capacity} people
                                                        </span>
                                                        <span className="venue-stat">
                                                            <strong>Price:</strong> ${parseFloat(venue.price).toFixed(2)}
                                                        </span>
                                                        <span className="venue-stat">
                                                            <strong>Images:</strong> {venue.images ? venue.images.length : 0}
                                                        </span>
                                                    </div>
                                                    {venue.contact_Email && (
                                                        <p className="venue-email">
                                                            <strong>📧</strong> {venue.contact_Email}
                                                        </p>
                                                    )}
                                                    {venue.contact_Phone && (
                                                        <p className="venue-phone">
                                                            <strong>📞</strong> {venue.contact_Phone}
                                                        </p>
                                                    )}
                                                    {venue.description && (
                                                        <p className="venue-description">
                                                            {venue.description.length > 100 
                                                                ? `${venue.description.substring(0, 100)}...` 
                                                                : venue.description}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                {/* Action Buttons */}
                                                <div className="venue-actions">
                                                    <button 
                                                        className="edit-btn"
                                                        onClick={() => handleEditClick(venue)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteVenue(venue.venue_ID, venue.venue_Name)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Summary */}
                            {!loading && venues.length > 0 && (
                                <div className="table-summary">
                                    <div className="summary-info">
                                        Showing {venues.length} venues
                                    </div>
                                    <div className="summary-actions">
                                        <button 
                                            className="refresh-btn"
                                            onClick={fetchVenues}
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

export default VenueManagement;