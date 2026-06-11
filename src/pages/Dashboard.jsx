import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { UsersThree, Student, Trash, WarningCircle, CheckSquare, Plus, UploadSimple, DownloadSimple, Info, UserCircle, TrendUp } from '@phosphor-icons/react';
import Modal from '../components/Modal';

const Dashboard = () => {
  const { db, setDb } = useContext(AppContext);
  const { addToast } = useToast();

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [classInput, setClassInput] = useState('');
  const [classToDelete, setClassToDelete] = useState('');

  const [isRawModalOpen, setIsRawModalOpen] = useState(false);
  const [rawJsonData, setRawJsonData] = useState('');

  const handleAddClass = () => {
    if (!classInput.trim()) return addToast("กรุณากรอกชื่อชั้นเรียน", "error");
    if (db?.classes?.includes(classInput.trim())) return addToast("มีชั้นเรียนนี้อยู่แล้ว", "error");

    const newDb = { ...db };
    if (!newDb.classes) newDb.classes = [];
    newDb.classes.push(classInput.trim());
    newDb.classes.sort();

    setDb(newDb);
    setClassInput('');
    setIsClassModalOpen(false);
    addToast(`เพิ่มชั้นเรียน ${classInput} สำเร็จ`, "success");
  };

  const confirmDeleteClass = () => {
    if (!classToDelete) return;
    const newDb = { ...db };
    newDb.classes = newDb.classes.filter(c => c !== classToDelete);
    setDb(newDb);
    addToast(`ลบชั้นเรียน ${classToDelete} สำเร็จ`, "info");
    setIsConfirmOpen(false);
    setClassToDelete('');
  };

  const getStudentCount = (cls) => {
    return db?.students?.filter(s => s.cls === cls).length || 0;
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `comgrade_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addToast("ส่งออกข้อมูลสำรองเรียบร้อย", "success");
  };

  const handleImportData = () => {
    try {
      const importedDb = JSON.parse(rawJsonData);
      if (importedDb && typeof importedDb === 'object') {
        setDb(importedDb);
        setIsRawModalOpen(false);
        setRawJsonData('');
        addToast("นำเข้าข้อมูลสำเร็จ", "success");
      } else {
        addToast("รูปแบบไฟล์ JSON ไม่ถูกต้อง", "error");
      }
    } catch (e) {
      addToast("รูปแบบไฟล์ JSON ไม่ถูกต้อง", "error");
    }
  };

  const totalStudents = db?.students?.length || 0;
  const totalClasses = db?.classes?.length || 0;
  const totalCheckRecords = Object.keys(db?.attendance || {}).length;

  return (
    <div className="space-y-6">
      
      {/* Overview Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Welcome Card - Takes 2 cols on tablet */}
        <div className="glass-card p-8 md:col-span-2 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
          <div className="relative z-10">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-800 mb-2">ยินดีต้อนรับกลับมา, คุณครู! 👋</h1>
            <p className="text-slate-600 font-medium max-w-lg mb-8">จัดการชั้นเรียน เช็คชื่อ และตรวจสอบคะแนนกิจกรรมได้อย่างง่ายดายด้วยดีไซน์กระจกใส สบายตา</p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setIsClassModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold btn-primary-glass flex items-center gap-2"
              >
                <Plus weight="bold" /> สร้างชั้นเรียนใหม่
              </button>
              <button 
                onClick={() => setIsRawModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold btn-glass flex items-center gap-2 text-indigo-600"
              >
                <UploadSimple weight="bold" /> นำเข้าข้อมูลสำรอง
              </button>
            </div>
          </div>
        </div>

        {/* Total Students Mini Card */}
        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full opacity-20 blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-inner">
              <UsersThree weight="duotone" className="text-2xl" />
            </div>
            <span className="px-2.5 py-1 bg-white/50 border border-white rounded-lg text-xs font-bold text-slate-500">ทั้งหมด</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">นักเรียนในระบบ</h3>
            <div className="flex items-end gap-2">
              <span className="font-display font-bold text-5xl text-slate-800 tracking-tighter">{totalStudents}</span>
              <span className="font-bold text-slate-400 pb-1.5">คน</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Classes List - Spans 3 cols */}
        <div className="md:col-span-3 glass-card p-6 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-3">
              <Student weight="duotone" className="text-indigo-500" /> ห้องเรียนของคุณ
            </h2>
            <div className="px-3 py-1 bg-indigo-50/50 border border-indigo-100 rounded-lg text-sm font-bold text-indigo-600">
              {totalClasses} ห้อง
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {db?.classes?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                  <UserCircle weight="duotone" className="text-4xl text-slate-300" />
                </div>
                <p className="font-display font-bold text-lg text-slate-500">ยังไม่มีชั้นเรียน</p>
                <p className="text-sm">สร้างชั้นเรียนเพื่อเริ่มต้นเพิ่มรายชื่อนักเรียนและเช็คชื่อ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {db?.classes?.map(cls => (
                  <div key={cls} className="p-5 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/60 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)] group flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="font-display font-bold text-2xl text-slate-800">ชั้น {cls}</h3>
                      <button 
                        onClick={() => { setClassToDelete(cls); setIsConfirmOpen(true); }}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                        title="ลบชั้นเรียน"
                      >
                        <Trash weight="bold" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-500">
                            <Student weight="fill" />
                          </div>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-white/50 px-2 py-1 rounded-md">
                        {getStudentCount(cls)} คน
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel for Status & System - Spans 1 col */}
        <div className="glass-card p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">ข้อมูลระบบ</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner">
                  <CheckSquare weight="duotone" className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">บันทึกการเช็คชื่อ</p>
                  <p className="font-display font-bold text-xl text-slate-800">{totalCheckRecords}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-inner">
                  <TrendUp weight="duotone" className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">การสำรองข้อมูล</p>
                  <p className="font-bold text-sm text-emerald-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> อัปเดตล่าสุด</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <button 
              onClick={handleExportData}
              className="w-full py-3.5 rounded-xl text-sm font-bold btn-glass flex items-center justify-center gap-2 text-slate-700"
            >
              <DownloadSimple weight="bold" /> ดาวน์โหลดข้อมูลสำรอง
            </button>
            <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-sky-50/50 border border-sky-100 text-[10px] font-medium text-sky-700 leading-relaxed">
              <Info weight="fill" className="text-sky-500 text-lg shrink-0" />
              <p>ระบบบันทึกข้อมูลอัตโนมัติบน Cloud แนะนำให้ดาวน์โหลดไฟล์สำรองเก็บไว้สัปดาห์ละ 1 ครั้ง</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals updated to use glassmorphism conceptually (assuming Modal component handles its own overlay) */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="➕ เพิ่มชั้นเรียนใหม่">
        <div className="p-2 space-y-4">
          <p className="text-sm font-medium text-slate-600">โปรดพิมพ์ชื่อห้องเรียนในรูปแบบที่ต้องการ เช่น ม.1/1 หรือ ป.6/2</p>
          <input 
            type="text" 
            className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-800 bg-slate-50" 
            placeholder="เช่น ป.1/1" 
            value={classInput}
            onChange={e => setClassInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddClass()}
            autoFocus
          />
          <button onClick={handleAddClass} className="w-full py-3.5 btn-primary-glass rounded-xl font-bold text-sm">
            ยืนยันการเพิ่มชั้นเรียน
          </button>
        </div>
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="⚠️ ลบชั้นเรียน">
        <div className="space-y-5">
          <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-center">
            <WarningCircle weight="duotone" className="text-5xl text-rose-400 mx-auto mb-2" />
            <p className="text-sm text-slate-700 font-medium">คุณต้องการลบชั้นเรียน <strong className="text-rose-600 text-base">"{classToDelete}"</strong> ใช่หรือไม่?</p>
            <p className="text-xs text-rose-500 mt-2 font-semibold">ข้อมูลนักเรียนและการเช็คชื่อของห้องนี้จะหายไปทั้งหมด</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={() => setIsConfirmOpen(false)} className="py-3 btn-glass rounded-xl font-bold text-slate-700">ยกเลิก</button>
            <button onClick={confirmDeleteClass} className="py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-md font-bold transition-all active:scale-95">ยืนยันการลบ</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isRawModalOpen} onClose={() => setIsRawModalOpen(false)} title="📥 นำเข้าข้อมูล (Import)">
        <div className="p-2 space-y-4">
          <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2">
            <WarningCircle weight="fill" className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-amber-700">คำเตือน: การนำเข้าข้อมูลจะเขียนทับข้อมูลเดิมทั้งหมด โปรดตรวจสอบให้แน่ใจ</p>
          </div>
          <textarea 
            className="w-full px-4 py-4 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-xs font-mono bg-slate-50 h-64 resize-none custom-scrollbar" 
            placeholder="วางโค้ด JSON ที่ได้จากการส่งออกข้อมูลที่นี่..."
            value={rawJsonData}
            onChange={e => setRawJsonData(e.target.value)}
          ></textarea>
          <button onClick={handleImportData} className="w-full py-3.5 btn-primary-glass rounded-xl font-bold text-sm">
            นำเข้าและเขียนทับข้อมูล
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
