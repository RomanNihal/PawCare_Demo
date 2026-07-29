/* VetCare Pro - Simple Authentication Helper */
import { Toast } from '../utils.js';

const AUTH_KEY = 'vet_admin_logged_in';

export const auth = {
  isLoggedIn() {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  },

  login(username, password) {
    if (username === 'admin' && password === 'admin123') {
      sessionStorage.setItem(AUTH_KEY, 'true');
      Toast.show('Successfully logged in!', 'success');
      return true;
    } else {
      Toast.show('Invalid username or password.', 'error');
      return false;
    }
  },

  logout() {
    sessionStorage.removeItem(AUTH_KEY);
    Toast.show('Logged out successfully.', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
};
