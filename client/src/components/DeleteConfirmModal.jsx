import React from 'react';

const DeleteConfirmModal = ({ 
  show, 
  title, 
  onConfirm, 
  onCancel, 
  loading 
}) => {
  if (!show) return null;
  
  return (
    <div className="modal-overlay" onClick={() => { if (!loading) onCancel(); }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>⚠️ Delete Event?</h3>
        <p>
          Are you sure you want to delete <strong>"{title}"</strong>?
        </p>
        <p className="modal-warning">
          This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onCancel} 
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-danger" 
            onClick={onConfirm} 
            disabled={loading}
          >
            {loading ? "Deleting..." : "Yes, Delete Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
