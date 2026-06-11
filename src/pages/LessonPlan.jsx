import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { BookOpen, Plus, Trash, FloppyDisk, PencilSimple, WarningCircle, GraduationCap } from '@phosphor-icons/react';

const LessonPlan = () => {
  const { db, setDb } = useContext(AppContext);
  const { addToast } = useToast();

  const [lpClass, setLpClass] = useState(db?.classes?.[0] || '');
  const [plans, setPlans] = useState([]);
  
  // Track which row is being edited
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ week: '', topic: '', detail: '', score: '' });

  useEffect(() => {
    if (!lpClass) {
      setPlans([]);
      return;
    }
    const classPlans = db?.lessonPlans?.[lpClass] || [];
    setPlans(JSON.parse(JSON.stringify(classPlans)));
    setEditingId(null);
  }, [lpClass, db?.lessonPlans]);

  const handleAddRow = () => {
    const newDb = { ...db };
    if (!newDb.lessonPlans) newDb.lessonPlans = {};
    if (!newDb.lessonPlans[lpClass]) newDb.lessonPlans[lpClass] = [];
    if (!newDb.lpCounter) newDb.lpCounter = 1;

    const newRow = {
      id: newDb.lpCounter++,
      week: `สัปดาห์ที่ ${newDb.lessonPlans[lpClass].length + 1}`,
      topic: 'หัวข้อใหม่',
      detail: '',
      score: 0
    };

    newDb.lessonPlans[lpClass].push(newRow);
    setDb(newDb);
    addToast("เพิ่มข้อมูลแผนการสอนเรียบร้อย", "success");
  };

  const handleEditClick = (plan) => {
    setEditingId(plan.id);
    setEditForm({ ...plan });
  };

  const handleSaveEdit = () => {
    const newDb = { ...db };
    const classPlans = newDb.lessonPlans[lpClass] || [];
    
    const idx = classPlans.findIndex(p => p.id === editingId);
    if (idx !== -1) {
      classPlans[idx] = { 
        ...editForm, 
        score: parseFloat(editForm.score) || 0 
      };
    }

    setDb(newDb);
    setEditingId(null);
    addToast("บันทึกข้อมูลเรียบร้อยแล้ว", "success");
  };

  const handleDelete = (id) => {
    if (!window.confirm("คุณต้องการลบข้อมูลสัปดาห์นี้ใช่หรือไม่?")) return;
    
    const newDb = { ...db };
    if (newDb.lessonPlans && newDb.lessonPlans[lpClass]) {
      newDb.lessonPlans[lpClass] = newDb.lessonPlans[lpClass].filter(p => p.id !== id);
      setDb(newDb);
      addToast("ลบข้อมูลเรียบร้อยแล้ว", "info");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Glass Card */}
      <div className="glass-card p-6 flex flex-col md:flex-row gap-6 items-center justify-between z-10 relative">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
            <BookOpen weight="duotone" className="text-3xl" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-slate-800">Timeline แผนการสอน</h3>
            <p className="text-sm text-slate-500 font-medium">จัดการเนื้อหาการสอนรายสัปดาห์</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
          <div className="w-full sm:w-auto flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/60 shadow-sm">
            <GraduationCap weight="fill" className="text-sky-500 text-xl shrink-0" />
            <select 
              value={lpClass} 
              onChange={e => setLpClass(e.target.value)} 
              className="w-full sm:w-32 bg-transparent outline-none text-sm font-bold text-slate-700 cursor-pointer"
            >
              {db?.classes?.length === 0 && <option value="">ไม่มีห้องเรียน</option>}
              {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
            </select>
          </div>
          
          <button 
            onClick={handleAddRow}
            disabled={!lpClass}
            className="w-full sm:w-auto px-6 py-3.5 btn-primary-glass disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-2xl text-sm flex items-center justify-center gap-2"
          >
            <Plus weight="bold" /> เพิ่มสัปดาห์เรียน
          </button>
        </div>
      </div>

      {/* Timeline Layout */}
      <div className="glass-card p-8 min-h-[500px] relative">
        {!lpClass ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-20">
            <WarningCircle weight="duotone" className="text-6xl mx-auto mb-4 text-slate-300" />
            <p className="font-display font-bold text-xl text-slate-500">โปรดเลือกชั้นเรียนก่อน</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-20">
            <BookOpen weight="duotone" className="text-6xl mx-auto mb-4 text-slate-300" />
            <p className="font-display font-bold text-xl text-slate-500">ยังไม่มีแผนการสอน</p>
            <p className="text-sm mt-2 font-medium">คลิก "เพิ่มสัปดาห์เรียน" เพื่อเริ่มสร้าง Timeline</p>
          </div>
        ) : (
          <div className="relative pl-4 md:pl-10 space-y-8">
            {/* The vertical timeline line */}
            <div className="absolute left-6 md:left-[2.85rem] top-4 bottom-4 w-1 bg-gradient-to-b from-sky-400 to-indigo-500 opacity-20 rounded-full"></div>
            
            {plans.map((plan, index) => {
              const isEditing = editingId === plan.id;
              
              return (
                <div key={plan.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 md:-left-12 top-6 w-5 h-5 rounded-full bg-white border-4 border-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.2)] z-10 group-hover:scale-125 transition-transform duration-300"></div>
                  
                  {/* Content Card */}
                  <div className={`ml-4 md:ml-8 glass-panel p-6 border transition-all duration-300 ${isEditing ? 'border-sky-300 shadow-lg shadow-sky-500/10' : 'border-white/60 hover:border-white hover:shadow-lg'}`}>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">สัปดาห์ / วันที่</label>
                            <input type="text" className="w-full px-4 py-2.5 text-sm rounded-xl border-none outline-none bg-white/80 focus:bg-white focus:ring-2 focus:ring-sky-200 font-bold text-sky-700 shadow-inner" value={editForm.week} onChange={e => setEditForm({...editForm, week: e.target.value})} placeholder="สัปดาห์ที่ 1" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">หัวข้อการเรียนรู้</label>
                            <input type="text" className="w-full px-4 py-2.5 text-sm rounded-xl border-none outline-none bg-white/80 focus:bg-white focus:ring-2 focus:ring-sky-200 font-bold text-slate-800 shadow-inner" value={editForm.topic} onChange={e => setEditForm({...editForm, topic: e.target.value})} placeholder="พิมพ์ชื่อหน่วย..." />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">รายละเอียดเนื้อหา / ตัวชี้วัด</label>
                          <textarea className="w-full px-4 py-3 text-sm rounded-xl border-none outline-none bg-white/80 focus:bg-white focus:ring-2 focus:ring-sky-200 text-slate-600 resize-y min-h-[80px] custom-scrollbar shadow-inner" value={editForm.detail} onChange={e => setEditForm({...editForm, detail: e.target.value})} placeholder="รายละเอียดเนื้อหา..." />
                        </div>
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">คะแนนเก็บ (ถ้ามี)</label>
                            <input type="number" className="w-32 px-4 py-2.5 text-sm rounded-xl border-none outline-none bg-white/80 focus:bg-white focus:ring-2 focus:ring-sky-200 font-bold text-amber-600 shadow-inner" value={editForm.score} onChange={e => setEditForm({...editForm, score: e.target.value})} placeholder="0" />
                          </div>
                          <button onClick={handleSaveEdit} className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 transition-all active:scale-95">
                            <FloppyDisk weight="fill" /> บันทึก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs font-bold rounded-lg shadow-sm">
                              {plan.week}
                            </span>
                            {plan.score > 0 && (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-200 flex items-center gap-1">
                                🎯 {plan.score} คะแนน
                              </span>
                            )}
                          </div>
                          <h4 className="font-display font-bold text-xl text-slate-800 leading-snug">{plan.topic}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{plan.detail || <span className="text-slate-400 italic">ไม่มีรายละเอียดเนื้อหา</span>}</p>
                        </div>
                        
                        <div className="flex md:flex-col gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity justify-end md:justify-start">
                          <button onClick={() => handleEditClick(plan)} className="w-10 h-10 rounded-xl btn-glass flex items-center justify-center text-slate-500 hover:text-sky-600">
                            <PencilSimple weight="bold" />
                          </button>
                          <button onClick={() => handleDelete(plan.id)} className="w-10 h-10 rounded-xl btn-glass flex items-center justify-center text-slate-500 hover:text-rose-600">
                            <Trash weight="bold" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPlan;
