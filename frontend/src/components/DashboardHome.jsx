import React, { useState, useEffect } from 'react';
import './css/LandingPage.css';

const DashboardHome = ({ onReadMoreClick }) => {
    const [popularVenue, setPopularVenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPopularVenue();
    }, []);

    const fetchPopularVenue = async () => {
        try {
            console.log('🔄 Fetching popular venue...');
            const response = await fetch('http://localhost:5000/api/venues/popular');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Popular venue received:', data);
            
            setPopularVenue(data);
        } catch (err) {
            console.error('❌ Error:', err);
            setError(err.message);
            // Set fallback venue for testing
            setPopularVenue({
                id: 1,
                name: 'Grand Ballroom',
                description: 'A luxurious venue for your special events. Perfect for weddings, corporate gatherings, and celebrations.',
                capacity: 500,
                price_per_hour: 2999,
                location: 'Downtown',
                image: 'https://via.placeholder.com/800x400?text=Sample+Venue+Image',
                booking_count: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReadMore = () => {
        if (popularVenue && onReadMoreClick) {
            console.log('📍 Read More clicked for venue:', popularVenue.id, popularVenue.name);
            
            // Pass the complete venue data to parent
            onReadMoreClick({
                id: popularVenue.id,
                title: popularVenue.name,
                address: popularVenue.address,
                description: popularVenue.description,
                price: popularVenue.price_per_hour,
                capacity: popularVenue.capacity,
                contact_email: popularVenue.contact_email,
                contact_phone: popularVenue.contact_phone,
                image: popularVenue.image,
                location: popularVenue.location,
                booking_count: popularVenue.booking_count
            });
        }
    };

    return (
        <div className="tab-content active">
            {/* Hero / Banner */}
            <div className="home-hero">
                <img
                    src="/images/banner.jpg"
                    alt="Event Banner"
                />
            </div>

            {/* Popular Venues Section */}
            <div style={{ padding: '0 40px' }}>
                <div className="popular-label">
                    Popular venues
                </div>

                {loading ? (
                    <div className="loading">Loading popular venue...</div>
                ) : error ? (
                    <div className="error">Error: {error}</div>
                ) : popularVenue ? (
                    <div className="popular-venue">
                        {/* Left Image */}
                        <img
                            src={popularVenue.image}
                            alt={popularVenue.name}
                            onError={(e) => {
                                console.error('❌ Image failed to load:', e.target.src);
                                e.target.src = 'https://via.placeholder.com/800x400?text=Venue+Image+Not+Available';
                            }}
                            onLoad={() => console.log('✅ Image loaded successfully')}
                        />

                        {/* Right Content */}
                        <div className="popular-content">
                            <h3>{popularVenue.name}</h3>
                            <p>{popularVenue.description}</p>
                            <p><strong>Capacity:</strong> {popularVenue.capacity} people</p>
                            <p><strong>Price:</strong> ₹{popularVenue.price_per_hour}/hour</p>
                            <p><strong>Location:</strong> {popularVenue.location}</p>
                            {popularVenue.booking_count > 0 && (
                                <p><strong>Bookings:</strong> {popularVenue.booking_count || 0} times</p>
                            )}
                            
                            <button 
                                className="read-more-btn"
                                onClick={handleReadMore}
                            >
                                Read More &gt;
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>No popular venue found</div>
                )}
            </div>
        </div>
    );
};

export default DashboardHome;