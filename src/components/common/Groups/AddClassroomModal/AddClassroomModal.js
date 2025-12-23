// src/components/common/Groups/AddClassroomModal/AddClassroomModal.js
import React, { useState } from 'react';
import './AddClassroomModal.css';

const AddClassroomModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    teacherName: '',
    teacherEmail: '',
    maxStudents: '',
    duration: '8',
    breakTime: '110',
    description: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    'Computer Science and Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Biotechnology',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Classroom name is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.teacherName.trim()) {
      newErrors.teacherName = 'Teacher name is required';
    }

    if (formData.teacherEmail && !/\S+@\S+\.\S+/.test(formData.teacherEmail)) {
      newErrors.teacherEmail = 'Invalid email format';
    }

    if (!formData.maxStudents || formData.maxStudents < 1) {
      newErrors.maxStudents = 'Max students must be at least 1';
    }

    if (!formData.duration || formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 hour';
    }

    if (!formData.breakTime || formData.breakTime < 0) {
      newErrors.breakTime = 'Break time must be 0 or more minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const classroomData = {
        ...formData,
        maxStudents: parseInt(formData.maxStudents),
        duration: `${formData.duration}h`,
        breakTime: parseInt(formData.breakTime)
      };
      
      await onSave(classroomData);
    } catch (error) {
      console.error('Error saving classroom:', error);
      alert('Failed to create classroom. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>Add New Classroom</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">
                Classroom Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., III-CSE-B"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="department">
                Department <span className="required">*</span>
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={errors.department ? 'error' : ''}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <span className="error-message">{errors.department}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="teacherName">
                Teacher Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="teacherName"
                name="teacherName"
                value={formData.teacherName}
                onChange={handleInputChange}
                placeholder="Teacher's full name"
                className={errors.teacherName ? 'error' : ''}
              />
              {errors.teacherName && <span className="error-message">{errors.teacherName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="teacherEmail">Teacher Email</label>
              <input
                type="email"
                id="teacherEmail"
                name="teacherEmail"
                value={formData.teacherEmail}
                onChange={handleInputChange}
                placeholder="teacher@example.com"
                className={errors.teacherEmail ? 'error' : ''}
              />
              {errors.teacherEmail && <span className="error-message">{errors.teacherEmail}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="maxStudents">
                Max Students <span className="required">*</span>
              </label>
              <input
                type="number"
                id="maxStudents"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleInputChange}
                placeholder="67"
                min="1"
                className={errors.maxStudents ? 'error' : ''}
              />
              {errors.maxStudents && <span className="error-message">{errors.maxStudents}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="duration">
                Class Duration (hours) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="8"
                min="1"
                className={errors.duration ? 'error' : ''}
              />
              {errors.duration && <span className="error-message">{errors.duration}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="breakTime">
                Break Time (minutes) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="breakTime"
                name="breakTime"
                value={formData.breakTime}
                onChange={handleInputChange}
                placeholder="110"
                min="0"
                className={errors.breakTime ? 'error' : ''}
              />
              {errors.breakTime && <span className="error-message">{errors.breakTime}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description about the classroom..."
                rows="3"
              />
            </div>

            <div className="form-group full-width">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <label htmlFor="isActive" className="checkbox-label">
                  Active Classroom (students can mark attendance)
                </label>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Create Classroom
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassroomModal;