// Security utilities for input validation and sanitization

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Basic text sanitization to prevent XSS attacks
 */
export function sanitizeText(input: string): string {
  if (!input) return input;
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove potentially dangerous HTML tags
  sanitized = sanitized.replace(/<(iframe|embed|object|applet|link|meta|style)[^>]*>/gi, '');
  
  // Remove javascript: and data: protocols
  sanitized = sanitized.replace(/(?:javascript|data):/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Trim and normalize whitespace
  sanitized = sanitized.trim().replace(/\s+/g, ' ');
  
  return sanitized;
}

/**
 * Validate poster URL against allowed domains
 */
export function validatePosterUrl(url: string): boolean {
  if (!url) return true; // Empty URLs are allowed
  
  try {
    const urlObj = new URL(url);
    
    // List of allowed domains for poster images
    const allowedDomains = [
      'images.unsplash.com',
      'unsplash.com',
      'cdn.jsdelivr.net',
      'i.imgur.com',
      'imgur.com',
      'example.com', // Replace with your actual domains
      // Add more trusted domains as needed
    ];
    
    // Check if the domain is in the allowed list
    const hostname = urlObj.hostname.toLowerCase();
    return allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false; // Invalid URL
  }
}

/**
 * Simple rate limiting implementation
 */
export function checkRateLimit(
  key: string, 
  maxRequests: number, 
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  return true;
}

/**
 * Clean up expired rate limit entries periodically
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (basic)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}