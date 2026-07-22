import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT:
//   • Emulator  → uses Android bridge IP (10.0.2.2 maps to the host machine)
//   • Real device → must use your Mac's LAN IP so the phone can reach the server
//     Run `ipconfig getifaddr en0` to get the correct IP and set it below.
// ─────────────────────────────────────────────────────────────────────────────

// Set this to 'true' when testing on a real physical device.
const USE_REAL_DEVICE = true;

const REAL_DEVICE_IP = '192.168.6.250'; // Your Mac's LAN IP
const BACKEND_PORT = 3000;

const getBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    if (USE_REAL_DEVICE) {
      return `http://${REAL_DEVICE_IP}:${BACKEND_PORT}`;
    }
    // Android emulator bridge IP — maps to host localhost
    return `http://10.0.2.2:${BACKEND_PORT}`;
  }

  if (Platform.OS === 'ios') {
    // iOS simulator shares host network; physical device needs LAN IP
    if (USE_REAL_DEVICE) {
      return `http://${REAL_DEVICE_IP}:${BACKEND_PORT}`;
    }
    return `http://localhost:${BACKEND_PORT}`;
  }

  return `http://localhost:${BACKEND_PORT}`;
};

export const API_URL = getBaseUrl();

