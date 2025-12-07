// API Base URL Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Helper function to build full API URLs
export const buildApiUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Remove /api prefix if present in path (to avoid duplication)
  const finalPath = cleanPath.startsWith('api/') ? cleanPath.slice(4) : cleanPath;
  
  return `${API_BASE_URL}/${finalPath}`;
};

export default { API_BASE_URL, buildApiUrl };
