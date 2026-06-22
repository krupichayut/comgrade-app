import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Users, UsersThree, Plus, PencilSimple, Trash, UserCircle, MagnifyingGlass, Funnel } from '@phosphor-icons/react';
import Modal from '../components/Modal';

const Students = () => {
  const { db, setDb } = useContext(AppContext);
  const { addToast } = useToast();
  
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('ทุกชั้นเรียน');
  
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const [studentForm, setStudentForm] = useState({ id: '', no: '', name: '', cls: '', gender: 'ชาย' });
  const [bulkText, setBulkText] = useState('');
  const [bulkClass, setBulkClass] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);

  const getStudentStats = (id) => {
    let present = 0, absent = 0, late = 0, leave = 0;
    if (db?.attendance) {
      for (const key in db.attendance) {
        const r = db.attendance[key].find(x => x.studentId === id);
        if (r) {
          if (r.status === 'present') present++;
          else if (r.status === 'absent') absent++;
          else if (r.status === 'late') late++;
          else if (r.status === 'leave') leave++;
        }
      }
    }
    return { present, absent, late, leave };
  };

  const filteredStudents = db?.students?.filter(s => {
    const matchClass = classFilter === 'ทุกชั้นเรียน' || s.cls === classFilter;
    const matchSearch = search === '' || s.name.includes(search) || s.no.toString() === search;
    return matchClass && matchSearch;
  })?.sort((a, b) => {
    const roomComp = a.cls.localeCompare(b.cls, 'th', { numeric: true });
    if (roomComp !== 0) return roomComp;
    return a.no - b.no;
  }) || [];

  const handleOpenAdd = () => {
    setStudentForm({ id: '', no: '', name: '', cls: db?.classes?.[0] || '', gender: 'ชาย' });
    setIsStudentModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setStudentForm({ ...student });
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = () => {
    if (!studentForm.name || !studentForm.no) return addToast("กรุณากรอกข้อมูลให้ครบถ้วน", "error");

    const newDb = { ...db };
    newDb.students = [...(newDb.students || [])]; // Clone array to trigger React render properly
    const no = parseInt(studentForm.no);

    if (studentForm.id) {
      const idx = newDb.students.findIndex(s => s.id === studentForm.id);
      if (idx !== -1) {
        newDb.students[idx] = { ...studentForm, no };
      }
      addToast("อัปเดตข้อมูลนักเรียนเรียบร้อยแล้ว", "success");
    } else {
      if (!newDb.idCounter) newDb.idCounter = 1;
      const newStudent = { ...studentForm, id: newDb.idCounter++, no };
      newDb.students.push(newStudent);
      addToast("เพิ่มนักเรียนใหม่เรียบร้อยแล้ว", "success");
    }

    setDb(newDb);
    setIsStudentModalOpen(false);
  };

  const handleDeleteRequest = (student) => {
    setItemToDelete(student);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    const newDb = { ...db };
    newDb.students = newDb.students.filter(s => s.id !== itemToDelete.id);
    for (const key in newDb.scores) {
      if (key.endsWith(`_${itemToDelete.id}`)) delete newDb.scores[key];
    }
    setDb(newDb);
    addToast("ลบข้อมูลเรียบร้อย", "info");
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleBulkImport = () => {
    if (!bulkClass || !bulkText.trim()) return addToast("ข้อมูลไม่ครบถ้วน", "error");

    const newDb = { ...db };
    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l !== "");
    let successCount = 0;

    const existingInClass = newDb.students.filter(s => s.cls === bulkClass);
    let autoNo = existingInClass.length > 0 ? Math.max(...existingInClass.map(s => s.no)) + 1 : 1;

    lines.forEach(line => {
      let cleanName = line;
      let number = autoNo;

      const numRegex = /^(\d+)\s*[\.\-\/\s]+\s*(.+)$/;
      const match = line.match(numRegex);
      if (match) {
        number = parseInt(match[1]);
        cleanName = match[2].trim();
      } else {
        autoNo++;
      }

      let gender = "ชาย"; 
      if (cleanName.includes("ด.ญ.") || cleanName.includes("เด็กหญิง") || cleanName.includes("น.ส.") || cleanName.includes("ด.ญ")) gender = "หญิง";

      newDb.students.push({ id: newDb.idCounter++, name: cleanName, no: number, cls: bulkClass, gender });
      successCount++;
    });

    setDb(newDb);
    addToast(`นำเข้าสำเร็จ ${successCount} รายการ`, "success");
    setIsBulkModalOpen(false);
    setBulkText('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="glass-card p-6 flex flex-col xl:flex-row gap-6 items-center justify-between z-10 relative">
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Users weight="duotone" className="text-3xl" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-slate-800">ทำเนียบนักเรียน</h3>
            <p className="text-sm text-slate-500 font-medium">จัดการรายชื่อ ข้อมูลส่วนตัว และสถานะ</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
          <div className="relative w-full sm:w-64">
            <MagnifyingGlass weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือ เลขที่..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 outline-none text-sm focus:bg-white focus:ring-2 focus:ring-pink-200 transition-all font-medium text-slate-700" 
            />
          </div>
          
          <div className="relative w-full sm:w-auto">
            <Funnel weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select 
              value={classFilter} 
              onChange={e => setClassFilter(e.target.value)} 
              className="w-full sm:w-auto pl-10 pr-4 py-3 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 outline-none text-sm focus:bg-white focus:ring-2 focus:ring-pink-200 transition-all font-bold text-slate-700 cursor-pointer appearance-none"
            >
              <option value="ทุกชั้นเรียน">แสดงทุกชั้นเรียน</option>
              {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
            </select>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => {
                if (!db?.classes?.length) return addToast("โปรดเพิ่มชั้นเรียนก่อนนำเข้า", "error");
                setBulkClass(db.classes[0]);
                setIsBulkModalOpen(true);
              }}
              className="flex-1 sm:flex-none px-4 py-3 btn-glass text-pink-600 font-bold rounded-2xl text-sm flex items-center justify-center gap-2"
            >
              <UsersThree weight="fill" /> นำเข้าทีละห้อง
            </button>
            <button 
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-none px-5 py-3 btn-primary-glass bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-500/30 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2"
            >
              <Plus weight="bold" /> เพิ่มรายบุคคล
            </button>
          </div>
        </div>
      </div>

      {/* Main Glass Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-5 px-6 text-center w-16">เลขที่</th>
                <th className="py-5 px-4">โปรไฟล์นักเรียน</th>
                <th className="py-5 px-4 w-28 text-center">ชั้นเรียน</th>
                <th className="py-5 px-4 w-24 text-center">เพศ</th>
                <th className="py-5 px-4 text-center text-emerald-600">มาเรียน</th>
                <th className="py-5 px-4 text-center text-rose-500">ขาดเรียน</th>
                <th className="py-5 px-4 text-center text-amber-500">สาย</th>
                <th className="py-5 px-4 text-center text-indigo-600">ลา</th>
                <th className="py-5 px-6 text-center w-32 no-print">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-20 text-center text-slate-400">
                    <UserCircle weight="duotone" className="text-7xl mx-auto mb-4 text-slate-300" />
                    <p className="font-display font-medium text-xl text-slate-500">ไม่พบรายชื่อนักเรียนในระบบ</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const st = getStudentStats(student.id);
                  const total = st.present + st.absent + st.late + st.leave;
                  const rate = total > 0 ? Math.round(((st.present + st.late) / total) * 100) : 100;

                  return (
                    <tr key={student.id} className="hover:bg-white/50 transition-colors group">
                      <td className="py-4 px-6 text-center font-bold text-slate-400 group-hover:text-pink-500 transition-colors">{student.no}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-sm shadow-md ${student.gender === 'หญิง' ? 'bg-gradient-to-br from-pink-400 to-rose-400' : 'bg-gradient-to-br from-sky-400 to-blue-500'}`}>
                            {student.name.substring(0, 1)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-base">{student.name}</div>
                            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-1">
                              <span className={`w-2 h-2 rounded-full inline-block shadow-sm ${rate >= 80 ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                              อัตราเข้าเรียน {rate}%
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-3 py-1.5 bg-white/60 border border-white text-slate-700 text-xs font-bold rounded-xl shadow-sm">{student.cls || "-"}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border shadow-sm ${student.gender === 'หญิง' ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-sky-50 border-sky-200 text-sky-600'}`}>
                          {student.gender}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-emerald-600 bg-emerald-50/20">{st.present}</td>
                      <td className="py-4 px-4 text-center font-bold text-rose-500 bg-rose-50/20">{st.absent}</td>
                      <td className="py-4 px-4 text-center font-bold text-amber-500 bg-amber-50/20">{st.late}</td>
                      <td className="py-4 px-4 text-center font-bold text-indigo-600 bg-indigo-50/20">{st.leave}</td>
                      <td className="py-4 px-6 text-center no-print">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEdit(student)} className="w-10 h-10 rounded-xl btn-glass flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm"><PencilSimple weight="bold" /></button>
                          <button onClick={() => handleDeleteRequest(student)} className="w-10 h-10 rounded-xl btn-glass flex items-center justify-center text-slate-500 hover:text-rose-600 shadow-sm"><Trash weight="bold" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} title={studentForm.id ? "✏️ แก้ไขข้อมูลนักเรียน" : "➕ เพิ่มนักเรียนใหม่"}>
        <div className="grid grid-cols-2 gap-5 p-2">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">ชื่อ-นามสกุล <span className="text-rose-500">*</span></label>
            <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-200 bg-slate-50 font-bold text-slate-800 transition-all" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">เลขที่</label>
            <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-200 bg-slate-50 font-bold text-slate-800 transition-all" value={studentForm.no} onChange={e => setStudentForm({...studentForm, no: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">ชั้นเรียน</label>
            <select className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-200 bg-slate-50 font-bold text-slate-800 transition-all" value={studentForm.cls} onChange={e => setStudentForm({...studentForm, cls: e.target.value})}>
              {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">เพศ</label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 has-[:checked]:border-sky-400 has-[:checked]:bg-sky-50 has-[:checked]:text-sky-700 font-bold text-sm text-slate-500 transition-all">
                <input type="radio" value="ชาย" checked={studentForm.gender === 'ชาย'} onChange={e => setStudentForm({...studentForm, gender: e.target.value})} className="hidden" />👦 ชาย
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 has-[:checked]:border-pink-400 has-[:checked]:bg-pink-50 has-[:checked]:text-pink-700 font-bold text-sm text-slate-500 transition-all">
                <input type="radio" value="หญิง" checked={studentForm.gender === 'หญิง'} onChange={e => setStudentForm({...studentForm, gender: e.target.value})} className="hidden" />👧 หญิง
              </label>
            </div>
          </div>
          <div className="col-span-2 mt-2">
            <button onClick={handleSaveStudent} className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/30 transition-all active:scale-95">บันทึกข้อมูล</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} title="📥 นำเข้ารายชื่อนักเรียนด่วน">
        <div className="space-y-5 p-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">เลือกห้องเรียน</label>
            <select className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-200 bg-slate-50 font-bold text-slate-800 transition-all" value={bulkClass} onChange={e => setBulkClass(e.target.value)}>
              {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">รายชื่อนักเรียน (คัดลอกจาก Excel)</label>
            <textarea className="w-full px-4 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-200 bg-slate-50 text-sm h-56 resize-none font-medium custom-scrollbar transition-all" placeholder="1. ด.ช. รักเรียน\n2. ด.ญ. ดีใจ" value={bulkText} onChange={e => setBulkText(e.target.value)}></textarea>
          </div>
          <button onClick={handleBulkImport} className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/30 transition-all active:scale-95">ยืนยันการนำเข้า</button>
        </div>
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="⚠️ ยืนยันการลบข้อมูล">
        <div className="space-y-5">
          <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-center">
            <p className="text-sm text-slate-700 font-medium">ลบข้อมูลของ <strong className="text-rose-600 text-base">{itemToDelete?.name}</strong>?</p>
            <p className="text-xs text-rose-500 mt-2">ประวัติการเช็คชื่อและคะแนนทั้งหมดจะหายไปและไม่สามารถกู้คืนได้</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={() => setIsConfirmOpen(false)} className="py-3 bg-slate-100 font-bold rounded-xl text-slate-600">ยกเลิก</button>
            <button onClick={confirmDelete} className="py-3 bg-rose-500 text-white font-bold rounded-xl shadow-md">ยืนยันลบ</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Students;
