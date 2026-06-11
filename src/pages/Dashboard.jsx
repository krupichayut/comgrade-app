import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { ChalkboardTeacher, DownloadSimple, UploadSimple, Users, Clipboard, Notebook, Trash, Plus, ChartLineUp, Lightning } from '@phosphor-icons/react';

const StatCard = ({ title, value, icon, colorClass, gradientClass }) => (
  <div className={`premium-card p-5 relative overflow-hidden group`}>
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 transition-transform duration-500 group-hover:scale-150 ${colorClass.split(' ')[0]}`}></div>
    <div className="relative z-10 flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="font-display font-bold text-3xl text-slate-800">{value}</h4>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${gradientClass}`}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { db, setDb } = useContext(AppContext);
  const { addToast } = useToast();

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

  let sumPAndL = 0;
  let totalAttActions = 0;
  
  if (db?.attendance) {
    for (const key in db.attendance) {
      db.attendance[key].forEach(r => {
        totalAttActions++;
        if (r.status === 'present' || r.status === 'late') sumPAndL++;
      });
    }
  }
  const overallPct = totalAttActions > 0 ? Math.round((sumPAndL / totalAttActions) * 100) : 100;

  const today = new Date().toISOString().split('T')[0];
  const todayKeys = Object.keys(db?.attendance || {}).filter(k => k.startsWith(today));
  
  const now = new Date();
  const upcomingHws = (db?.homework || []).filter(h => {
    const due = new Date(h.due);
    const diffDays = (due - now) / 864e5;
    return diffDays >= -1 && diffDays <= 7;
  }).sort((a, b) => a.due.localeCompare(b.due));

  const handleAddClass = () => {
    const name = newClassName.trim();
    if (!name) {
      addToast("กรุณากรอกชื่อชั้นเรียนใหม่ เช่น ม.1/2", "error");
      return;
    }
    if (db?.classes?.includes(name)) {
      addToast("ชั้นเรียนนี้มีอยู่ในระบบแล้ว", "error");
      return;
    }
    const newDb = { ...db };
    if (!newDb.classes) newDb.classes = [];
    newDb.classes.push(name);
    setDb(newDb);
    setNewClassName('');
    addToast(`เพิ่มห้องเรียน ${name} เรียบร้อยแล้ว`, "success");
  };

  const requestDeleteClass = (c) => {
    setClassToDelete(c);
    setIsConfirmOpen(true);
  };

  const confirmDeleteClass = () => {
    if (!classToDelete) return;
    const inUse = db?.students?.some(s => s.cls === classToDelete);
    
    const newDb = { ...db };
    newDb.classes = newDb.classes.filter(c => c !== classToDelete);
    if (inUse) {
      newDb.students.forEach(s => {
        if (s.cls === classToDelete) s.cls = "";
      });
    }

    setDb(newDb);
    addToast("ลบชั้นเรียนเสร็จเรียบร้อย", "success");
    setIsConfirmOpen(false);
    setClassToDelete(null);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `comgrade_backup_${today}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    addToast("ดาวน์โหลดไฟล์สำรองเรียบร้อย", "success");
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.classes && imported.students) {
          setDb(imported);
          addToast("ฟื้นฟูข้อมูลจากไฟล์สำรองสำเร็จ 🎉", "success");
        } else {
          addToast("ไฟล์ไม่ถูกต้อง หรือไม่ใช่ไฟล์ข้อมูลของระบบนี้", "error");
        }
      } catch (err) {
        addToast("ไม่สามารถอ่านข้อมูลในไฟล์ได้", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '-';
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print bg-white/40 p-2 rounded-2xl backdrop-blur-md border border-white/60 shadow-sm">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scroll">
          <button onClick={() => setIsClassModalOpen(true)} className="btn-premium whitespace-nowrap px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-indigo-500/30 shadow-lg">
            <ChalkboardTeacher weight="duotone" className="text-lg" /> โครงสร้างชั้นเรียน
          </button>
          <button onClick={exportJSON} className="btn-premium whitespace-nowrap px-4 py-2.5 bg-white text-slate-700 font-bold rounded-xl text-sm flex items-center gap-2 border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600">
            <DownloadSimple weight="bold" /> แบ็คอัปข้อมูล
          </button>
          <label className="btn-premium whitespace-nowrap px-4 py-2.5 bg-white text-slate-700 font-bold rounded-xl text-sm flex items-center gap-2 border border-slate-200 shadow-sm hover:border-emerald-400 hover:text-emerald-600 cursor-pointer">
            <UploadSimple weight="bold" /> นำเข้าข้อมูล
            <input type="file" accept=".json" onChange={importJSON} className="hidden" />
          </label>
        </div>
      </div>
      
      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="นักเรียนในระบบ" value={db?.students?.length || 0} icon={<Users weight="duotone" className="text-white" />} colorClass="bg-blue-500" gradientClass="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/40" />
        <StatCard title="จำนวนห้องเรียน" value={db?.classes?.length || 0} icon={<ChalkboardTeacher weight="duotone" className="text-white" />} colorClass="bg-indigo-500" gradientClass="bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-indigo-500/40" />
        <StatCard title="อัตราเข้าเรียนเฉลี่ย" value={`${overallPct}%`} icon={<ChartLineUp weight="duotone" className="text-white" />} colorClass="bg-emerald-500" gradientClass="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/40" />
        <StatCard title="งานและกิจกรรม" value={db?.homework?.length || 0} icon={<Notebook weight="duotone" className="text-white" />} colorClass="bg-amber-500" gradientClass="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/40" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Attendance Feed */}
        <div className="premium-card p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Clipboard weight="duotone" className="text-2xl" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800">การเช็คชื่อวันนี้</h3>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">{formatThaiDate(today)}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {todayKeys.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Clipboard weight="duotone" className="text-5xl mb-3 text-slate-200" />
                <p className="text-sm font-medium">ยังไม่มีรายการเช็คชื่อของวันนี้</p>
              </div>
            ) : (
              todayKeys.map(key => {
                const parts = key.split('_');
                const room = parts[1];
                const period = parts[2];
                const records = db.attendance[key];
                const c = { present: 0, absent: 0, late: 0, leave: 0 };
                records.forEach(r => { if (c[r.status] !== undefined) c[r.status]++; });

                return (
                  <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border shadow-sm flex items-center justify-center font-display font-bold text-indigo-900 text-xs">
                        ม.{room}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-sm block">คาบที่ {period}</span>
                        <span className="text-xs text-slate-400 font-medium">เช็คชื่อแล้ว {records.length} คน</span>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs font-bold font-mono">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg">มา {c.present}</span>
                      <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg">ขาด {c.absent}</span>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg">สาย {c.late}</span>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg">ลา {c.leave}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Upcoming Tasks Feed */}
        <div className="premium-card p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Lightning weight="duotone" className="text-2xl" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800">งานที่ใกล้กำหนดส่ง</h3>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">7 วันนี้</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {upcomingHws.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Lightning weight="duotone" className="text-5xl mb-3 text-slate-200" />
                <p className="text-sm font-medium">ไม่มีกิจกรรมส่งงานใดที่อยู่ใกล้กำหนด</p>
              </div>
            ) : (
              upcomingHws.slice(0, 5).map(h => (
                <div key={h.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all flex items-center justify-between gap-3">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-slate-800 text-sm truncate">{h.title}</span>
                    <span className="text-xs text-slate-500 font-medium mt-0.5">ชั้น: <span className="text-indigo-600">{h.cls}</span> &bull; {h.type}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg mb-1 whitespace-nowrap">
                      ส่ง {formatThaiDate(h.due)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{h.maxScore} คะแนน</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Class Manager Modal */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="🏫 โครงสร้างชั้นเรียนระบบ">
        <div className="flex gap-2 mb-5 p-1 bg-slate-50 rounded-2xl border">
          <input 
            type="text" 
            placeholder="เพิ่มห้องเรียนใหม่ เช่น ม.1/2" 
            value={newClassName}
            onChange={e => setNewClassName(e.target.value)}
            className="flex-1 px-4 py-2 outline-none bg-transparent font-medium"
          />
          <button onClick={handleAddClass} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1 active:scale-95">
            <Plus weight="bold" /> เพิ่มห้อง
          </button>
        </div>
        
        <div className="rounded-2xl border border-slate-100 divide-y max-h-64 overflow-y-auto custom-scrollbar">
          {!db?.classes || db.classes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm font-medium">ยังไม่มีชั้นเรียนในระบบ</div>
          ) : (
            [...db.classes].sort((a, b) => a.localeCompare(b, 'th', { numeric: true })).map(c => {
              const studentCount = db?.students?.filter(s => s.cls === c).length || 0;
              return (
                <div key={c} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-xs">{c.substring(0,2)}</div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">{c}</span>
                      <span className="text-xs text-slate-400 font-medium">นักเรียน {studentCount} คน</span>
                    </div>
                  </div>
                  <button onClick={() => requestDeleteClass(c)} className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white">
                    <Trash weight="fill" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="⚠️ ยืนยันการลบห้องเรียน">
        <div className="space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            คุณต้องการลบห้องเรียน <strong className="text-rose-600 text-base">"{classToDelete}"</strong> ออกจากระบบใช่หรือไม่?
            <br />
            {db?.students?.some(s => s.cls === classToDelete) && <span className="block mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">⚠️ คำเตือน! มีนักเรียนอยู่ในห้องนี้ ข้อมูลนักเรียนจะไม่หายไป แต่ช่อง 'ชั้นเรียน' ของเด็กๆ จะกลายเป็นค่าว่างครับ</span>}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setIsConfirmOpen(false)} className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
              ยกเลิก
            </button>
            <button onClick={confirmDeleteClass} className="py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">
              ยืนยันการลบ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
