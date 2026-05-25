import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { Plus, Notebook, Clock, ChalkboardTeacher, PencilSimple, Trash } from '@phosphor-icons/react';

const Homework = () => {
  const { db, setDb } = useContext(AppContext);
  const { addToast } = useToast();

  const [classFilter, setClassFilter] = useState('ทุกชั้นเรียน');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form states
  const [form, setForm] = useState({ id: '', title: '', desc: '', maxScore: 10, due: '', cls: '', type: 'งานในชั้นเรียน' });

  const filteredHomework = db?.homework?.filter(hw => {
    const matchClass = classFilter === 'ทุกชั้นเรียน' || hw.cls === 'ทุกชั้นเรียน' || hw.cls === classFilter;
    const matchType = typeFilter === '' || hw.type === typeFilter;
    return matchClass && matchType;
  })?.sort((a, b) => b.id - a.id) || [];

  const handleOpenAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    setForm({ id: '', title: '', desc: '', maxScore: 10, due: today, cls: db?.classes?.[0] || 'ทุกชั้นเรียน', type: 'งานในชั้นเรียน' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (hw) => {
    setForm({ ...hw });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      addToast("กรุณาระบุชื่องาน/การบ้าน", "error");
      return;
    }

    const newDb = { ...db };
    const maxScore = parseInt(form.maxScore) || 10;
    const newHw = { ...form, maxScore, title: form.title.trim(), desc: form.desc.trim() };

    if (!newHw.createdAt) {
      newHw.createdAt = new Date().toISOString();
    }

    if (form.id) {
      const idx = newDb.homework.findIndex(h => h.id === form.id);
      if (idx >= 0) newDb.homework[idx] = newHw;
      addToast("อัปเดตข้อมูลรายละเอียดงานสำเร็จ", "success");
    } else {
      newHw.id = newDb.hwCounter++;
      newDb.homework.push(newHw);
      addToast("เพิ่มหัวข้อกิจกรรมงานชิ้นใหม่สำเร็จ 🎉", "success");
    }

    setDb(newDb);
    setIsModalOpen(false);
  };

  const requestDelete = (hw) => {
    setItemToDelete(hw);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    const newDb = { ...db };
    
    // Remove homework
    newDb.homework = newDb.homework.filter(h => h.id !== itemToDelete.id);
    
    // Remove scores for this homework
    for (const key in newDb.scores) {
      if (key.startsWith(`${itemToDelete.id}_`)) {
        delete newDb.scores[key];
      }
    }

    setDb(newDb);
    addToast("ลบหัวข้อกิจกรรมงานเรียบร้อย", "info");
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '-';
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };

  const badges = {
    'งานในชั้นเรียน': 'bg-sky-50 text-sky-700 border-sky-200',
    'การบ้าน': 'bg-amber-50 text-amber-700 border-amber-200',
    'โปรเจกต์': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'แบบทดสอบ': 'bg-rose-50 text-rose-700 border-rose-200',
    'ทักษะปฏิบัติ': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-36">
            <label className="block text-xs font-semibold text-slate-500 mb-1">กรองชั้นเรียน</label>
            <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
              <option value="ทุกชั้นเรียน">ทุกชั้นเรียน</option>
              {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="w-full sm:w-40">
            <label className="block text-xs font-semibold text-slate-500 mb-1">ประเภทงาน</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
              <option value="">ทั้งหมด</option>
              <option value="งานในชั้นเรียน">งานในชั้นเรียน</option>
              <option value="การบ้าน">การบ้าน</option>
              <option value="โปรเจกต์">โปรเจกต์</option>
              <option value="แบบทดสอบ">แบบทดสอบ</option>
              <option value="ทักษะปฏิบัติ">ทักษะปฏิบัติ</option>
            </select>
          </div>
        </div>
        <button onClick={handleOpenAdd} className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1 shadow-md shadow-emerald-600/10 transition-colors">
          <Plus weight="bold" /> มอบหมายงานใหม่
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHomework.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Notebook weight="bold" className="text-4xl mb-2 mx-auto block" />
            <p className="text-sm">ไม่พบข้อมูลการมอบหมายงาน/การบ้าน</p>
          </div>
        ) : (
          filteredHomework.map(hw => {
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = hw.due < today;
            const isDueSoon = !isOverdue && hw.due <= new Date(Date.now() + 3 * 864e5).toISOString().split('T')[0];
            const scoreCount = Object.keys(db?.scores || {}).filter(k => k.startsWith(`${hw.id}_`)).length;

            return (
              <div key={hw.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-400 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${badges[hw.type] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {hw.type}
                    </span>
                    {isOverdue ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">เลยกำหนดส่ง</span>
                    ) : isDueSoon ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">ใกล้ครบกำหนด</span>
                    ) : null}
                  </div>
                  <h4 className="font-display font-semibold text-slate-800 text-base leading-snug line-clamp-2" title={hw.title}>{hw.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    ชั้น: <span className="text-indigo-600">{hw.cls}</span> &bull; 
                    คะแนนเต็ม: <span className="text-indigo-600">{hw.maxScore}</span> &bull; 
                    กำหนดส่ง: <span className="text-indigo-600">{formatThaiDate(hw.due)}</span>
                  </p>
                  {hw.desc && <p className="text-xs text-slate-400 font-light line-clamp-2">{hw.desc}</p>}
                </div>
                
                <div className="border-t pt-4 mt-4 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">บันทึกคะแนนแล้ว: <strong>{scoreCount} คน</strong></span>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleOpenEdit(hw)} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                      <PencilSimple weight="bold" /> แก้ไข
                    </button>
                    <button onClick={() => requestDelete(hw)} className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all">
                      <Trash weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={form.id ? "✏️ แก้ไขมอบหมายงาน" : "📋 มอบหมายงานใหม่"}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">หัวข้องาน <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border rounded-xl outline-none focus:border-indigo-500 bg-slate-50" 
              placeholder="เช่น ส่งสมุดครั้งที่ 1" 
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">คำอธิบายเพิ่มเติม</label>
            <textarea 
              className="w-full px-4 py-2 border rounded-xl outline-none focus:border-indigo-500 bg-slate-50 resize-none h-20 text-sm" 
              placeholder="ระบุรายละเอียดของงานชิ้นนี้..." 
              value={form.desc}
              onChange={e => setForm({...form, desc: e.target.value})}
            ></textarea>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ชั้นเรียน</label>
            <select 
              className="w-full px-4 py-2 border rounded-xl outline-none focus:border-indigo-500 bg-slate-50"
              value={form.cls}
              onChange={e => setForm({...form, cls: e.target.value})}
            >
              <option value="ทุกชั้นเรียน">ทุกชั้นเรียน</option>
              {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ประเภทงาน</label>
            <select 
              className="w-full px-4 py-2 border rounded-xl outline-none focus:border-indigo-500 bg-slate-50"
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value})}
            >
              <option value="งานในชั้นเรียน">งานในชั้นเรียน</option>
              <option value="การบ้าน">การบ้าน</option>
              <option value="โปรเจกต์">โปรเจกต์</option>
              <option value="แบบทดสอบ">แบบทดสอบ</option>
              <option value="ทักษะปฏิบัติ">ทักษะปฏิบัติ</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">กำหนดส่ง</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 border rounded-xl outline-none focus:border-indigo-500 bg-slate-50" 
              value={form.due}
              onChange={e => setForm({...form, due: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">คะแนนเต็ม <span className="text-rose-500">*</span></label>
            <input 
              type="number" 
              min="1"
              className="w-full px-4 py-2 border rounded-xl outline-none focus:border-indigo-500 bg-slate-50" 
              value={form.maxScore}
              onChange={e => setForm({...form, maxScore: e.target.value})}
            />
          </div>
          <div className="col-span-2 mt-2">
            <button onClick={handleSave} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors">
              💾 บันทึกข้อมูล
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="⚠️ ยืนยันการลบกิจกรรมส่งงาน">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            การลบหัวข้องานจะทำให้ตารางคะแนนประวัติส่งงานของนักเรียนทุกคนสูญหาย คุณยังต้องการลบหัวข้องาน <strong>"{itemToDelete?.title}"</strong> นี้หรือไม่?
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

export default Homework;
