// C:\VenuEase\frontend\src\components\LandingPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import './css/LandingPage.css';

const LandingPage = ({ onLoginClick, onSignUpClick }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const trackRef = useRef(null);

    const carouselData = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            title: "Venue Scheduling",
            description: "Easily book and manage venue reservations with our intuitive scheduling system."
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1348&q=80",
            title: "Event Management",
            description: "Plan and coordinate all aspects of your event in one centralized platform."
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            title: "Vendor Coordination",
            description: "Connect with trusted vendors and manage all your event service needs."
        },
        {
            id: 4,
            image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            title: "Real-time Updates",
            description: "Stay informed with instant notifications and real-time status updates."
        },
        {
            id: 5,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1348&q=80",
            title: "Customer Support",
            description: "Our dedicated team is available 24/7 to assist with any questions or issues."
        }
    ];

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % carouselData.length);
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + carouselData.length) % carouselData.length);
    };

    useEffect(() => {
        if (trackRef.current) {
            const cardWidth = trackRef.current.children[0].offsetWidth + 40; // width + gap
            trackRef.current.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
        }
    }, [currentSlide]);

    return (
        <div className="landing-page">
            {/* Header - Updated to match HTML design */}
            <header className="header">
                <div className="container">
                    <div className="logo">
                        <h1>VenuEase</h1>
                    </div>
                    <div className="logo-buttons">
                        <button className="btn-schedule">Schedules</button>
                        <button className="btn-place">Places</button>
                        <button className="btn-offer">Offers</button>
                    </div>
                    <nav className="navigation">
                        <button className="btn-login" onClick={onLoginClick}>Log In</button>
                        <button className="btn-signup" onClick={onSignUpClick}>Sign Up</button>
                    </nav>
                </div>
            </header>

            {/* Image Top Section */}
            <section className="image-top">
                <div className="top-container">
                    <img 
                        src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                        alt="Venue" 
                        className="top-image" 
                    />
                </div>
                <div className="bottom-container">
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">⏱️</div>
                            <div className="feature-content">
                                <h4>Time Efficient</h4>
                                <p>Faster scheduling</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">📍</div>
                            <div className="feature-content">
                                <h4>All in one place</h4>
                                <p>Easily view venues, Events, and schedules anytime</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">📊</div>
                            <div className="feature-content">
                                <h4>Quick Insights</h4>
                                <p>Get automatic looking and resume reports</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>About VenuEase</h1>
                    </div>
                </div>
                <div className="arrows">
                    <div className="arrow" id="prev" onClick={prevSlide}>&#8249;</div>
                    <div className="arrow" id="next" onClick={nextSlide}>&#8250;</div>
                </div>
            </section>

            {/* Carousel Section */}
            <div className="carousel-container">
                <div className="carousel-track" id="track" ref={trackRef}>
                    {carouselData.map((item) => (
                        <div className="card" key={item.id}>
                            <img src={item.image} alt={item.title} />
                            <div className="card-text">
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;