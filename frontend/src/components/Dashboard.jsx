import React, { useState } from 'react';
import './css/LandingPage.css';

const Dashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('home');
    const [bookingData, setBookingData] = useState({
        fromDate: '',
        toDate: '',
        fromTime: '',
        toTime: ''
    });
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentSuccessful, setPaymentSuccessful] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data for events
    const recentEvents = [
        {
            id: 1,
            title: "Wedding Celebration",
            image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
        },
        {
            id: 2,
            title: "Corporate Conference",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            description: "Another detailed description about the corporate conference event with additional information about the venue, speakers, and schedule."
        }
    ];

    // Mock data for offers - now includes venue details
    const offers = [
        {
            id: 1,
            title: "THE REVEREND",
            address: "Bago Bantay, Quezon City",
            venueAddress: "Aregante Street, Biñang, Dasmariñas, City",
            price: 666,
            venuePrice: "₱14,000",
            image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            venueDescription: "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            reviews: [
                { id: 1, user: "John Doe", rating: 5, comment: "Excellent and Cool! Very accommodating staff and beautiful venue.", avatar: "👤" },
                { id: 2, user: "Jane Smith", rating: 5, comment: "Loved the atmosphere. Highly recommended.", avatar: "👤" },
                { id: 3, user: "Mike Johnson", rating: 5, comment: "Perfect for any event. Will book again.", avatar: "👤" }
            ]
        },
        {
            id: 2,
            title: "GRAND BALLROOM",
            address: "Makati City",
            venueAddress: "Ayala Avenue, Makati City",
            price: 1200,
            venuePrice: "₱25,000",
            image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            description: "Elegant ballroom perfect for weddings and corporate events.",
            venueDescription: "A luxurious ballroom with crystal chandeliers and marble floors. Perfect for grand weddings, corporate galas, and formal events. Features state-of-the-art audio-visual equipment and professional event planning services.",
            reviews: [
                { id: 1, user: "Sarah Wilson", rating: 5, comment: "Absolutely stunning venue! Perfect for our wedding.", avatar: "👤" },
                { id: 2, user: "David Chen", rating: 4, comment: "Great for corporate events. Professional staff.", avatar: "👤" }
            ]
        },
        {
            id: 3,
            title: "GARDEN PAVILION",
            address: "Tagaytay City",
            venueAddress: "Crosswinds, Tagaytay City",
            price: 950,
            venuePrice: "₱18,000",
            image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            description: "Beautiful garden venue with scenic views.",
            venueDescription: "Nestled in the mountains of Tagaytay, this garden pavilion offers breathtaking views of Taal Lake. Perfect for intimate weddings, family gatherings, and outdoor corporate retreats.",
            reviews: [
                { id: 1, user: "Maria Garcia", rating: 5, comment: "Magical venue with amazing views!", avatar: "👤" },
                { id: 2, user: "Robert Kim", rating: 5, comment: "Perfect sunset wedding spot.", avatar: "👤" }
            ]
        },
        {
            id: 4,
            title: "URBAN LOFT",
            address: "Taguig City",
            venueAddress: "Bonifacio Global City, Taguig",
            price: 850,
            venuePrice: "₱15,000",
            image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            description: "Modern loft space for creative events and gatherings.",
            venueDescription: "Industrial-chic loft space with exposed brick walls and high ceilings. Ideal for art exhibitions, product launches, startup events, and creative workshops. Features flexible layout options.",
            reviews: [
                { id: 1, user: "Alex Turner", rating: 5, comment: "Perfect for our product launch!", avatar: "👤" },
                { id: 2, user: "Lisa Park", rating: 4, comment: "Great atmosphere for creative events.", avatar: "👤" }
            ]
        }
    ];

    // Mock wallets
    const wallets = [
        { id: 1, name: "GCash", number: "+63 000 000 0000", icon: "GC" },
        { id: 2, name: "PayPal", number: "user@example.com", icon: "PP" },
        { id: 3, name: "Maya", number: "+63 000 000 0000", icon: "MP" }
    ];

    // Filter offers based on search query
    const filteredOffers = offers.filter(offer => 
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleEventExpand = (eventId) => {
        setExpandedEvents(prev => ({
            ...prev,
            [eventId]: !prev[eventId]
        }));
    };

    const handleBookNow = (offer) => {
        setSelectedVenue(offer);
        setActiveTab('venues');
    };


    const startBooking = (offer) => {
        setSelectedVenue(offer);
        setActiveTab('booking');
    };

    const cancelBooking = () => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            setBookingData({
                fromDate: '',
                toDate: '',
                fromTime: '',
                toTime: ''
            });
            setSelectedVenue(null);
            setActiveTab('venues');
        }
    };

    const proceedToPayment = () => {
        if (!bookingData.fromDate || !bookingData.toDate || !bookingData.fromTime || !bookingData.toTime) {
            alert("Please fill in all date and time fields");
            return;
        }
        setActiveTab('payment');
    };

    const backToBooking = () => {
        setActiveTab('booking');
    };

    const processPayment = () => {
        if (!selectedWallet) {
            alert("Please select a payment method");
            return;
        }
        setShowPaymentModal(true);
        setPaymentSuccessful(true);
    };

    const closeModal = () => {
        setShowPaymentModal(false);
        setPaymentSuccessful(false);
        setSelectedWallet(null);
        setBookingData({
            fromDate: '',
            toDate: '',
            fromTime: '',
            toTime: ''
        });
        setSelectedVenue(null);
        setActiveTab('venues');
    };

    const renderHomeTab = () => (
        <div className="tab-content active">
            <h1 className="section-title" style={{ padding: '25px 40px 10px', margin: 0, fontFamily: "'Playfair Display', serif" }}>
                Recent Events
            </h1>
            
            {recentEvents.map(event => (
                <div key={event.id} className="event-container" style={{
                    display: 'flex',
                    gap: '30px',
                    padding: '30px 40px',
                    background: 'white',
                    margin: '20px 40px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <div className="event-img" style={{ flex: 1 }}>
                        <img 
                            src={event.image} 
                            alt={event.title}
                            style={{ 
                                width: '100%', 
                                height: '300px', 
                                objectFit: 'cover',
                                borderRadius: '10px'
                            }}
                        />
                    </div>
                    <div className="event-details" style={{ flex: 2 }}>
                        <h3 style={{ marginTop: 0, color: '#333' }}>{event.title}</h3>
                        <p style={{ 
                            lineHeight: '1.6',
                            color: '#666',
                            maxHeight: expandedEvents[event.id] ? 'none' : '120px',
                            overflow: 'hidden'
                        }}>
                            {event.description}
                        </p>
                        <button 
                            className="read-more-btn"
                            onClick={() => toggleEventExpand(event.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#bd9780',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                padding: '5px 0',
                                marginTop: '10px'
                            }}
                        >
                            {expandedEvents[event.id] ? 'Read Less <' : 'Read More >'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderOffersTab = () => (
        <div className="tab-content active">
            <h1 style={{ padding: '25px 40px 10px', margin: 0, fontFamily: "'Playfair Display', serif" }}>
                Offers
            </h1>
            
            <div className="search-box" style={{ margin: '20px 40px', textAlign: 'right' }}>
                <input 
                    type="text" 
                    placeholder="Search venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '20px',
                        border: '1px solid #ccc',
                        width: '250px'
                    }}
                />
            </div>

            <div className="offers-container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '30px',
                padding: '0 40px 40px'
            }}>
                {filteredOffers.map(offer => (
                    <div key={offer.id} className="offer-card" style={{
                        background: 'white',
                        padding: '15px',
                        borderRadius: '8px',
                        display: 'flex',
                        gap: '15px',
                        border: '1px solid #ccc',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                    }}>
                        <img 
                            src={offer.image} 
                            alt={offer.title}
                            style={{
                                width: '230px',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '6px'
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <div className="offer-title" style={{
                                fontWeight: 'bold',
                                fontSize: '20px',
                                marginBottom: '10px',
                                color: '#bd9780'
                            }}>
                                {offer.title}
                            </div>
                            <p style={{ lineHeight: '1.5', color: '#666', marginBottom: '15px' }}>
                                <strong>Address:</strong> {offer.address}<br /><br />
                                <strong>Description:</strong> {offer.description}
                            </p>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'flex-end'
                            }}>
                                <div style={{
                                    fontWeight: 'bold',
                                    color: '#bd9780',
                                    fontSize: '18px'
                                }}>
                                    ₱{offer.price}
                                </div>
                                <button 
                                    className="btn"
                                    onClick={() => handleBookNow(offer)}
                                    style={{
                                        marginTop: '15px',
                                        padding: '8px 20px',
                                        width: 'auto'
                                    }}
                                >
                                    BOOK NOW
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderVenuesTab = () => {
        // If we have a selected venue from Offers tab, show only that one
        const venueToShow = selectedVenue || offers[0];
        
        return (
            <div className="tab-content active">
                <div style={{ padding: '40px' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h1 style={{ 
                            margin: 0, 
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '32px'
                        }}>
                            {selectedVenue ? 'Selected Venue' : 'Featured Venues'}
                        </h1>
                        {selectedVenue && (
                            <button 
                                className="btn"
                                onClick={() => setSelectedVenue(null)}
                                style={{
                                    background: '#ddd',
                                    color: '#333',
                                    width: 'auto'
                                }}
                            >
                                View All Venues
                            </button>
                        )}
                    </div>

                    <div className="venue-info" style={{
                        display: 'flex',
                        gap: '40px',
                        background: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        marginBottom: '40px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                    }}>
                        <img 
                            src={venueToShow.image} 
                            alt={venueToShow.title}
                            style={{
                                width: '380px',
                                height: '300px',
                                objectFit: 'cover',
                                borderRadius: '10px'
                            }}
                        />
                        <div className="venue-text" style={{ flex: 1 }}>
                            <h2 style={{ 
                                margin: '0 0 10px 0', 
                                fontSize: '28px',
                                color: '#333'
                            }}>
                                {venueToShow.title}
                            </h2>
                            <p style={{ 
                                fontSize: '14px', 
                                color: '#666',
                                marginBottom: '20px'
                            }}>
                                {venueToShow.venueAddress || venueToShow.address}<br />
                                PRICE: {venueToShow.venuePrice || `₱${venueToShow.price}`}
                            </p>
                            <h3 style={{ margin: '20px 0 10px 0', color: '#333' }}>
                                Description:
                            </h3>
                            <p style={{ lineHeight: '1.6', color: '#666' }}>
                                {venueToShow.venueDescription || venueToShow.description}
                            </p>
                        </div>
                    </div>

                    <h3 style={{ 
                        margin: '40px 0 20px 0', 
                        fontSize: '24px',
                        color: '#333',
                        borderBottom: '2px solid #bd9780',
                        paddingBottom: '10px'
                    }}>
                        REVIEWS
                    </h3>

                    <div className="reviews" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        {venueToShow.reviews?.map(review => (
                            <div key={review.id} className="review-card" style={{
                                background: '#bd9780',
                                color: 'white',
                                padding: '25px',
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontSize: '40px',
                                    marginBottom: '15px'
                                }}>
                                    {review.avatar}
                                </div>
                                <h4 style={{ margin: '10px 0', fontSize: '18px' }}>
                                    {review.comment.split('!')[0]}!
                                </h4>
                                <p style={{ 
                                    margin: '10px 0', 
                                    fontSize: '14px',
                                    lineHeight: '1.4'
                                }}>
                                    {review.comment.split('!')[1]}
                                </p>
                                <div style={{ 
                                    marginTop: '15px', 
                                    fontSize: '20px',
                                    color: '#FFD700'
                                }}>
                                    {'★'.repeat(review.rating)}
                                </div>
                                <p style={{ marginTop: '10px', fontSize: '12px' }}>
                                    - {review.user}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="buttons" style={{
                        display: 'flex',
                        gap: '20px',
                        justifyContent: 'center',
                        marginTop: '30px'
                    }}>
                        <button className="btn" style={{ width: '200px' }}>
                            ➤ Make a Review
                        </button>
                        <button 
                            className="btn" 
                            style={{ width: '200px' }}
                            onClick={() => startBooking(venueToShow)}
                        >
                            ➤ Book Now!
                        </button>
                    </div>

                    {!selectedVenue && (
                        <div style={{ marginTop: '50px' }}>
                            <h3 style={{ 
                                marginBottom: '20px', 
                                fontSize: '24px',
                                color: '#333'
                            }}>
                                Other Venues
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '20px'
                            }}>
                                {offers.slice(1, 3).map(venue => (
                                    <div 
                                        key={venue.id}
                                        onClick={() => setSelectedVenue(venue)}
                                        style={{
                                            background: 'white',
                                            padding: '20px',
                                            borderRadius: '10px',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            gap: '15px',
                                            alignItems: 'center'
                                        }}>
                                            <img 
                                                src={venue.image}
                                                alt={venue.title}
                                                style={{
                                                    width: '100px',
                                                    height: '80px',
                                                    objectFit: 'cover',
                                                    borderRadius: '5px'
                                                }}
                                            />
                                            <div>
                                                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                                                    {venue.title}
                                                </h4>
                                                <p style={{ 
                                                    fontSize: '12px', 
                                                    color: '#666',
                                                    margin: '0 0 5px 0'
                                                }}>
                                                    {venue.address}
                                                </p>
                                                <div style={{
                                                    fontWeight: 'bold',
                                                    color: '#bd9780'
                                                }}>
                                                    {venue.venuePrice || `₱${venue.price}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderBookingTab = () => (
        <div className="tab-content active">
            <div className="booking-container" style={{
                padding: '30px 40px',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '28px',
                    marginBottom: '10px'
                }}>
                    {selectedVenue?.title}
                </h1>
                
                <div style={{
                    background: 'white',
                    borderRadius: '10px',
                    padding: '25px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    marginBottom: '30px'
                }}>
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ margin: '5px 0' }}>
                            <strong>Address:</strong> {selectedVenue?.address}
                        </p>
                        <div style={{
                            fontWeight: 'bold',
                            color: '#bd9780',
                            fontSize: '18px',
                            margin: '15px 0'
                        }}>
                            PRICE: ₱{selectedVenue?.price}
                        </div>
                    </div>
                    
                    <h3 style={{
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        fontSize: '18px',
                        color: '#333',
                        borderBottom: '1px solid #eee',
                        paddingBottom: '10px'
                    }}>
                        DESCRIPTION
                    </h3>
                    <p style={{ lineHeight: '1.6', color: '#666' }}>
                        {selectedVenue?.description} INCIDIDUNT UT LABORE ET DOLORE MAGNA ALIQUA. UT ENIM AD MINIM VENIAM, QUIS NOSTRUD EXERCITATION ULLAMCO LABORIS NISI UT ALIQUIP EX EA COMMODO CONSEQUAT.
                    </p>
                </div>
                
                <div style={{
                    background: 'white',
                    borderRadius: '10px',
                    padding: '25px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    marginBottom: '20px'
                }}>
                    <h3 style={{
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        fontSize: '18px',
                        color: '#333',
                        borderBottom: '1px solid #eee',
                        paddingBottom: '10px'
                    }}>
                        DATE & TIME
                    </h3>
                    
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>From Date:</label>
                            <input 
                                type="date"
                                value={bookingData.fromDate}
                                onChange={(e) => setBookingData({...bookingData, fromDate: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    marginBottom: '15px',
                                    fontFamily: 'inherit'
                                }}
                            />
                            
                            <label style={{ display: 'block', marginBottom: '5px' }}>To Date:</label>
                            <input 
                                type="date"
                                value={bookingData.toDate}
                                onChange={(e) => setBookingData({...bookingData, toDate: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    marginBottom: '15px',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>From Time:</label>
                            <input 
                                type="time"
                                value={bookingData.fromTime}
                                onChange={(e) => setBookingData({...bookingData, fromTime: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    marginBottom: '15px',
                                    fontFamily: 'inherit'
                                }}
                            />
                            
                            <label style={{ display: 'block', marginBottom: '5px' }}>To Time:</label>
                            <input 
                                type="time"
                                value={bookingData.toTime}
                                onChange={(e) => setBookingData({...bookingData, toTime: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    marginBottom: '15px',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                    </div>
                </div>
                
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '15px',
                    marginTop: '30px'
                }}>
                    <button 
                        className="btn"
                        onClick={cancelBooking}
                        style={{
                            background: '#ddd',
                            color: '#333',
                            width: 'auto'
                        }}
                    >
                        CANCEL
                    </button>
                    <button 
                        className="btn"
                        onClick={proceedToPayment}
                        style={{ width: 'auto' }}
                    >
                        CONTINUE TO PAYMENT
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPaymentTab = () => (
        <div className="tab-content active">
            <div className="payment-container" style={{
                padding: '30px 40px',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '28px',
                    marginBottom: '30px',
                    paddingBottom: '10px',
                    borderBottom: '2px solid #bd9780'
                }}>
                    PAYMENT METHOD
                </h1>
                
                <div style={{
                    display: 'flex',
                    gap: '30px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '10px',
                        padding: '25px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        flex: 1,
                        minWidth: '300px'
                    }}>
                        <h3 style={{
                            fontWeight: 'bold',
                            marginBottom: '20px',
                            fontSize: '18px',
                            color: '#333'
                        }}>
                            ONLINE BANKING
                        </h3>
                        
                        <div style={{
                            textAlign: 'center',
                            margin: '20px 0',
                            padding: '15px',
                            background: '#f9f9f9',
                            borderRadius: '8px'
                        }}>
                            <p>SCAN THIS QR CODE</p>
                            <p>WHEN USING E-WALLET</p>
                            <div style={{
                                width: '200px',
                                height: '200px',
                                background: '#e0e0e0',
                                margin: '15px auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#666'
                            }}>
                                [QR CODE PLACEHOLDER]
                            </div>
                            <a href="#" style={{
                                display: 'block',
                                marginTop: '15px',
                                color: '#bd9780',
                                fontWeight: 'bold',
                                textDecoration: 'none'
                            }}>
                                Connect your bank now 
                            </a>
                        </div>
                    </div>
                    
                    <div style={{
                        background: 'white',
                        borderRadius: '10px',
                        padding: '25px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        flex: 1,
                        minWidth: '300px'
                    }}>
                        <h3 style={{
                            fontWeight: 'bold',
                            marginBottom: '20px',
                            fontSize: '18px',
                            color: '#333'
                        }}>
                            ONLINE WALLETS
                        </h3>
                        
                        {wallets.map(wallet => (
                            <div 
                                key={wallet.id}
                                onClick={() => setSelectedWallet(wallet.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    margin: '15px 0',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background 0.3s',
                                    background: selectedWallet === wallet.id ? '#f0e1d8' : 'transparent',
                                    border: selectedWallet === wallet.id ? '1px solid #bd9780' : '1px solid transparent'
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: '#e0e0e0',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                }}>
                                    {wallet.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold' }}>{wallet.name}</div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>{wallet.number}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '15px',
                    marginTop: '30px',
                    paddingTop: '20px',
                    borderTop: '1px solid #ddd'
                }}>
                    <button 
                        className="btn"
                        onClick={backToBooking}
                        style={{
                            background: '#ddd',
                            color: '#333',
                            width: 'auto'
                        }}
                    >
                        BACK
                    </button>
                    <button 
                        className="btn"
                        onClick={processPayment}
                        style={{ width: 'auto' }}
                    >
                        PROCEED TO PAYMENT
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard">
            {/* Header with profile settings and logout */}
            <header className="header" style={{ 
                padding: '15px 40px',
                background: '#eeebed',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <div className="container1" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <h1 style={{ 
                            fontSize: '24px', 
                            color: '#bd9780', 
                            margin: 0,
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}>
                            VENUEASE
                        </h1>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                            Welcome, <strong>{user.full_Name}</strong>
                        </p>
                    </div>
                    <nav className="navigation" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button 
                            className="btn"
                            style={{ 
                                padding: '8px 20px',
                                width: 'auto',
                                fontSize: '14px'
                            }}
                        >
                            Profile Settings
                        </button>
                        <button 
                            className="btn-logout"
                            onClick={onLogout}
                            style={{
                                padding: '8px 20px',
                                background: '#333',
                                color: 'white',
                                border: 'none',
                                borderRadius: '25px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            {/* Tabs Navigation */}
            <div style={{
                display: 'flex',
                gap: '25px',
                padding: '10px 40px',
                borderBottom: '2px solid #333',
                background: 'white'
            }}>
                <button 
                    onClick={() => {
                        setActiveTab('home');
                        setSelectedVenue(null);
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'home' ? '#bd9780' : '#333',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        paddingBottom: '8px',
                        borderBottom: activeTab === 'home' ? '2px solid #bd9780' : 'none'
                    }}
                >
                    Home
                </button>
                <button 
                    onClick={() => {
                        setActiveTab('offers');
                        setSelectedVenue(null);
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'offers' ? '#bd9780' : '#333',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        paddingBottom: '8px',
                        borderBottom: activeTab === 'offers' ? '2px solid #bd9780' : 'none'
                    }}
                >
                    Offers
                </button>
                <button 
                    onClick={() => {
                        setActiveTab('venues');
                        // Keep selected venue when switching to venues tab
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'venues' ? '#bd9780' : '#333',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        paddingBottom: '8px',
                        borderBottom: activeTab === 'venues' ? '2px solid #bd9780' : 'none'
                    }}
                >
                    Venues
                </button>
            </div>

            {/* Main Content */}
            <div className="dashboard-content" style={{ 
                background: '#f5f5f5',
                minHeight: 'calc(100vh - 120px)'
            }}>
                {activeTab === 'home' && renderHomeTab()}
                {activeTab === 'offers' && renderOffersTab()}
                {activeTab === 'venues' && renderVenuesTab()}
                {activeTab === 'booking' && renderBookingTab()}
                {activeTab === 'payment' && renderPaymentTab()}
            </div>

            {/* Payment Success Modal */}
            {showPaymentModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ fontSize: '60px', color: '#4CAF50', marginBottom: '20px' }}>✓</div>
                        <h2 style={{ 
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '24px',
                            marginBottom: '20px'
                        }}>
                            PAYMENT SUCCESSFUL!
                        </h2>
                        
                        <div style={{ 
                            margin: '20px 0',
                            padding: '15px',
                            background: '#f9f9f9',
                            borderRadius: '8px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
                                <span>Amount Paid:</span>
                                <span>₱{selectedVenue?.price}.00</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
                                <span>Total Amount Sent:</span>
                                <span>₱{selectedVenue?.price}.00</span>
                            </div>
                        </div>
                        
                        <p style={{ color: '#666' }}>
                            Your payment has been processed successfully. You will receive a confirmation email shortly.
                        </p>
                        
                        <button 
                            className="btn"
                            onClick={closeModal}
                            style={{ marginTop: '20px', width: 'auto' }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;