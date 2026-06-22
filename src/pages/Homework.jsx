import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Notebook, Plus, PencilSimple, Trash, WarningCircle, CalendarBlank, GraduationCap, ClipboardText } from '@phosphor-icons/react';
import Modal from '../components/Modal';

const Homework = () => {
  const { db, setDb } = useContext(AppContext);
  const { addToast } = useToast();

  const [hwClass, setHwClass] = useState('ทุกชั้นเรียน');
  const [hwType, setHwType] = useState('ทั้งหมด');

  const [isHwModalOpen, setIsHwModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [hwForm, setHwForm] = useState({ id: '', title: '', type: 'ใบงาน/การบ้าน', maxScore: 10, cls: 'ทุกชั้นเรียน', due: new Date().toISOString().split('T')[0] });

  const filteredHws = db?.homework?.filter(h => {
    const matchClass = hwClass === 'ทุกชั้นเรียน' || h.cls === hwClass || h.cls === 'ทุกชั้นเรียน';
    const matchType = hwType === 'ทั้งหมด' || h.type === hwType;
    return matchClass && matchType;
  }).sort((a, b) => new Date(b.due) - new Date(a.due)) || [];

  const handleOpenAdd = () => {
    setHwForm({ id: '', title: '', type: 'ใบงาน/การบ้าน', maxScore: 10, cls: 'ทุกชั้นเรียน', due: new Date().toISOString().split('T')[0] });
    setIsHwModalOpen(true);
  };

  const handleOpenEdit = (hw) => {
    setHwForm({ ...hw });
    setIsHwModalOpen(true);
  };

  const handleSaveHw = () => {
    if (!hwForm.title.trim()) return addToast("กรุณากรอกชื่อใบงาน/กิจกรรม", "error");

    const newDb = { ...db };
    newDb.homework = [...(newDb.homework || [])]; // Clone array
    const maxScore = parseFloat(hwForm.maxScore) || 0;

    if (hwForm.id) {
      const idx = newDb.homework.findIndex(h => h.id === hwForm.id);
      if (idx !== -1) newDb.homework[idx] = { ...hwForm, maxScore };
      addToast("อัปเดตกิจกรรมเรียบร้อยแล้ว", "success");
    } else {
      if (!newDb.hwCounter) newDb.hwCounter = 1;
      newDb.homework.push({ id: newDb.hwCounter++, title: hwForm.title, type: hwForm.type, maxScore, cls: hwForm.cls, due: hwForm.due });
      addToast("สร้างกิจกรรมใหม่เรียบร้อยแล้ว", "success");
    }

    setDb(newDb);
    setIsHwModalOpen(false);
  };

  const handleDeleteRequest = (hw) => {
    setItemToDelete(hw);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    const newDb = { ...db };
    newDb.homework = newDb.homework.filter(h => h.id !== itemToDelete.id);
    for (const key in newDb.scores) {
      if (key.startsWith(`${itemToDelete.id}_`)) delete newDb.scores[key];
    }
    setDb(newDb);
    addToast("ลบข้อมูลกิจกรรมและคะแนนที่เกี่ยวข้องเรียบร้อย", "info");
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '-';
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'สอบเก็บคะแนน': return 'bg-rose-500 text-white shadow-rose-500/30';
      case 'ชิ้นงาน/โปรเจกต์': return 'bg-purple-500 text-white shadow-purple-500/30';
      case 'ใบงาน/การบ้าน': return 'bg-emerald-500 text-white shadow-emerald-500/30';
      case 'สอบกลางภาค':
      case 'สอบปลายภาค': return 'bg-amber-500 text-white shadow-amber-500/30';
      default: return 'bg-slate-500 text-white shadow-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex flex-col lg:flex-row gap-6 items-center justify-between z-10 relative">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Notebook weight="duotone" className="text-3xl" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-slate-800">มอบหมายงานและกิจกรรม</h3>
            <p className="text-sm text-slate-500 font-medium">จัดการชิ้นงาน การบ้าน และกำหนดคะแนนเต็ม</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
          <div className="flex bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 p-1 shadow-sm">
            <select value={hwClass} onChange={e => setHwClass(e.target.value)} className="bg-transparent pl-4 pr-8 py-2 outline-none text-sm font-bold text-slate-700 cursor-pointer">
              <option value="ทุกชั้นเรียน">ทุกชั้นเรียน</option>
              {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
            </select>
            <div className="w-[1px] bg-white mx-1 my-2"></div>
            <select value={hwType} onChange={e => setHwType(e.target.value)} className="bg-transparent pl-4 pr-8 py-2 outline-none text-sm font-bold text-slate-700 cursor-pointer">
              <option value="ทั้งหมด">ทุกประเภทงาน</option>
              <option value="ใบงาน/การบ้าน">ใบงาน/การบ้าน</option>
              <option value="ชิ้นงาน/โปรเจกต์">ชิ้นงาน/โปรเจกต์</option>
              <option value="สอบเก็บคะแนน">สอบเก็บคะแนน</option>
              <option value="สอบกลางภาค">สอบกลางภาค</option>
              <option value="สอบปลายภาค">สอบปลายภาค</option>
            </select>
          </div>
          <button onClick={handleOpenAdd} className="w-full sm:w-auto px-6 py-3.5 btn-primary-glass bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2">
            <Plus weight="bold" /> สร้างงานใหม่
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHws.length === 0 ? (
          <div className="col-span-full glass-card p-20 text-center text-slate-400">
            <ClipboardText weight="duotone" className="text-7xl mx-auto mb-4 text-slate-300" />
            <p className="font-display font-medium text-xl text-slate-500">ยังไม่มีกิจกรรมที่มอบหมาย</p>
            <p className="text-sm mt-2">คลิก "สร้างงานใหม่" เพื่อเพิ่มกิจกรรมเข้าสู่ระบบ</p>
          </div>
        ) : (
          filteredHws.map(h => (
            <div key={h.id} className="glass-panel p-6 group flex flex-col justify-between min-h-[180px] border border-white/60 hover:border-white hover:bg-white/90 transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-md ${getTypeColor(h.type)}`}>
                    {h.type}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit(h)} className="w-8 h-8 rounded-full btn-glass flex items-center justify-center text-slate-500 hover:text-indigo-600">
                      <PencilSimple weight="bold" />
                    </button>
                    <button onClick={() => handleDeleteRequest(h)} className="w-8 h-8 rounded-full btn-glass flex items-center justify-center text-slate-500 hover:text-rose-600">
                      <Trash weight="bold" />
                    </button>
                  </div>
                </div>
                <h4 className="font-display font-bold text-slate-800 text-xl mb-3 leading-snug line-clamp-2">{h.title}</h4>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5"><GraduationCap weight="fill" className="text-amber-500" /> {h.cls}</div>
                  <div className="flex items-center gap-1.5"><CalendarBlank weight="fill" className="text-amber-500" /> {formatThaiDate(h.due)}</div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">คะแนนเต็ม</span>
                <span className="font-display font-bold text-3xl text-amber-500 drop-shadow-sm">{h.maxScore}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isHwModalOpen} onClose={() => setIsHwModalOpen(false)} title={hwForm.id ? "✏️ แก้ไขกิจกรรม" : "➕ สร้างกิจกรรมใหม่"}>
        <div className="grid grid-cols-2 gap-5 p-2">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">ชื่อใบงาน/กิจกรรม <span className="text-rose-500">*</span></label>
            <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-200 bg-slate-50 font-bold text-slate-800 transition-all" placeholder="เช่น ใบงานที่ 1.1" value={hwForm.title} onChange={e => setHwForm({...hwForm, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">ประเภทงาน</label>
            <select className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-200 bg-slate-50 font-bold text-slate-800 transition-all" value={hwForm.type} onChange={e => setHwForm({...hwForm, type: e.target.value})}>
              <option value="ใบงาน/การบ้าน">ใบงาน/การบ้าน</option>
              <option value="ชิ้นงาน/โปรเจกต์">ชิ้นงาน/โปรเจกต์</option>
              <option value="สอบเก็บคะแนน">สอบเก็บคะแนน</option>
              <option value="สอบกลางภาค">สอบกลางภาค</option>
              <option value="สอบปลายภาค">สอบปลายภาค</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">คะแนนเต็ม</label>
            <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-200 bg-slate-50 font-bold text-amber-600 transition-all" placeholder="10" value={hwForm.maxScore} onChange={e => setHwForm({...hwForm, maxScore: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">เป้าหมาย (ชั้นเรียน)</label>
            <select className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-200 bg-slate-50 font-bold text-slate-800 transition-all" value={hwForm.cls} onChange={e => setHwForm({...hwForm, cls: e.target.value})}>
              <option value="ทุกชั้นเรียน">ทุกชั้นเรียน</option>
              {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">กำหนดส่ง</label>
            <input type="date" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-200 bg-slate-50 font-bold text-slate-800 transition-all" value={hwForm.due} onChange={e => setHwForm({...hwForm, due: e.target.value})} />
          </div>
          <div className="col-span-2 mt-2">
            <button onClick={handleSaveHw} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/30 transition-all active:scale-95">บันทึกข้อมูลกิจกรรม</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="⚠️ ลบกิจกรรม">
        <div className="space-y-5">
          <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-center">
            <WarningCircle weight="duotone" className="text-5xl text-rose-400 mx-auto mb-2" />
            <p className="text-sm text-slate-700 font-medium">ลบกิจกรรม <strong className="text-rose-600 text-base">"{itemToDelete?.title}"</strong>?</p>
            <p className="text-xs text-rose-500 mt-2 font-semibold">คะแนนทั้งหมดของนักเรียนที่ผูกกับงานชิ้นนี้จะถูกลบไปด้วย</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={() => setIsConfirmOpen(false)} className="py-3 btn-glass rounded-xl font-bold text-slate-700">ยกเลิก</button>
            <button onClick={confirmDelete} className="py-3 bg-rose-500 text-white font-bold rounded-xl shadow-md">ยืนยันการลบ</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Homework;
