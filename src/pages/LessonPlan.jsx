import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { BookOpen, Plus, Trash, FloppyDisk, PencilSimple, WarningCircle } from '@phosphor-icons/react';

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
    
    // Load plans for the selected class
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
    addToast("เพิ่มแถวใหม่เรียบร้อยแล้ว", "success");
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
    <div className="space-y-6">
      {/* Header Card */}
      <div className="premium-card p-4 flex flex-col lg:flex-row gap-4 items-center justify-between z-10 relative">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-100 to-blue-100 text-sky-600 flex items-center justify-center shadow-inner">
            <BookOpen weight="duotone" className="text-2xl" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-slate-800">โครงสร้างแผนการสอน</h3>
            <p className="text-xs text-slate-500 font-medium">จัดการตารางเรียนและเนื้อหาแยกตามรายชั้นเรียน</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">เลือกชั้นเรียน</label>
            <select 
              value={lpClass} 
              onChange={e => setLpClass(e.target.value)} 
              className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-slate-50 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-bold text-slate-700"
            >
              {db?.classes?.length === 0 && <option value="">ไม่มีชั้นเรียน</option>}
              {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
            </select>
          </div>
          
          <div className="self-end">
            <button 
              onClick={handleAddRow}
              disabled={!lpClass}
              className="w-full sm:w-auto px-5 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 transition-all btn-premium"
            >
              <Plus weight="bold" /> เพิ่มสัปดาห์
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-5 w-32">สัปดาห์ / วันที่</th>
                <th className="py-4 px-4 w-64">หัวข้อ / หน่วยการเรียนรู้</th>
                <th className="py-4 px-4">รายละเอียด / ตัวชี้วัด</th>
                <th className="py-4 px-4 w-28 text-center text-amber-600">คะแนนเก็บ</th>
                <th className="py-4 px-5 text-center w-28 no-print">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {!lpClass ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400 bg-slate-50/50">
                    <WarningCircle weight="duotone" className="text-5xl mx-auto mb-3 text-slate-300" />
                    <p className="font-display font-medium text-lg">โปรดเพิ่มชั้นเรียนในเมนู 'ภาพรวม' ก่อน</p>
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400 bg-slate-50/50">
                    <BookOpen weight="duotone" className="text-6xl mx-auto mb-3 text-slate-300" />
                    <p className="font-display font-medium text-lg">ยังไม่มีข้อมูลแผนการสอนสำหรับห้อง {lpClass}</p>
                    <p className="text-xs mt-1">คลิกปุ่ม "+ เพิ่มสัปดาห์" ด้านบนเพื่อเริ่มสร้างตาราง</p>
                  </td>
                </tr>
              ) : (
                plans.map(plan => {
                  const isEditing = editingId === plan.id;
                  
                  return (
                    <tr key={plan.id} className={`${isEditing ? 'bg-sky-50/50' : 'hover:bg-slate-50'} transition-colors group`}>
                      {/* Week Column */}
                      <td className="py-3 px-5 align-top">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 text-sm border border-sky-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-100 bg-white font-bold text-slate-700"
                            value={editForm.week}
                            onChange={e => setEditForm({...editForm, week: e.target.value})}
                            placeholder="สัปดาห์ที่ 1"
                          />
                        ) : (
                          <span className="font-bold text-sky-700">{plan.week}</span>
                        )}
                      </td>
                      
                      {/* Topic Column */}
                      <td className="py-3 px-4 align-top">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 text-sm border border-sky-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-100 bg-white font-bold text-slate-800"
                            value={editForm.topic}
                            onChange={e => setEditForm({...editForm, topic: e.target.value})}
                            placeholder="พิมพ์ชื่อหน่วย..."
                          />
                        ) : (
                          <span className="font-bold text-slate-800">{plan.topic}</span>
                        )}
                      </td>
                      
                      {/* Detail Column */}
                      <td className="py-3 px-4 align-top">
                        {isEditing ? (
                          <textarea 
                            className="w-full px-3 py-2 text-sm border border-sky-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-100 bg-white text-slate-600 resize-y min-h-[60px] custom-scrollbar"
                            value={editForm.detail}
                            onChange={e => setEditForm({...editForm, detail: e.target.value})}
                            placeholder="รายละเอียดเนื้อหา..."
                          />
                        ) : (
                          <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">{plan.detail || <span className="text-slate-300 italic">ไม่มีรายละเอียด</span>}</div>
                        )}
                      </td>
                      
                      {/* Score Column */}
                      <td className="py-3 px-4 align-top text-center">
                        {isEditing ? (
                          <input 
                            type="number" 
                            className="w-20 mx-auto px-2 py-2 text-sm border border-sky-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-100 bg-white font-bold text-amber-600 text-center"
                            value={editForm.score}
                            onChange={e => setEditForm({...editForm, score: e.target.value})}
                            placeholder="0"
                          />
                        ) : (
                          <span className="font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">{plan.score}</span>
                        )}
                      </td>
                      
                      {/* Action Column */}
                      <td className="py-3 px-5 align-top text-center no-print">
                        {isEditing ? (
                          <button 
                            onClick={handleSaveEdit}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
                          >
                            <FloppyDisk weight="fill" /> บันทึก
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditClick(plan)}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-sky-300 hover:text-sky-600 text-slate-500 flex items-center justify-center transition-all shadow-sm"
                              title="แก้ไข"
                            >
                              <PencilSimple weight="bold" />
                            </button>
                            <button 
                              onClick={() => handleDelete(plan.id)}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 text-slate-500 flex items-center justify-center transition-all shadow-sm"
                              title="ลบ"
                            >
                              <Trash weight="bold" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LessonPlan;
