import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Gear, Database, CloudArrowUp, WarningCircle, FloppyDisk } from '@phosphor-icons/react';
import { supabaseUrl, supabaseAnonKey, supabaseAppId } from '../services/supabase';

const Settings = () => {
  const { isConnected, pushToCloud } = useContext(AppContext);
  const { addToast } = useToast();

  const [formAppId, setFormAppId] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formKey, setFormKey] = useState('');

  useEffect(() => {
    setFormAppId(localStorage.getItem('supabase_appid') || import.meta.env.VITE_SUPABASE_APP_ID || 'com_primary_attendance');
    setFormUrl(localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL || '');
    setFormKey(localStorage.getItem('supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  }, []);

  const handleSaveSettings = () => {
    if (formAppId) localStorage.setItem('supabase_appid', formAppId);
    if (formUrl) localStorage.setItem('supabase_url', formUrl);
    if (formKey) localStorage.setItem('supabase_key', formKey);
    
    addToast("บันทึกการตั้งค่าเรียบร้อยแล้ว กรุณารีเฟรชหน้าเว็บ", "success");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card p-6 flex items-center gap-4 z-10 relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-600 text-white flex items-center justify-center shadow-lg shadow-slate-500/30">
          <Gear weight="duotone" className="text-3xl" />
        </div>
        <div>
          <h3 className="font-display font-bold text-2xl text-slate-800">ตั้งค่าระบบ (Settings)</h3>
          <p className="text-sm text-slate-500 font-medium">จัดการการเชื่อมต่อฐานข้อมูลและการกู้คืนข้อมูล</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database weight="duotone" className="text-2xl text-indigo-500" />
            <h4 className="font-display font-bold text-xl text-slate-800">การเชื่อมต่อฐานข้อมูล</h4>
          </div>
          
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600">สถานะการเชื่อมต่อ Cloud</span>
              {isConnected ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">🟢 เชื่อมต่อแล้ว</span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200">🔴 ทำงานออฟไลน์ (Local)</span>
              )}
            </div>

            <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 text-sm text-sky-700 mb-4">
              <WarningCircle weight="fill" className="inline mr-1 text-sky-500" />
              หากข้อมูลหายไปหลังจากอัปเดตเว็บ เป็นไปได้ว่าระบบเปลี่ยน URL (Preview URL) ทำให้ไม่พบการตั้งค่าเดิม โปรดตรวจสอบ Database App ID ด้านล่างให้ตรงกับของเดิม
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Database App ID (รหัสฐานข้อมูลของคุณ)</label>
              <input 
                type="text" 
                value={formAppId} 
                onChange={e => setFormAppId(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 border border-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Supabase URL</label>
              <input 
                type="text" 
                value={formUrl} 
                onChange={e => setFormUrl(e.target.value)}
                placeholder="https://xxxx.supabase.co"
                className="w-full px-4 py-3 bg-white/60 border border-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm text-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Supabase Anon Key</label>
              <input 
                type="password" 
                value={formKey} 
                onChange={e => setFormKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                className="w-full px-4 py-3 bg-white/60 border border-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm text-slate-600"
              />
            </div>

            <button 
              onClick={handleSaveSettings}
              className="w-full py-3.5 btn-primary-glass bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 mt-4"
            >
              <FloppyDisk weight="bold" className="text-lg" /> บันทึกและรีเฟรชระบบ
            </button>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <CloudArrowUp weight="duotone" className="text-2xl text-teal-500" />
            <h4 className="font-display font-bold text-xl text-slate-800">กู้คืนข้อมูล</h4>
          </div>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            หากคุณเคยใช้งานระบบผ่าน URL อื่น (เช่น localhost หรือโดเมนเก่า) ข้อมูลเดิมของคุณยังคงปลอดภัยอยู่ในเครื่องคอมพิวเตอร์ของคุณ 
            <br/><br/>
            วิธีแก้: ให้คุณกลับไปเปิดเว็บไซต์ใน URL เดิมที่เคยใช้ ข้อมูลจะกลับมาครบถ้วน จากนั้นให้ไปที่เมนู "ภาพรวม" และกด <strong>"ดาวน์โหลดข้อมูลสำรอง"</strong> เพื่อนำมา Import ในเว็บใหม่นี้ครับ
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
