import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Users, UsersThree, Plus, PencilSimple, Trash, UserCircle, MagnifyingGlass } from '@phosphor-icons/react';
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
    if (!studentForm.name.trim()) {
      addToast("กรุณากรอกชื่อและสกุลของนักเรียน", "error");
      return;
    }

    const newDb = { ...db };
    const no = parseInt(studentForm.no) || 0;

    if (studentForm.id) {
      const idx = newDb.students.findIndex(s => s.id === studentForm.id);
      if (idx !== -1) {
        newDb.students[idx] = { ...studentForm, no };
      }
      addToast("อัปเดตข้อมูลนักเรียนเรียบร้อยแล้ว", "success");
    } else {
      newDb.students.push({
        id: newDb.idCounter++,
        name: studentForm.name,
        no,
        cls: studentForm.cls,
        gender: studentForm.gender
      });
      addToast("บันทึกข้อมูลนักเรียนใหม่เรียบร้อยแล้ว", "success");
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
      if (key.endsWith(`_${itemToDelete.id}`)) {
        delete newDb.scores[key];
      }
    }
    
    setDb(newDb);
    addToast("ลบข้อมูลนักเรียนเรียบร้อย", "info");
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleBulkImport = () => {
    if (!bulkClass) {
      addToast("กรุณาเลือกชั้นเรียน", "error");
      return;
    }
    if (!bulkText.trim()) {
      addToast("กรุณากรอกรายชื่อนักเรียนก่อนกดนำเข้า", "error");
      return;
    }

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
      if (cleanName.includes("ด.ญ.") || cleanName.includes("เด็กหญิง") || cleanName.includes("น.ส.") || cleanName.includes("นางสาว") || cleanName.includes("ด.ญ")) {
        gender = "หญิง";
      }

      newDb.students.push({
        id: newDb.idCounter++,
        name: cleanName,
        no: number,
        cls: bulkClass,
        gender: gender
      });
      successCount++;
    });

    setDb(newDb);
    addToast(`นำเข้ารายชื่อห้อง ${bulkClass} สำเร็จ ${successCount} รายการ ⚡`, "success");
    setIsBulkModalOpen(false);
    setBulkText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="premium-card p-4 flex flex-col lg:flex-row gap-4 items-center justify-between z-10 relative">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center shadow-inner">
            <Users weight="duotone" className="text-2xl" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-slate-800">ทำเนียบรายชื่อนักเรียน</h3>
            <p className="text-xs text-slate-500 font-medium">จัดการข้อมูลส่วนตัวและดูสถิติย้อนหลัง</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <div className="relative w-full sm:w-56">
            <MagnifyingGlass weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือ เลขที่..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50" 
            />
          </div>
          <select 
            value={classFilter} 
            onChange={e => setClassFilter(e.target.value)} 
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700"
          >
            <option value="ทุกชั้นเรียน">แสดงทุกชั้นเรียน</option>
            {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
          </select>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => {
                if (!db?.classes?.length) {
                  addToast("กรุณาเพิ่มชั้นเรียนในเมนู 'ภาพรวม' ก่อนนำเข้า", "error");
                  return;
                }
                setBulkClass(db.classes[0]);
                setIsBulkModalOpen(true);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors btn-premium border border-indigo-100"
            >
              <UsersThree weight="fill" /> นำเข้าทีละห้อง
            </button>
            <button 
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all btn-premium"
            >
              <Plus weight="bold" /> เพิ่มทีละคน
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-5 text-center w-16">เลขที่</th>
                <th className="py-4 px-4">ข้อมูลนักเรียน</th>
                <th className="py-4 px-4 w-28 text-center">ชั้นเรียน</th>
                <th className="py-4 px-4 w-24 text-center">เพศ</th>
                <th className="py-4 px-4 text-center text-emerald-600">มา</th>
                <th className="py-4 px-4 text-center text-rose-500">ขาด</th>
                <th className="py-4 px-4 text-center text-amber-500">สาย</th>
                <th className="py-4 px-4 text-center text-indigo-600">ลา</th>
                <th className="py-4 px-5 text-center w-32 no-print">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-400 bg-slate-50/50">
                    <UserCircle weight="duotone" className="text-6xl mx-auto mb-3 text-slate-300" />
                    <p className="font-display font-medium text-lg">ไม่พบรายชื่อนักเรียน</p>
                    <p className="text-xs mt-1">ลองเปลี่ยนคำค้นหา หรือเพิ่มนักเรียนใหม่เข้าสู่ระบบ</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const st = getStudentStats(student.id);
                  const total = st.present + st.absent + st.late + st.leave;
                  const rate = total > 0 ? Math.round(((st.present + st.late) / total) * 100) : 100;

                  return (
                    <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="py-3 px-5 text-center font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">{student.no}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm ${student.gender === 'หญิง' ? 'bg-gradient-to-br from-fuchsia-400 to-pink-500' : 'bg-gradient-to-br from-sky-400 to-blue-500'}`}>
                            {student.name.substring(0, 1)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{student.name}</div>
                            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full inline-block ${rate >= 80 ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`}></span>
                              อัตราเข้าเรียน {rate}%
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg">{student.cls || "-"}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${student.gender === 'หญิง' ? 'bg-fuchsia-50 text-fuchsia-700' : 'bg-sky-50 text-sky-700'}`}>
                          {student.gender}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">{st.present}</td>
                      <td className="py-3 px-4 text-center font-bold text-rose-500">{st.absent}</td>
                      <td className="py-3 px-4 text-center font-bold text-amber-500">{st.late}</td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-600">{st.leave}</td>
                      <td className="py-3 px-5 text-center no-print">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEdit(student)}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-500 flex items-center justify-center transition-all shadow-sm"
                            title="แก้ไข"
                          >
                            <PencilSimple weight="bold" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRequest(student)}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 text-slate-500 flex items-center justify-center transition-all shadow-sm"
                            title="ลบ"
                          >
                            <Trash weight="bold" />
                          </button>
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

      {/* Student Add/Edit Modal */}
      <Modal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} title={studentForm.id ? "✏️ แก้ไขข้อมูลนักเรียน" : "➕ เพิ่มนักเรียนใหม่"}>
        <div className="grid grid-cols-2 gap-5 p-1">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ชื่อ-นามสกุล <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 font-medium text-slate-800" 
              placeholder="ด.ช. สมชาย รักเรียน" 
              value={studentForm.name}
              onChange={e => setStudentForm({...studentForm, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">เลขที่</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 font-medium text-slate-800" 
              placeholder="Auto" 
              value={studentForm.no}
              onChange={e => setStudentForm({...studentForm, no: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ชั้นเรียน</label>
            <select 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 font-medium text-slate-800"
              value={studentForm.cls}
              onChange={e => setStudentForm({...studentForm, cls: e.target.value})}
            >
              {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">เพศ</label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all hover:bg-slate-50 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700 font-bold text-sm text-slate-600">
                <input type="radio" name="gender" value="ชาย" checked={studentForm.gender === 'ชาย'} onChange={e => setStudentForm({...studentForm, gender: e.target.value})} className="hidden" />
                👦 ชาย
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all hover:bg-slate-50 has-[:checked]:border-fuchsia-500 has-[:checked]:bg-fuchsia-50 has-[:checked]:text-fuchsia-700 font-bold text-sm text-slate-600">
                <input type="radio" name="gender" value="หญิง" checked={studentForm.gender === 'หญิง'} onChange={e => setStudentForm({...studentForm, gender: e.target.value})} className="hidden" />
                👧 หญิง
              </label>
            </div>
          </div>
          <div className="col-span-2 mt-4">
            <button onClick={handleSaveStudent} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 text-sm">
              บันทึกข้อมูล
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} title="📥 นำเข้ารายชื่อนักเรียนด่วน">
        <div className="space-y-5 p-1">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">เลือกชั้นเรียนเป้าหมาย <span className="text-rose-500">*</span></label>
            <select 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 font-bold text-indigo-900"
              value={bulkClass}
              onChange={e => setBulkClass(e.target.value)}
            >
              {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">วางรายชื่อ (1 บรรทัดต่อ 1 คน)</label>
            <textarea 
              className="w-full px-4 py-4 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 text-sm h-56 resize-none font-medium leading-relaxed custom-scrollbar" 
              placeholder={`สามารถวางจาก Word/Excel ได้เลย เช่น:\n1. ด.ช. สมชาย รักเรียน\n2 ด.ญ. สมหญิง ใจดี\n\n(หรือวางแค่ชื่อเฉยๆ ระบบจะเรียงเลขที่ให้อัตโนมัติ)`}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
            ></textarea>
          </div>
          <button onClick={handleBulkImport} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2">
            <UsersThree weight="fill" className="text-lg" /> ยืนยันการนำเข้ารายชื่อ
          </button>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="⚠️ ลบข้อมูลนักเรียน">
        <div className="space-y-5">
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 text-center">
            <UserCircle weight="duotone" className="text-5xl text-rose-300 mx-auto mb-2" />
            <p className="text-sm text-slate-700 font-medium">
              คุณกำลังจะลบข้อมูลของ <strong className="text-rose-600 text-base">{itemToDelete?.name}</strong>
            </p>
            <p className="text-xs text-rose-500 mt-2">ประวัติการเช็คชื่อและคะแนนทั้งหมดจะหายไปและไม่สามารถกู้คืนได้</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={() => setIsConfirmOpen(false)} className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
              ยกเลิก
            </button>
            <button onClick={confirmDelete} className="py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">
              ยืนยันการลบ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Students;
