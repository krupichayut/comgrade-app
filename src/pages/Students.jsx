import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Users, UsersThree, Plus } from '@phosphor-icons/react';

const Students = () => {
  const { db } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('ทุกชั้นเรียน');

  const filteredStudents = db?.students?.filter(s => {
    const matchClass = classFilter === 'ทุกชั้นเรียน' || s.class === classFilter;
    const matchSearch = search === '' || s.name.includes(search) || s.no.toString() === search;
    return matchClass && matchSearch;
  }) || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b flex flex-wrap gap-4 items-center justify-between">
          <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
            <Users weight="bold" className="text-indigo-600 text-xl" /> ทำเนียบรายชื่อนักเรียน
          </h3>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="🔍 ค้นชื่อ หรือ เลขที่..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 outline-none text-sm w-full sm:w-48 focus:border-indigo-500" 
            />
            <select 
              value={classFilter} 
              onChange={e => setClassFilter(e.target.value)} 
              className="px-3.5 py-2 rounded-xl border border-slate-200 outline-none text-sm bg-white focus:border-indigo-500"
            >
              <option value="ทุกชั้นเรียน">ทุกชั้นเรียน</option>
              {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-sm flex items-center justify-center gap-1 transition-colors">
              <UsersThree weight="bold" /> นำเข้าทีละห้อง
            </button>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1 shadow-md transition-all">
              <Plus weight="bold" /> เพิ่มทีละคน
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-50/50 text-indigo-900 border-b text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-5 text-center w-16">เลขที่</th>
                <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                <th className="py-3 px-4 w-28 text-center">ชั้น</th>
                <th className="py-3 px-4 w-24 text-center">เพศ</th>
                <th className="py-3 px-4 text-center text-emerald-600">มาเรียน</th>
                <th className="py-3 px-4 text-center text-rose-500">ขาด</th>
                <th className="py-3 px-4 text-center text-amber-500">สาย</th>
                <th className="py-3 px-4 text-center text-indigo-600">ลา</th>
                <th className="py-3 px-4 text-center w-28 no-print">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500">ไม่พบรายชื่อนักเรียน</td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="py-3 px-5 text-center font-semibold text-slate-600">{student.no}</td>
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4 text-center">{student.class}</td>
                    <td className="py-3 px-4 text-center">{student.gender}</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-medium">0</td>
                    <td className="py-3 px-4 text-center text-rose-500 font-medium">0</td>
                    <td className="py-3 px-4 text-center text-amber-500 font-medium">0</td>
                    <td className="py-3 px-4 text-center text-indigo-600 font-medium">0</td>
                    <td className="py-3 px-4 text-center">
                      <button className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold mr-2">แก้ไข</button>
                      <button className="text-rose-500 hover:text-rose-700 text-xs font-semibold">ลบ</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Students;
