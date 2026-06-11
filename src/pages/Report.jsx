import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Printer, PresentationChart, CheckSquare, TrendUp, GraduationCap } from '@phosphor-icons/react';

const Report = () => {
  const { db } = useContext(AppContext);
  const [reportClass, setReportClass] = useState(db?.classes?.[0] || '');

  const generateReportData = () => {
    if (!reportClass) return [];
    
    const students = db?.students?.filter(s => s.cls === reportClass)?.sort((a, b) => a.no - b.no) || [];
    const hws = db?.homework?.filter(h => h.cls === reportClass || h.cls === 'ทุกชั้นเรียน') || [];
    
    return students.map(s => {
      // Attendance Stats
      let present = 0, absent = 0, late = 0, leave = 0, totalAtt = 0;
      if (db?.attendance) {
        for (const key in db.attendance) {
          if (key.includes(`_${reportClass}_`)) {
            const r = db.attendance[key].find(x => x.studentId === s.id);
            if (r) {
              totalAtt++;
              if (r.status === 'present') present++;
              else if (r.status === 'absent') absent++;
              else if (r.status === 'late') late++;
              else if (r.status === 'leave') leave++;
            }
          }
        }
      }
      
      const attRate = totalAtt > 0 ? Math.round(((present + late) / totalAtt) * 100) : 100;
      
      // Score Stats
      let totalEarned = 0;
      let totalPossible = 0;
      hws.forEach(h => {
        const score = db?.scores?.[`${h.id}_${s.id}`];
        if (score !== undefined && score !== null) {
          totalEarned += score;
          totalPossible += h.maxScore;
        }
      });
      const scoreRate = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

      let finalGrade = "0";
      let gradeColor = "text-rose-500";
      if (scoreRate >= 80) { finalGrade = "4"; gradeColor = "text-emerald-500"; }
      else if (scoreRate >= 75) { finalGrade = "3.5"; gradeColor = "text-teal-500"; }
      else if (scoreRate >= 70) { finalGrade = "3"; gradeColor = "text-teal-500"; }
      else if (scoreRate >= 65) { finalGrade = "2.5"; gradeColor = "text-amber-500"; }
      else if (scoreRate >= 60) { finalGrade = "2"; gradeColor = "text-amber-500"; }
      else if (scoreRate >= 55) { finalGrade = "1.5"; gradeColor = "text-indigo-500"; }
      else if (scoreRate >= 50) { finalGrade = "1"; gradeColor = "text-indigo-500"; }

      return {
        ...s,
        present, absent, late, leave, attRate,
        totalEarned, totalPossible, scoreRate, finalGrade, gradeColor
      };
    });
  };

  const reportData = generateReportData();

  return (
    <div className="space-y-6">
      {/* Non-printable Controls */}
      <div className="glass-card p-6 flex flex-col md:flex-row gap-4 items-center justify-between no-print z-10 relative">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-fuchsia-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
             <PresentationChart weight="duotone" className="text-3xl" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-slate-800">รายงานผลการเรียน</h3>
            <p className="text-sm text-slate-500 font-medium">ภาพรวมการมาเรียนและคะแนนเพื่อพิมพ์</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 p-1 shadow-sm">
            <select 
              value={reportClass} 
              onChange={e => setReportClass(e.target.value)} 
              className="bg-transparent pl-4 pr-8 py-2.5 outline-none text-sm font-bold text-purple-700 cursor-pointer"
            >
              {db?.classes?.length === 0 && <option value="">ไม่มีห้องเรียน</option>}
              {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
            </select>
          </div>
          <button 
            onClick={() => window.print()}
            disabled={!reportClass || reportData.length === 0}
            className="px-6 py-3.5 btn-primary-glass bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-purple-500/30 disabled:opacity-50 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2"
          >
            <Printer weight="fill" className="text-lg" /> พิมพ์รายงาน
          </button>
        </div>
      </div>

      {/* Printable Area - In glass card on screen, pure white on print */}
      <div className="glass-card overflow-hidden print:bg-white print:shadow-none print:border-none print:rounded-none">
        <div className="p-10">
          <div className="text-center mb-10 pb-6 border-b border-white/60 print:border-slate-300">
            <h1 className="font-display font-bold text-3xl text-slate-800 mb-2">สรุปผลการเรียนและเวลาเรียน</h1>
            <p className="text-lg font-bold text-purple-700">ชั้นเรียน: {reportClass || "-"}</p>
            <p className="text-sm text-slate-500 font-medium mt-1">พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left border-collapse text-sm print:text-xs">
              <thead>
                <tr>
                  <th className="py-4 px-4 text-center border-b border-white/60 print:border-slate-300" rowSpan="2">เลขที่</th>
                  <th className="py-4 px-4 border-b border-white/60 print:border-slate-300" rowSpan="2">ชื่อ-นามสกุล</th>
                  <th className="py-2 px-4 text-center border-b border-white/60 print:border-slate-300" colSpan="4">สถิติการมาเรียน</th>
                  <th className="py-2 px-4 text-center border-b border-white/60 print:border-slate-300" colSpan="4">ผลการประเมินคะแนน</th>
                </tr>
                <tr>
                  <th className="py-3 px-2 text-center text-xs font-bold text-emerald-600 border-b border-white/60 print:border-slate-300">มา/สาย</th>
                  <th className="py-3 px-2 text-center text-xs font-bold text-rose-500 border-b border-white/60 print:border-slate-300">ขาด</th>
                  <th className="py-3 px-2 text-center text-xs font-bold text-indigo-500 border-b border-white/60 print:border-slate-300">ลา</th>
                  <th className="py-3 px-2 text-center text-xs font-bold text-slate-600 border-b border-white/60 print:border-slate-300">% มาเรียน</th>
                  <th className="py-3 px-2 text-center text-xs font-bold text-amber-600 border-b border-white/60 print:border-slate-300">ได้</th>
                  <th className="py-3 px-2 text-center text-xs font-bold text-amber-600 border-b border-white/60 print:border-slate-300">เต็ม</th>
                  <th className="py-3 px-2 text-center text-xs font-bold text-slate-600 border-b border-white/60 print:border-slate-300">% คะแนน</th>
                  <th className="py-3 px-2 text-center text-xs font-bold text-purple-600 border-b border-white/60 print:border-slate-300">เกรด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40 print:divide-slate-200">
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-20 text-center text-slate-400">ไม่พบข้อมูล กรุณาเลือกชั้นเรียนที่มีนักเรียน</td>
                  </tr>
                ) : (
                  reportData.map(s => (
                    <tr key={s.id} className="hover:bg-white/50 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-400">{s.no}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                      <td className="py-3 px-2 text-center text-emerald-600 bg-emerald-50/30 print:bg-transparent">{s.present + s.late}</td>
                      <td className="py-3 px-2 text-center text-rose-500 bg-rose-50/30 print:bg-transparent">{s.absent}</td>
                      <td className="py-3 px-2 text-center text-indigo-500 bg-indigo-50/30 print:bg-transparent">{s.leave}</td>
                      <td className="py-3 px-2 text-center">
                         <span className={`font-bold ${s.attRate >= 80 ? 'text-emerald-500' : 'text-rose-500'}`}>{s.attRate}%</span>
                      </td>
                      
                      <td className="py-3 px-2 text-center font-bold text-amber-600 bg-amber-50/30 print:bg-transparent">{s.totalEarned}</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-400">{s.totalPossible}</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-600">{s.scoreRate}%</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`font-display font-bold text-xl ${s.gradeColor}`}>{s.totalPossible > 0 ? s.finalGrade : "-"}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
