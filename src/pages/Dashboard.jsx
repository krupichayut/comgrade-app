import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ChalkboardTeacher, DownloadSimple, UploadSimple, Users, Clipboard, Notebook } from '@phosphor-icons/react';

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      <h4 className="font-display font-bold text-2xl text-slate-800">{value}</h4>
    </div>
  </div>
);

const Dashboard = () => {
  const { db, isLoading } = useContext(AppContext);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div className="border-l-4 border-indigo-600 pl-3">
          <h2 className="font-display font-bold text-xl text-slate-800">แผงควบคุมหลัก</h2>
          <p className="text-xs text-slate-500">ข้อมูลรวมและพารามิเตอร์ของระบบวิชาคอมพิวเตอร์</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors">
            <ChalkboardTeacher weight="bold" /> จัดการชั้นเรียน
          </button>
          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors">
            <DownloadSimple weight="bold" /> ส่งออกข้อมูลสำรอง
          </button>
          <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors cursor-pointer">
            <UploadSimple weight="bold" /> นำเข้าไฟล์สำรอง
            <input type="file" className="hidden" />
          </label>
        </div>
      </div>
      
      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="นักเรียนทั้งหมด" value={db?.students?.length || 0} icon={<Users weight="fill" />} colorClass="bg-blue-50 text-blue-600" />
        <StatCard title="ห้องเรียน" value={db?.classes?.length || 0} icon={<ChalkboardTeacher weight="fill" />} colorClass="bg-indigo-50 text-indigo-600" />
        <StatCard title="การเข้าเรียนเฉลี่ย" value="-" icon={<Clipboard weight="fill" />} colorClass="bg-emerald-50 text-emerald-600" />
        <StatCard title="งาน/กิจกรรม" value={db?.homework?.length || 0} icon={<Notebook weight="fill" />} colorClass="bg-amber-50 text-amber-600" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Attendance Feed */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Clipboard weight="bold" className="text-indigo-600 text-xl" />
            <h3 className="font-display font-semibold text-slate-800">📅 การเช็คชื่อวันนี้</h3>
          </div>
          <div className="space-y-3">
            <div className="py-12 text-center text-slate-400">
              <Clipboard weight="bold" className="text-4xl mb-2 mx-auto block" />
              <p className="text-sm">ยังไม่มีการเช็คชื่อสำหรับวันนี้</p>
            </div>
          </div>
        </div>
        
        {/* Upcoming Tasks Feed */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Notebook weight="bold" className="text-amber-500 text-xl" />
            <h3 className="font-display font-semibold text-slate-800">🔔 งานที่ใกล้ครบกำหนดส่ง</h3>
          </div>
          <div className="space-y-3">
            <div className="py-12 text-center text-slate-400">
              <Notebook weight="bold" className="text-4xl mb-2 mx-auto block" />
              <p className="text-sm">ไม่มีกิจกรรมส่งงานใดที่อยู่ใกล้กำหนดส่ง</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
