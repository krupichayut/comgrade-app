import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { FloppyDisk, ArrowsCounterClockwise } from '@phosphor-icons/react';

const Scores = () => {
  const { db } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('entry'); // 'entry' | 'summary'
  const [scClass, setScClass] = useState(db?.classes[0] || '');
  const [scHw, setScHw] = useState('');
  
  // Derived state
  const classHws = db?.homework?.filter(hw => hw.class === scClass || hw.class === 'ทุกชั้นเรียน') || [];
  const selectedHw = classHws.find(h => h.id === scHw);

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
                  <select value={scClass} onChange={e => setScClass(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
                    {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="w-full sm:w-64">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">เลือกใบงาน/การบ้าน</label>
                  <select value={scHw} onChange={e => setScHw(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
                    <option value="">-- โปรดเลือกงาน --</option>
                    {classHws.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
                  </select>
                </div>
              </div>
              <button className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 transition-colors">
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
                  <th className="py-3 px-4 text-center w-32">ประเมินผล</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">โปรดเลือกงานเพื่อบันทึกคะแนน</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-36">
                <label className="block text-xs font-semibold text-slate-500 mb-1">กรองชั้นเรียน</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:border-indigo-500">
                  {db?.classes?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button className="self-end px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center gap-1 transition-colors">
                <ArrowsCounterClockwise weight="bold" /> ประมวลผลใหม่
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-500">
            คลิกปุ่มประมวลผลเพื่อดูรายงานสรุปคะแนน
          </div>
        </div>
      )}
    </div>
  );
};

export default Scores;
