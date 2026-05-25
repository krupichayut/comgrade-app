import React, { createContext, useState, useEffect } from 'react';
import { supabase, localDb, supabaseAppId } from '../services/supabase';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [db, setDb] = useState(localDb);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Supabase on mount
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('computer_attendance')
            .select('data')
            .eq('id', supabaseAppId)
            .single();
            
          if (error) {
            console.error("Supabase fetch error:", error);
            // Fallback to local storage backup if available
            const localBackup = localStorage.getItem('computer_att_db');
            if (localBackup) setDb(JSON.parse(localBackup));
          } else if (data && data.data) {
            setIsConnected(true);
            setDb(data.data);
            localStorage.setItem('computer_att_db', JSON.stringify(data.data));
          }
        } catch (err) {
          console.error("Supabase connection failed:", err);
          const localBackup = localStorage.getItem('computer_att_db');
          if (localBackup) setDb(JSON.parse(localBackup));
        }
      } else {
        const localBackup = localStorage.getItem('computer_att_db');
        if (localBackup) setDb(JSON.parse(localBackup));
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  // Sync to Cloud function
  const pushToCloud = async (newDb) => {
    setDb(newDb);
    localStorage.setItem('computer_att_db', JSON.stringify(newDb));
    
    if (isConnected && supabase) {
      try {
        await supabase
          .from('computer_attendance')
          .upsert({ 
            id: supabaseAppId, 
            data: newDb, 
            updated_at: new Date().toISOString() 
          });
      } catch (error) {
        console.error("Push to Cloud Fail:", error);
      }
    }
  };

  const value = {
    db,
    setDb: pushToCloud,
    isConnected,
    isLoading,
    pushToCloud
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
