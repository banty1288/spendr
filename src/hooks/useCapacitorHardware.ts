import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router';

export function useCapacitorHardware() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle hardware back button
    const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
      // If we are on the home screen, exit the app
      if (location.pathname === '/home' || location.pathname === '/login' || location.pathname === '/') {
        App.exitApp();
      } else if (canGoBack) {
        // Otherwise, navigate back in the React Router history
        navigate(-1);
      } else {
        // Fallback: just exit
        App.exitApp();
      }
    });

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [navigate, location]);
}
