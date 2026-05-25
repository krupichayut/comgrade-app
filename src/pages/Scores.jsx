import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { FloppyDisk, ArrowsCounterClockwise } from '@phosphor-icons/react';

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

  // Load existing scores for the selected homework
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
    if (pct >= 80) return { text: "ดีเยี่ยม (4)", class: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (pct >= 70) return { text: "ดีมาก (3)", class: "bg-teal-50 text-teal-700 border-teal-200" };
    if (pct >= 60) return { text: "ดีพอใช้ (2)", class: "bg-amber-50 text-amber-700 border-amber-200" };
    if (pct >= 50) return { text: "ผ่านเกณฑ์ (1)", class: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    return { text: "ต่ำกว่าเกณฑ์", class: "bg-rose-50 text-rose-700 border-rose-200" };
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
    addToast(`บันทึกผลการประเมินคะแนน ${savedCount} รายการสำเร็จเรียบร้อย`, "success");
  };

  // Render Summary
  const renderSummary = () => {
    const classesToRender = sumClass ? [sumClass] : (db?.classes || []);
    
    if (classesToRender.length === 0) {
      return (
        <div className="py-12 text-center text-slate-400 bg-white border rounded-2xl p-8">
          ไม่พบข้อมูลชั้นเรียนและคะแนนสำหรับประเมินผล
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

        const grade = totalPossible > 0 ? evaluateScoreGrade(pct) : { text: "-", class: "" };

        return (
          <tr key={s.id} className="hover:bg-slate-50 transition-colors">
            <td className="py-3 px-5 text-center font-semibold text-slate-600">{s.no}</td>
            <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
            <td className="py-3 px-4 text-center font-medium">{totalEarned} / {totalPossible}</td>
            <td className="py-3 px-4 text-center font-bold text-slate-800">{totalPossible > 0 ? `${pct}%` : "-"}</td>
            <td className="py-3 px-4 text-center">
              {totalPossible > 0 ? <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${grade.class}`}>{grade.text}</span> : '-'}
            </td>
            <td className="py-3 px-4 text-center font-semibold text-indigo-600">{tasksCompleted} / {clsHws.length}</td>
          </tr>
        );
      });

      const classAveragePct = studentClassCount > 0 ? Math.round(sumClassPct / studentClassCount) : 0;

      return (
        <div key={c} className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b flex items-center justify-between bg-indigo-50/20">
            <h4 className="font-display font-bold text-indigo-950">🏫 คะแนนสะสม ชั้น {c}</h4>
            <span className="text-xs font-semibold px-3 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-full">
              คะแนนเฉลี่ยห้อง: {classAveragePct}%
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-400 uppercase">
                  <th className="py-3 px-5 text-center w-20">เลขที่</th>
                  <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-4 text-center">คะแนนรวมสะสม</th>
                  <th className="py-3 px-4 text-center">% คะแนนเฉลี่ย</th>
                  <th className="py-3 px-4 text-center">ระดับผลงาน</th>
                  <th className="py-3 px-4 text-center">จำนวนงานที่ส่ง</th>
                </tr>
              </thead>
              <tbody className="divide-y">{rows}</tbody>
            </table>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex gap-1 border-b pb-1">
        <button 
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all border-b-2 ${activeTab === 'entry' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-indigo-600'}`}
          onClick={() => setActiveTab('entry')}
        >
          ✏️ บันทึกคะแนน
        </button>
        <button 
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all border-b-2 ${activeTab === 'summary' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-indigo-600'}`}
          onClick={() => setActiveTab('summary')}
        >
          📊 รายงานคะแนนสะสม
        </button>
      </div>

      {activeTab === 'entry' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex flex-wrap items-end gap-4 justify-between">
              <div className="flex flex-wrap gap-4 items-end flex-1">
                <div className="w-full sm:w-36">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ชั้นเรียน</label>
                  <select value={scClass} onChange={e => { setScClass(e.target.value); setScHw(''); }} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
                    {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="w-full sm:w-64">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">เลือกใบงาน/การบ้าน</label>
                  <select value={scHw} onChange={e => setScHw(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
                    <option value="">-- โปรดเลือกงาน --</option>
                    {classHws.map(h => <option key={h.id} value={h.id}>{h.title} (เต็ม {h.maxScore})</option>)}
                  </select>
                </div>
              </div>
              <button onClick={saveScores} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 transition-colors">
                <FloppyDisk weight="bold" /> บันทึกตารางคะแนน
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-50/50 text-indigo-900 border-b text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-5 text-center w-20">เลขที่</th>
                  <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-4 text-center w-36">คะแนนที่ได้</th>
                  <th className="py-3 px-4 text-center w-28">คะแนนเต็ม</th>
                  <th className="py-3 px-4 text-center w-28">คิดเป็น %</th>
                  <th className="py-3 px-4 text-center w-36">ประเมินผล</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {!selectedHw ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">โปรดเลือกงานเพื่อบันทึกคะแนน</td>
                  </tr>
                ) : entryStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">ไม่พบรายชื่อนักเรียนในชั้น {scClass}</td>
                  </tr>
                ) : (
                  entryStudents.map(s => {
                    const val = currentScores[s.id] !== undefined ? currentScores[s.id] : '';
                    let pct = 0;
                    let pctText = "-";
                    let grade = { text: "-", class: "" };
                    
                    if (val !== '' && !isNaN(val)) {
                      const scoreNum = parseFloat(val);
                      pct = selectedHw.maxScore > 0 ? Math.round((scoreNum / selectedHw.maxScore) * 100) : 0;
                      pctText = `${pct}%`;
                      grade = evaluateScoreGrade(pct);
                    }

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-5 text-center font-semibold text-slate-600">{s.no}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                        <td className="py-3 px-4 text-center">
                          <input 
                            type="number" 
                            min="0" 
                            max={selectedHw.maxScore} 
                            step="any"
                            value={val}
                            onChange={e => handleScoreChange(s.id, e.target.value)}
                            className="w-20 px-2.5 py-1.5 border border-slate-200 rounded-lg text-center font-semibold focus:border-indigo-500 outline-none" 
                            placeholder="0" 
                          />
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-500">{selectedHw.maxScore}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-700">{pctText}</td>
                        <td className="py-3 px-4 text-center">
                          {grade.text !== '-' ? <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${grade.class}`}>{grade.text}</span> : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-48">
                <label className="block text-xs font-semibold text-slate-500 mb-1">กรองชั้นเรียน</label>
                <select value={sumClass} onChange={e => setSumClass(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
                  <option value="">เลือกทุกชั้นเรียน</option>
                  {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
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
