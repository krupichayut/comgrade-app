import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { ChartLineUp, Printer, UserFocus } from '@phosphor-icons/react';

const Report = () => {
  const { db } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('att'); // 'att' | 'class' | 'student'
  const [repClass, setRepClass] = useState(db?.classes[0] || '');

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex gap-1 border-b pb-1 no-print">
        <button 
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all border-b-2 ${activeTab === 'att' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-indigo-600'}`}
          onClick={() => setActiveTab('att')}
        >
          📅 สรุปการเข้าเรียน
        </button>
        <button 
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all border-b-2 ${activeTab === 'class' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-indigo-600'}`}
          onClick={() => setActiveTab('class')}
        >
          🏫 สรุปผลรายชั้นเรียน
        </button>
        <button 
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all border-b-2 ${activeTab === 'student' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-indigo-600'}`}
          onClick={() => setActiveTab('student')}
        >
          👤 สรุปประวัติรายบุคคล
        </button>
      </div>

      {activeTab === 'att' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm no-print">
            <div className="flex flex-wrap items-end gap-3 justify-between">
              <div className="flex flex-wrap gap-3 items-end flex-1">
                <div className="w-36">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ตั้งแต่วันที่</label>
                  <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:border-indigo-500" />
                </div>
                <div className="w-36">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ถึงวันที่</label>
                  <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:border-indigo-500" />
                </div>
                <div className="w-36">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ชั้นเรียน</label>
                  <select value={repClass} onChange={e => setRepClass(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
                    {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1 shadow-md transition-colors">
                  <ChartLineUp weight="bold" /> คํานวณรายงาน
                </button>
              </div>
              <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors" onClick={() => window.print()}>
                <Printer weight="bold" /> พิมพ์เอกสาร
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-500">
            คลิกปุ่มคำนวณรายงานเพื่อดูสรุปการเข้าเรียน
          </div>
        </div>
      )}

      {activeTab === 'class' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-500 col-span-full">
               ฟังก์ชันสรุปผลรายชั้นเรียนอยู่ระหว่างการพัฒนา
             </div>
          </div>
        </div>
      )}

      {activeTab === 'student' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">ค้นหาชื่อนักเรียนในระบบเพื่อดึงแฟ้มสะสมผลงาน</label>
              <input type="text" placeholder="🔍 พิมพ์ชื่อ-สกุล หรือ เลขที่..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm max-h-[600px] overflow-y-auto">
              <div className="p-4 border-b bg-indigo-50/50">
                <h4 className="font-display font-semibold text-indigo-900 text-sm">รายชื่อทั้งหมด</h4>
              </div>
              <div className="divide-y p-4 text-center text-slate-400 text-sm">
                ไม่พบรายชื่อ
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
                <UserFocus weight="bold" className="text-5xl mb-3 mx-auto block text-slate-300" />
                <h4 className="font-display font-semibold text-slate-500 mb-1">โปรดเลือกนักเรียนจากตารางทางซ้ายมือ</h4>
                <p className="text-xs">เพื่อสรุปสถิติอัตราการเข้าเรียนและประวัติการเช็คชื่อแบบเรียลไทม์</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
