// src/App.js

import React, { useState } from 'react';
import './App.css';

// Import components
import Sidebar from './components/common/Sidebar/Sidebar';
import Dashboard from './components/common/Dashboard/Dashboard';
import Groups from './components/common/Groups/Groups';
import GroupDetails from './components/common/Groups/GroupDetails/GroupDetails';

// Simple component for other pages (placeholder)
const PlaceholderPage = ({ title }) => (
  <div className="content-container">
    <h1>{title}</h1>
    <p>This feature is <strong>coming soon</strong>!</p>
    <p>Stay tuned for updates as we continue to build out the admin dashboard.</p>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Reset selected group when changing pages
    if (page !== 'groups') {
      setSelectedGroupId(null);
    }
  };

  const handleGroupSelect = (groupId) => {
    setSelectedGroupId(groupId);
    setCurrentPage('group-details');
  };

  const handleBackToGroups = () => {
    setSelectedGroupId(null);
    setCurrentPage('groups');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      
      case 'groups':
        return (
          <Groups 
            onGroupSelect={handleGroupSelect}
          />
        );
      
      case 'group-details':
        return (
          <GroupDetails 
            groupId={selectedGroupId}
            onBack={handleBackToGroups}
          />
        );
      
      case 'add-users':
        return <PlaceholderPage title="Add Users" />;
      
      case 'set-coordinates':
        return <PlaceholderPage title="Set Coordinates" />;
      
      case 'timetable':
        return <PlaceholderPage title="Timetable" />;
      
      case 'teachers':
        return <PlaceholderPage title="Teachers" />;
      
      case 'search':
        return <PlaceholderPage title="Search" />;
      
      case 'active-users':
        return <PlaceholderPage title="Active Users" />;
      
      case 'statistics':
        return <PlaceholderPage title="Statistics" />;
      
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <Sidebar 
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;