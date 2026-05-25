import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { CheckSquare, FloppyDisk, Clock } from '@phosphor-icons/react';

const Attendance = () => {
  const { db } = useContext(AppContext);
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attClass, setAttClass] = useState(db?.classes[0] || '');
  const [attPeriod, setAttPeriod] = useState('1');
  const [thresholdTime, setThresholdTime] = useState('08:45');
  const [autoCalculate, setAutoCalculate] = useState(true);

  // Mock students for the selected class
  const classStudents = db?.students?.filter(s => s.class === attClass) || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-end gap-4 justify-between">
          <div className="flex flex-wrap gap-4 items-end flex-1">
            <div className="w-full sm:w-40">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">วันที่ทำรายการ</label>
              <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:border-indigo-500" />
            </div>
            <div className="w-full sm:w-36">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">ชั้นเรียน</label>
              <select value={attClass} onChange={e => setAttClass(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
                {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="w-full sm:w-56">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">คาบเรียน/เวลาเรียน</label>
              <select value={attPeriod} onChange={e => setAttPeriod(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
                <option value="1">คาบที่ 1 (08:30-09:30)</option>
                <option value="2">คาบที่ 2 (09:30-10:30)</option>
                <option value="3">คาบที่ 3 (10:30-11:30)</option>
                <option value="4">คาบที่ 4 (12:30-13:30)</option>
                <option value="5">คาบที่ 5 (13:30-14:30)</option>
                <option value="6">คาบที่ 6 (14:30-15:30)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-initial px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors">
              <CheckSquare weight="bold" /> มาเรียนทั้งหมด
            </button>
            <button className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 transition-colors">
              <FloppyDisk weight="bold" /> บันทึกข้อมูล
            </button>
          </div>
        </div>

        {/* Threshold setup */}
        <div className="flex flex-wrap items-center gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-2">
            <Clock weight="bold" className="text-indigo-600 text-lg" />
            <span className="text-sm font-semibold text-indigo-950">เกณฑ์เวลาและคำนวณเข้าเรียนสายอัตโนมัติ:</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-500">เกณฑ์เข้าเรียนสาย</label>
            <input type="time" value={thresholdTime} onChange={e => setThresholdTime(e.target.value)} className="px-2 py-1 border border-slate-200 rounded-lg text-xs outline-none bg-white font-semibold text-indigo-900 font-mono focus:border-indigo-500" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="autoCalc" checked={autoCalculate} onChange={e => setAutoCalculate(e.target.checked)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
            <label htmlFor="autoCalc" className="text-xs font-semibold text-slate-600 cursor-pointer">ช่วยเลือก "มาเรียน" หรือ "มาสาย" อัตโนมัติเมื่อกดเลือกสถานะ</label>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 flex-wrap text-xs bg-white rounded-xl p-3 border border-slate-100 text-slate-500 justify-center">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> มาเรียน</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> ขาดเรียน</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> มาสาย</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span> ลากิจ/ลาป่วย</span>
      </div>
      
      {/* Grid List Placeholder */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {classStudents.length === 0 ? (
           <div className="col-span-full py-12 text-center text-slate-400">
             <p className="text-sm">ไม่มีข้อมูลนักเรียนในชั้นเรียนนี้ (โปรดเพิ่มนักเรียนที่เมนูจัดการนักเรียน)</p>
           </div>
        ) : (
          classStudents.map(student => (
            <div key={student.id} className="bg-white border rounded-xl p-3 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-500 mb-1">เลขที่ {student.no}</span>
              <span className="text-sm font-semibold text-slate-800 line-clamp-1">{student.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Attendance;
