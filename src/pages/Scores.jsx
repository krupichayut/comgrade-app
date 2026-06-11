import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { FloppyDisk, Star, FileText, Warning, ChartBarHorizontal } from '@phosphor-icons/react';

const Scores = () => {
  const { db, setDb } = useContext(AppContext);
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('entry'); // 'entry' | 'summary'
  
  // Entry States
  const [scClass, setScClass] = useState(db?.classes?.[0] || '');
  const [scHw, setScHw] = useState('');
  const [currentScores, setCurrentScores] = useState({});

  // Summary States
  const [sumClass, setSumClass] = useState('');

  // Derived data
  const classHws = db?.homework?.filter(hw => hw.cls === scClass || hw.cls === 'ทุกชั้นเรียน') || [];
  const selectedHw = classHws.find(h => h.id.toString() === scHw.toString());
  const entryStudents = db?.students?.filter(s => s.cls === scClass)?.sort((a, b) => a.no - b.no) || [];

  useEffect(() => {
    if (selectedHw && db?.scores) {
      const initialScores = {};
      entryStudents.forEach(s => {
        const key = `${selectedHw.id}_${s.id}`;
        if (db.scores[key] !== undefined) {
          initialScores[s.id] = db.scores[key];
        }
      });
      setCurrentScores(initialScores);
    } else {
      setCurrentScores({});
    }
  }, [scHw, scClass, db]);

  const handleScoreChange = (studentId, val) => {
    setCurrentScores(prev => ({ ...prev, [studentId]: val }));
  };

  const evaluateScoreGrade = (pct) => {
    if (pct >= 80) return { text: "ดีเยี่ยม (4)", class: "bg-emerald-100/50 text-emerald-700 border-emerald-200" };
    if (pct >= 70) return { text: "ดีมาก (3)", class: "bg-teal-100/50 text-teal-700 border-teal-200" };
    if (pct >= 60) return { text: "ดีพอใช้ (2)", class: "bg-amber-100/50 text-amber-700 border-amber-200" };
    if (pct >= 50) return { text: "ผ่านเกณฑ์ (1)", class: "bg-indigo-100/50 text-indigo-700 border-indigo-200" };
    return { text: "ไม่ผ่านเกณฑ์", class: "bg-rose-100/50 text-rose-700 border-rose-200" };
  };

  const saveScores = () => {
    if (!selectedHw) return addToast("กรุณาเลือกชื่องานกิจกรรม", "error");

    const newDb = { ...db };
    if (!newDb.scores) newDb.scores = {};
    
    let savedCount = 0;

    entryStudents.forEach(s => {
      const val = currentScores[s.id];
      const key = `${selectedHw.id}_${s.id}`;
      
      if (val === "" || val === undefined) {
        delete newDb.scores[key];
      } else {
        newDb.scores[key] = parseFloat(val);
        savedCount++;
      }
    });

    setDb(newDb);
    addToast(`บันทึกคะแนนสำเร็จ ${savedCount} รายการ`, "success");
  };

  const renderSummary = () => {
    const classesToRender = sumClass ? [sumClass] : (db?.classes || []);
    
    if (classesToRender.length === 0) {
      return (
        <div className="glass-card py-16 text-center text-slate-400">
           <Warning weight="duotone" className="text-6xl mx-auto mb-4 text-slate-300" />
          <p className="font-display font-medium text-lg">ไม่พบข้อมูลชั้นเรียนในระบบ</p>
        </div>
      );
    }

    return classesToRender.map(c => {
      const students = db?.students?.filter(s => s.cls === c)?.sort((a, b) => a.no - b.no) || [];
      if (students.length === 0) return null;

      const clsHws = db?.homework?.filter(h => h.cls === c || h.cls === 'ทุกชั้นเรียน') || [];
      let sumClassPct = 0;
      let studentClassCount = 0;

      const rows = students.map(s => {
        let totalEarned = 0;
        let totalPossible = 0;
        let tasksCompleted = 0;

        clsHws.forEach(h => {
          const score = db?.scores?.[`${h.id}_${s.id}`];
          if (score !== undefined && score !== null) {
            totalEarned += score;
            totalPossible += h.maxScore;
            tasksCompleted++;
          }
        });

        const pct = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
        if (totalPossible > 0) { sumClassPct += pct; studentClassCount++; }

        const grade = totalPossible > 0 ? evaluateScoreGrade(pct) : { text: "-", class: "bg-white/40 text-slate-400 border-white/60" };

        return (
          <tr key={s.id} className="hover:bg-white/50 transition-colors group">
            <td className="py-4 px-6 text-center font-bold text-slate-400">{s.no}</td>
            <td className="py-4 px-4 font-bold text-slate-800">{s.name}</td>
            <td className="py-4 px-4 text-center">
              <span className="font-mono font-bold text-slate-600 bg-white/50 px-3 py-1.5 rounded-lg border border-white">{totalEarned} / {totalPossible}</span>
            </td>
            <td className="py-4 px-4 text-center">
               <span className={`font-display font-bold text-2xl ${pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-indigo-500' : 'text-rose-500'}`}>
                 {totalPossible > 0 ? `${pct}%` : "-"}
               </span>
            </td>
            <td className="py-4 px-4 text-center">
              {totalPossible > 0 ? <span className={`px-3 py-1.5 text-xs font-bold rounded-xl border shadow-sm ${grade.class}`}>{grade.text}</span> : '-'}
            </td>
            <td className="py-4 px-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/40 rounded-xl border border-white">
                <span className="font-bold text-indigo-600">{tasksCompleted}</span> 
                <span className="text-slate-400 text-[10px]">/ {clsHws.length}</span>
              </div>
            </td>
          </tr>
        );
      });

      const classAveragePct = studentClassCount > 0 ? Math.round(sumClassPct / studentClassCount) : 0;

      return (
        <div key={c} className="glass-card overflow-hidden mb-8">
          <div className="px-6 py-6 border-b border-white/60 bg-white/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                <Star weight="fill" className="text-2xl" />
              </div>
              <h4 className="font-display font-bold text-2xl text-slate-800">คะแนนสะสม ชั้น {c}</h4>
            </div>
            <div className="flex items-center gap-3 bg-white/60 px-5 py-2.5 rounded-2xl border border-white shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase">ค่าเฉลี่ยห้อง</span>
              <span className="font-display font-bold text-2xl text-indigo-600">{classAveragePct}%</span>
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr>
                  <th className="py-5 px-6 text-center w-20">เลขที่</th>
                  <th className="py-5 px-4">ชื่อ-นามสกุล</th>
                  <th className="py-5 px-4 text-center">คะแนนรวม</th>
                  <th className="py-5 px-4 text-center">% เฉลี่ย</th>
                  <th className="py-5 px-4 text-center">ระดับผลงาน</th>
                  <th className="py-5 px-4 text-center">ส่งงานแล้ว</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">{rows}</tbody>
            </table>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Premium Tabs */}
      <div className="flex gap-2 p-1.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 w-fit">
        <button 
          className={`px-6 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'entry' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'}`}
          onClick={() => setActiveTab('entry')}
        >
          ✏️ บันทึกตารางคะแนน
        </button>
        <button 
          className={`px-6 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'summary' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'}`}
          onClick={() => setActiveTab('summary')}
        >
          📊 รายงานคะแนนสะสม
        </button>
      </div>

      {activeTab === 'entry' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass-card p-6 flex flex-col lg:flex-row gap-6 items-center justify-between z-10 relative">
            <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto flex-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-400 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                <ChartBarHorizontal weight="duotone" className="text-3xl" />
              </div>
              
              <div className="flex bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 p-1 shadow-sm">
                <select value={scClass} onChange={e => { setScClass(e.target.value); setScHw(''); }} className="bg-transparent pl-4 pr-8 py-2.5 outline-none text-sm font-bold text-indigo-900 cursor-pointer">
                  {db?.classes?.length === 0 && <option value="">ไม่มีห้องเรียน</option>}
                  {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
                </select>
                <div className="w-[1px] bg-white mx-1 my-2"></div>
                <select value={scHw} onChange={e => setScHw(e.target.value)} className="bg-transparent pl-4 pr-8 py-2.5 outline-none text-sm font-bold text-slate-700 cursor-pointer">
                  <option value="">-- โปรดเลือกงาน --</option>
                  {classHws.map(h => <option key={h.id} value={h.id}>{h.title} (เต็ม {h.maxScore})</option>)}
                </select>
              </div>
            </div>
            <button onClick={saveScores} className="w-full lg:w-auto px-6 py-3.5 btn-primary-glass bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-500/30 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2">
              <FloppyDisk weight="fill" className="text-lg" /> บันทึกตารางคะแนน
            </button>
          </div>
          
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-5 px-6 text-center w-20">เลขที่</th>
                    <th className="py-5 px-4">ชื่อ-นามสกุลนักเรียน</th>
                    <th className="py-5 px-4 text-center w-40">คะแนนที่ได้</th>
                    <th className="py-5 px-4 text-center w-28">คะแนนเต็ม</th>
                    <th className="py-5 px-4 text-center w-28 text-indigo-600">%</th>
                    <th className="py-5 px-4 text-center w-40">ประเมินผล</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40 text-sm">
                  {!selectedHw ? (
                    <tr>
                      <td colSpan="6" className="py-20 text-center text-slate-400">
                        <FileText weight="duotone" className="text-7xl mx-auto mb-4 text-slate-300" />
                        <p className="font-display font-medium text-xl text-slate-500">โปรดเลือกชิ้นงาน</p>
                        <p className="text-sm mt-2">เพื่อเริ่มกรอกคะแนนให้กับนักเรียนแต่ละคน</p>
                      </td>
                    </tr>
                  ) : entryStudents.length === 0 ? (
                    <tr><td colSpan="6" className="py-20 text-center text-slate-400">ไม่พบรายชื่อนักเรียนในห้องนี้</td></tr>
                  ) : (
                    entryStudents.map(s => {
                      const val = currentScores[s.id] !== undefined ? currentScores[s.id] : '';
                      let pct = 0; let pctText = "-"; let grade = { text: "-", class: "bg-white/40 text-slate-400 border-white/60" };
                      
                      if (val !== '' && !isNaN(val)) {
                        pct = selectedHw.maxScore > 0 ? Math.round((parseFloat(val) / selectedHw.maxScore) * 100) : 0;
                        pctText = `${pct}%`;
                        grade = evaluateScoreGrade(pct);
                      }

                      return (
                        <tr key={s.id} className="hover:bg-white/50 transition-colors group">
                          <td className="py-4 px-6 text-center font-bold text-slate-400">{s.no}</td>
                          <td className="py-4 px-4 font-bold text-slate-800">{s.name}</td>
                          <td className="py-4 px-4 text-center">
                            <input 
                              type="number" min="0" max={selectedHw.maxScore} step="any"
                              value={val} onChange={e => handleScoreChange(s.id, e.target.value)}
                              className="w-24 px-4 py-2 bg-white/60 border border-white/80 rounded-xl text-center font-bold text-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none transition-all shadow-inner" 
                              placeholder="0" 
                            />
                          </td>
                          <td className="py-4 px-4 text-center font-bold text-slate-400">{selectedHw.maxScore}</td>
                          <td className="py-4 px-4 text-center font-display font-bold text-xl text-slate-700">{pctText}</td>
                          <td className="py-4 px-4 text-center">
                            {grade.text !== '-' ? <span className={`px-3 py-1.5 text-xs font-bold rounded-xl border shadow-sm ${grade.class}`}>{grade.text}</span> : '-'}
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
      )}

      {activeTab === 'summary' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass-card p-6 flex items-center justify-between z-10 relative">
            <div className="w-full sm:w-auto flex items-center gap-4">
              <label className="text-xs font-bold text-slate-500 uppercase">แสดงผลชั้นเรียน</label>
              <select value={sumClass} onChange={e => setSumClass(e.target.value)} className="w-48 px-4 py-2.5 bg-white/60 border border-white rounded-2xl outline-none text-sm font-bold text-indigo-900 focus:bg-white transition-all cursor-pointer">
                <option value="">สรุปทุกชั้นเรียน</option>
                {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
              </select>
            </div>
          </div>
          <div>{renderSummary()}</div>
        </div>
      )}
    </div>
  );
};

export default Scores;
