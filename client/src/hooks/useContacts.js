import { useState } from 'react';
import api from '../api';

export const useContact = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/contact', formData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error sending message';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendMessage,
    loading,
    error
  };
};