import React from 'react';
import { X } from '@phosphor-icons/react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className={`bg-white rounded-2xl w-full ${maxWidth} shadow-xl overflow-hidden`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
          <h3 className="font-display font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white border shadow-sm text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all">
            <X weight="bold" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
