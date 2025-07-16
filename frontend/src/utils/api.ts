export const getApiBaseUrl = () => {
  // Check if we are on the server-side (Node.js environment)
  if (typeof window === 'undefined') {
    // Use the internal Docker network URL for server-side requests
    return process.env.API_INTERNAL_URL;
  }
  // Use the public URL for client-side (browser) requests
return process.env.NEXT_PUBLIC_API_BASE_URL;
};

export const API_BASE_URL = getApiBaseUrl();