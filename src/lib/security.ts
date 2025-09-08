// Security utilities for input validation and sanitization

// Allowed domains for poster URLs (security hardening)
const ALLOWED_POSTER_DOMAINS = [
  'images.unsplash.com',
  'cdn.pixabay.com',
  'images.pexels.com',
  'www.themoviedb.org',
  'image.tmdb.org',
  'ia.media-imdb.com',
  'm.media-amazon.com',
  'upload.wikimedia.org',
  // Add more trusted domains as needed
];

// HTML sanitization function
export const sanitizeText = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Validate poster URL against allowed domains
export const validatePosterUrl = (url: string): boolean => {
  if (!url) return true; // Allow empty URLs
  
  try {
    const urlObj = new URL(url);
    return ALLOWED_POSTER_DOMAINS.includes(urlObj.hostname.toLowerCase());
  } catch {
    return false;
  }
};

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};

// Clean up old rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 300000); // Clean up every 5 minutes