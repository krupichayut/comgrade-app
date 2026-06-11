import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { FloppyDisk, ArrowsCounterClockwise, Star, FileText, CheckCircle, Warning } from '@phosphor-icons/react';

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
    if (pct >= 80) return { text: "ดีเยี่ยม (4)", class: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100" };
    if (pct >= 70) return { text: "ดีมาก (3)", class: "bg-teal-50 text-teal-700 border-teal-200 shadow-teal-100" };
    if (pct >= 60) return { text: "ดีพอใช้ (2)", class: "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100" };
    if (pct >= 50) return { text: "ผ่านเกณฑ์ (1)", class: "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-100" };
    return { text: "ไม่ผ่านเกณฑ์", class: "bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100" };
  };

  const saveScores = () => {
    if (!selectedHw) {
      addToast("กรุณาเลือกชื่องานกิจกรรมที่ต้องการลงบันทึกคะแนน", "error");
      return;
    }

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
    addToast(`บันทึกผลคะแนน ${savedCount} รายการเรียบร้อยแล้ว`, "success");
  };

  const renderSummary = () => {
    const classesToRender = sumClass ? [sumClass] : (db?.classes || []);
    
    if (classesToRender.length === 0) {
      return (
        <div className="premium-card py-16 text-center text-slate-400">
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
        if (totalPossible > 0) {
          sumClassPct += pct;
          studentClassCount++;
        }

        const grade = totalPossible > 0 ? evaluateScoreGrade(pct) : { text: "-", class: "bg-slate-50 text-slate-400 border-slate-200" };

        return (
          <tr key={s.id} className="hover:bg-indigo-50/40 transition-colors group">
            <td className="py-3 px-5 text-center font-bold text-slate-400">{s.no}</td>
            <td className="py-3 px-4">
              <div className="font-bold text-slate-800">{s.name}</div>
            </td>
            <td className="py-3 px-4 text-center">
              <span className="font-mono font-medium text-slate-600">{totalEarned} / {totalPossible}</span>
            </td>
            <td className="py-3 px-4 text-center">
               <span className={`font-display font-bold text-lg ${pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-indigo-500' : 'text-rose-500'}`}>
                 {totalPossible > 0 ? `${pct}%` : "-"}
               </span>
            </td>
            <td className="py-3 px-4 text-center">
              {totalPossible > 0 ? <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border shadow-sm ${grade.class}`}>{grade.text}</span> : '-'}
            </td>
            <td className="py-3 px-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-indigo-600">{tasksCompleted}</span> 
                <span className="text-slate-400 text-xs">/ {clsHws.length} งาน</span>
              </div>
            </td>
          </tr>
        );
      });

      const classAveragePct = studentClassCount > 0 ? Math.round(sumClassPct / studentClassCount) : 0;

      return (
        <div key={c} className="premium-card overflow-hidden mb-6">
          <div className="px-6 py-5 border-b flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Star weight="fill" className="text-lg" />
              </div>
              <h4 className="font-display font-bold text-xl text-indigo-950">คะแนนสะสม ชั้น {c}</h4>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">ค่าเฉลี่ยห้อง</span>
              <span className="font-display font-bold text-xl text-indigo-600">{classAveragePct}%</span>
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr>
                  <th className="py-4 px-5 text-center w-20">เลขที่</th>
                  <th className="py-4 px-4">ชื่อ-นามสกุล</th>
                  <th className="py-4 px-4 text-center">คะแนนรวมสะสม</th>
                  <th className="py-4 px-4 text-center">% คะแนนเฉลี่ย</th>
                  <th className="py-4 px-4 text-center">ระดับผลงาน</th>
                  <th className="py-4 px-4 text-center">จำนวนงานที่ส่ง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">{rows}</tbody>
            </table>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-200/50 backdrop-blur-sm rounded-2xl w-fit">
        <button 
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'entry' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'}`}
          onClick={() => setActiveTab('entry')}
        >
          ✏️ บันทึกตารางคะแนน
        </button>
        <button 
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'summary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'}`}
          onClick={() => setActiveTab('summary')}
        >
          📊 รายงานคะแนนสะสมห้อง
        </button>
      </div>

      {activeTab === 'entry' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="premium-card p-4 flex flex-col lg:flex-row gap-4 items-center justify-between z-10 relative">
            <div className="flex flex-wrap gap-4 items-end w-full lg:w-auto flex-1">
              <div className="w-full sm:w-36">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ชั้นเรียน</label>
                <select value={scClass} onChange={e => { setScClass(e.target.value); setScHw(''); }} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-slate-50 text-indigo-900 focus:border-indigo-500 transition-all">
                  {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
                </select>
              </div>
              <div className="w-full sm:w-72">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">เลือกใบงาน/กิจกรรม</label>
                <select value={scHw} onChange={e => setScHw(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-slate-50 focus:border-indigo-500 transition-all text-slate-700">
                  <option value="">-- โปรดเลือกงาน --</option>
                  {classHws.map(h => <option key={h.id} value={h.id}>{h.title} (เต็ม {h.maxScore})</option>)}
                </select>
              </div>
            </div>
            <button onClick={saveScores} className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 btn-premium">
              <FloppyDisk weight="fill" className="text-lg" /> บันทึกตารางคะแนน
            </button>
          </div>
          
          <div className="premium-card overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-4 px-5 text-center w-20">เลขที่</th>
                    <th className="py-4 px-4">ชื่อ-นามสกุลนักเรียน</th>
                    <th className="py-4 px-4 text-center w-36">คะแนนที่ได้</th>
                    <th className="py-4 px-4 text-center w-28">คะแนนเต็ม</th>
                    <th className="py-4 px-4 text-center w-28 text-indigo-600">คิดเป็น %</th>
                    <th className="py-4 px-4 text-center w-36">ประเมินผล</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {!selectedHw ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-slate-400 bg-slate-50/50">
                        <FileText weight="duotone" className="text-6xl mx-auto mb-3 text-slate-300" />
                        <p className="font-display font-medium text-lg">โปรดเลือกชิ้นงาน</p>
                        <p className="text-xs mt-1">เพื่อเริ่มกรอกคะแนนให้กับนักเรียนแต่ละคน</p>
                      </td>
                    </tr>
                  ) : entryStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-slate-400 bg-slate-50/50">ไม่พบรายชื่อนักเรียนในชั้น {scClass}</td>
                    </tr>
                  ) : (
                    entryStudents.map(s => {
                      const val = currentScores[s.id] !== undefined ? currentScores[s.id] : '';
                      let pct = 0;
                      let pctText = "-";
                      let grade = { text: "-", class: "bg-slate-50 text-slate-400 border-slate-200" };
                      
                      if (val !== '' && !isNaN(val)) {
                        const scoreNum = parseFloat(val);
                        pct = selectedHw.maxScore > 0 ? Math.round((scoreNum / selectedHw.maxScore) * 100) : 0;
                        pctText = `${pct}%`;
                        grade = evaluateScoreGrade(pct);
                      }

                      return (
                        <tr key={s.id} className="hover:bg-indigo-50/40 transition-colors group">
                          <td className="py-3 px-5 text-center font-bold text-slate-400">{s.no}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                          <td className="py-3 px-4 text-center">
                            <input 
                              type="number" 
                              min="0" 
                              max={selectedHw.maxScore} 
                              step="any"
                              value={val}
                              onChange={e => handleScoreChange(s.id, e.target.value)}
                              className="w-24 px-3 py-2 border border-slate-200 rounded-xl text-center font-bold text-indigo-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-inner bg-slate-50" 
                              placeholder="0" 
                            />
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-400">{selectedHw.maxScore}</td>
                          <td className="py-3 px-4 text-center font-display font-bold text-lg text-slate-700">{pctText}</td>
                          <td className="py-3 px-4 text-center">
                            {grade.text !== '-' ? <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border shadow-sm ${grade.class}`}>{grade.text}</span> : '-'}
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="premium-card p-4 flex items-center justify-between z-10 relative">
            <div className="w-full sm:w-64">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">แสดงผลสำหรับชั้นเรียน</label>
              <select value={sumClass} onChange={e => setSumClass(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-slate-50 text-indigo-900 focus:border-indigo-500 transition-all">
                <option value="">สรุปยอดรวมทุกชั้นเรียน</option>
                {db?.classes?.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
              </select>
            </div>
          </div>
          <div>
            {renderSummary()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scores;
