import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';
import '../styles/event-form.css';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    location: '',
    capacity: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          image: 'Please select a valid image file'
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: 'Image size must be less than 5MB'
        }));
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      if (errors.image) {
        setErrors((prev) => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    if (!formData.dateTime) {
      newErrors.dateTime = 'Event date and time are required';
    } else {
      const selectedDate = new Date(formData.dateTime);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.dateTime = 'Event date must be in the future';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Event location is required';
    } else if (formData.location.trim().length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    }

    if (!formData.capacity) {
      newErrors.capacity = 'Event capacity is required';
    } else {
      const capacityNum = parseInt(formData.capacity, 10);
      if (isNaN(capacityNum) || capacityNum < 1) {
        newErrors.capacity = 'Capacity must be at least 1';
      } else if (capacityNum > 10000) {
        newErrors.capacity = 'Capacity cannot exceed 10,000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setApiError('');
      return;
    }

    try {
      setLoading(true);
      setApiError('');
      setSuccessMessage('');

      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('dateTime', formData.dateTime);
      submitData.append('location', formData.location.trim());
      submitData.append('capacity', parseInt(formData.capacity, 10));

      if (imageFile) {
        console.log('📸 Image file being appended:', imageFile.name, imageFile.size);
        submitData.append('image', imageFile);
      } else {
        console.log('⚠️ No image file selected');
      }

      console.log('📤 FormData being sent:', {
        hasImage: !!imageFile,
        imageFileName: imageFile?.name,
        imageSize: imageFile?.size
      });

      const response = await eventService.createEvent(submitData);

      setSuccessMessage('Event created successfully! Redirecting...');

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create event. Please try again.';
      setApiError(errorMessage);
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="event-form-container">
      <div className="container">
        <div className="form-wrapper">
          <div className="form-header">
            <h1>Create Event</h1>
            <p>Fill in the details below to create a new event</p>
          </div>

          {/* Error Alert */}
          {apiError && (
            <div className="alert alert-error">
              {apiError}
              <button
                className="alert-close"
                onClick={() => setApiError('')}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="alert alert-success">
              {successMessage}
              <button
                className="alert-close"
                onClick={() => setSuccessMessage('')}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Title Field */}
            <div className="form-group">
              <label htmlFor="title">
                Event Title <span className="required">*</span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Summer Music Festival"
                disabled={loading}
                className={errors.title ? 'input-error' : ''}
              />
              {errors.title && (
                <span className="field-error">{errors.title}</span>
              )}
              <span className="field-hint">
                {formData.title.length}/100 characters
              </span>
            </div>

            {/* Description Field */}
            <div className="form-group">
              <label htmlFor="description">
                Event Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event in detail..."
                disabled={loading}
                rows="5"
                className={errors.description ? 'input-error' : ''}
              />
              {errors.description && (
                <span className="field-error">{errors.description}</span>
              )}
              <span className="field-hint">
                {formData.description.length}/500 characters
              </span>
            </div>

            {/* Date and Time Field */}
            <div className="form-group">
              <label htmlFor="dateTime">
                Date & Time <span className="required">*</span>
              </label>
              <input
                id="dateTime"
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleInputChange}
                min={getMinDateTime()}
                disabled={loading}
                className={errors.dateTime ? 'input-error' : ''}
              />
              {errors.dateTime && (
                <span className="field-error">{errors.dateTime}</span>
              )}
            </div>

            {/* Location Field */}
            <div className="form-group">
              <label htmlFor="location">
                Location <span className="required">*</span>
              </label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Central Park, New York"
                disabled={loading}
                className={errors.location ? 'input-error' : ''}
              />
              {errors.location && (
                <span className="field-error">{errors.location}</span>
              )}
            </div>

            {/* Capacity Field */}
            <div className="form-group">
              <label htmlFor="capacity">
                Capacity <span className="required">*</span>
              </label>
              <input
                id="capacity"
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Maximum number of attendees"
                min="1"
                max="10000"
                disabled={loading}
                className={errors.capacity ? 'input-error' : ''}
              />
              {errors.capacity && (
                <span className="field-error">{errors.capacity}</span>
              )}
            </div>

            {/* Image Upload Field */}
            <div className="form-group">
              <label htmlFor="image">
                Event Image <span className="optional">(Optional)</span>
              </label>

              {/* Image Preview */}
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Event preview" />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={handleRemoveImage}
                    disabled={loading}
                  >
                    Remove Image
                  </button>
                </div>
              )}

              {/* File Input */}
              {!imagePreview && (
                <div className="file-input-wrapper">
                  <input
                    id="image"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                    className="file-input"
                  />
                  <label htmlFor="image" className="file-input-label">
                    <span className="upload-icon">📸</span>
                    <span className="upload-text">
                      Click to upload image or drag and drop
                    </span>
                    <span className="upload-hint">
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </label>
                </div>
              )}

              {errors.image && (
                <span className="field-error">{errors.image}</span>
              )}
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
                disabled={loading}
              >
                {loading ? 'Creating Event...' : 'Create Event'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg btn-block"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ProtectedCreateEventPage = () => (
  <ProtectedRoute>
    <CreateEventPage />
  </ProtectedRoute>
);

export default ProtectedCreateEventPage;