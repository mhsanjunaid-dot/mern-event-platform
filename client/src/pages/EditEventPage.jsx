import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { useAuth } from '../hooks/useAuth';
import '../styles/event-form.css';

const EditEventPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    location: '',
    capacity: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const fetchEvent = async () => {
      if (!user) {
        setAuthError('You must be logged in to edit events.');
        setPageLoading(false);
        return;
      }

      try {
        const response = await eventService.getEventById(id);
        const eventData = response.event || response;
        
        if (eventData.createdBy._id !== user.id) {
          setAuthError('You are not authorized to edit this event. Only the event creator can edit it.');
          setPageLoading(false);
          return;
        }

        const eventDateTime = new Date(eventData.dateTime);
        const formattedDateTime = eventDateTime.toISOString().slice(0, 16);

        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          dateTime: formattedDateTime,
          location: eventData.location || '',
          capacity: eventData.capacity.toString()
        });

        if (eventData.image) {
          setCurrentImage(eventData.image);
        }

        setPageLoading(false);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to load event. Please try again.';
        setApiError(errorMessage);
        setPageLoading(false);
      }
    };

    if (user && id) {
      fetchEvent();
    }
  }, [id, user, authLoading]);

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

  const handleRemoveNewImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleRemoveCurrentImage = () => {
    setCurrentImage(null);
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
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (!formData.dateTime) {
      newErrors.dateTime = 'Event date and time are required';
    } else {
      const selectedDateTime = new Date(formData.dateTime);
      if (selectedDateTime < new Date()) {
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
    } else if (isNaN(formData.capacity) || parseInt(formData.capacity, 10) < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    } else if (parseInt(formData.capacity, 10) > 10000) {
      newErrors.capacity = 'Capacity cannot exceed 10,000';
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
        submitData.append('image', imageFile);
      }

      await eventService.updateEvent(id, submitData);

      setSuccessMessage('Event updated successfully! Redirecting...');

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update event. Please try again.';
      setApiError(errorMessage);
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  if (authError) {
    return (
      <div className="event-form-container">
        <div className="container">
          <div className="form-wrapper">
            <div className="form-header">
              <h1>Edit Event</h1>
            </div>
            <div className="alert alert-error">
              {authError}
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="event-form-container">
        <div className="container">
          <div className="form-wrapper">
            <div className="form-header">
              <h1>Edit Event</h1>
            </div>
            <div className="loading-spinner">
              <p>Loading event details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-form-container">
      <div className="container">
        <div className="form-wrapper">
          <div className="form-header">
            <h1>Edit Event</h1>
            <p>Update event details</p>
          </div>

          {apiError && <div className="alert alert-error">{apiError}</div>}
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="title">
                Event Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                disabled={loading}
                className={errors.title ? 'input-error' : ''}
              />
              {errors.title && (
                <span className="error-text">{errors.title}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter event description"
                rows="4"
                disabled={loading}
                className={errors.description ? 'input-error' : ''}
              />
              {errors.description && (
                <span className="error-text">{errors.description}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="dateTime">
                Date & Time <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleInputChange}
                min={getMinDateTime()}
                disabled={loading}
                className={errors.dateTime ? 'input-error' : ''}
              />
              {errors.dateTime && (
                <span className="error-text">{errors.dateTime}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="location">
                Location <span className="required">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter event location"
                disabled={loading}
                className={errors.location ? 'input-error' : ''}
              />
              {errors.location && (
                <span className="error-text">{errors.location}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="capacity">
                Capacity <span className="required">*</span>
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Enter event capacity"
                min="1"
                max="10000"
                disabled={loading}
                className={errors.capacity ? 'input-error' : ''}
              />
              {errors.capacity && (
                <span className="error-text">{errors.capacity}</span>
              )}
            </div>

            <div className="form-group">
              <label>Event Image</label>

              {currentImage && !imagePreview && (
                <div className="image-preview-section">
                  <div className="image-preview">
                    <img
                      src={
                        currentImage.startsWith('http')
                          ? currentImage
                          : `http://localhost:5001${currentImage}`
                      }
                      alt="Current event"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleRemoveCurrentImage}
                    disabled={loading}
                  >
                    Remove Current Image
                  </button>
                </div>
              )}

              {imagePreview && (
                <div className="image-preview-section">
                  <div className="image-preview">
                    <img src={imagePreview} alt="New preview" />
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleRemoveNewImage}
                    disabled={loading}
                  >
                    Remove New Image
                  </button>
                </div>
              )}

              {!imagePreview && (
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                  <label htmlFor="image" className="file-input-label">
                    Choose a new image (or keep current)
                  </label>
                  <p className="file-input-hint">
                    Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                  </p>
                </div>
              )}

              {errors.image && (
                <span className="error-text">{errors.image}</span>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Event'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-block"
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

export default EditEventPage;
