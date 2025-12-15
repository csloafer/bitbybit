import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/LandingPage.css';

const DashboardOffers = ({ handleBookNow }) => {
    const [offers, setOffers] = useState([]);
    const [filteredOffers, setFilteredOffers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch venues from backend
    useEffect(() => {
        fetchOffers();
    }, []);

    // Handle search filter
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredOffers(offers);
        } else {
            const filtered = offers.filter(offer =>
                offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                offer.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                offer.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredOffers(filtered);
        }
    }, [searchQuery, offers]);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch from backend API
            const response = await axios.get('http://localhost:5000/api/venues');

            console.log('API Response:', response.data); // Debug log

            // Transform API data to match your component format
            const transformedOffers = response.data.map(venue => {
                // Helper function to get full image URL
                const getFullImageUrl = (imagePath) => {
                    if (!imagePath) return 'https://via.placeholder.com/400x250?text=No+Image';
                    if (imagePath.startsWith('http')) return imagePath;
                    if (imagePath.startsWith('/uploads/')) {
                        return `http://localhost:5000${imagePath}`;
                    }
                    return `http://localhost:5000/uploads/venues/${imagePath}`;
                };

                // Get all images as full URLs
                const allImages = (venue.all_images || []).map(img => getFullImageUrl(img));
                const mainImage = venue.image ? getFullImageUrl(venue.image) :
                    (allImages.length > 0 ? allImages[0] : 'https://via.placeholder.com/400x250?text=No+Image');

                return {
                    id: venue.id,
                    title: venue.title,
                    address: venue.address,
                    description: venue.description,
                    price: venue.price,
                    capacity: venue.capacity,
                    contact_email: venue.contact_email,
                    contact_phone: venue.contact_phone,
                    image: mainImage,
                    all_images: allImages,
                    // Include raw venue data for DashboardVenues
                    venue_data: venue
                };
            });

            console.log('Transformed offers:', transformedOffers);
            setOffers(transformedOffers);
            setFilteredOffers(transformedOffers);
            console.log(`✅ Loaded ${transformedOffers.length} venues from backend`);
        } catch (err) {
            console.error('❌ Error fetching offers:', err);
            setError('Failed to load venues. Please try again later.');
            // Fallback to empty array
            setOffers([]);
            setFilteredOffers([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle book now click
    const handleBookNowClick = (offer) => {
        console.log('Booking offer:', offer);
        if (handleBookNow) {
            // Pass the complete offer object
            handleBookNow({
                id: offer.id,
                title: offer.title,
                address: offer.address,
                description: offer.description,
                price: offer.price,
                capacity: offer.capacity,
                contact_email: offer.contact_email,
                contact_phone: offer.contact_phone,
                image: offer.image,
                all_images: offer.all_images
            });
        }
    };

    // Refresh offers
    const refreshOffers = () => {
        fetchOffers();
    };

    // Truncate long description
    const truncateDescription = (text, maxLength = 120) => {
        if (!text) return 'No description available';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="tab-content active">
                {/* HEADER WITH TITLE AND SEARCH IN ONE ROW */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '25px 40px 20px'
                }}>
                    <h1 style={{ 
                        margin: 0, 
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '28px'
                    }}>
                        Offers
                    </h1>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <button
                            onClick={refreshOffers}
                            style={{
                                padding: '8px 20px',
                                backgroundColor: '#f5f5f5',
                                color: '#333',
                                border: '1px solid #ccc',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                            disabled
                        >
                            <span>↻</span> Refresh
                        </button>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '300px'
                }}>
                    <div>Loading venues...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tab-content active">
                {/* HEADER WITH TITLE AND SEARCH IN ONE ROW */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '25px 40px 20px'
                }}>
                    <h1 style={{ 
                        margin: 0, 
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '28px'
                    }}>
                        Offers
                    </h1>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <input
                            type="text"
                            placeholder="Search venues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '20px',
                                border: '1px solid #ccc',
                                width: '250px',
                                fontSize: '14px'
                            }}
                        />
                        <button
                            onClick={refreshOffers}
                            style={{
                                padding: '8px 20px',
                                backgroundColor: '#f5f5f5',
                                color: '#333',
                                border: '1px solid #ccc',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <span>↻</span> Refresh
                        </button>
                    </div>
                </div>

                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#ff6b6b'
                }}>
                    <div>{error}</div>
                    <button
                        onClick={refreshOffers}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#bd9780',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-content active">
            {/* HEADER WITH TITLE AND SEARCH IN ONE ROW */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '25px 40px 20px',
                flexWrap: 'wrap' // For responsive design
            }}>
                <h1 style={{ 
                    margin: 0, 
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '28px',
                    color: '#333'
                }}>
                    Offers ({offers.length} venues)
                </h1>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <input
                        type="text"
                        placeholder="Search venues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '25px',
                            border: '1px solid #ccc',
                            width: '280px',
                            fontSize: '14px',
                            transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#bd9780';
                            e.target.style.boxShadow = '0 0 0 2px rgba(189, 151, 128, 0.2)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ccc';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    <button
                        onClick={refreshOffers}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#f5f5f5',
                            color: '#333',
                            border: '1px solid #ccc',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#e8e8e8';
                            e.target.style.borderColor = '#999';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#f5f5f5';
                            e.target.style.borderColor = '#ccc';
                        }}
                    >
                        <span>↻</span> Refresh
                    </button>
                </div>
            </div>

            {filteredOffers.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666'
                }}>
                    {searchQuery ? 'No venues found matching your search.' : 'No venues available at the moment.'}
                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={refreshOffers}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#bd9780',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer'
                            }}
                        >
                            Check for New Venues
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className="offers-container"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '30px',
                        padding: '0 40px 40px'
                    }}
                >
                    {filteredOffers.map((offer) => (
                        <div
                            key={offer.id}
                            className="offer-card"
                            style={{
                                background: 'white',
                                padding: '15px',
                                borderRadius: '8px',
                                display: 'flex',
                                gap: '15px',
                                border: '1px solid #ccc',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                height: '280px',
                                overflow: 'hidden'
                            }}
                        >
                            {/* IMAGE - Fixed size */}
                            <div style={{
                                width: '230px',
                                height: '250px',
                                flexShrink: 0,
                                position: 'relative'
                            }}>
                                <img
                                    src={offer.image}
                                    alt={offer.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '6px'
                                    }}
                                    onError={(e) => {
                                        console.error('Image failed to load:', offer.image);
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/230x250?text=No+Image';
                                    }}
                                />
                            </div>

                            {/* CONTENT COLUMN */}
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: 0,
                                }}
                            >
                                <div
                                    className="offer-title"
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: '20px',
                                        marginBottom: '10px',
                                        color: '#bd9780',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                    title={offer.title}
                                >
                                    {offer.title}
                                </div>

                                <div style={{
                                    flex: 1,
                                    overflow: 'hidden',
                                    marginBottom: '10px'
                                }}>
                                    <p style={{
                                        lineHeight: '1.4',
                                        color: '#666',
                                        fontSize: '14px',
                                        margin: 0
                                    }}>
                                        <strong>Address:</strong> {offer.address}
                                    </p>
                                    <p style={{
                                        lineHeight: '1.4',
                                        color: '#666',
                                        fontSize: '14px',
                                        margin: '8px 0 0 0',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        <strong>Description:</strong> {truncateDescription(offer.description, 100)}
                                    </p>
                                    {offer.capacity && (
                                        <p style={{
                                            lineHeight: '1.4',
                                            color: '#666',
                                            fontSize: '14px',
                                            margin: '8px 0 0 0'
                                        }}>
                                            <strong>Capacity:</strong> {offer.capacity} people
                                        </p>
                                    )}
                                </div>

                                {/* PRICE + BUTTON */}
                                <div
                                    style={{
                                        marginTop: 'auto',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        gap: '15px',
                                        paddingTop: '10px',
                                        borderTop: '1px solid #eee'
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 'bold',
                                            color: '#bd9780',
                                            fontSize: '18px'
                                        }}
                                    >
                                        ₱{offer.price}
                                    </div>

                                    <button
                                        className="btn"
                                        onClick={() => handleBookNowClick(offer)}
                                        style={{
                                            padding: '8px 20px',
                                            width: 'auto',
                                            backgroundColor: '#bd9780',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#a87f66';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#bd9780';
                                        }}
                                    >
                                        BOOK NOW
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardOffers;