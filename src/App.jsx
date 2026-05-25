import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { House, CheckSquare, Users, ChartBarHorizontal, Notebook, FileText, CloudArrowUp, GraduationCap } from '@phosphor-icons/react';
import { AppProvider, AppContext } from './context/AppContext';

import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import Homework from './pages/Homework';
import Scores from './pages/Scores';
import Report from './pages/Report';

const Layout = ({ children }) => {
  const { isConnected } = React.useContext(AppContext);

  return (
    <div className="min-h-screen text-slate-800 bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                💻
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight tracking-wide">ระบบเช็คชื่อวิชาคอมพิวเตอร์</h1>
                <p className="text-[11px] text-indigo-200/80 font-light flex items-center gap-1">
                  <GraduationCap weight="fill" /> ระบบบันทึกและวิเคราะห์อัตลักษณ์ผู้เรียนอัจฉริยะ
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${isConnected ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                <span className={`w-2.5 h-2.5 rounded-full inline-block ${isConnected ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`}></span>
                <span>{isConnected ? 'ระบบออนไลน์ (คลาวด์)' : 'ตรวจสอบระบบ...'}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="bg-indigo-950/40 border-t border-white/5 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-2 py-2 min-w-[620px]">
              <NavTab to="/dashboard" icon={<House weight="bold" />} label="ภาพรวม" />
              <NavTab to="/attendance" icon={<CheckSquare weight="bold" />} label="เช็คชื่อวันนี้" />
              <NavTab to="/students" icon={<Users weight="bold" />} label="จัดการนักเรียน" />
              <NavTab to="/scores" icon={<ChartBarHorizontal weight="bold" />} label="คะแนนกิจกรรม" />
              <NavTab to="/homework" icon={<Notebook weight="bold" />} label="มอบหมายงาน" />
              <NavTab to="/report" icon={<FileText weight="bold" />} label="สรุปและรายงาน" />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

const NavTab = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
        isActive ? 'bg-white/20 text-white' : 'text-indigo-100 hover:bg-white/10'
      }`
    }
  >
    {icon} {label}
  </NavLink>
);

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
