import React from 'react';
import '../styles/delete-modal.css';

/**
 * DeleteConfirmModal - Reusable confirmation modal for delete operations
 * @param {boolean} show - Controls modal visibility
 * @param {string} title - Event title to display in confirmation
 * @param {function} onConfirm - Callback when user confirms deletion
 * @param {function} onCancel - Callback when user cancels
 * @param {boolean} loading - Shows loading state during API call
 */
const DeleteConfirmModal = ({ show, title, onConfirm, onCancel, loading }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚠️ Delete Event</h2>
        </div>
        
        <div className="modal-body">
          <p>Are you sure you want to delete:</p>
          <p className="event-title-confirm">"{title}"</p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        
        <div className="modal-actions">
          <button
            className="btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn-confirm-delete"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
