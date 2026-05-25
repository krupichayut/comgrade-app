import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { ChalkboardTeacher, DownloadSimple, UploadSimple, Users, Clipboard, Notebook, Trash, Plus } from '@phosphor-icons/react';

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      <h4 className="font-display font-bold text-2xl text-slate-800">{value}</h4>
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

  // Statistics calculation
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

  // Today's Attendance
  const today = new Date().toISOString().split('T')[0];
  const todayKeys = Object.keys(db?.attendance || {}).filter(k => k.startsWith(today));
  
  // Upcoming Homework
  const now = new Date();
  const upcomingHws = (db?.homework || []).filter(h => {
    const due = new Date(h.due);
    const diffDays = (due - now) / 864e5;
    return diffDays >= -1 && diffDays <= 7;
  }).sort((a, b) => a.due.localeCompare(b.due));

  // Handlers for Class Manager
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

  // Export & Import
  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `computer_attendance_backup_${today}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    addToast("ส่งออกข้อมูลสำรองเสร็จสิ้น", "success");
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
          addToast("นำเข้าไฟล์ข้อมูลสำรองสำเร็จเรียบร้อย 🎉", "success");
        } else {
          addToast("โครงสร้างไฟล์ข้อมูลไม่ถูกต้อง", "error");
        }
      } catch (err) {
        addToast("ไม่สามารถวิเคราะห์ข้อมูลในไฟล์ได้", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '-';
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print flex-wrap gap-4">
        <div className="border-l-4 border-indigo-600 pl-3">
          <h2 className="font-display font-bold text-xl text-slate-800">แผงควบคุมหลัก</h2>
          <p className="text-xs text-slate-500">ข้อมูลรวมและพารามิเตอร์ของระบบวิชาคอมพิวเตอร์</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setIsClassModalOpen(true)} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors">
            <ChalkboardTeacher weight="bold" /> จัดการชั้นเรียน
          </button>
          <button onClick={exportJSON} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors">
            <DownloadSimple weight="bold" /> ส่งออกข้อมูลสำรอง
          </button>
          <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors cursor-pointer">
            <UploadSimple weight="bold" /> นำเข้าไฟล์สำรอง
            <input type="file" accept=".json" onChange={importJSON} className="hidden" />
          </label>
        </div>
      </div>
      
      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="นักเรียนทั้งหมด" value={db?.students?.length || 0} icon={<Users weight="fill" />} colorClass="bg-blue-50 text-blue-600" />
        <StatCard title="ห้องเรียน" value={db?.classes?.length || 0} icon={<ChalkboardTeacher weight="fill" />} colorClass="bg-indigo-50 text-indigo-600" />
        <StatCard title="การเข้าเรียนเฉลี่ย" value={`${overallPct}%`} icon={<Clipboard weight="fill" />} colorClass="bg-emerald-50 text-emerald-600" />
        <StatCard title="งาน/กิจกรรม" value={db?.homework?.length || 0} icon={<Notebook weight="fill" />} colorClass="bg-amber-50 text-amber-600" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Attendance Feed */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Clipboard weight="bold" className="text-indigo-600 text-xl" />
            <h3 className="font-display font-semibold text-slate-800">📅 การเช็คชื่อวันนี้</h3>
          </div>
          <div className="space-y-3">
            {todayKeys.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Clipboard weight="bold" className="text-4xl mb-2 mx-auto block" />
                <p className="text-sm">ยังไม่มีการเช็คชื่อสำหรับวันนี้</p>
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
                  <div key={key} className="p-3.5 border rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 text-sm">ชั้นเรียนห้อง {room}</span>
                      <span className="text-xs text-slate-400">คาบที่เรียน: {period}</span>
                    </div>
                    <div className="flex gap-2 text-xs font-bold font-mono">
                      <span className="text-emerald-600">มา: {c.present}</span>
                      <span className="text-rose-500">ขาด: {c.absent}</span>
                      <span className="text-amber-500">สาย: {c.late}</span>
                      <span className="text-indigo-600">ลา: {c.leave}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Upcoming Tasks Feed */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Notebook weight="bold" className="text-amber-500 text-xl" />
            <h3 className="font-display font-semibold text-slate-800">🔔 งานที่ใกล้ครบกำหนดส่ง</h3>
          </div>
          <div className="space-y-3">
            {upcomingHws.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Notebook weight="bold" className="text-4xl mb-2 mx-auto block" />
                <p className="text-sm">ไม่มีกิจกรรมส่งงานใดที่อยู่ใกล้กำหนดส่ง</p>
              </div>
            ) : (
              upcomingHws.slice(0, 4).map(h => (
                <div key={h.id} className="p-3.5 border rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 text-sm line-clamp-1">{h.title}</span>
                    <span className="text-xs text-slate-400">ชั้น: {h.cls} &bull; ประเภท: {h.type}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                    ส่ง {formatThaiDate(h.due)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Class Manager Modal */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="🏫 จัดการชั้นเรียนระบบ">
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="ชื่อชั้นเรียน เช่น ม.1/2" 
            value={newClassName}
            onChange={e => setNewClassName(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-xl outline-none focus:border-indigo-500 bg-slate-50"
          />
          <button onClick={handleAddClass} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-1">
            <Plus weight="bold" /> เพิ่มห้อง
          </button>
        </div>
        
        <div className="border rounded-xl divide-y max-h-64 overflow-y-auto">
          {!db?.classes || db.classes.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">ยังไม่มีชั้นเรียนในระบบ</div>
          ) : (
            [...db.classes].sort((a, b) => a.localeCompare(b, 'th', { numeric: true })).map(c => {
              const studentCount = db?.students?.filter(s => s.cls === c).length || 0;
              return (
                <div key={c} className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm">{c}</span>
                    <span className="text-xs text-slate-400">({studentCount} คน)</span>
                  </div>
                  <button onClick={() => requestDeleteClass(c)} className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all">
                    <Trash weight="bold" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </Modal>

      {/* Confirm Delete Class Modal */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="⚠️ ยืนยันการลบห้องเรียน">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            คุณต้องการลบห้องเรียน <strong>"{classToDelete}"</strong> หรือไม่?
            <br />
            {db?.students?.some(s => s.cls === classToDelete) && <span className="text-rose-500 block mt-2">⚠️ คำเตือน! ชั้นเรียนนี้กำลังมีข้อมูลนักเรียนอยู่ภายใน หากยืนยันที่จะลบ ห้องเรียนของนักเรียนเหล่านั้นจะกลายเป็นค่าว่าง</span>}
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={() => setIsConfirmOpen(false)} className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
              ยกเลิก
            </button>
            <button onClick={confirmDeleteClass} className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-colors">
              ยืนยันการลบ
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Dashboard;
