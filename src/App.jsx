import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { House, CheckSquare, Users, ChartBarHorizontal, Notebook, FileText, GraduationCap, List, BookOpen, X } from '@phosphor-icons/react';
import { AppProvider, AppContext } from './context/AppContext';

import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import Homework from './pages/Homework';
import Scores from './pages/Scores';
import Report from './pages/Report';
import LessonPlan from './pages/LessonPlan';

const SidebarItem = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
        isActive 
          ? 'bg-white shadow-md text-indigo-600 scale-[1.02]' 
          : 'text-slate-600 hover:bg-white/50 hover:text-indigo-600'
      }`
    }
  >
    <div className="text-xl">{icon}</div>
    <span className="text-sm">{label}</span>
  </NavLink>
);

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    switch(location.pathname) {
      case '/dashboard': return 'ภาพรวม (Dashboard)';
      case '/lesson-plan': return 'แผนการสอน (Lesson Plan)';
      case '/attendance': return 'เช็คชื่อวันนี้ (Attendance)';
      case '/students': return 'จัดการนักเรียน (Students)';
      case '/scores': return 'คะแนนกิจกรรม (Scores)';
      case '/homework': return 'มอบหมายงาน (Homework)';
      case '/report': return 'รายงานผล (Report)';
      default: return 'ระบบเช็คชื่อวิชาคอมพิวเตอร์';
    }
  };

  return (
    <div className="flex h-screen relative font-sans text-slate-800">
      {/* Animated Background Orbs */}
      <div className="orb-1"></div>
      <div className="orb-2"></div>
      <div className="orb-3"></div>

      {/* Glass Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 glass-sidebar transform transition-transform duration-500 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap weight="duotone" className="text-3xl" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-slate-800 leading-tight">ComGrade<span className="text-indigo-600">.</span></h1>
              <p className="text-[10px] font-bold text-slate-500 tracking-wider">TEACHER PORTAL</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-500 backdrop-blur-md">
            <X weight="bold" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-1 custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest mb-3 mt-4">เมนูหลัก</p>
          <SidebarItem to="/dashboard" icon={<House weight="duotone" />} label="ภาพรวม" onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/lesson-plan" icon={<BookOpen weight="duotone" />} label="แผนการสอน" onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/attendance" icon={<CheckSquare weight="duotone" />} label="เช็คชื่อวันนี้" onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/students" icon={<Users weight="duotone" />} label="จัดการนักเรียน" onClick={() => setIsMobileMenuOpen(false)} />
          
          <p className="px-4 text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest mb-3 mt-8">การประเมินผล</p>
          <SidebarItem to="/scores" icon={<ChartBarHorizontal weight="duotone" />} label="คะแนนกิจกรรม" onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/homework" icon={<Notebook weight="duotone" />} label="มอบหมายงาน" onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/report" icon={<FileText weight="duotone" />} label="รายงานผล" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
        
        <div className="p-6">
          <div className="p-4 bg-white/60 backdrop-blur-md rounded-3xl border border-white flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 shadow-inner border-2 border-white"></div>
            <div>
              <p className="text-xs font-bold text-slate-800">ครูผู้สอน</p>
              <p className="text-[10px] font-bold text-emerald-600">Online &bull; พร้อมใช้งาน</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="h-20 glass-panel border-b-0 m-4 mb-0 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center text-slate-700 hover:bg-white shadow-sm transition-colors backdrop-blur-md"
            >
              <List weight="bold" className="text-xl" />
            </button>
            <h2 className="font-display font-bold text-2xl text-slate-800">{getPageTitle()}</h2>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-xl text-xs font-bold text-slate-600 shadow-sm border border-white">
              ปีการศึกษา 2567
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lesson-plan" element={<LessonPlan />} />
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
};

export default App;
