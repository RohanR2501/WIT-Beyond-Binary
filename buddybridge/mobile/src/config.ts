import Constants from 'expo-constants';

// Access the backend API base URL from app.json's extra field
export const API_BASE = Constants.manifest.extra.API_BASE;
export const WS_BASE = API_BASE.replace("http", "ws"); // WebSocket URL
