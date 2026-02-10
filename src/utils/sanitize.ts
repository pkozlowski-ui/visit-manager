/**
 * Input Sanitization Utilities
 * 
 * Provides defense-in-depth sanitization for user input.
 * While React automatically escapes text content, this layer provides:
 * - Protection against future code changes
 * - Data integrity (length limits, character filtering)
 * - Consistent validation across the application
 */

export interface SanitizeOptions {
    maxLength?: number;
    allowedChars?: RegExp;
    trim?: boolean;
}

/**
 * Sanitize general text input
 * Removes potentially dangerous characters and enforces length limits
 */
export const sanitizeInput = (
    input: string,
    options: SanitizeOptions = {}
): string => {
    const {
        maxLength = 100,
        allowedChars = /[^<>]/g, // Remove < and > by default
        trim = true,
    } = options;

    let sanitized = input;

    // Trim whitespace
    if (trim) {
        sanitized = sanitized.trim();
    }

    // Enforce length limit
    sanitized = sanitized.slice(0, maxLength);

    // Filter allowed characters
    sanitized = sanitized.match(allowedChars)?.join('') || '';

    return sanitized;
};

/**
 * Sanitize name input (person, service, etc.)
 * Allows letters, spaces, hyphens, apostrophes
 */
export const sanitizeName = (name: string): string => {
    return sanitizeInput(name, {
        maxLength: 100,
        allowedChars: /[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s'-]/g, // Letters, spaces, hyphens, apostrophes
        trim: true,
    });
};

/**
 * Sanitize phone number
 * Allows digits, spaces, hyphens, plus, parentheses
 */
export const sanitizePhone = (phone: string): string => {
    return sanitizeInput(phone, {
        maxLength: 20,
        allowedChars: /[0-9\s+()-]/g,
        trim: true,
    });
};

/**
 * Sanitize email address
 * Basic sanitization - full validation should be done separately
 */
export const sanitizeEmail = (email: string): string => {
    return sanitizeInput(email, {
        maxLength: 254, // RFC 5321
        allowedChars: /[a-zA-Z0-9@._-]/g,
        trim: true,
    }).toLowerCase();
};

/**
 * Sanitize general text/notes
 * More permissive but still removes dangerous characters
 */
export const sanitizeText = (text: string, maxLength = 500): string => {
    return sanitizeInput(text, {
        maxLength,
        allowedChars: /[^<>]/g, // Remove only < and >
        trim: true,
    });
};

/**
 * Sanitize color hex value
 * Ensures valid hex color format
 */
export const sanitizeColor = (color: string): string => {
    const sanitized = color.trim();

    // Must start with # and be followed by 3 or 6 hex digits
    if (/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/.test(sanitized)) {
        return sanitized;
    }

    // Default fallback color
    return '#6C5DD3';
};

/**
 * Sanitize date string
 * Ensures ISO date format (YYYY-MM-DD)
 */
export const sanitizeDate = (date: string): string => {
    const sanitized = date.trim();

    // Must match ISO date format
    if (/^\d{4}-\d{2}-\d{2}$/.test(sanitized)) {
        return sanitized;
    }

    return '';
};
