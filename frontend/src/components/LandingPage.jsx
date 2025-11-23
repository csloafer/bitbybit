// C:\VenuEase\frontend\src\components\LandingPage.jsx
import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onLoginClick, onSignUpClick }) => {
    return (
        <div className="landing-page">
            {/* Navigation - Match your design */}
            <nav className="nav">
                <div className="nav-container">
                    <div className="nav-brand">
                        <span className="brand-text">VenuEase</span>
                    </div>
                    <div className="nav-links">
                        <a href="#" className="nav-link">Schedules</a>
                        <a href="#" className="nav-link">Places</a>
                        <a href="#" className="nav-link">Offers</a>
                    </div>
                    <div className="nav-actions">
                        <button className="nav-login" onClick={onLoginClick}>Log In</button>
                        <button className="nav-signup" onClick={onSignUpClick}>Sign Up</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Match your design */}
            <section className="hero">
                <div className="hero-container">
                    <h1 className="hero-title">Time Efficient All in one place Quick Insights</h1>
                    <p className="hero-subtitle">
                        Uncontrolling and unlock the front door to a new building and your doors.
                    </p>
                </div>
            </section>

            {/* About Section - Match your design */}
            <section className="about">
                <div className="about-container">
                    <h2 className="about-title">About VenuEase</h2>
                    
                    <div className="about-content">
                        <div className="about-item">
                            <h3 className="about-item-title">VENUE SCHEDULING</h3>
                            <p className="about-item-text">
                                Lifting phone needs are used, only if click on someone else can be 
                                transition rather than answer or take off or contact without anyone.
                            </p>
                        </div>
                        
                        <div className="about-item">
                            <h3 className="about-item-title">VENUE SCHEDULING</h3>
                            <p className="about-item-text">
                                Lifting phone needs are used, only if click on someone else can be 
                                transition rather than answer or take off or contact without anyone.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;