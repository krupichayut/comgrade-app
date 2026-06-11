import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { ChartLineUp, Printer, UserFocus, CheckCircle, ClockAfternoon, XCircle, Notepad, MagnifyingGlass } from '@phosphor-icons/react';

const Report = () => {
  const { db } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('att'); // 'att' | 'class' | 'student'
  
  // Attendance Tab State
  const [repClass, setRepClass] = useState(db?.classes?.[0] || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [calculatedAtt, setCalculatedAtt] = useState(null);

  // Student Tab State
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '-';
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };

  const calcReport = () => {
    if (!repClass || !db?.attendance || !db?.students) return;

    const studentsInClass = db.students.filter(s => s.cls === repClass).sort((a, b) => a.no - b.no);
    const result = [];

    const relevantKeys = Object.keys(db.attendance).filter(k => {
      const parts = k.split('_');
      if (parts[1] !== repClass) return false;
      const d = parts[0];
      return d >= startDate && d <= endDate;
    });

    studentsInClass.forEach(s => {
      const counts = { present: 0, absent: 0, late: 0, leave: 0 };
      let total = 0;

      relevantKeys.forEach(k => {
        const records = db.attendance[k];
        const r = records.find(x => x.studentId === s.id);
        if (r) {
          counts[r.status]++;
          total++;
        }
      });

      result.push({
        id: s.id,
        no: s.no,
        name: s.name,
        gender: s.gender,
        ...counts,
        total,
        pct: total > 0 ? Math.round(((counts.present + counts.late) / total) * 100) : 0
      });
    });

    setCalculatedAtt(result);
  };

  const studentSearchList = db?.students?.filter(s => 
    searchStudent === '' || s.name.includes(searchStudent) || s.no.toString() === searchStudent
  ) || [];

  return (
    <div className="space-y-6">
      {/* Premium Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-2xl w-fit no-print">
        <button 
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'att' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'}`}
          onClick={() => setActiveTab('att')}
        >
          📅 สรุปการเข้าเรียน
        </button>
        <button 
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'class' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'}`}
          onClick={() => setActiveTab('class')}
        >
          🏫 สรุปผลรายชั้นเรียน
        </button>
        <button 
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'}`}
          onClick={() => setActiveTab('student')}
        >
          👤 สรุปประวัติรายบุคคล
        </button>
      </div>

      {activeTab === 'att' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="premium-card p-4 flex flex-col xl:flex-row xl:items-end gap-5 justify-between no-print z-10 relative">
            <div className="flex flex-wrap gap-4 items-end w-full xl:w-auto flex-1">
              <div className="w-full sm:w-40">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ตั้งแต่วันที่</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-slate-50 text-indigo-900 focus:border-indigo-500 transition-all" />
              </div>
              <div className="w-full sm:w-40">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ถึงวันที่</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-slate-50 text-indigo-900 focus:border-indigo-500 transition-all" />
              </div>
              <div className="w-full sm:w-36">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ชั้นเรียน</label>
                <select value={repClass} onChange={e => setRepClass(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-slate-50 text-indigo-900 focus:border-indigo-500 transition-all">
                  {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 w-full xl:w-auto">
              <button onClick={calcReport} className="flex-1 xl:flex-none px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 btn-premium">
                <ChartLineUp weight="bold" className="text-lg" /> คํานวณรายงาน
              </button>
              <button className="flex-1 xl:flex-none px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-slate-200 shadow-sm transition-all" onClick={() => window.print()}>
                <Printer weight="bold" className="text-lg" /> พิมพ์
              </button>
            </div>
          </div>
          
          {!calculatedAtt ? (
            <div className="premium-card p-16 text-center text-slate-400">
              <ChartLineUp weight="duotone" className="text-6xl mx-auto mb-4 text-slate-300" />
              <p className="font-display font-medium text-lg">กำหนดช่วงเวลาเพื่อดูรายงาน</p>
              <p className="text-sm mt-2">คลิกปุ่ม "คำนวณรายงาน" ด้านบนเพื่อดูสรุปสถิติ</p>
            </div>
          ) : (
            <div className="premium-card overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-white text-center print:bg-white print:border-none print:p-0 print:mb-4">
                <h3 className="font-display font-bold text-2xl text-indigo-950 print:text-black">รายงานสรุปการเข้าเรียน ชั้น {repClass}</h3>
                <p className="text-sm font-bold text-indigo-600 print:text-black mt-1">
                  ระหว่างวันที่ {formatThaiDate(startDate)} ถึง {formatThaiDate(endDate)}
                </p>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="py-4 px-5 text-center w-16">เลขที่</th>
                      <th className="py-4 px-4">ชื่อ-นามสกุล</th>
                      <th className="py-4 px-4 text-center w-20 text-emerald-600">มาเรียน</th>
                      <th className="py-4 px-4 text-center w-20 text-amber-500">มาสาย</th>
                      <th className="py-4 px-4 text-center w-20 text-rose-500">ขาดเรียน</th>
                      <th className="py-4 px-4 text-center w-20 text-indigo-600">ลา</th>
                      <th className="py-4 px-4 text-center w-28">% อัตราเข้าเรียน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {calculatedAtt.length === 0 ? (
                      <tr><td colSpan="7" className="py-16 text-center text-slate-400">ไม่พบข้อมูล หรือนักเรียนในห้องเรียนนี้</td></tr>
                    ) : (
                      calculatedAtt.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-5 text-center font-bold text-slate-400">{s.no}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-emerald-50/30">{s.present}</td>
                          <td className="py-3 px-4 text-center font-bold text-amber-500 bg-amber-50/30">{s.late}</td>
                          <td className="py-3 px-4 text-center font-bold text-rose-500 bg-rose-50/30">{s.absent}</td>
                          <td className="py-3 px-4 text-center font-bold text-indigo-600 bg-indigo-50/30">{s.leave}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${s.pct >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                              {s.pct}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'class' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {db?.classes?.length === 0 ? (
               <div className="premium-card p-16 text-center text-slate-400 col-span-full">
                 ไม่พบข้อมูลชั้นเรียนในระบบ
               </div>
            ) : (
              db?.classes?.map(c => {
                let totalActions = 0;
                let sumPAndL = 0;
                let studentCount = db?.students?.filter(s => s.cls === c)?.length || 0;

                if (db?.attendance) {
                  for (const key in db.attendance) {
                    if (key.includes(`_${c}_`)) {
                      db.attendance[key].forEach(r => {
                        totalActions++;
                        if (r.status === 'present' || r.status === 'late') sumPAndL++;
                      });
                    }
                  }
                }
                
                const pct = totalActions > 0 ? Math.round((sumPAndL / totalActions) * 100) : 100;

                return (
                  <div key={c} className="premium-card overflow-hidden group">
                    <div className={`h-2 w-full ${pct >= 80 ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="font-display font-bold text-2xl text-slate-800">ชั้น {c}</h3>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg border">
                          {studentCount} คน
                        </span>
                      </div>
                      
                      <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">อัตราเข้าเรียนเฉลี่ย</span>
                          <span className={`font-display font-bold text-4xl tracking-tighter ${pct >= 80 ? 'text-emerald-500' : 'text-rose-500'}`}>{pct}%</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border shadow-inner text-xl">
                          {pct >= 80 ? <span title="ยอดเยี่ยม">🌟</span> : <span title="ต้องติดตาม">⚠️</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'student' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Search Panel */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="premium-card p-4 no-print relative z-10">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ค้นหาประวัตินักเรียนรายบุคคล</label>
                <div className="relative">
                  <MagnifyingGlass weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input 
                    type="text" 
                    value={searchStudent}
                    onChange={e => setSearchStudent(e.target.value)}
                    placeholder="พิมพ์ชื่อ หรือ เลขที่..." 
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-bold text-slate-700 bg-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
                  />
                </div>
              </div>

              <div className="premium-card overflow-hidden flex-1 max-h-[600px] flex flex-col no-print">
                <div className="p-4 border-b bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                  <h4 className="font-display font-bold text-slate-700 text-sm flex justify-between items-center">
                    <span>ผลการค้นหา</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px]">{studentSearchList.length}</span>
                  </h4>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  {studentSearchList.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-medium text-sm">ไม่พบรายชื่อในระบบ</div>
                  ) : (
                    <div className="space-y-1">
                      {studentSearchList.map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => setSelectedStudent(s)}
                          className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 border ${selectedStudent?.id === s.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 translate-x-1' : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-200 text-slate-700'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-inner ${selectedStudent?.id === s.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {s.no}
                          </div>
                          <div>
                            <div className="font-bold text-sm leading-tight truncate max-w-[180px]">{s.name}</div>
                            <div className={`text-[10px] font-semibold mt-0.5 ${selectedStudent?.id === s.id ? 'text-indigo-200' : 'text-slate-400'}`}>ห้อง {s.cls}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Display Panel */}
            <div className="lg:col-span-2">
              {!selectedStudent ? (
                <div className="premium-card h-full p-16 flex flex-col items-center justify-center text-center text-slate-400">
                  <UserFocus weight="duotone" className="text-7xl mb-4 text-slate-200" />
                  <h4 className="font-display font-bold text-xl text-slate-600 mb-2">โปรดเลือกรายชื่อนักเรียนจากแผงด้านซ้าย</h4>
                  <p className="text-sm font-medium max-w-sm">เพื่อเรียกดูแฟ้มสะสมผลงาน อัตราการเข้าเรียน และประวัติการเช็คชื่อแบบเรียลไทม์</p>
                </div>
              ) : (
                <div className="premium-card overflow-hidden">
                  <div className="p-6 md:p-8 border-b bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-indigo-600 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl rotate-3">
                          <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center font-display font-bold text-3xl text-indigo-900">
                            {selectedStudent.name.substring(0,1)}
                          </div>
                        </div>
                        <div className="text-white pt-2">
                          <h2 className="font-display font-bold text-2xl md:text-3xl mb-1 drop-shadow-md">{selectedStudent.name}</h2>
                          <div className="flex gap-2 text-xs font-bold">
                            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg">เลขที่ {selectedStudent.no}</span>
                            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg">ชั้นเรียน {selectedStudent.cls}</span>
                          </div>
                        </div>
                      </div>
                      <button className="self-start md:self-end px-4 py-2 bg-white text-indigo-700 hover:bg-slate-50 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-lg no-print btn-premium" onClick={() => window.print()}>
                        <Printer weight="bold" /> พิมพ์รายงาน
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8 space-y-8">
                    {/* Calculate individual student stats */}
                    {(() => {
                      const history = [];
                      let pres = 0, abs = 0, late = 0, leave = 0;
                      
                      if (db?.attendance) {
                        for (const key in db.attendance) {
                          const parts = key.split('_');
                          if (parts[1] === selectedStudent.cls) {
                            const date = parts[0];
                            const r = db.attendance[key].find(x => x.studentId === selectedStudent.id);
                            if (r) {
                              if (r.status === 'present') pres++;
                              if (r.status === 'absent') abs++;
                              if (r.status === 'late') late++;
                              if (r.status === 'leave') leave++;
                              history.push({ date, period: parts[2], status: r.status, time: r.checkTime });
                            }
                          }
                        }
                      }
                      
                      const tot = pres + abs + late + leave;
                      const pct = tot > 0 ? Math.round(((pres + late) / tot) * 100) : 100;
                      history.sort((a, b) => b.date.localeCompare(a.date));

                      return (
                        <>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><ChartLineUp weight="bold" className="text-indigo-500 text-lg" /> สรุปสถิติการเข้าเรียน</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 relative overflow-hidden group">
                                <span className="text-[10px] font-bold text-emerald-600 block mb-1 uppercase">มาเรียน</span>
                                <span className="font-display font-bold text-3xl text-emerald-700">{pres}</span>
                                <CheckCircle weight="duotone" className="absolute -right-4 -bottom-4 text-6xl text-emerald-500 opacity-10 group-hover:scale-125 transition-transform" />
                              </div>
                              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 relative overflow-hidden group">
                                <span className="text-[10px] font-bold text-amber-600 block mb-1 uppercase">มาสาย</span>
                                <span className="font-display font-bold text-3xl text-amber-700">{late}</span>
                                <ClockAfternoon weight="duotone" className="absolute -right-4 -bottom-4 text-6xl text-amber-500 opacity-10 group-hover:scale-125 transition-transform" />
                              </div>
                              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 relative overflow-hidden group">
                                <span className="text-[10px] font-bold text-rose-500 block mb-1 uppercase">ขาดเรียน</span>
                                <span className="font-display font-bold text-3xl text-rose-700">{abs}</span>
                                <XCircle weight="duotone" className="absolute -right-4 -bottom-4 text-6xl text-rose-500 opacity-10 group-hover:scale-125 transition-transform" />
                              </div>
                              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 relative overflow-hidden group">
                                <span className="text-[10px] font-bold text-indigo-600 block mb-1 uppercase">ลา</span>
                                <span className="font-display font-bold text-3xl text-indigo-700">{leave}</span>
                                <Notepad weight="duotone" className="absolute -right-4 -bottom-4 text-6xl text-indigo-500 opacity-10 group-hover:scale-125 transition-transform" />
                              </div>
                            </div>
                          </div>

                          <div className={`p-6 rounded-3xl border shadow-sm flex items-center justify-between ${pct >= 80 ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' : 'bg-gradient-to-r from-rose-50 to-orange-50 border-rose-200'}`}>
                            <div>
                              <h4 className="font-display font-bold text-lg text-slate-800">อัตราการเข้าเรียนเฉลี่ย</h4>
                              <p className="text-xs font-semibold text-slate-500 mt-1">ประเมินจากฐานข้อมูลการเช็คชื่อทั้งหมด {tot} ครั้ง</p>
                            </div>
                            <div className={`font-display font-bold text-5xl drop-shadow-sm ${pct >= 80 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {pct}%
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><ClockAfternoon weight="bold" className="text-indigo-500 text-lg" /> ประวัติการเช็คชื่อย้อนหลัง</h4>
                            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar border-l-2 border-slate-100 pl-4 py-2">
                              {history.length === 0 ? (
                                <p className="text-center text-sm text-slate-400 py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">ยังไม่มีประวัติการเช็คชื่อสำหรับนักเรียนคนนี้</p>
                              ) : (
                                history.map((h, i) => {
                                  let icon, color, label;
                                  if (h.status === 'present') { icon = <CheckCircle weight="fill" />; color = "text-emerald-600 bg-emerald-50 border-emerald-100"; label = "มาเรียน"; }
                                  if (h.status === 'absent') { icon = <XCircle weight="fill" />; color = "text-rose-500 bg-rose-50 border-rose-100"; label = "ขาดเรียน"; }
                                  if (h.status === 'late') { icon = <ClockAfternoon weight="fill" />; color = "text-amber-500 bg-amber-50 border-amber-100"; label = "มาสาย"; }
                                  if (h.status === 'leave') { icon = <Notepad weight="fill" />; color = "text-indigo-600 bg-indigo-50 border-indigo-100"; label = "ลา"; }
                                  
                                  return (
                                    <div key={i} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all hover:shadow-sm ${color} relative`}>
                                      {/* Timeline dot */}
                                      <div className={`absolute -left-[23px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white ${color.split(' ')[0].replace('text-', 'bg-')} shadow-sm`}></div>
                                      
                                      <div className="flex items-center gap-3 z-10">
                                        <div className={`text-2xl ${color.split(' ')[0]} bg-white w-10 h-10 flex items-center justify-center rounded-xl shadow-sm`}>{icon}</div>
                                        <div>
                                          <div className="font-bold text-slate-800 text-sm">{formatThaiDate(h.date)}</div>
                                          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">คาบที่ {h.period} &bull; เวลาเช็คชื่อ: {h.time || 'ไม่ระบุ'}</div>
                                        </div>
                                      </div>
                                      <div className={`text-[10px] font-bold px-2.5 py-1 rounded-md bg-white shadow-sm border ${color.split(' ')[0]} uppercase tracking-widest`}>{label}</div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
