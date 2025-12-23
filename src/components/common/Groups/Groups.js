// src/components/common/Groups/Groups.js

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import GroupDetails from './GroupDetails/GroupDetails';
import AddClassroomModal from './AddClassroomModal/AddClassroomModal';
import BulkUploadModal from './BulkUploadModal/BulkUploadModal';
import './Groups.css';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const groupsCollection = collection(db, 'groups');
      const groupsSnapshot = await getDocs(groupsCollection);

      const groupsData = await Promise.all(
        groupsSnapshot.docs.map(async (groupDoc) => {
          const groupData = { id: groupDoc.id, ...groupDoc.data() };

          // Fetch student count for each group
          try {
            const studentsCollection = collection(db, 'groups', groupDoc.id, 'students');
            const studentsSnapshot = await getDocs(studentsCollection);
            groupData.studentCount = studentsSnapshot.size;
          } catch (err) {
            groupData.studentCount = 0;
          }

          return groupData;
        })
      );

      setGroups(groupsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to fetch classrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (window.confirm(`Are you sure you want to delete "${groupName}" classroom? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'groups', groupId));
        setGroups(groups.filter(group => group.id !== groupId));
        console.log(`Deleted group: ${groupName}`);
      } catch (err) {
        console.error('Error deleting group:', err);
        alert('Failed to delete classroom');
      }
    }
  };

  const handleAddGroup = async (groupData) => {
    try {
      const docRef = await addDoc(collection(db, 'groups'), {
        ...groupData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const newGroup = {
        id: docRef.id,
        ...groupData,
        studentCount: 0
      };

      setGroups([...groups, newGroup]);
      setShowAddModal(false);
      console.log('Added new group:', groupData.name);
    } catch (err) {
      console.error('Error adding group:', err);
      alert('Failed to add classroom');
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.teacherName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedGroup) {
    return (
      <GroupDetails 
        groupId={selectedGroup} 
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="groups-container">
        <div className="groups-header">
          <div className="header-content">
            <h1>Groups (Classrooms)</h1>
            <p>Manage and monitor all classroom groups</p>
          </div>
          <div className="header-actions">
            <button className="header-action-btn" disabled>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </button>
            <button className="header-action-btn" disabled>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="groups-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading classrooms...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="groups-container">
        <div className="groups-header">
          <div className="header-content">
            <h1>Groups (Classrooms)</h1>
            <p>Manage and monitor all classroom groups</p>
          </div>
          <div className="header-actions">
            <button 
              className="header-action-btn"
              onClick={() => setShowBulkUpload(true)}
              title="Bulk Upload Classrooms"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </button>
            <button 
              className="header-action-btn"
              onClick={() => setShowAddModal(true)}
              title="Add New Classroom"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="groups-content">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={fetchGroups} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="groups-container">
      {/* Header */}
      <div className="groups-header">
        <div className="header-content">
          <h1>Groups (Classrooms)</h1>
          <p>Manage and monitor all classroom groups</p>
        </div>
        <div className="header-actions">
          <button 
            className="header-action-btn bulk-upload"
            onClick={() => setShowBulkUpload(true)}
            title="Bulk Upload Classrooms"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </button>
          <button 
            className="header-action-btn add-classroom"
            onClick={() => setShowAddModal(true)}
            title="Add New Classroom"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="groups-content">

        {/* Search Section */}
        <div className="search-section">
          <div className="search-input-container">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search classrooms by name, department, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Groups Grid */}
        <div className="groups-grid">
          {filteredGroups.map((group) => (
            <div key={group.id} className="group-card">
              <div className="group-header">
                <div className="group-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                  </svg>
                </div>
                <div className="group-menu">
                  <button className="menu-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                  <div className="dropdown-menu">
                    <button onClick={() => setSelectedGroup(group.id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                      View Details
                    </button>
                    <button>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                      Edit Classroom
                    </button>
                    <button 
                      className="delete-option"
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                      Delete Classroom
                    </button>
                  </div>
                </div>
              </div>

              <div className="group-content">
                <h3>{group.name || 'Unnamed Classroom'}</h3>
                <p className="department">{group.department || 'No Department'}</p>
                {group.teacherName && (
                  <p className="teacher">Teacher: {group.teacherName}</p>
                )}
                {group.description && (
                  <p className="description">{group.description}</p>
                )}
              </div>

              <div className="group-stats">
                <div className="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zM12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span>{group.studentCount || 0}/{group.maxStudents || 'N/A'}</span>
                </div>

                <div className="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  <span>{group.duration || '8h'}</span>
                </div>

                <div className="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
                  </svg>
                  <span>{group.breakTime || 110}min</span>
                </div>
              </div>

              <div className="group-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => setSelectedGroup(group.id)}
                >
                  View Students
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && !loading && (
          <div className="empty-groups">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
              </svg>
            </div>
            <h3>No Classrooms Found</h3>
            <p>
              {searchTerm 
                ? `No classrooms match "${searchTerm}"`
                : 'No classrooms have been created yet.'
              }
            </p>
            <button className="add-first-classroom" onClick={() => setShowAddModal(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Create First Classroom
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddClassroomModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleAddGroup}
        />
      )}

      {showBulkUpload && (
        <BulkUploadModal 
          onClose={() => setShowBulkUpload(false)}
          onComplete={() => {
            setShowBulkUpload(false);
            fetchGroups(); // Refresh groups after bulk upload
          }}
        />
      )}
    </div>
  );
};

export default Groups;
