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
    if (!hwForm.title.trim()) {
      addToast("กรุณากรอกชื่อใบงาน/กิจกรรม", "error");
      return;
    }

    const newDb = { ...db };
    const maxScore = parseFloat(hwForm.maxScore) || 0;

    if (hwForm.id) {
      const idx = newDb.homework.findIndex(h => h.id === hwForm.id);
      if (idx !== -1) newDb.homework[idx] = { ...hwForm, maxScore };
      addToast("อัปเดตข้อมูลกิจกรรมเรียบร้อยแล้ว", "success");
    } else {
      newDb.homework.push({
        id: newDb.hwCounter++,
        title: hwForm.title,
        type: hwForm.type,
        maxScore,
        cls: hwForm.cls,
        due: hwForm.due
      });
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
    
    // Clean up scores associated with this homework
    for (const key in newDb.scores) {
      if (key.startsWith(`${itemToDelete.id}_`)) {
        delete newDb.scores[key];
      }
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
      case 'สอบเก็บคะแนน': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'ชิ้นงาน/โปรเจกต์': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ใบงาน/การบ้าน': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'สอบกลางภาค':
      case 'สอบปลายภาค': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="premium-card p-4 flex flex-col lg:flex-row gap-4 items-center justify-between z-10 relative">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-100 to-orange-100 text-amber-600 flex items-center justify-center shadow-inner">
            <Notebook weight="duotone" className="text-2xl" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-slate-800">มอบหมายงานและกิจกรรม</h3>
            <p className="text-xs text-slate-500 font-medium">จัดการชิ้นงาน การบ้าน และกำหนดคะแนนเต็ม</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <select value={hwClass} onChange={e => setHwClass(e.target.value)} className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-slate-50 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all font-medium text-slate-700">
            <option value="ทุกชั้นเรียน">ทุกชั้นเรียน</option>
            {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
          </select>
          <select value={hwType} onChange={e => setHwType(e.target.value)} className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-slate-50 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all font-medium text-slate-700">
            <option value="ทั้งหมด">ทุกประเภทงาน</option>
            <option value="ใบงาน/การบ้าน">ใบงาน/การบ้าน</option>
            <option value="ชิ้นงาน/โปรเจกต์">ชิ้นงาน/โปรเจกต์</option>
            <option value="สอบเก็บคะแนน">สอบเก็บคะแนน</option>
            <option value="สอบกลางภาค">สอบกลางภาค</option>
            <option value="สอบปลายภาค">สอบปลายภาค</option>
          </select>
          <button onClick={handleOpenAdd} className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all btn-premium">
            <Plus weight="bold" /> สร้างงานใหม่
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHws.length === 0 ? (
          <div className="col-span-full premium-card p-16 text-center text-slate-400">
            <ClipboardText weight="duotone" className="text-6xl mx-auto mb-4 text-slate-300" />
            <p className="font-display font-medium text-lg">ยังไม่มีกิจกรรมที่มอบหมาย</p>
            <p className="text-sm mt-2">โปรดคลิก "สร้างงานใหม่" เพื่อเพิ่มกิจกรรมเข้าสู่ระบบ</p>
          </div>
        ) : (
          filteredHws.map(h => (
            <div key={h.id} className="premium-card p-5 group flex flex-col justify-between min-h-[160px]">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold tracking-wide ${getTypeColor(h.type)}`}>
                    {h.type}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit(h)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors">
                      <PencilSimple weight="bold" />
                    </button>
                    <button onClick={() => handleDeleteRequest(h)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors">
                      <Trash weight="bold" />
                    </button>
                  </div>
                </div>
                <h4 className="font-display font-bold text-slate-800 text-lg mb-2 leading-snug line-clamp-2">{h.title}</h4>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-[11px] font-bold text-slate-500">
                  <div className="flex items-center gap-1.5"><GraduationCap weight="fill" className="text-slate-400 text-sm" /> เป้าหมาย: {h.cls}</div>
                  <div className="flex items-center gap-1.5"><CalendarBlank weight="fill" className="text-slate-400 text-sm" /> กำหนด: {formatThaiDate(h.due)}</div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">คะแนนเต็ม</span>
                <span className="font-display font-bold text-2xl text-amber-500">{h.maxScore}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isHwModalOpen} onClose={() => setIsHwModalOpen(false)} title={hwForm.id ? "✏️ แก้ไขกิจกรรม" : "➕ สร้างกิจกรรมใหม่"}>
        <div className="grid grid-cols-2 gap-5 p-1">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ชื่อใบงาน/กิจกรรม <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all bg-slate-50 font-medium text-slate-800"
              placeholder="เช่น ใบงานที่ 1.1 รู้จักกับคอมพิวเตอร์" 
              value={hwForm.title}
              onChange={e => setHwForm({...hwForm, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ประเภทงาน</label>
            <select 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all bg-slate-50 font-medium text-slate-800"
              value={hwForm.type}
              onChange={e => setHwForm({...hwForm, type: e.target.value})}
            >
              <option value="ใบงาน/การบ้าน">ใบงาน/การบ้าน</option>
              <option value="ชิ้นงาน/โปรเจกต์">ชิ้นงาน/โปรเจกต์</option>
              <option value="สอบเก็บคะแนน">สอบเก็บคะแนน</option>
              <option value="สอบกลางภาค">สอบกลางภาค</option>
              <option value="สอบปลายภาค">สอบปลายภาค</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">คะแนนเต็ม</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all bg-slate-50 font-bold text-amber-600"
              placeholder="10" 
              value={hwForm.maxScore}
              onChange={e => setHwForm({...hwForm, maxScore: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">เป้าหมาย (ชั้นเรียน)</label>
            <select 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all bg-slate-50 font-medium text-slate-800"
              value={hwForm.cls}
              onChange={e => setHwForm({...hwForm, cls: e.target.value})}
            >
              <option value="ทุกชั้นเรียน">ทุกชั้นเรียน</option>
              {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">กำหนดส่ง</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all bg-slate-50 font-medium text-slate-800"
              value={hwForm.due}
              onChange={e => setHwForm({...hwForm, due: e.target.value})}
            />
          </div>
          <div className="col-span-2 mt-4">
            <button onClick={handleSaveHw} className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all active:scale-95 text-sm">
              บันทึกข้อมูลกิจกรรม
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="⚠️ ลบกิจกรรม">
        <div className="space-y-5">
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 text-center">
            <WarningCircle weight="duotone" className="text-5xl text-rose-400 mx-auto mb-2" />
            <p className="text-sm text-slate-700 font-medium">
              คุณต้องการลบกิจกรรม <strong className="text-rose-600 text-base">"{itemToDelete?.title}"</strong> ใช่หรือไม่?
            </p>
            <p className="text-xs text-rose-500 mt-2 font-semibold">คะแนนทั้งหมดของนักเรียนที่ผูกกับงานชิ้นนี้จะถูกลบไปด้วย และกู้คืนไม่ได้</p>
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

export default Homework;
