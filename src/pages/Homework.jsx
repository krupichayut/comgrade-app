import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, Notebook, Clock, ChalkboardTeacher } from '@phosphor-icons/react';

const Homework = () => {
  const { db } = useContext(AppContext);
  const [classFilter, setClassFilter] = useState('ทุกชั้นเรียน');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredHomework = db?.homework?.filter(hw => {
    const matchClass = classFilter === 'ทุกชั้นเรียน' || hw.class === 'ทุกชั้นเรียน' || hw.class === classFilter;
    const matchType = typeFilter === '' || hw.type === typeFilter;
    return matchClass && matchType;
  }) || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="w-36">
            <label className="block text-xs font-semibold text-slate-500 mb-1">กรองชั้นเรียน</label>
            <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
              <option value="ทุกชั้นเรียน">ทุกชั้นเรียน</option>
              {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="w-40">
            <label className="block text-xs font-semibold text-slate-500 mb-1">ประเภทงาน</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
              <option value="">ทั้งหมด</option>
              <option value="งานในชั้นเรียน">งานในชั้นเรียน</option>
              <option value="การบ้าน">การบ้าน</option>
              <option value="โปรเจกต์">โปรเจกต์</option>
              <option value="แบบทดสอบ">แบบทดสอบ</option>
              <option value="ทักษะปฏิบัติ">ทักษะปฏิบัติ</option>
            </select>
          </div>
        </div>
        <button className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1 shadow-md shadow-emerald-600/10 transition-colors">
          <Plus weight="bold" /> มอบหมายงานใหม่
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHomework.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Notebook weight="bold" className="text-4xl mb-2 mx-auto block" />
            <p className="text-sm">ไม่พบข้อมูลการมอบหมายงาน/การบ้าน</p>
          </div>
        ) : (
          filteredHomework.map(hw => (
            <div key={hw.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-display font-semibold text-lg text-slate-800 line-clamp-1" title={hw.title}>{hw.title}</h4>
                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg whitespace-nowrap">{hw.type}</span>
              </div>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[32px]">{hw.desc || '-'}</p>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 border-t pt-3">
                <div className="flex items-center gap-1" title="ชั้นเรียน">
                  <ChalkboardTeacher weight="fill" className="text-indigo-500" /> {hw.class}
                </div>
                <div className="flex items-center gap-1" title="กำหนดส่ง">
                  <Clock weight="fill" className="text-rose-500" /> {hw.due}
                </div>
                <div className="flex items-center gap-1 ml-auto" title="คะแนนเต็ม">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]">★</span>
                  {hw.maxScore} คะแนน
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Homework;
