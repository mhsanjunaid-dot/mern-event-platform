export const getErrorMessage = (error) => {
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }

  const { status, data } = error.response;

  if (data?.message) {
    return data.message;
  }

  switch (status) {
    case 400:
      return 'Bad request. Please check your input.';
    case 401:
      return 'Unauthorized. Please login again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Conflict. Resource already exists.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
};

/**
 * Check if error is due to authentication
 * @param {Error} error - Axios error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error.response?.status === 401 || error.response?.status === 403;
};

/**
 * Check if error is due to validation
 * @param {Error} error - Axios error object
 * @returns {boolean}
 */
export const isValidationError = (error) => {
  return error.response?.status === 400;
};

/**
 * Format validation errors from backend
 * @param {Error} error - Axios error object
 * @returns {Object} Key-value pairs of field errors
 */
export const getValidationErrors = (error) => {
  if (error.response?.status === 400 && error.response?.data?.errors) {
    return error.response.data.errors;
  }
  return {};
};