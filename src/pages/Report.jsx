import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { ChartLineUp, Printer, UserFocus, CheckCircle, ClockAfternoon, XCircle, Notepad } from '@phosphor-icons/react';

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

    // Keys format: date_class_period
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
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:border-indigo-500" />
                </div>
                <div className="w-36">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ถึงวันที่</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:border-indigo-500" />
                </div>
                <div className="w-36">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ชั้นเรียน</label>
                  <select value={repClass} onChange={e => setRepClass(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
                    {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={calcReport} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1 shadow-md transition-colors">
                  <ChartLineUp weight="bold" /> คํานวณรายงาน
                </button>
              </div>
              <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors" onClick={() => window.print()}>
                <Printer weight="bold" /> พิมพ์เอกสาร
              </button>
            </div>
          </div>
          
          {!calculatedAtt ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-500">
              คลิกปุ่มคำนวณรายงานเพื่อดูสรุปการเข้าเรียน
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-indigo-50/50 text-center print:bg-white print:border-none">
                <h3 className="font-display font-bold text-lg text-indigo-950 print:text-black">รายงานสรุปการเข้าเรียน ชั้น {repClass}</h3>
                <p className="text-sm text-indigo-700 print:text-black">
                  ระหว่างวันที่ {formatThaiDate(startDate)} ถึง {formatThaiDate(endDate)}
                </p>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-5 text-center w-16">เลขที่</th>
                    <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                    <th className="py-3 px-4 text-center w-20 text-emerald-600">มาเรียน</th>
                    <th className="py-3 px-4 text-center w-20 text-amber-500">มาสาย</th>
                    <th className="py-3 px-4 text-center w-20 text-rose-500">ขาดเรียน</th>
                    <th className="py-3 px-4 text-center w-20 text-indigo-600">ลา</th>
                    <th className="py-3 px-4 text-center w-24">% การเข้าเรียน</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {calculatedAtt.length === 0 ? (
                    <tr><td colSpan="7" className="py-8 text-center text-slate-500">ไม่พบรายชื่อในห้องเรียนนี้</td></tr>
                  ) : (
                    calculatedAtt.map(s => (
                      <tr key={s.id}>
                        <td className="py-3 px-5 text-center font-semibold text-slate-600">{s.no}</td>
                        <td className="py-3 px-4">{s.name}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600">{s.present}</td>
                        <td className="py-3 px-4 text-center font-bold text-amber-500">{s.late}</td>
                        <td className="py-3 px-4 text-center font-bold text-rose-500">{s.absent}</td>
                        <td className="py-3 px-4 text-center font-bold text-indigo-600">{s.leave}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${s.pct >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {s.pct}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'class' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {db?.classes?.length === 0 ? (
               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-500 col-span-full">
                 ไม่พบข้อมูลชั้นเรียน
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
                  <div key={c} className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-display font-bold text-xl text-slate-800 mb-1">ชั้น {c}</h3>
                    <p className="text-xs text-slate-500 mb-4">จำนวนนักเรียนทั้งหมด {studentCount} คน</p>
                    <div className="flex items-end justify-between mt-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">อัตราเข้าเรียนเฉลี่ย</span>
                        <span className={`font-display font-bold text-3xl ${pct >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>{pct}%</span>
                      </div>
                      <div className="flex -space-x-2">
                        {/* Placeholder for visual flair */}
                        {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>)}
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
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex gap-4 items-center no-print">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">ค้นหาชื่อนักเรียนในระบบเพื่อดึงแฟ้มสะสมผลงาน</label>
              <input 
                type="text" 
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                placeholder="🔍 พิมพ์ชื่อ-สกุล หรือ เลขที่..." 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm max-h-[600px] overflow-y-auto no-print">
              <div className="p-4 border-b bg-indigo-50/50 sticky top-0">
                <h4 className="font-display font-semibold text-indigo-900 text-sm">รายชื่อทั้งหมด ({studentSearchList.length})</h4>
              </div>
              <div className="divide-y text-sm">
                {studentSearchList.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">ไม่พบรายชื่อ</div>
                ) : (
                  studentSearchList.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => setSelectedStudent(s)}
                      className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between ${selectedStudent?.id === s.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{s.name}</div>
                        <div className="text-xs text-slate-400">เลขที่ {s.no} &bull; ห้อง {s.cls}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {!selectedStudent ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
                  <UserFocus weight="bold" className="text-5xl mb-3 mx-auto block text-slate-300" />
                  <h4 className="font-display font-semibold text-slate-500 mb-1">โปรดเลือกนักเรียนจากตารางทางซ้ายมือ</h4>
                  <p className="text-xs">เพื่อสรุปสถิติอัตราการเข้าเรียนและประวัติการเช็คชื่อแบบเรียลไทม์</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-white flex justify-between items-start">
                    <div>
                      <h2 className="font-display font-bold text-2xl text-slate-800 mb-1">{selectedStudent.name}</h2>
                      <div className="flex gap-3 text-sm font-semibold text-slate-500">
                        <span className="px-2 py-0.5 bg-white border rounded">เลขที่ {selectedStudent.no}</span>
                        <span className="px-2 py-0.5 bg-white border rounded">ชั้นเรียน {selectedStudent.cls}</span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors no-print" onClick={() => window.print()}>
                      <Printer weight="bold" /> พิมพ์
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
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
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-4 border rounded-2xl bg-emerald-50 text-center">
                              <span className="text-xs font-semibold text-emerald-600 block mb-1">มาเรียน</span>
                              <span className="font-display font-bold text-2xl text-emerald-700">{pres}</span>
                            </div>
                            <div className="p-4 border rounded-2xl bg-amber-50 text-center">
                              <span className="text-xs font-semibold text-amber-600 block mb-1">มาสาย</span>
                              <span className="font-display font-bold text-2xl text-amber-700">{late}</span>
                            </div>
                            <div className="p-4 border rounded-2xl bg-rose-50 text-center">
                              <span className="text-xs font-semibold text-rose-500 block mb-1">ขาดเรียน</span>
                              <span className="font-display font-bold text-2xl text-rose-700">{abs}</span>
                            </div>
                            <div className="p-4 border rounded-2xl bg-indigo-50 text-center">
                              <span className="text-xs font-semibold text-indigo-600 block mb-1">ลา</span>
                              <span className="font-display font-bold text-2xl text-indigo-700">{leave}</span>
                            </div>
                          </div>

                          <div className="bg-slate-50 border rounded-2xl p-5 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-slate-800">อัตราการเข้าเรียน</h4>
                              <p className="text-xs text-slate-500">รวมทั้งหมด {tot} ครั้ง</p>
                            </div>
                            <div className={`font-display font-bold text-3xl ${pct >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {pct}%
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-800 mb-3 text-sm border-b pb-2">ประวัติการเช็คชื่อย้อนหลัง</h4>
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                              {history.length === 0 ? (
                                <p className="text-center text-sm text-slate-400 py-4">ยังไม่มีประวัติการเช็คชื่อ</p>
                              ) : (
                                history.map((h, i) => {
                                  let icon, color, label;
                                  if (h.status === 'present') { icon = <CheckCircle weight="fill" />; color = "text-emerald-600 bg-emerald-50"; label = "มาเรียน"; }
                                  if (h.status === 'absent') { icon = <XCircle weight="fill" />; color = "text-rose-500 bg-rose-50"; label = "ขาดเรียน"; }
                                  if (h.status === 'late') { icon = <ClockAfternoon weight="fill" />; color = "text-amber-500 bg-amber-50"; label = "มาสาย"; }
                                  if (h.status === 'leave') { icon = <Notepad weight="fill" />; color = "text-indigo-600 bg-indigo-50"; label = "ลา"; }
                                  
                                  return (
                                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${color.split(' ')[1]}`}>
                                      <div className="flex items-center gap-3">
                                        <div className={`text-xl ${color.split(' ')[0]}`}>{icon}</div>
                                        <div>
                                          <div className="font-semibold text-slate-800 text-sm">{formatThaiDate(h.date)}</div>
                                          <div className="text-xs text-slate-500">คาบที่ {h.period} &bull; เช็คชื่อเวลา {h.time || '-'}</div>
                                        </div>
                                      </div>
                                      <div className={`text-xs font-bold px-2 py-1 rounded bg-white shadow-sm ${color.split(' ')[0]}`}>{label}</div>
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
