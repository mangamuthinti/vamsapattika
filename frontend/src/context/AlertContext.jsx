import React, { createContext, useContext, useState, useEffect } from 'react';
import CustomAlert from '../components/CustomAlert';

const AlertContext = createContext();

// Global alert function accessible from anywhere
let globalShowAlert = null;

export const showGlobalAlert = (message) => {
  if (globalShowAlert) {
    globalShowAlert(message);
  } else {
    // Fallback to native alert if context not ready
    alert(message);
  }
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({ isOpen: false, message: '' });

  const showAlert = (message) => {
    setAlertState({ isOpen: true, message });
  };

  const hideAlert = () => {
    setAlertState({ isOpen: false, message: '' });
  };

  // Set global alert function
  useEffect(() => {
    globalShowAlert = showAlert;
    return () => {
      globalShowAlert = null;
    };
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={hideAlert}
      />
      {children}
    </AlertContext.Provider>
  );
};
