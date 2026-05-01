import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getThemeStyles } = useTheme();
  const themeStyles = getThemeStyles();

  const token = searchParams.get('token');
  const provider = searchParams.get('provider');
  const error = searchParams.get('error');

  const [status, setStatus] = useState('processing'); // processing, success, error

  useEffect(() => {
    if (error) {
      setStatus('error');
      toast.error(`${provider} authentication failed`);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!token) {
      setStatus('error');
      toast.error('No authentication token received');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // Save token to localStorage
    try {
      // Decode JWT to get user info (without verification for client-side)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const userData = JSON.parse(jsonPayload);

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('authProvider', provider);

      setStatus('success');
      toast.success(`Successfully logged in with ${provider}!`);

      // Redirect to contact page or admin dashboard
      setTimeout(() => {
        if (userData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/contact');
        }
      }, 1500);
    } catch (err) {
      console.error('Token parsing error:', err);
      setStatus('error');
      toast.error('Failed to process authentication');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [token, provider, error, navigate]);

  const getProviderIcon = () => {
    switch (provider) {
      case 'google':
        return <FaGoogle className="w-12 h-12 text-[#DB4437]" />;
      case 'github':
        return <FaGithub className="w-12 h-12 text-white" />;
      default:
        return <FaGoogle className="w-12 h-12 text-gray-600" />;
    }
  };

  const getProviderName = () => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      default:
        return 'OAuth';
    }
  };

  return (
    <div className={`min-h-screen ${themeStyles.bg} flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${themeStyles.card} rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20 dark:border-gray-700/50`}
      >
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Loader className="w-10 h-10 text-purple-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Authenticating with {getProviderName()}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your credentials...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Authentication Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You're now logged in with {getProviderName()}.
              </p>
              <div className="flex items-center justify-center gap-3">
                {getProviderIcon()}
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {provider}
                </span>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
              >
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Authentication Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                There was a problem with your {getProviderName()} authentication.
                Redirecting to login...
              </p>
            </>
          )}
        </div>

        {/* Progress bar for processing */}
        {status === 'processing' && (
          <div className="mt-8 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;
