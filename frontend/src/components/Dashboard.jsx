import React, { useState, useEffect } from 'react';
import './css/LandingPage.css';
import DashboardHome from './DashboardHome.jsx';
import DashboardOffers from './DashboardOffers.jsx';
import DashboardVenues from './DashboardVenues.jsx';
import DashboardBooking from './DashboardBooking.jsx';
import DashboardPayment from './DashboardPayment.jsx';
import QRCodeModal from './QRCodeModal.jsx';
import PaymentSuccessModal from './PaymentSuccessModal.jsx';
import { FaUserCircle } from 'react-icons/fa';
import axios from 'axios';

const Dashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('home');
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [selectedVenueId, setSelectedVenueId] = useState(null);
    const [selectedVenueData, setSelectedVenueData] = useState(null);
    const [bookingData, setBookingData] = useState({
        fromDate: '',
        toDate: '',
        fromTime: '',
        toTime: ''
    });
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    
    // Data arrays
    const [recentEvents] = useState([]);
    const [wallets] = useState([
        { id: 1, name: 'PayPal', type: 'paypal' },
        { id: 2, name: 'Credit Card', type: 'credit-card' },
        { id: 3, name: 'Bank Transfer', type: 'bank-transfer' }
    ]);

    // Fetch venue details when selectedVenueId changes
    useEffect(() => {
        if (selectedVenueId) {
            fetchVenueDetails(selectedVenueId);
        }
    }, [selectedVenueId]);

    const fetchVenueDetails = async (venueId) => {
        try {
            console.log(`📥 Fetching details for venue ID: ${venueId}`);
            const response = await axios.get(`http://localhost:5000/api/venues/${venueId}`);
            console.log('Venue details fetched:', response.data);
            setSelectedVenueData(response.data);
        } catch (error) {
            console.error('❌ Error fetching venue details:', error);
            // Keep using the basic venue data from offers
        }
    };

    const handleBookNow = (offer) => {
        console.log('Booking offer from Dashboard:', offer);
        
        // Set the basic venue info from offers
        setSelectedVenue({
            id: offer.id,
            title: offer.title || offer.venue_Name,
            address: offer.address,
            description: offer.description,
            price: offer.price,
            capacity: offer.capacity,
            contact_email: offer.contact_email,
            contact_phone: offer.contact_phone,
            image: offer.image
        });
        
        // Also set the venue ID to fetch complete details
        setSelectedVenueId(offer.id);
        
        // Switch to venues tab
        setActiveTab('venues');
    };

    const startBooking = (venue) => {
        console.log('Starting booking for:', venue);
        
        // Use the detailed venue data if available, otherwise use what we have
        const venueToBook = selectedVenueData || venue || selectedVenue;
        
        if (!venueToBook) {
            console.error('No venue data available for booking');
            alert('Please select a venue first');
            return;
        }
        
        setSelectedVenue(venueToBook);
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
            setSelectedVenueId(null);
            setSelectedVenueData(null);
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
        setSelectedPaymentMethod(selectedWallet);
        setShowQRModal(true);
    };

    const confirmPayment = () => {
        setShowQRModal(false);
        setShowPaymentModal(true);
        setTimeout(() => {
            setShowPaymentModal(false);
            setSelectedWallet(null);
            setBookingData({
                fromDate: '',
                toDate: '',
                fromTime: '',
                toTime: ''
            });
            setSelectedVenue(null);
            setSelectedVenueId(null);
            setSelectedVenueData(null);
            setActiveTab('venues');
        }, 3000);
    };

    const closeQRModal = () => {
        setShowQRModal(false);
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setSelectedWallet(null);
        setBookingData({
            fromDate: '',
            toDate: '',
            fromTime: '',
            toTime: ''
        });
        setSelectedVenue(null);
        setSelectedVenueId(null);
        setSelectedVenueData(null);
        setActiveTab('venues');
    };

    // Check if user exists
    if (!user) {
        console.error('User data is missing!');
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Loading error</h2>
                <p>User data not available. Please try logging in again.</p>
                <button onClick={onLogout}>Back to Login</button>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="header">
                <div className="container1">
                    <div className="logo">
                        <h1>VENUEASE</h1>
                        <p>Welcome, <strong>{user.full_Name || user.name || 'User'}</strong></p>
                    </div>
                    <nav className="navigation">
                        <button className="profile-icon-btn" title="Profile Settings">
                            <FaUserCircle size={26} />
                        </button>
                        <button 
                            className="btn-logout"
                            onClick={onLogout}
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
                        setSelectedVenueId(null);
                        setSelectedVenueData(null);
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
                        setSelectedVenueId(null);
                        setSelectedVenueData(null);
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
            <div className="dashboard-content">
                {activeTab === 'home' && (
                    <DashboardHome 
                        recentEvents={recentEvents}
                    />
                )}
                {activeTab === 'offers' && (
                    <DashboardOffers 
                        handleBookNow={handleBookNow}
                    />
                )}
                {activeTab === 'venues' && (
                    <DashboardVenues 
                        selectedVenue={selectedVenueData || selectedVenue}
                        selectedVenueId={selectedVenueId}
                        startBooking={startBooking}
                    />
                )}
                {activeTab === 'booking' && (
                    <DashboardBooking 
                        selectedVenue={selectedVenueData || selectedVenue}
                        bookingData={bookingData}
                        setBookingData={setBookingData}
                        cancelBooking={cancelBooking}
                        proceedToPayment={proceedToPayment}
                    />
                )}
                {activeTab === 'payment' && (
                    <DashboardPayment 
                        selectedVenue={selectedVenueData || selectedVenue}
                        selectedWallet={selectedWallet}
                        setSelectedWallet={setSelectedWallet}
                        backToBooking={backToBooking}
                        processPayment={processPayment}
                        wallets={wallets}
                    />
                )}
            </div>

            {/* Modals */}
            {showQRModal && selectedPaymentMethod && (
                <QRCodeModal 
                    selectedPaymentMethod={selectedPaymentMethod}
                    selectedVenue={selectedVenueData || selectedVenue}
                    closeQRModal={closeQRModal}
                    confirmPayment={confirmPayment}
                />
            )}

            {showPaymentModal && (
                <PaymentSuccessModal 
                    selectedVenue={selectedVenueData || selectedVenue}
                    closePaymentModal={closePaymentModal}
                />
            )}
        </div>
    );
};

export default Dashboard;