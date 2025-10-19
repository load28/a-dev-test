/**
 * Security Middleware
 *
 * 보안 헤더 및 정책을 설정하는 미들웨어
 * - CSP (Content Security Policy)
 * - HSTS (HTTP Strict Transport Security)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - CORS (Cross-Origin Resource Sharing)
 * - Cookie Security
 */

export interface SecurityConfig {
  csp?: {
    directives?: {
      'default-src'?: string[];
      'script-src'?: string[];
      'style-src'?: string[];
      'img-src'?: string[];
      'connect-src'?: string[];
      'font-src'?: string[];
      'object-src'?: string[];
      'media-src'?: string[];
      'frame-src'?: string[];
      'base-uri'?: string[];
      'form-action'?: string[];
      'frame-ancestors'?: string[];
      'upgrade-insecure-requests'?: boolean;
      'block-all-mixed-content'?: boolean;
    };
    reportOnly?: boolean;
  };
  hsts?: {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  frameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  contentTypeOptions?: boolean;
  cors?: {
    origin?: string | string[] | ((origin: string) => boolean);
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
  };
  cookies?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    domain?: string;
    path?: string;
    maxAge?: number;
  };
}

/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"],
      'font-src': ["'self'", 'data:'],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'frame-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': true,
      'block-all-mixed-content': true,
    },
    reportOnly: false,
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameOptions: 'DENY',
  contentTypeOptions: true,
  cors: {
    origin: (origin: string) => {
      // Development: allow localhost
      if (process.env.NODE_ENV === 'development') {
        return origin.includes('localhost') || origin.includes('127.0.0.1');
      }
      // Production: whitelist specific origins
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      return allowedOrigins.includes(origin);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    credentials: true,
    maxAge: 86400, // 24 hours
  },
  cookies: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: 86400, // 24 hours
  },
};

/**
 * Build CSP header value from directives
 */
function buildCSPHeader(directives: SecurityConfig['csp']['directives']): string {
  if (!directives) return '';

  const cspParts: string[] = [];

  Object.entries(directives).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
      if (value) {
        cspParts.push(key);
      }
    } else if (Array.isArray(value)) {
      cspParts.push(`${key} ${value.join(' ')}`);
    }
  });

  return cspParts.join('; ');
}

/**
 * Build HSTS header value
 */
function buildHSTSHeader(hsts: SecurityConfig['hsts']): string {
  if (!hsts) return '';

  const parts: string[] = [`max-age=${hsts.maxAge || 31536000}`];

  if (hsts.includeSubDomains) {
    parts.push('includeSubDomains');
  }

  if (hsts.preload) {
    parts.push('preload');
  }

  return parts.join('; ');
}

/**
 * Check if origin is allowed based on CORS config
 */
function isOriginAllowed(origin: string, config: SecurityConfig['cors']): boolean {
  if (!config?.origin) return false;

  if (typeof config.origin === 'string') {
    return config.origin === '*' || config.origin === origin;
  }

  if (Array.isArray(config.origin)) {
    return config.origin.includes(origin);
  }

  if (typeof config.origin === 'function') {
    return config.origin(origin);
  }

  return false;
}

/**
 * Apply security headers to Response
 *
 * Note: This is a utility function for server-side implementations.
 * For Vite dev server, use the Vite plugin configuration.
 */
export function applySecurityHeaders(
  headers: Headers,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG
): Headers {
  const newHeaders = new Headers(headers);

  // CSP
  if (config.csp?.directives) {
    const cspHeader = buildCSPHeader(config.csp.directives);
    if (cspHeader) {
      const headerName = config.csp.reportOnly
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy';
      newHeaders.set(headerName, cspHeader);
    }
  }

  // HSTS
  if (config.hsts) {
    const hstsHeader = buildHSTSHeader(config.hsts);
    if (hstsHeader) {
      newHeaders.set('Strict-Transport-Security', hstsHeader);
    }
  }

  // X-Frame-Options
  if (config.frameOptions) {
    newHeaders.set('X-Frame-Options', config.frameOptions);
  }

  // X-Content-Type-Options
  if (config.contentTypeOptions) {
    newHeaders.set('X-Content-Type-Options', 'nosniff');
  }

  // Additional security headers
  newHeaders.set('X-XSS-Protection', '1; mode=block');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  return newHeaders;
}

/**
 * Apply CORS headers to Response
 */
export function applyCORSHeaders(
  headers: Headers,
  origin: string,
  method: string,
  config: SecurityConfig['cors'] = DEFAULT_SECURITY_CONFIG.cors
): Headers {
  const newHeaders = new Headers(headers);

  if (!config) return newHeaders;

  // Check if origin is allowed
  if (isOriginAllowed(origin, config)) {
    newHeaders.set('Access-Control-Allow-Origin', origin);

    if (config.credentials) {
      newHeaders.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  // Handle preflight requests
  if (method === 'OPTIONS') {
    if (config.methods) {
      newHeaders.set('Access-Control-Allow-Methods', config.methods.join(', '));
    }

    if (config.allowedHeaders) {
      newHeaders.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
    }

    if (config.maxAge) {
      newHeaders.set('Access-Control-Max-Age', config.maxAge.toString());
    }
  }

  // Expose headers
  if (config.exposedHeaders) {
    newHeaders.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
  }

  return newHeaders;
}

/**
 * Format cookie with security options
 */
export function formatSecureCookie(
  name: string,
  value: string,
  options: SecurityConfig['cookies'] = DEFAULT_SECURITY_CONFIG.cookies
): string {
  const parts: string[] = [`${name}=${value}`];

  if (options?.httpOnly) {
    parts.push('HttpOnly');
  }

  if (options?.secure) {
    parts.push('Secure');
  }

  if (options?.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (options?.domain) {
    parts.push(`Domain=${options.domain}`);
  }

  if (options?.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options?.maxAge) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  return parts.join('; ');
}

/**
 * Vite Plugin for development server security headers
 */
export function viteSecurityPlugin(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
  return {
    name: 'vite-security-headers',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        // Apply security headers
        const headers = applySecurityHeaders(new Headers(), config);
        headers.forEach((value, key) => {
          res.setHeader(key, value);
        });

        // Apply CORS headers
        const origin = req.headers.origin || '';
        const method = req.method || 'GET';
        const corsHeaders = applyCORSHeaders(new Headers(), origin, method, config.cors);
        corsHeaders.forEach((value, key) => {
          res.setHeader(key, value);
        });

        // Handle preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        next();
      });
    },
  };
}

/**
 * Express/Connect middleware for security headers
 */
export function securityMiddleware(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
  return (req: any, res: any, next: any) => {
    // Apply security headers
    const headers = applySecurityHeaders(new Headers(), config);
    headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Apply CORS headers
    const origin = req.headers.origin || '';
    const method = req.method || 'GET';
    const corsHeaders = applyCORSHeaders(new Headers(), origin, method, config.cors);
    corsHeaders.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}

export default {
  applySecurityHeaders,
  applyCORSHeaders,
  formatSecureCookie,
  viteSecurityPlugin,
  securityMiddleware,
  DEFAULT_SECURITY_CONFIG,
};
