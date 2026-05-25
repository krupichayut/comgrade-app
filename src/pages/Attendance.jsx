import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { CheckSquare, FloppyDisk, Clock, CheckCircle, XCircle, ClockAfternoon, Notepad } from '@phosphor-icons/react';

const Attendance = () => {
  const { db, setDb } = useContext(AppContext);
  const { addToast } = useToast();
  
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attClass, setAttClass] = useState(db?.classes?.[0] || '');
  const [attPeriod, setAttPeriod] = useState('1');
  const [thresholdTime, setThresholdTime] = useState('08:45');
  const [autoCalculate, setAutoCalculate] = useState(true);

  // currentAttendance format: { [studentId]: { status, checkTime } }
  const [currentAttendance, setCurrentAttendance] = useState({});

  const classStudents = db?.students?.filter(s => s.cls === attClass)?.sort((a, b) => a.no - b.no) || [];
  
  const getAttKey = () => `${attDate}_${attClass}_${attPeriod}`;

  const getCurrentTimeStr = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // Load attendance from db whenever filters change
  useEffect(() => {
    if (!attClass) return;
    const key = getAttKey();
    const savedRecords = db?.attendance?.[key] || [];
    const initialAtt = {};
    savedRecords.forEach(r => {
      initialAtt[r.studentId] = { status: r.status, checkTime: r.checkTime || getCurrentTimeStr() };
    });
    setCurrentAttendance(initialAtt);
  }, [attDate, attClass, attPeriod, db]);

  const updateStudentTime = (studentId, timeVal) => {
    setCurrentAttendance(prev => {
      const currentStatus = prev[studentId]?.status || 'present';
      let finalStatus = currentStatus;

      if (autoCalculate && currentStatus !== 'leave' && currentStatus !== 'absent') {
        if (thresholdTime) {
          finalStatus = timeVal <= thresholdTime ? 'present' : 'late';
        }
      }
      return { ...prev, [studentId]: { status: finalStatus, checkTime: timeVal } };
    });
  };

  const setStudentStatus = (studentId, status) => {
    setCurrentAttendance(prev => {
      const existing = prev[studentId];
      if (existing && existing.status === status) {
        // Toggle off
        const next = { ...prev };
        delete next[studentId];
        return next;
      }

      const timeVal = existing?.checkTime || getCurrentTimeStr();
      let finalStatus = status;

      if (autoCalculate && (status === 'present' || status === 'late')) {
        if (thresholdTime) {
          finalStatus = timeVal <= thresholdTime ? 'present' : 'late';
        }
      }

      return { ...prev, [studentId]: { status: finalStatus, checkTime: timeVal } };
    });
  };

  const markAllPresent = () => {
    const nowStr = getCurrentTimeStr();
    const newAtt = { ...currentAttendance };
    
    classStudents.forEach(s => {
      let finalStatus = 'present';
      if (autoCalculate && thresholdTime) {
        finalStatus = nowStr <= thresholdTime ? 'present' : 'late';
      }
      newAtt[s.id] = { status: finalStatus, checkTime: nowStr };
    });
    
    setCurrentAttendance(newAtt);
  };

  const saveAttendance = () => {
    if (!attClass) {
      addToast("กรุณาเลือกชั้นเรียน", "error");
      return;
    }

    const key = getAttKey();
    const records = [];
    
    for (const id in currentAttendance) {
      records.push({
        studentId: parseInt(id),
        status: currentAttendance[id].status,
        checkTime: currentAttendance[id].checkTime
      });
    }

    const newDb = { ...db };
    if (!newDb.attendance) newDb.attendance = {};
    newDb.attendance[key] = records;
    
    setDb(newDb);
    addToast("บันทึกการลงเวลาเช็คชื่อวันนี้สำเร็จเรียบร้อย ✅", "success");
  };

  // Quick Stats
  let presentCount = 0, absentCount = 0, lateCount = 0, leaveCount = 0, checkedCount = 0;
  for (const id in currentAttendance) {
    const status = currentAttendance[id].status;
    if (status === 'present') presentCount++;
    if (status === 'absent') absentCount++;
    if (status === 'late') lateCount++;
    if (status === 'leave') leaveCount++;
    checkedCount++;
  }

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
            <button onClick={markAllPresent} className="flex-1 sm:flex-initial px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors">
              <CheckSquare weight="bold" /> มาเรียนทั้งหมด
            </button>
            <button onClick={saveAttendance} className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 transition-colors">
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
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border p-3 flex flex-col">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">👥 นักเรียนทั้งหมด</span>
          <span className="font-display font-bold text-lg text-slate-800">{classStudents.length} คน</span>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-3 flex flex-col">
          <span className="text-[10px] font-semibold text-emerald-600 uppercase">✅ มาเรียน</span>
          <span className="font-display font-bold text-lg text-emerald-700">{presentCount}</span>
        </div>
        <div className="bg-rose-50 rounded-xl border border-rose-100 p-3 flex flex-col">
          <span className="text-[10px] font-semibold text-rose-500 uppercase">❌ ขาดเรียน</span>
          <span className="font-display font-bold text-lg text-rose-700">{absentCount}</span>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-3 flex flex-col">
          <span className="text-[10px] font-semibold text-amber-600 uppercase">⏰ มาสาย</span>
          <span className="font-display font-bold text-lg text-amber-700">{lateCount}</span>
        </div>
        <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-3 flex flex-col">
          <span className="text-[10px] font-semibold text-indigo-600 uppercase">📋 ลากิจ/ป่วย</span>
          <span className="font-display font-bold text-lg text-indigo-700">{leaveCount}</span>
        </div>
        <div className="bg-slate-100 rounded-xl p-3 flex flex-col border">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">⬜ ยังไม่เช็ค</span>
          <span className="font-display font-bold text-lg text-slate-600">{classStudents.length - checkedCount}</span>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {classStudents.length === 0 ? (
           <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border">
             <p className="text-sm">ไม่มีข้อมูลนักเรียนในชั้นเรียนนี้ (โปรดเพิ่มนักเรียนที่เมนูจัดการนักเรียน)</p>
           </div>
        ) : (
          classStudents.map(student => {
            const record = currentAttendance[student.id] || { status: "", checkTime: getCurrentTimeStr() };
            const status = record.status;
            const time = record.checkTime;

            let bgStyle = "bg-white border-slate-200 hover:shadow-md";
            if (status === 'present') bgStyle = "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/10 hover:shadow-emerald-500/10";
            if (status === 'absent') bgStyle = "bg-rose-50 border-rose-500 ring-2 ring-rose-500/10 hover:shadow-rose-500/10";
            if (status === 'late') bgStyle = "bg-amber-50 border-amber-500 ring-2 ring-amber-500/10 hover:shadow-amber-500/10";
            if (status === 'leave') bgStyle = "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/10 hover:shadow-indigo-500/10";

            return (
              <div key={student.id} className={`border rounded-2xl p-4 flex flex-col justify-between shadow-sm transition-all ${bgStyle}`}>
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                    <span>เลขที่ {student.no}</span>
                    <div className="flex items-center gap-1">
                      <Clock weight="bold" className="text-slate-400" />
                      <input 
                        type="time" 
                        value={time} 
                        onChange={e => updateStudentTime(student.id, e.target.value)} 
                        className="w-[74px] px-1 py-0.5 rounded border border-slate-200 text-slate-700 focus:border-indigo-500 font-mono text-[11px] outline-none bg-white text-center"
                      />
                    </div>
                  </div>
                  <h4 className="font-display font-semibold text-slate-800 text-sm line-clamp-1 leading-tight mt-1">{student.name}</h4>
                  
                  <div className="text-[10px] mt-1.5 h-4">
                    {status === 'present' ? <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle weight="fill" /> มาเรียน (ทันเวลา)</span> : 
                     status === 'late' ? <span className="text-amber-600 font-bold flex items-center gap-1"><ClockAfternoon weight="fill" /> มาสาย</span> :
                     status === 'absent' ? <span className="text-rose-600 font-bold flex items-center gap-1"><XCircle weight="fill" /> ขาดเรียน</span> :
                     status === 'leave' ? <span className="text-indigo-600 font-bold flex items-center gap-1"><Notepad weight="fill" /> ลาเรียน</span> :
                     <span className="text-slate-400 font-medium">ยังไม่บันทึก</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1 mt-3">
                  <button onClick={() => setStudentStatus(student.id, 'present')} className={`py-2 text-xs font-bold rounded-xl transition-all border ${status === 'present' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'}`}>มา</button>
                  <button onClick={() => setStudentStatus(student.id, 'absent')} className={`py-2 text-xs font-bold rounded-xl transition-all border ${status === 'absent' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'}`}>ขาด</button>
                  <button onClick={() => setStudentStatus(student.id, 'late')} className={`py-2 text-xs font-bold rounded-xl transition-all border ${status === 'late' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'}`}>สาย</button>
                  <button onClick={() => setStudentStatus(student.id, 'leave')} className={`py-2 text-xs font-bold rounded-xl transition-all border ${status === 'leave' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'}`}>ลา</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Attendance;
