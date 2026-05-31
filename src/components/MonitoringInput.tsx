import React, { useState, useMemo } from 'react';
import { NARRATIVE_TEMPLATES } from '../constants';
import { Score, DailyRecord, Student, Indicator } from '../types';
import { Send, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MonitoringInputProps {
  student: Student;
  onSave: (record: DailyRecord) => void;
}

export const MonitoringInput = ({ student, onSave }: MonitoringInputProps) => {
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [activityLog, setActivityLog] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Group indicators by category
  const categories = useMemo(() => {
    const groups: Record<string, Indicator[]> = {};
    const indicators = student.indicators || [];
    indicators.forEach(ind => {
      if (!groups[ind.category]) groups[ind.category] = [];
      groups[ind.category].push(ind);
    });
    return Object.entries(groups);
  }, [student.indicators]);

  const generateNarrative = (indicator: Indicator, score: Score) => {
    if (!score) return '';
    const template = NARRATIVE_TEMPLATES[score];
    return template.replace('[program]', indicator.text);
  };

  const narratives = useMemo(() => {
    return Object.entries(scores).map(([id, score]) => {
      const indicator = student.indicators?.find(i => i.id === id);
      if (!indicator) return null;
      return {
        id,
        category: indicator.category,
        text: generateNarrative(indicator, score as Score)
      };
    }).filter(Boolean);
  }, [scores, student.indicators]);

  const handleScoreChange = (id: string, score: Score) => {
    setScores(prev => ({ ...prev, [id]: score }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      onSave({
        id: Date.now().toString(),
        studentId: student.id,
        date: new Date().toISOString(),
        scores,
        activityLog,
      });
      setIsSaving(false);
      setScores({});
      setActivityLog('');
    }, 1000);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full overflow-hidden">
      {/* Column 1: Scoring Forms */}
      <section className="col-span-12 lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {categories.map(([category, items]) => (
          <div key={category} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
              {category}
            </h3>
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id}>
                  <label className="text-[11px] text-slate-500 block mb-2 font-semibold uppercase tracking-wider">
                    {item.text}
                  </label>
                  <div className="flex justify-between gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleScoreChange(item.id, s as Score)}
                        className={`w-full text-center py-2.5 rounded-lg border text-xs transition-all ${
                          scores[item.id] === s
                            ? "border-blue-500 bg-blue-50 text-blue-600 font-bold ring-2 ring-blue-500/20"
                            : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm mt-2">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
            Daily Activity Log
          </h3>
          <textarea
            value={activityLog}
            onChange={(e) => setActivityLog(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32 transition-all"
            placeholder="e.g. Sholat dzuhur berjamaah, makan siang spageti, membantu merapikan alat tulis..."
          ></textarea>
        </div>
      </section>

      {/* Column 2: Live Narrative Preview */}
      <section className="col-span-12 lg:col-span-7 flex flex-col gap-6">
        <div className="bg-white rounded-xl flex-1 border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Narrative Preview</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black">Live Generation</p>
            </div>
            <span className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 size={10} /> Live Sync
            </span>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
            {narratives.length === 0 && !activityLog && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 p-8 text-center">
                <FileText size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-sm">Start scoring or adding logs to see the narrative preview</p>
              </div>
            )}
            
            <AnimatePresence mode="popLayout">
              {narratives.map((nar, idx) => (
                <motion.div
                  key={nar?.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-50 border-l-4 border-blue-500 p-4 rounded-r-lg group hover:bg-blue-50 transition-colors"
                >
                  <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">{nar?.category}</p>
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    {nar?.text}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>

            {activityLog && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-50 border-l-4 border-amber-500 p-4 rounded-r-lg"
              >
                <p className="text-[10px] text-amber-600 font-bold uppercase mb-1">Aktivitas Tambahan</p>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  {activityLog}
                </p>
              </motion.div>
            )}

            {(narratives.length > 0 || activityLog) && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 uppercase font-extrabold mb-3 tracking-widest">Automation Intelligence</p>
                <div className="bg-blue-900 text-blue-50 p-4 rounded-xl border border-blue-800 shadow-xl shadow-blue-900/20">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                      <span className="text-xs font-black">AI</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold mb-1">Observation Insights:</p>
                      <p className="text-xs text-blue-200/90 leading-relaxed">
                        Generating real-time insights based on {narratives.length} specific indicators and activity logs. 
                        Final report will contain a complete behavioral narrative.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <button
              onClick={handleSubmit}
              disabled={isSaving || (Object.keys(scores).length === 0 && !activityLog)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isSaving ? "Processing..." : "Finalize & Save Daily Report"}
              {!isSaving && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
