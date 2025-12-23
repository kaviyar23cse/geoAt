// src/components/common/Groups/BulkUploadModal/BulkUploadModal.js
import React, { useState } from 'react';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../../services/firebase';
import './BulkUploadModal.css';

const BulkUploadModal = ({ onClose, onComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [successCount, setSuccessCount] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Please upload a CSV or Excel file');
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setSuccessCount(0);
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const requiredFields = ['name', 'department'];
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required columns: ${missingFields.join(', ')}`);
    }

    const classrooms = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const classroom = {};
      headers.forEach((header, index) => {
        classroom[header] = values[index];
      });

      // Validate required fields
      if (!classroom.name) {
        errors.push(`Row ${i + 1}: Classroom name is required`);
        continue;
      }

      if (!classroom.department) {
        errors.push(`Row ${i + 1}: Department is required`);
        continue;
      }

      // Set defaults and convert types
      classroom.maxStudents = classroom.maxstudents ? parseInt(classroom.maxstudents) : 60;
      classroom.duration = classroom.duration || '8h';
      classroom.breakTime = classroom.breaktime ? parseInt(classroom.breaktime) : 110;
      classroom.teacherName = classroom.teachername || classroom.teacher || '';
      classroom.teacherEmail = classroom.teacheremail || '';
      classroom.isActive = classroom.isactive !== 'false';
      classroom.description = classroom.description || '';

      classrooms.push(classroom);
    }

    return { classrooms, errors };
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setErrors([]);
    setSuccessCount(0);
    setUploadProgress(0);

    try {
      const text = await file.text();
      const { classrooms, errors: parseErrors } = parseCSV(text);
      
      if (parseErrors.length > 0) {
        setErrors(parseErrors);
        setIsUploading(false);
        return;
      }

      const batch = writeBatch(db);
      let successCount = 0;
      const uploadErrors = [];

      for (let i = 0; i < classrooms.length; i++) {
        try {
          const classroom = classrooms[i];
          const docRef = doc(collection(db, 'groups'));
          
          batch.set(docRef, {
            ...classroom,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          successCount++;
          setUploadProgress(Math.round(((i + 1) / classrooms.length) * 100));
        } catch (error) {
          uploadErrors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      await batch.commit();
      
      setSuccessCount(successCount);
      setErrors(uploadErrors);
      
      if (uploadErrors.length === 0) {
        setTimeout(() => {
          onComplete();
        }, 1500);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setErrors(['Failed to process file: ' + error.message]);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,department,teachername,teacheremail,maxstudents,duration,breaktime,description,isactive
III-CSE-A,Computer Science and Engineering,Dr. John Smith,john.smith@college.edu,60,8,110,Third year CSE section A,true
III-CSE-B,Computer Science and Engineering,Dr. Jane Doe,jane.doe@college.edu,65,8,110,Third year CSE section B,true
II-IT-A,Information Technology,Prof. Mike Johnson,mike.johnson@college.edu,55,7,90,Second year IT section A,true`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'classroom_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isUploading) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="bulk-modal-container">
        <div className="modal-header">
          <h2>Bulk Upload Classrooms</h2>
          {!isUploading && (
            <button className="close-btn" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </div>

        <div className="bulk-modal-content">
          {!file ? (
            <>
              <div className="instructions">
                <h3>Upload Instructions</h3>
                <ul>
                  <li>Download the template file to see the required format</li>
                  <li>Required columns: <strong>name</strong>, <strong>department</strong></li>
                  <li>Optional columns: teachername, teacheremail, maxstudents, duration, breaktime, description, isactive</li>
                  <li>Supported formats: CSV, Excel (.xlsx, .xls)</li>
                  <li>Maximum file size: 5MB</li>
                </ul>
              </div>

              <div className="template-download">
                <button className="template-btn" onClick={downloadTemplate}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  Download Template
                </button>
              </div>

              <div 
                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="upload-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <h3>Drop your file here</h3>
                <p>or</p>
                <label className="upload-btn">
                  Choose File
                  <input 
                    type="file" 
                    accept=".csv,.xlsx,.xls" 
                    onChange={handleFileInput}
                    hidden
                  />
                </label>
                <p className="file-info">CSV or Excel files only</p>
              </div>
            </>
          ) : (
            <div className="upload-status">
              <div className="file-info">
                <div className="file-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <div className="file-details">
                  <h3>{file.name}</h3>
                  <p>{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              {isUploading && (
                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p>Uploading... {uploadProgress}%</p>
                </div>
              )}

              {successCount > 0 && (
                <div className="success-message">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Successfully uploaded {successCount} classrooms!
                </div>
              )}

              {errors.length > 0 && (
                <div className="error-section">
                  <h4>Errors Found:</h4>
                  <div className="error-list">
                    {errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="error-item">
                        {error}
                      </div>
                    ))}
                    {errors.length > 10 && (
                      <div className="error-item">
                        ... and {errors.length - 10} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="upload-actions">
                {!isUploading && (
                  <>
                    <button 
                      className="cancel-btn" 
                      onClick={() => setFile(null)}
                    >
                      Choose Different File
                    </button>
                    <button 
                      className="upload-btn-action" 
                      onClick={handleUpload}
                      disabled={errors.length > 0}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z"/>
                      </svg>
                      Upload Classrooms
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;