// src/components/common/Groups/GroupDetails/GroupDetails.js
import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../services/firebase';
import './GroupDetails.css';

const GroupDetails = ({ groupId, onBack }) => {
  const [groupInfo, setGroupInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch group information
      const groupDoc = doc(db, 'groups', groupId);
      const groupSnapshot = await getDoc(groupDoc);
      
      if (groupSnapshot.exists()) {
        setGroupInfo({ id: groupSnapshot.id, ...groupSnapshot.data() });
      }

      // Fetch students in this group
      const studentsCollection = collection(db, 'groups', groupId, 'students');
      const studentsSnapshot = await getDocs(studentsCollection);
      
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStudents(studentsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching group details:', err);
      setError('Failed to fetch group details');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId, fetchGroupDetails]);

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = () => {
    console.log('Add student clicked');
    // Future implementation
  };

  const handleStudentAction = (student, action) => {
    console.log(`${action} for student:`, student.name);
    // Future implementation for edit, delete, etc.
  };

  if (loading) {
    return (
      <div className="group-details-container">
        <div className="group-details-header">
          <div className="header-left">
            <button className="back-btn" onClick={onBack}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
            <h1>Loading...</h1>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading classroom details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group-details-container">
        <div className="group-details-header">
          <div className="header-left">
            <button className="back-btn" onClick={onBack}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
            <h1>Error</h1>
          </div>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={fetchGroupDetails} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group-details-container">
      {/* Header */}
      <div className="group-details-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <div className="header-info">
            <h1>{groupInfo?.name || 'Classroom'} Students</h1>
            <p>{groupInfo?.department || 'Department'}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="export-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>
            </svg>
          </button>
          <button className="add-student-btn" onClick={handleAddStudent}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Group Info Section */}
      <div className="group-info-section">
        <div className="info-card">
          <div className="info-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
            </svg>
          </div>
          <div className="info-content">
            <h3>{groupInfo?.name || 'Unnamed Class'}</h3>
            <p>{groupInfo?.department || 'Computer Science and Engineering'}</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zM12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <div>
              <span className="stat-label">Max: {groupInfo?.maxStudents || 'N/A'}</span>
            </div>
          </div>

          <div className="stat-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <div>
              <span className="stat-label">8h</span>
            </div>
          </div>

          <div className="stat-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
            </svg>
            <div>
              <span className="stat-label">{groupInfo?.breakTime || 110}min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-section">
        <div className="search-input-container">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search students by name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Students List */}
      <div className="students-section">
        <div className="students-header">
          <h2>Students ({filteredStudents.length})</h2>
        </div>

        <div className="students-grid">
          {filteredStudents.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-header">
                <div className="student-avatar">
                  {student.name ? student.name.substring(0, 2).toUpperCase() : 'ST'}
                </div>
                <div className="student-menu">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </div>
              </div>

              <div className="student-info">
                <h3>{student.name || 'Unknown Student'}</h3>
                <p className="roll-number">Roll: {student.rollNumber || 'N/A'}</p>
                <p className="email">{student.email || 'No email provided'}</p>
                {student.phone && (
                  <p className="phone">{student.phone}</p>
                )}
              </div>

              <div className="student-status">
                <div className="biometric-status">
                  {student.biometricRegistered ? (
                    <div className="status-badge registered">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Biometric Registered
                    </div>
                  ) : (
                    <div className="status-badge not-registered">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Biometric Required
                    </div>
                  )}
                </div>
              </div>

              <div className="student-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => handleStudentAction(student, 'edit')}
                >
                  Edit
                </button>
                {!student.biometricRegistered && (
                  <button 
                    className="action-btn biometric"
                    onClick={() => handleStudentAction(student, 'register-biometric')}
                  >
                    Re-register Biometric
                  </button>
                )}
                <button 
                  className="action-btn delete"
                  onClick={() => handleStudentAction(student, 'delete')}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && !loading && (
          <div className="empty-students">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zM12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <h3>No Students Found</h3>
            <p>
              {searchTerm 
                ? `No students match "${searchTerm}"`
                : 'No students have been added to this classroom yet.'
              }
            </p>
            <button className="add-first-student" onClick={handleAddStudent}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Add First Student
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetails;