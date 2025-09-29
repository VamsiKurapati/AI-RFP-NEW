/**
 * Input sanitization utilities for XSS prevention
 */

/**
 * Sanitizes HTML content by removing potentially dangerous tags and attributes
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string safe for display
 */
export const sanitizeHtml = (input) => {
    if (typeof input !== 'string') {
        return '';
    }

    // Remove HTML tags and decode HTML entities
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
        .replace(/<link\b[^<]*>/gi, '') // Remove link tags
        .replace(/<meta\b[^<]*>/gi, '') // Remove meta tags
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/vbscript:/gi, '') // Remove vbscript: protocols
        .replace(/data:/gi, '') // Remove data: protocols
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .trim();
};

/**
 * Sanitizes text input by removing potentially dangerous characters
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string safe for display
 */
export const sanitizeText = (input) => {
    if (typeof input !== 'string') {
        return '';
    }

    return input
        .replace(/[<>]/g, '') // Remove < and > characters
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/vbscript:/gi, '') // Remove vbscript: protocols
        .replace(/data:/gi, '') // Remove data: protocols
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
};

/**
 * Sanitizes URL input
 * @param {string} url - The URL to sanitize
 * @returns {string} - Sanitized URL safe for use
 */
export const sanitizeUrl = (url) => {
    if (typeof url !== 'string') {
        return '';
    }

    const trimmedUrl = url.trim();

    // Only allow http, https, and relative URLs
    if (trimmedUrl.match(/^(https?:\/\/|\/)/)) {
        return trimmedUrl;
    }

    // If no protocol, assume https
    return `https://${trimmedUrl}`;
};

/**
 * Sanitizes email input
 * @param {string} email - The email to sanitize
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
    if (typeof email !== 'string') {
        return '';
    }

    return email
        .toLowerCase()
        .replace(/[^a-z0-9@._-]/g, '') // Remove invalid characters
        .trim();
};

/**
 * Sanitizes phone number input
 * @param {string} phone - The phone number to sanitize
 * @returns {string} - Sanitized phone number
 */
export const sanitizePhone = (phone) => {
    if (typeof phone !== 'string') {
        return '';
    }

    return phone
        .replace(/[^0-9+\-().\s]/g, '') // Keep only valid phone characters
        .trim();
};

/**
 * Sanitizes form data object
 * @param {Object} formData - The form data object to sanitize
 * @returns {Object} - Sanitized form data object
 */
export const sanitizeFormData = (formData) => {
    if (typeof formData !== 'object' || formData === null) {
        return {};
    }

    const sanitized = {};

    for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'string') {
            // Apply different sanitization based on field type
            if (key.toLowerCase().includes('email')) {
                sanitized[key] = sanitizeEmail(value);
            } else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('mobile')) {
                sanitized[key] = sanitizePhone(value);
            } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('website') || key.toLowerCase().includes('linkedin')) {
                sanitized[key] = sanitizeUrl(value);
            } else {
                sanitized[key] = sanitizeText(value);
            }
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

/**
 * Escapes HTML entities for safe display
 * @param {string} text - The text to escape
 * @returns {string} - Escaped text safe for HTML display
 */
export const escapeHtml = (text) => {
    if (typeof text !== 'string') {
        return '';
    }

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };

    return text.replace(/[&<>"'/]/g, (char) => map[char]);
};
