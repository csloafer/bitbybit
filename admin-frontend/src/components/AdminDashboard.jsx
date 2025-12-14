import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = ({ admin, onLogout, onViewUsers, onViewVenues, onViewEvents, onViewBookings, onViewQueryBuilder }) => {
  const [analytics, setAnalytics] = useState({
    totalActiveUsers: 0,
    registeredVenues: 0,
    avgMonthlyVisits: 0,
    totalBookings: 0
  });
  
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchBookingData();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set fallback data
      setAnalytics({
        totalActiveUsers: 157,
        registeredVenues: 58,
        avgMonthlyVisits: 123,
        totalBookings: 106
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/analytics/monthly-bookings');
      setBookingsData(response.data);
    } catch (error) {
      console.error('Error fetching booking data:', error);
      // Set fallback data
      const fallbackData = [
        { month: 'Jan', bookings: 150 },
        { month: 'Feb', bookings: 280 },
        { month: 'Mar', bookings: 450 },
        { month: 'Apr', bookings: 320 },
        { month: 'May', bookings: 580 },
        { month: 'Jun', bookings: 700 },
        { month: 'Jul', bookings: 850 },
        { month: 'Aug', bookings: 920 },
        { month: 'Sep', bookings: 780 },
        { month: 'Oct', bookings: 950 },
        { month: 'Nov', bookings: 1230 },
        { month: 'Dec', bookings: 1050 }
      ];
      setBookingsData(fallbackData);
    } finally {
      setLoadingChart(false);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: bookingsData.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Bookings',
        data: bookingsData.map(item => item.bookings),
        borderColor: '#6E4F3F',
        backgroundColor: 'rgba(110, 79, 63, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6E4F3F',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#21140F',
        titleColor: '#EEEBED',
        bodyColor: '#CEAB96',
        borderColor: '#BD9780',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `Bookings: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(206, 171, 150, 0.2)'
        },
        ticks: {
          color: '#6E4F3F'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(206, 171, 150, 0.2)'
        },
        ticks: {
          color: '#6E4F3F',
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-logo">
            <h1 className="brand-name">VenuEase</h1>
            <div className="brand-subtitle">ADMIN PANEL</div>
          </div>
          
          <nav className="admin-nav">
            <div className="nav-title">MAIN NAVIGATION</div>
            <ul className="nav-list">
              <li className="nav-item">
                <a href="#" className="nav-link active">
                  <span className="nav-icon">📊</span>
                  <span>Dashboard</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onViewUsers(); }}>
                  <span className="nav-icon">👥</span>
                  <span>Users</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onViewQueryBuilder(); }}>
                  <span className="nav-icon">🔍</span>
                  <span>Query Editor</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onViewVenues(); }}>
                  <span className="nav-icon">🏢</span>
                  <span>Venues</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-content">
          <div className="admin-main">
            {/* Header */}
            <header className="admin-header">
              <div className="header-left">
                <h1>Dashboard</h1>
                <p>Welcome back, {admin.full_Name}! Here's what's happening with your venue bookings.</p>
              </div>
              
              <div className="header-right">
                <div className="admin-info">
                  <div className="admin-avatar">
                    {getInitials(admin.full_Name)}
                  </div>
                  <div className="admin-details">
                    <h3>{admin.full_Name}</h3>
                    <p>{admin.role.toUpperCase()}</p>
                  </div>
                </div>
                <button className="logout-btn" onClick={onLogout}>
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </header>

            {/* Analytics Cards */}
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="analytics-header">
                  <div className="analytics-title">Total Active Users</div>
                  <div className="analytics-icon">👥</div>
                </div>
                <div className="analytics-value">
                  {loading ? '...' : analytics.totalActiveUsers.toLocaleString()}
                </div>
                <div className="analytics-trend">
                  <span className="trend-up">↗️ 12% from last month</span>
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="analytics-header">
                  <div className="analytics-title">Registered Venues</div>
                  <div className="analytics-icon">🏢</div>
                </div>
                <div className="analytics-value">
                  {loading ? '...' : analytics.registeredVenues.toLocaleString()}
                </div>
                <div className="analytics-trend">
                  <span className="trend-up">↗️ 5% from last month</span>
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="analytics-header">
                  <div className="analytics-title">Avg. User Visit Per Month</div>
                  <div className="analytics-icon">📈</div>
                </div>
                <div className="analytics-value">
                  {loading ? '...' : analytics.avgMonthlyVisits.toLocaleString()}
                </div>
                <div className="analytics-trend">
                  <span className="trend-up">↗️ 8% from last month</span>
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="analytics-header">
                  <div className="analytics-title">Total Bookings</div>
                  <div className="analytics-icon">📅</div>
                </div>
                <div className="analytics-value">
                  {loading ? '...' : analytics.totalBookings.toLocaleString()}
                </div>
                <div className="analytics-trend">
                  <span className="trend-up">↗️ 15% from last month</span>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="chart-section">
              <div className="chart-header">
                <h2>Monthly Count of Bookings</h2>
                <div className="date-range">
                  <span>November 1 - Now</span>
                </div>
              </div>
              
              <div className="chart-container">
                {loadingChart ? (
                  <div className="loading">
                    <div className="loading-spinner"></div>
                    Loading chart data...
                  </div>
                ) : (
                  <Line data={chartData} options={chartOptions} />
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;