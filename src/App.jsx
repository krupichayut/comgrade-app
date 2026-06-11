import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { House, CheckSquare, Users, ChartBarHorizontal, Notebook, FileText, GraduationCap, List, X } from '@phosphor-icons/react';
import { AppProvider, AppContext } from './context/AppContext';

import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import Homework from './pages/Homework';
import Scores from './pages/Scores';
import Report from './pages/Report';

const SidebarItem = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-[0_4px_20px_rgba(79,70,229,0.4)] translate-x-1' 
          : 'text-indigo-200 hover:bg-white/10 hover:text-white'
      }`
    }
  >
    <div className="text-xl">{icon}</div>
    <span>{label}</span>
  </NavLink>
);

const Layout = ({ children }) => {
  const { isConnected } = React.useContext(AppContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Map path to title
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/dashboard': return 'ภาพรวม (Dashboard)';
      case '/attendance': return 'เช็คชื่อวันนี้ (Attendance)';
      case '/students': return 'จัดการนักเรียน (Students)';
      case '/scores': return 'คะแนนกิจกรรม (Scores)';
      case '/homework': return 'มอบหมายงาน (Homework)';
      case '/report': return 'สรุปและรายงาน (Report)';
      default: return 'ระบบเช็คชื่อวิชาคอมพิวเตอร์';
    }
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex flex-col items-center justify-center gap-3 border-b border-indigo-800/50">
        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center text-4xl transform hover:rotate-12 transition-transform duration-500">
          💻
        </div>
        <div className="text-center">
          <h1 className="font-display font-bold text-white tracking-wide leading-tight">COMGRADE<br/><span className="text-xs font-medium text-indigo-300">ระบบเช็คชื่ออัจฉริยะ</span></h1>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-1.5 custom-scrollbar">
        <p className="px-4 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 mt-4">เมนูหลัก</p>
        <SidebarItem to="/dashboard" icon={<House weight="duotone" />} label="ภาพรวม" onClick={() => setIsMobileMenuOpen(false)} />
        <SidebarItem to="/attendance" icon={<CheckSquare weight="duotone" />} label="เช็คชื่อวันนี้" onClick={() => setIsMobileMenuOpen(false)} />
        <SidebarItem to="/students" icon={<Users weight="duotone" />} label="จัดการนักเรียน" onClick={() => setIsMobileMenuOpen(false)} />
        
        <p className="px-4 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 mt-6">การประเมินผล</p>
        <SidebarItem to="/homework" icon={<Notebook weight="duotone" />} label="มอบหมายงาน" onClick={() => setIsMobileMenuOpen(false)} />
        <SidebarItem to="/scores" icon={<ChartBarHorizontal weight="duotone" />} label="คะแนนกิจกรรม" onClick={() => setIsMobileMenuOpen(false)} />
        <SidebarItem to="/report" icon={<FileText weight="duotone" />} label="สรุปและรายงาน" onClick={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="p-4 border-t border-indigo-800/50">
        <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
          <span className="relative flex h-2.5 w-2.5">
            {!isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500'}`}></span>
          </span>
          <span>{isConnected ? 'เชื่อมต่อ Cloud แล้ว' : 'กำลังซิงค์ข้อมูล...'}</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fe]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] glass-sidebar text-slate-300 shadow-2xl relative z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="flex flex-col w-[260px] h-full bg-indigo-950 text-slate-300 shadow-2xl" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-100/50 to-transparent -z-10"></div>
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200/40 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-[20%] left-[-10%] w-72 h-72 bg-sky-200/40 rounded-full blur-3xl -z-10"></div>

        {/* Top Header */}
        <header className="h-20 glass-panel flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0 m-4 rounded-3xl">
          <div className="flex items-center gap-4">
            <button className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <List weight="bold" className="text-xl" />
            </button>
            <div>
              <h2 className="font-display font-bold text-xl text-slate-800">{getPageTitle()}</h2>
              <p className="hidden sm:block text-xs text-slate-500 font-medium tracking-wide">ยินดีต้อนรับสู่ระบบเช็คชื่ออัจฉริยะ</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100/80 rounded-full text-sm font-semibold text-slate-600 border border-slate-200">
              <GraduationCap weight="duotone" className="text-indigo-600 text-lg" />
              <span>ปีการศึกษา 2569</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-white rounded-full border-2 border-white overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher`} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-10 pb-10 pt-2 custom-scrollbar relative z-0">
          <div className="max-w-[1400px] mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/students" element={<Students />} />
            <Route path="/scores" element={<Scores />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
