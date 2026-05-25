import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Users, UsersThree, Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import Modal from '../components/Modal';

const Students = () => {
  const { db, setDb } = useContext(AppContext);
  const { addToast } = useToast();
  
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('ทุกชั้นเรียน');
  
  // Modal states
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Form states
  const [studentForm, setStudentForm] = useState({ id: '', no: '', name: '', cls: '', gender: 'ชาย' });
  const [bulkText, setBulkText] = useState('');
  const [bulkClass, setBulkClass] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);

  // Helper for stats
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
    
    // Remove student
    newDb.students = newDb.students.filter(s => s.id !== itemToDelete.id);
    
    // Remove scores for this student
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
              <option value="ทุกชั้นเรียน">แสดงทุกชั้นเรียน</option>
              {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
              onClick={() => {
                if (!db?.classes?.length) {
                  addToast("กรุณาเพิ่มชั้นเรียนในเมนู 'ภาพรวม' ก่อนนำเข้า", "error");
                  return;
                }
                setBulkClass(db.classes[0]);
                setIsBulkModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-sm flex items-center justify-center gap-1 transition-colors"
            >
              <UsersThree weight="bold" /> นำเข้าทีละห้อง
            </button>
            <button 
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1 shadow-md transition-all"
            >
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
                filteredStudents.map(student => {
                  const st = getStudentStats(student.id);
                  const total = st.present + st.absent + st.late + st.leave;
                  const rate = total > 0 ? Math.round(((st.present + st.late) / total) * 100) : 100;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 text-center font-semibold text-slate-600">{student.no}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full inline-block ${rate >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          เข้าเรียน {rate}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">{student.cls || "ไม่มีห้อง"}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${student.gender === 'หญิง' ? 'bg-fuchsia-50 text-fuchsia-700' : 'bg-sky-50 text-sky-700'}`}>
                          {student.gender}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">{st.present}</td>
                      <td className="py-3 px-4 text-center font-bold text-rose-500">{st.absent}</td>
                      <td className="py-3 px-4 text-center font-bold text-amber-500">{st.late}</td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-600">{st.leave}</td>
                      <td className="py-3 px-4 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => handleOpenEdit(student)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
                          >
                            <PencilSimple weight="bold" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRequest(student)}
                            className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all"
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
      <Modal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} title={studentForm.id ? "✏️ แก้ไขข้อมูลนักเรียน" : "➕ เพิ่มทีละคน"}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ชื่อ-นามสกุล <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border rounded-xl outline-none focus:border-indigo-500 bg-slate-50" 
              placeholder="ด.ช. สมชาย รักเรียน" 
              value={studentForm.name}
              onChange={e => setStudentForm({...studentForm, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">เลขที่</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 border rounded-xl outline-none focus:border-indigo-500 bg-slate-50" 
              placeholder="Auto" 
              value={studentForm.no}
              onChange={e => setStudentForm({...studentForm, no: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ชั้นเรียน</label>
            <select 
              className="w-full px-4 py-2 border rounded-xl outline-none focus:border-indigo-500 bg-slate-50"
              value={studentForm.cls}
              onChange={e => setStudentForm({...studentForm, cls: e.target.value})}
            >
              {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">เพศ</label>
            <select 
              className="w-full px-4 py-2 border rounded-xl outline-none focus:border-indigo-500 bg-slate-50"
              value={studentForm.gender}
              onChange={e => setStudentForm({...studentForm, gender: e.target.value})}
            >
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select>
          </div>
          <div className="col-span-2 mt-2">
            <button onClick={handleSaveStudent} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors">
              💾 บันทึกข้อมูล
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} title="📥 นำเข้ารายชื่อนักเรียน">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">เลือกชั้นเรียนเป้าหมาย <span className="text-rose-500">*</span></label>
            <select 
              className="w-full px-4 py-2 border rounded-xl outline-none focus:border-indigo-500 bg-slate-50"
              value={bulkClass}
              onChange={e => setBulkClass(e.target.value)}
            >
              {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">วางรายชื่อ (1 บรรทัดต่อ 1 คน)</label>
            <textarea 
              className="w-full px-4 py-3 border rounded-xl outline-none focus:border-indigo-500 bg-slate-50 text-sm h-48 resize-none" 
              placeholder={`สามารถวางแบบมีเลขที่นำหน้าได้ เช่น:\n1. ด.ช. สมชาย รักเรียน\n2 ด.ญ. สมหญิง ใจดี\nหรือวางแค่ชื่อเฉยๆ ก็ได้ (ระบบจะรันเลขที่ให้เอง)`}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
            ></textarea>
          </div>
          <button onClick={handleBulkImport} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors">
            ⚡ นำเข้ารายชื่อตอนนี้เลย
          </button>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="⚠️ ยืนยันการลบนักเรียน">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            คุณมั่นใจหรือไม่ที่จะลบข้อมูลและประวัติการส่งงานทั้งหมดของ <strong>"{itemToDelete?.name}"</strong>?
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={() => setIsConfirmOpen(false)} className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
              ยกเลิก
            </button>
            <button onClick={confirmDelete} className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-colors">
              ยืนยันการลบ
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Students;
