import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
import authReducer from './authReducer';

// Create context
export const AuthContext = createContext();

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null,
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = useCallback(async () => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }

    try {
      const res = await axios.get('/api/users/me');

      dispatch({
        type: 'USER_LOADED',
        payload: res.data.data,
      });
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
      });
    }
  }, [dispatch]);

  // Register user
  const register = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const res = await axios.post('/api/users/register', formData, config);

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data,
      });

      loadUser();
    } catch (err) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response.data.error,
      });
    }
  };

  // Login user
  const login = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const res = await axios.post('/api/users/login', formData, config);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data,
      });

      loadUser();
    } catch (err) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response.data.error,
      });
    }
  };

  // Logout
  const logout = () => {
    dispatch({
      type: 'LOGOUT',
    });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({
      type: 'CLEAR_ERRORS',
    });
  };

  // Save career
  const saveCareer = async (careerId) => {
    try {
      const res = await axios.put(`/api/users/savecareer/${careerId}`);

      dispatch({
        type: 'UPDATE_USER',
        payload: { savedCareers: res.data.data },
      });

      return true;
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response.data.error,
      });
      return false;
    }
  };

  // Remove saved career
  const removeCareer = async (careerId) => {
    try {
      const res = await axios.put(`/api/users/removecareer/${careerId}`);

      dispatch({
        type: 'UPDATE_USER',
        payload: { savedCareers: res.data.data },
      });

      return true;
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response.data.error,
      });
      return false;
    }
  };

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Effect to load user on mount
  useEffect(() => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
      loadUser();
    }
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        loadUser,
        clearErrors,
        saveCareer,
        removeCareer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};