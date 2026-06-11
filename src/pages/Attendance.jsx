import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { CheckSquare, CalendarBlank, Chalkboard, Clock, FloppyDisk, Checks, UserCircle } from '@phosphor-icons/react';

const Attendance = () => {
  const { db, setDb } = useContext(AppContext);
  const { addToast } = useToast();

  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attClass, setAttClass] = useState(db?.classes?.[0] || '');
  const [attPeriod, setAttPeriod] = useState('คาบที่ 1 (08:30-09:30)');
  const [lateTimeThreshold, setLateTimeThreshold] = useState('08:45');
  const [autoLate, setAutoLate] = useState(true);

  const studentsInClass = useMemo(() => {
    return db?.students?.filter(s => s.cls === attClass).sort((a, b) => a.no - b.no) || [];
  }, [db?.students, attClass]);

  const [currentAtt, setCurrentAtt] = useState({});

  useEffect(() => {
    if (!attClass) return;
    const key = `${attDate}_${attClass}_${attPeriod}`;
    const saved = db?.attendance?.[key];
    const newAtt = {};

    studentsInClass.forEach(s => {
      const existing = saved?.find(x => x.studentId === s.id);
      newAtt[s.id] = existing ? { status: existing.status, time: existing.checkTime } : { status: '', time: '' };
    });
    setCurrentAtt(newAtt);
  }, [attDate, attClass, attPeriod, db?.attendance, studentsInClass]);

  const toggleStatus = (studentId, status) => {
    setCurrentAtt(prev => {
      const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      let finalStatus = status;

      if (autoLate && (status === 'present' || status === 'late')) {
        if (nowTime > lateTimeThreshold) {
          finalStatus = 'late';
        } else {
          finalStatus = 'present';
        }
      }

      const prevStatus = prev[studentId].status;
      return {
        ...prev,
        [studentId]: {
          status: prevStatus === finalStatus ? '' : finalStatus,
          time: prevStatus === finalStatus ? '' : nowTime
        }
      };
    });
  };

  const setAllPresent = () => {
    setCurrentAtt(prev => {
      const newAtt = { ...prev };
      const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      let finalStatus = 'present';
      if (autoLate && nowTime > lateTimeThreshold) {
        finalStatus = 'late';
      }

      Object.keys(newAtt).forEach(id => {
        newAtt[id] = { status: finalStatus, time: nowTime };
      });
      return newAtt;
    });
    addToast("ตั้งค่าให้ทุกคนมาเรียนเรียบร้อย", "info");
  };

  const saveAttendance = () => {
    const key = `${attDate}_${attClass}_${attPeriod}`;
    const recordsToSave = [];

    Object.keys(currentAtt).forEach(id => {
      if (currentAtt[id].status) {
        recordsToSave.push({
          studentId: parseInt(id),
          status: currentAtt[id].status,
          checkTime: currentAtt[id].time
        });
      }
    });

    const newDb = { ...db };
    if (!newDb.attendance) newDb.attendance = {};
    
    if (recordsToSave.length === 0) {
      delete newDb.attendance[key];
    } else {
      newDb.attendance[key] = recordsToSave;
    }

    setDb(newDb);
    addToast(`บันทึกข้อมูลการเช็คชื่อห้อง ${attClass} เรียบร้อยแล้ว`, "success");
  };

  const stats = { total: studentsInClass.length, present: 0, absent: 0, late: 0, leave: 0, uncheck: 0 };
  Object.values(currentAtt).forEach(v => {
    if (v.status) stats[v.status]++;
    else stats.uncheck++;
  });

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="glass-card p-6 flex flex-col xl:flex-row xl:items-center gap-6 justify-between z-10 relative">
        <div className="flex flex-wrap gap-4 w-full xl:w-auto">
          <div className="w-full sm:w-40 glass-panel p-2 flex items-center border border-white">
            <CalendarBlank weight="duotone" className="text-slate-400 text-xl mx-2" />
            <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} className="w-full bg-transparent outline-none text-sm font-bold text-slate-700" />
          </div>
          <div className="w-full sm:w-36 glass-panel p-2 flex items-center border border-white">
            <Chalkboard weight="duotone" className="text-indigo-400 text-xl mx-2 shrink-0" />
            <select value={attClass} onChange={e => setAttClass(e.target.value)} className="w-full bg-transparent outline-none text-sm font-bold text-indigo-700 cursor-pointer">
              {db?.classes?.length === 0 && <option value="">-</option>}
              {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
            </select>
          </div>
          <div className="w-full sm:w-64 glass-panel p-2 flex items-center border border-white">
            <Clock weight="duotone" className="text-slate-400 text-xl mx-2 shrink-0" />
            <select value={attPeriod} onChange={e => setAttPeriod(e.target.value)} className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 cursor-pointer">
              <option value="คาบที่ 1 (08:30-09:30)">คาบที่ 1 (08:30-09:30)</option>
              <option value="คาบที่ 2 (09:30-10:30)">คาบที่ 2 (09:30-10:30)</option>
              <option value="คาบที่ 3 (10:30-11:30)">คาบที่ 3 (10:30-11:30)</option>
              <option value="คาบที่ 4 (12:30-13:30)">คาบที่ 4 (12:30-13:30)</option>
              <option value="คาบที่ 5 (13:30-14:30)">คาบที่ 5 (13:30-14:30)</option>
              <option value="คาบที่ 6 (14:30-15:30)">คาบที่ 6 (14:30-15:30)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 w-full xl:w-auto">
          <button onClick={setAllPresent} className="flex-1 xl:flex-none px-5 py-3 btn-glass rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-indigo-600">
            <Checks weight="bold" className="text-lg" /> มาเรียนทั้งหมด
          </button>
          <button onClick={saveAttendance} className="flex-1 xl:flex-none px-6 py-3 btn-primary-glass rounded-xl text-sm font-bold flex items-center justify-center gap-2">
            <FloppyDisk weight="fill" className="text-lg" /> บันทึกการเช็คชื่อ
          </button>
        </div>
      </div>

      {/* Auto-late Setting Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white/40 backdrop-blur-md border border-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
          <Clock weight="fill" className="text-lg" />
          <span>ระบบคำนวณสายอัตโนมัติ:</span>
        </div>
        <div className="flex items-center gap-3 bg-white/60 px-3 py-1.5 rounded-lg border border-white">
          <span className="text-xs text-slate-500 font-semibold">เกณฑ์เวลาสาย</span>
          <input type="time" value={lateTimeThreshold} onChange={e => setLateTimeThreshold(e.target.value)} className="outline-none text-sm font-bold text-rose-600 bg-transparent" />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer select-none">
          <input type="checkbox" checked={autoLate} onChange={e => setAutoLate(e.target.checked)} className="w-4 h-4 text-indigo-500 rounded focus:ring-indigo-500 accent-indigo-500" />
          เปิดใช้ Auto-Late เมื่อกดปุ่ม "มา" หรือ "สาย"
        </label>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">ทั้งหมด</p>
          <p className="font-display font-bold text-3xl text-slate-800">{stats.total}</p>
        </div>
        <div className="glass-panel border border-emerald-200/50 p-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white/60 to-emerald-50/60">
          <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">มาเรียน</p>
          <p className="font-display font-bold text-3xl text-emerald-600">{stats.present}</p>
        </div>
        <div className="glass-panel border border-rose-200/50 p-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white/60 to-rose-50/60">
          <p className="text-[10px] font-bold text-rose-500 uppercase mb-1">ขาดเรียน</p>
          <p className="font-display font-bold text-3xl text-rose-500">{stats.absent}</p>
        </div>
        <div className="glass-panel border border-amber-200/50 p-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white/60 to-amber-50/60">
          <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">มาสาย</p>
          <p className="font-display font-bold text-3xl text-amber-500">{stats.late}</p>
        </div>
        <div className="glass-panel border border-indigo-200/50 p-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white/60 to-indigo-50/60">
          <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">ลา</p>
          <p className="font-display font-bold text-3xl text-indigo-500">{stats.leave}</p>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center opacity-60">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">ยังไม่เช็ค</p>
          <p className="font-display font-bold text-3xl text-slate-600">{stats.uncheck}</p>
        </div>
      </div>

      {/* Grid List of Students */}
      {studentsInClass.length === 0 ? (
        <div className="glass-card p-16 text-center text-slate-400">
          <UserCircle weight="duotone" className="text-6xl mx-auto mb-4 text-slate-300" />
          <p className="font-display font-medium text-lg text-slate-600">ไม่พบข้อมูลนักเรียนในชั้นเรียนนี้</p>
          <p className="text-sm mt-2">โปรดไปที่เมนู 'จัดการนักเรียน' เพื่อเพิ่มรายชื่อ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
          {studentsInClass.map(s => {
            const st = currentAtt[s.id] || { status: '', time: '' };
            
            let cardStyle = "bg-white/50 border-white/80 hover:bg-white/80";
            let statusDot = "bg-slate-300";
            let statusText = "ยังไม่เช็ค";
            let textColor = "text-slate-400";
            
            if (st.status === 'present') { cardStyle = "bg-emerald-50/80 border-emerald-200 shadow-[0_4px_12px_rgba(16,185,129,0.1)]"; statusDot = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"; statusText = `มาเรียน (${st.time})`; textColor = "text-emerald-700"; }
            if (st.status === 'absent') { cardStyle = "bg-rose-50/80 border-rose-200 shadow-[0_4px_12px_rgba(244,63,94,0.1)]"; statusDot = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"; statusText = `ขาดเรียน`; textColor = "text-rose-700"; }
            if (st.status === 'late') { cardStyle = "bg-amber-50/80 border-amber-200 shadow-[0_4px_12px_rgba(245,158,11,0.1)]"; statusDot = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"; statusText = `มาสาย (${st.time})`; textColor = "text-amber-700"; }
            if (st.status === 'leave') { cardStyle = "bg-indigo-50/80 border-indigo-200 shadow-[0_4px_12px_rgba(99,102,241,0.1)]"; statusDot = "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"; statusText = `ลา`; textColor = "text-indigo-700"; }

            return (
              <div key={s.id} className={`rounded-3xl border backdrop-blur-md p-4 transition-all duration-300 ${cardStyle}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">เลขที่ {s.no}</span>
                    <h4 className="font-display font-bold text-slate-800 text-base leading-tight truncate">{s.name}</h4>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/80 shadow-sm flex items-center justify-center border font-bold text-xs text-slate-500">
                    {s.gender === 'หญิง' ? 'ญ' : 'ช'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-4 text-[11px] font-bold bg-white/40 w-fit px-2 py-1 rounded-md">
                  <span className={`w-2 h-2 rounded-full inline-block ${statusDot}`}></span>
                  <span className={`${textColor}`}>{statusText}</span>
                </div>
                
                <div className="grid grid-cols-4 gap-1.5 h-10">
                  <button onClick={() => toggleStatus(s.id, 'present')} className={`rounded-xl font-bold text-xs transition-all ${st.status === 'present' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/60 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'}`}>มา</button>
                  <button onClick={() => toggleStatus(s.id, 'absent')} className={`rounded-xl font-bold text-xs transition-all ${st.status === 'absent' ? 'bg-rose-500 text-white shadow-md' : 'bg-white/60 text-slate-600 hover:bg-rose-100 hover:text-rose-700'}`}>ขาด</button>
                  <button onClick={() => toggleStatus(s.id, 'late')} className={`rounded-xl font-bold text-xs transition-all ${st.status === 'late' ? 'bg-amber-500 text-white shadow-md' : 'bg-white/60 text-slate-600 hover:bg-amber-100 hover:text-amber-700'}`}>สาย</button>
                  <button onClick={() => toggleStatus(s.id, 'leave')} className={`rounded-xl font-bold text-xs transition-all ${st.status === 'leave' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white/60 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700'}`}>ลา</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Attendance;
