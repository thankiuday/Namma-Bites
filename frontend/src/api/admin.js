import axios from './config';

// Admin Login
export const adminLogin = async (credentials) => {
  try {
    const response = await axios.post('/admin/login', credentials);
    return response;
  } catch (error) {
    throw error;
  }
};

// Admin Register
export const adminRegister = async (adminData) => {
  try {
    const response = await axios.post('/admin/register/first', adminData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get Admin Profile
export const getAdminProfile = async () => {
  try {
    const response = await axios.get('/admin/profile');
    return response;
  } catch (error) {
    throw error;
  }
};

// Update Admin Profile
export const updateAdminProfile = async (profileData) => {
  try {
    const response = await axios.put('/admin/profile', profileData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Change Admin Password
export const changeAdminPassword = async (passwordData) => {
  try {
    const response = await axios.put('/admin/change-password', passwordData);
    return response;
  } catch (error) {
    throw error;
  }
}; 