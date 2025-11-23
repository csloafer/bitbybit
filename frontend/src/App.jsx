import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
    const [currentView, setCurrentView] = useState('landing');
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
        setCurrentView('dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        setCurrentView('landing');
    };

    return (
        <div className="App">
            {currentView === 'landing' && (
                <LandingPage 
                    onLoginClick={() => setCurrentView('login')}
                    onSignUpClick={() => setCurrentView('register')}
                />
            )}
            
            {currentView === 'login' && (
                <Login 
                    switchToRegister={() => setCurrentView('register')}
                    switchToLanding={() => setCurrentView('landing')}
                    onLogin={handleLogin}
                />
            )}
            
            {currentView === 'register' && (
                <Register 
                    switchToLogin={() => setCurrentView('login')}
                    switchToLanding={() => setCurrentView('landing')}
                />
            )}
            
            {currentView === 'dashboard' && user && (
                <Dashboard 
                    user={user} 
                    onLogout={handleLogout}
                />
            )}
        </div>
    );
}

export default App;