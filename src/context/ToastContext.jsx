import React, { createContext, useState, useContext, useCallback } from 'react';
import { CheckCircle, Warning, Info } from '@phosphor-icons/react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none" id="toastContainer">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold text-white pointer-events-auto animate-in slide-in-from-right-10 duration-200 ${
            toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' :
            toast.type === 'error' ? 'bg-rose-600 border-rose-500' :
            'bg-indigo-600 border-indigo-500'
          }`}>
            {toast.type === 'success' && <CheckCircle weight="bold" className="text-lg" />}
            {toast.type === 'error' && <Warning weight="bold" className="text-lg" />}
            {toast.type === 'info' && <Info weight="bold" className="text-lg" />}
            <span>{toast.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
