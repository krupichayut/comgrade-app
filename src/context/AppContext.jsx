import React, { createContext, useState, useEffect } from 'react';
import { supabase, localDb } from '../services/supabase';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [db, setDb] = useState(localDb);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      if (supabase) {
        try {
          const { data, error } = await supabase.from('computer_attendance').select('id').limit(1);
          if (!error) {
            setIsConnected(true);
            // In a real scenario, fetch all needed data from Supabase here
            // For now, we rely on localDb as mock
          }
        } catch (err) {
          console.error("Supabase connection failed:", err);
        }
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  const value = {
    db,
    setDb,
    isConnected,
    isLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
