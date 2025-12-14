// Remove EventManagement import and update App.jsx
import React, { useState } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import VenueManagement from './components/VenueManagement';
import BookingManagement from './components/BookingManagement';
import QueryBuilder from './components/QueryBuilder';
import './App.css';

function App() {
    const [currentView, setCurrentView] = useState('login');
    const [admin, setAdmin] = useState(null);

    const handleLogin = (adminData) => {
        setAdmin(adminData);
        setCurrentView('dashboard');
    };

    const handleLogout = () => {
        setAdmin(null);
        setCurrentView('login');
    };

    // Navigation functions
    const navigateToDashboard = () => setCurrentView('dashboard');
    const navigateToUsers = () => setCurrentView('users');
    const navigateToQueryBuilder = () => setCurrentView('query');
    const navigateToVenues = () => setCurrentView('venues');
    const navigateToBookings = () => setCurrentView('bookings');

    return (
        <div className="App">
            {currentView === 'login' && (
                <AdminLogin onLogin={handleLogin} />
            )}
            
            {currentView === 'dashboard' && admin && (
                <AdminDashboard 
                    admin={admin} 
                    onLogout={handleLogout}
                    onViewUsers={navigateToUsers}
                    onViewVenues={navigateToVenues}
                    onViewBookings={navigateToBookings}
                    onViewQueryBuilder={navigateToQueryBuilder}
                    
                />
            )}

            {currentView === 'users' && admin && (
                <UserManagement 
                    admin={admin}
                    onLogout={handleLogout}
                    onViewDashboard={navigateToDashboard}
                    onViewUsers={navigateToUsers}
                    onViewQueryBuilder={navigateToQueryBuilder}
                    onViewVenues={navigateToVenues}
                />
            )}

            {currentView === 'venues' && admin && (
                <VenueManagement 
                    admin={admin}
                    onLogout={handleLogout}
                    onViewDashboard={navigateToDashboard}
                    onViewUsers={navigateToUsers}
                    onViewQueryBuilder={navigateToQueryBuilder}
                    onViewVenues={navigateToVenues}
                />
            )}

            {currentView === 'bookings' && admin && (
                <BookingManagement 
                    admin={admin}
                    onLogout={handleLogout}
                    onViewDashboard={navigateToDashboard}
                    onViewUsers={navigateToUsers}
                    onViewQueryBuilder={navigateToQueryBuilder}
                    onViewVenues={navigateToVenues}
                />
            )}

            {currentView === 'query' && admin && (
    <QueryBuilder 
        admin={admin}
        onLogout={handleLogout}
        onBack={navigateToDashboard}  // CHANGE THIS LINE
    />
)}
        </div>
    );
}

export default App;