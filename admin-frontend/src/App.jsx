import React, { useState } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import VenueManagement from './components/VenueManagement';
import EventManagement from './components/EventManagement';
import BookingManagement from './components/BookingManagement';
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

    return (
        <div className="App">
            {currentView === 'login' && (
                <AdminLogin onLogin={handleLogin} />
            )}
            
            {currentView === 'dashboard' && admin && (
                <AdminDashboard 
                    admin={admin} 
                    onLogout={handleLogout}
                    onViewUsers={() => setCurrentView('users')}
                    onViewVenues={() => setCurrentView('venues')}
                    onViewEvents={() => setCurrentView('events')}
                    onViewBookings={() => setCurrentView('bookings')}
                />
            )}

            {currentView === 'users' && admin && (
                <UserManagement 
                    admin={admin}
                    onBack={() => setCurrentView('dashboard')}
                    onLogout={handleLogout}
                />
            )}

            {currentView === 'venues' && admin && (
                <VenueManagement 
                    admin={admin}
                    onBack={() => setCurrentView('dashboard')}
                    onLogout={handleLogout}
                />
            )}

            {currentView === 'events' && admin && (
                <EventManagement 
                    admin={admin}
                    onBack={() => setCurrentView('dashboard')}
                    onLogout={handleLogout}
                />
            )}

            {currentView === 'bookings' && admin && (
                <BookingManagement 
                    admin={admin}
                    onBack={() => setCurrentView('dashboard')}
                    onLogout={handleLogout}
                />
            )}
        </div>
    );
}

export default App;