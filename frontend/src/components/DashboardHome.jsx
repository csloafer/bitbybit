import React, { useState, useEffect } from 'react';
import './css/LandingPage.css';

const DashboardHome = () => {
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
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`Failed to fetch popular venue: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Popular venue data received:', data);

            // Ensure we have a proper image URL
            if (data.image && !data.image.startsWith('http')) {
                data.image = `http://localhost:5000${data.image}`;
            }

            setPopularVenue(data);
        } catch (err) {
            console.error('❌ Error fetching popular venue:', err);
            setError(err.message);

            // Set fallback data for testing
            setPopularVenue({
                id: 1,
                name: 'Grand Ballroom',
                description: 'A luxurious venue for your special events. Perfect for weddings, corporate gatherings, and celebrations.',
                capacity: 500,
                price_per_hour: 2999,
                location: 'Downtown',
                image: 'https://via.placeholder.com/800x400?text=Sample+Venue'
            });
        } finally {
            setLoading(false);
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
                            src={`http://localhost:5000/uploads/venues/${popularVenue.image}`}
                            alt={popularVenue.name}
                        />

                        {/* Right Content */}
                        <div className="popular-content">
                            <h3>{popularVenue.name}</h3>
                            <p>{popularVenue.description}</p>
                            <p><strong>Capacity:</strong> {popularVenue.capacity} people</p>
                            <p><strong>Price:</strong> ₹{popularVenue.price_per_hour}/hour</p>
                            <p><strong>Location:</strong> {popularVenue.location}</p>

                            <button className="read-more-btn">
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