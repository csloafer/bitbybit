import React from 'react';
import './css/LandingPage.css';

const DashboardHome = () => {
    return (
        <div className="tab-content active">

            {/* Hero / Banner */}
            <div className="home-hero">
                <img
                    src="/images/banner.jpg"   // change to your actual banner path
                    alt="Event Banner"
                />
            </div>

            {/* Popular Venues Section */}
            <div style={{ padding: '0 40px' }}>
                <div className="popular-label">
                    Popular venues
                </div>

                <div className="popular-venue">
                    {/* Left Image */}
                    <img
                        src="/images/venue1.jpg" // change to your venue image
                        alt="Popular Venue"
                    />

                    {/* Right Content */}
                    <div className="popular-content">
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                            enim ad minim veniam, quis nostrud exercitation ullamco laboris
                            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                            reprehenderit in voluptate velit esse cillum dolore eu fugiat
                            nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                            sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>

                        <button className="read-more-btn">
                            Read More &gt;
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DashboardHome;
