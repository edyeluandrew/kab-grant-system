// Validation utility functions for form fields

/**
 * Count words in a text string
 * @param {string} text - The text to count words for
 * @returns {number} - Number of words
 */
export const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

/**
 * Validate required field
 * @param {*} value - The field value
 * @returns {string} - Error message or empty string if valid
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return '';
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {string} - Error message or empty string if valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
};

/**
 * Validate KAB email (@kab.ac.ug domain)
 * @param {string} email - The email to validate
 * @returns {string} - Error message or empty string if valid
 */
export const validateKABEmail = (email) => {
  const emailError = validateEmail(email);
  if (emailError) return emailError;

  if (!email.endsWith('@kab.ac.ug')) {
    return 'Please use a valid KAB email address ending with @kab.ac.ug';
  }
  return '';
};

/**
 * Validate phone number format
 * Allows: +256XXXXXXXXX, 07XXXXXXXX, 0755 123 456, etc.
 * @param {string} phone - The phone number to validate
 * @returns {string} - Error message or empty string if valid
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return 'Phone number is required';
  }

  // Remove spaces and hyphens for validation
  const cleanPhone = phone.replace(/[\s-]/g, '');

  // Check if contains only digits and + (at start)
  const phoneRegex = /^(\+)?[0-9]{9,}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return 'Please enter a valid phone number (e.g., +256712345678 or 07XXXXXXXX)';
  }

  return '';
};

/**
 * Validate budget as numeric
 * Accepts: 5000000, 5,000,000, 1000000.50
 * @param {*} budget - The budget value
 * @returns {string} - Error message or empty string if valid
 */
export const validateBudget = (budget) => {
  if (!budget || budget.toString().trim() === '') {
    return 'Total budget is required';
  }

  // Remove commas and check if it's a valid number
  const cleanBudget = budget.toString().replace(/,/g, '');
  if (isNaN(cleanBudget) || parseFloat(cleanBudget) <= 0) {
    return 'Total budget must be a valid number';
  }

  return '';
};

/**
 * Validate word count
 * @param {string} text - The text to validate
 * @param {number} maxWords - Maximum allowed words
 * @param {string} fieldName - Field name for error message
 * @returns {string} - Error message or empty string if valid
 */
export const validateWordCount = (text, maxWords, fieldName = 'This field') => {
  const words = countWords(text);
  if (words > maxWords) {
    return `${fieldName} exceeds maximum word limit of ${maxWords} words (current: ${words})`;
  }
  return '';
};

/**
 * Validate compliance checkbox
 * @param {boolean} checked - Whether checkbox is checked
 * @returns {string} - Error message or empty string if valid
 */
export const validateCompliance = (checked) => {
  if (!checked) {
    return 'You must confirm compliance before continuing';
  }
  return '';
};

/**
 * Validate "Other/Others" specification field
 * If "Other" or "Others" is selected, specification must be provided
 * @param {string} value - The dropdown value
 * @param {string} specification - The specification text
 * @returns {string} - Error message or empty string if valid
 */
export const validateOtherSpecification = (value, specification) => {
  if ((value === 'Other' || value === 'Others') && (!specification || specification.trim() === '')) {
    return 'Please specify what you mean by Other/Others';
  }
  return '';
};

/**
 * Combined validation for a proposal section
 * @param {object} formData - The form data object
 * @param {object} validationRules - Rules object with field names and their validation functions
 * @returns {object} - Errors object with field: errorMessage pairs
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach((field) => {
    const rules = validationRules[field];
    const value = formData[field];

    // Array of validators to apply
    const validators = Array.isArray(rules) ? rules : [rules];

    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });

  return errors;
};

/**
 * Parse numeric budget by removing commas
 * @param {*} budget - Budget value with possible commas
 * @returns {number} - Parsed numeric value
 */
export const parseBudget = (budget) => {
  if (!budget) return 0;
  return parseFloat(budget.toString().replace(/,/g, ''));
};

/**
 * Format budget with commas
 * @param {number} budget - Numeric budget
 * @returns {string} - Formatted budget string
 */
export const formatBudget = (budget) => {
  if (!budget) return '';
  return budget.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Check if option is "Other" or "Others"
 * @param {string} value - The option value
 * @returns {boolean} - True if value is Other or Others
 */
export const isOtherOption = (value) => {
  return value === 'Other' || value === 'Others';
};

/**
 * Get field names that need "Other" specification in a form
 * Returns an array of field names that have "Other/Others" option
 * @returns {array} - Array of field names that need specification
 */
export const getOtherSpecificationFields = () => {
  return [
    'piQualifications',
    'piDesignation',
    'researchType',
    'specialization',
    'qualifications', // For team members
    'designation', // For team members
  ];
};

/**
 * Generate specification field name from original field name
 * e.g., "piQualifications" -> "piQualificationsOther"
 * @param {string} fieldName - The original field name
 * @returns {string} - The specification field name
 */
export const getSpecificationFieldName = (fieldName) => {
  return `${fieldName}Other`;
};
