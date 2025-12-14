// C:\VenuEase\admin-frontend\src\components\QueryBuilder.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QueryBuilder.css';

const QueryBuilder = ({ admin, onBack, onLogout }) => {
    const [query, setQuery] = useState('SELECT * FROM CUSTOMERS');
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [executionTime, setExecutionTime] = useState(0);
    const [rowCount, setRowCount] = useState(0);
    const [activeTab, setActiveTab] = useState('query');
    const [savedQueries, setSavedQueries] = useState([]);
    const [queryHistory, setQueryHistory] = useState([]);
    const [selectedQuery, setSelectedQuery] = useState(null);

    // Predefined queries for quick access
    const commonQueries = [
        { id: 1, name: 'All Customers', sql: 'SELECT * FROM CUSTOMERS', icon: '👤' },
        { id: 2, name: 'Active Venues', sql: 'SELECT * FROM VENUE WHERE is_Available = TRUE', icon: '🏢' },
        { id: 3, name: 'Recent Bookings', sql: 'SELECT * FROM BOOKING ORDER BY booking_Date DESC LIMIT 20', icon: '📅' },
        { id: 4, name: 'Staff Members', sql: 'SELECT * FROM ADMIN ORDER BY role', icon: '👥' },
        { id: 5, name: 'Payments Today', sql: "SELECT * FROM PAYMENT WHERE DATE(payment_Date) = CURDATE()", icon: '💰' },
        { id: 6, name: 'Venue Statistics', sql: 'SELECT venue_Name, capacity, price FROM VENUE ORDER BY price DESC', icon: '📊' }
    ];

    useEffect(() => {
        loadSavedQueries();
        loadQueryHistory();
        executeDefaultQuery();
    }, []);

    const loadSavedQueries = () => {
        const saved = localStorage.getItem('venuease_saved_queries');
        if (saved) {
            setSavedQueries(JSON.parse(saved));
        }
    };

    const loadQueryHistory = () => {
        const history = localStorage.getItem('venuease_query_history');
        if (history) {
            setQueryHistory(JSON.parse(history).slice(0, 10)); // Last 10 queries
        }
    };

    const executeDefaultQuery = async () => {
        await executeQuery('SELECT * FROM CUSTOMERS');
    };

    const executeQuery = async (customQuery = null) => {
        const sqlQuery = customQuery || query;
        
        if (!sqlQuery.trim()) {
            setError('Please enter a SQL query');
            return;
        }

        setLoading(true);
        setError('');
        const startTime = performance.now();

        try {
            const response = await axios.post('http://localhost:5000/api/admin/database/query', {
                query: sqlQuery.trim()
            });

            const endTime = performance.now();
            setExecutionTime(endTime - startTime);
            
            if (response.data.results) {
                setResults(response.data.results);
                setRowCount(response.data.results.length);
                setActiveTab('results');
            } else {
                setResults([]);
                setRowCount(0);
            }

            // Add to history
            if (!customQuery) {
                addToHistory(sqlQuery);
            }

        } catch (error) {
            setError(error.response?.data?.error || 'Error executing query');
            console.error('Query execution error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToHistory = (sql) => {
        const historyItem = {
            id: Date.now(),
            sql: sql,
            timestamp: new Date().toISOString(),
            rowCount: results.length
        };

        const updatedHistory = [historyItem, ...queryHistory.slice(0, 9)];
        setQueryHistory(updatedHistory);
        localStorage.setItem('venuease_query_history', JSON.stringify(updatedHistory));
    };

    const saveCurrentQuery = () => {
        if (!query.trim()) {
            alert('Please enter a query to save');
            return;
        }

        const name = prompt('Enter a name for this query:', `Query ${savedQueries.length + 1}`);
        if (!name) return;

        const newQuery = {
            id: Date.now(),
            name: name,
            sql: query,
            timestamp: new Date().toISOString()
        };

        const updatedQueries = [...savedQueries, newQuery];
        setSavedQueries(updatedQueries);
        localStorage.setItem('venuease_saved_queries', JSON.stringify(updatedQueries));
        alert('Query saved successfully!');
    };

    const deleteQuery = (id) => {
        if (window.confirm('Are you sure you want to delete this saved query?')) {
            const updatedQueries = savedQueries.filter(q => q.id !== id);
            setSavedQueries(updatedQueries);
            localStorage.setItem('venuease_saved_queries', JSON.stringify(updatedQueries));
        }
    };

    const loadQuery = (sql) => {
        setQuery(sql);
        setSelectedQuery(null);
    };

    const formatValue = (value) => {
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'boolean') return value ? '✓' : '✗';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value).substring(0, 50) + '...';
            } catch {
                return '[Object]';
            }
        }
        return String(value);
    };

    const getColumnHeaders = () => {
        if (results.length === 0) return [];
        return Object.keys(results[0]);
    };

    const copyResults = () => {
        const text = JSON.stringify(results, null, 2);
        navigator.clipboard.writeText(text);
        alert('Results copied to clipboard!');
    };

    const exportToCSV = () => {
        if (results.length === 0) return;
        
        const headers = getColumnHeaders();
        const csvContent = [
            headers.join(','),
            ...results.map(row => 
                headers.map(header => 
                    `"${formatValue(row[header]).replace(/"/g, '""')}"`
                ).join(',')
            )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `query_results_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const clearQuery = () => {
        setQuery('');
        setResults([]);
        setError('');
        setSelectedQuery(null);
    };

    return (
        <div className="sql-analyzer">
            {/* Sidebar */}
            <div className="sql-sidebar">
                <div className="sidebar-header">
                    <h2>SQL Analyzer</h2>
                    <p className="admin-info">
                        Welcome, <strong>{admin?.full_Name}</strong>
                    </p>
                </div>

                <div className="sidebar-section">
                    <h3>📊 DASHBOARD</h3>
                    <button className="sidebar-btn back-btn" onClick={onBack}>
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="sidebar-section">
                    <h3>💾 SAVED QUERIES</h3>
                    <div className="saved-queries-list">
                        {savedQueries.length === 0 ? (
                            <p className="empty-message">No saved queries</p>
                        ) : (
                            savedQueries.map((savedQuery) => (
                                <div 
                                    key={savedQuery.id}
                                    className={`saved-query-item ${selectedQuery?.id === savedQuery.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedQuery(savedQuery);
                                        setQuery(savedQuery.sql);
                                    }}
                                >
                                    <span className="query-icon">📝</span>
                                    <div className="query-info">
                                        <strong>{savedQuery.name}</strong>
                                        <small>{new Date(savedQuery.timestamp).toLocaleDateString()}</small>
                                    </div>
                                    <button 
                                        className="delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteQuery(savedQuery.id);
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3>⚡ QUICK QUERIES</h3>
                    <div className="quick-queries">
                        {commonQueries.map((quickQuery) => (
                            <button
                                key={quickQuery.id}
                                className="quick-query-btn"
                                onClick={() => loadQuery(quickQuery.sql)}
                            >
                                <span className="query-icon">{quickQuery.icon}</span>
                                {quickQuery.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3>📜 RECENT QUERIES</h3>
                    <div className="history-list">
                        {queryHistory.length === 0 ? (
                            <p className="empty-message">No recent queries</p>
                        ) : (
                            queryHistory.map((historyItem) => (
                                <div 
                                    key={historyItem.id}
                                    className="history-item"
                                    onClick={() => loadQuery(historyItem.sql)}
                                    title={historyItem.sql}
                                >
                                    <div className="history-sql">
                                        {historyItem.sql.substring(0, 50)}...
                                    </div>
                                    <div className="history-info">
                                        <small>{historyItem.rowCount} rows</small>
                                        <small>{new Date(historyItem.timestamp).toLocaleTimeString()}</small>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={onLogout}>
                        🚪 Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="sql-main">
                <div className="main-header">
                    <h1>SQL Query Analyzer</h1>
                    <p>Execute and analyze SQL queries on the VenuEase database</p>
                </div>

                <div className="query-section">
                    <div className="query-header">
                        <h2>Code Query</h2>
                        <div className="query-actions">
                            <button 
                                className="action-btn save-btn"
                                onClick={saveCurrentQuery}
                                disabled={!query.trim()}
                            >
                                💾 Save
                            </button>
                            <button 
                                className="action-btn execute-btn"
                                onClick={() => executeQuery()}
                                disabled={loading || !query.trim()}
                            >
                                {loading ? '⏳ Executing...' : '▶ Execute'}
                            </button>
                            <button 
                                className="action-btn clear-btn"
                                onClick={clearQuery}
                            >
                                🗑️ Clear
                            </button>
                        </div>
                    </div>

                    <div className="query-editor-container">
                        <textarea
                            className="sql-editor"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter your SQL query here..."
                            rows="8"
                            spellCheck="false"
                        />
                        <div className="editor-footer">
                            <span className="query-tip">
                                💡 Tip: Use Ctrl+Enter to execute query
                            </span>
                            {selectedQuery && (
                                <span className="selected-query">
                                    Loading: <strong>{selectedQuery.name}</strong>
                                </span>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">❌</span>
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {/* Results Section */}
                    {results.length > 0 && activeTab === 'results' && (
                        <div className="results-section">
                            <div className="results-header">
                                <h2>Results</h2>
                                <div className="results-stats">
                                    <span className="stat-badge">
                                        📊 {rowCount} rows
                                    </span>
                                    <span className="stat-badge">
                                        ⚡ {executionTime.toFixed(2)}ms
                                    </span>
                                    <button 
                                        className="action-btn copy-btn"
                                        onClick={copyResults}
                                    >
                                        📋 Copy
                                    </button>
                                    <button 
                                        className="action-btn export-btn"
                                        onClick={exportToCSV}
                                    >
                                        📥 Export
                                    </button>
                                </div>
                            </div>

                            <div className="results-container">
                                <div className="results-table-wrapper">
                                    <table className="results-table">
                                        <thead>
                                            <tr>
                                                {getColumnHeaders().map((header, index) => (
                                                    <th key={index}>
                                                        <div className="column-header">
                                                            {header}
                                                            <span className="column-type">TEXT</span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.slice(0, 100).map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {getColumnHeaders().map((header, colIndex) => (
                                                        <td key={colIndex}>
                                                            <div className="cell-content">
                                                                {formatValue(row[header])}
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {results.length > 100 && (
                                    <div className="results-footer">
                                        Showing first 100 of {results.length} rows
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {results.length === 0 && activeTab === 'results' && (
                        <div className="empty-results">
                            <div className="empty-icon">📊</div>
                            <h3>No Results Yet</h3>
                            <p>Execute a query to see results here</p>
                            <button 
                                className="action-btn execute-btn"
                                onClick={() => executeQuery('SELECT * FROM CUSTOMERS')}
                            >
                                Try Example Query
                            </button>
                        </div>
                    )}

                    {/* Query Suggestions */}
                    <div className="suggestions-section">
                        <h3>💡 Query Suggestions</h3>
                        <div className="suggestions-grid">
                            <div className="suggestion-card">
                                <h4>USERS</h4>
                                <code>SELECT * FROM CUSTOMERS WHERE is_Active = TRUE</code>
                                <button onClick={() => loadQuery('SELECT * FROM CUSTOMERS WHERE is_Active = TRUE')}>
                                    Use Query
                                </button>
                            </div>
                            <div className="suggestion-card">
                                <h4>ADMINS</h4>
                                <code>SELECT * FROM ADMIN ORDER BY date_Created DESC</code>
                                <button onClick={() => loadQuery('SELECT * FROM ADMIN ORDER BY date_Created DESC')}>
                                    Use Query
                                </button>
                            </div>
                            <div className="suggestion-card">
                                <h4>VENUES</h4>
                                <code>SELECT venue_Name, capacity, price FROM VENUE</code>
                                <button onClick={() => loadQuery('SELECT venue_Name, capacity, price FROM VENUE')}>
                                    Use Query
                                </button>
                            </div>
                            <div className="suggestion-card">
                                <h4>BOOKINGS</h4>
                                <code>SELECT COUNT(*) as total FROM BOOKING</code>
                                <button onClick={() => loadQuery('SELECT COUNT(*) as total FROM BOOKING')}>
                                    Use Query
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueryBuilder;