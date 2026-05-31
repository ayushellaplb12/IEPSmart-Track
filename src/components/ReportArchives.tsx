import React, { useState } from 'react';
import { DailyRecord } from '../types';
import { FileText, Search, Calendar, Download, Eye, Clock, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ReportArchivesProps {
  records: DailyRecord[];
}

export const ReportArchives = ({ records }: ReportArchivesProps) => {
  const [search, setSearch] = useState('');

  const filteredRecords = records.filter(r => 
    r.activityLog.toLowerCase().includes(search.toLowerCase()) ||
    format(new Date(r.date), 'MMMM yyyy', { locale: id }).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search activity logs or dates..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
           <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 flex items-center gap-2">
            <Download size={16} /> Batch Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar">
        {filteredRecords.map(record => (
          <div key={record.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ring-1 ring-slate-100 px-2 py-1 rounded">Daily Report</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-tight mb-1">Generated On</p>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Calendar size={14} className="text-blue-500" />
                  {format(new Date(record.date), 'EEEE, d MMMM yyyy', { locale: id })}
                </div>
              </div>

              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-tight mb-1">Observation Activity</p>
                <p className="text-xs text-slate-500 line-clamp-2 italic leading-relaxed">
                  "{record.activityLog || 'No activity notes logged for this day.'}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <Clock size={12} />
                  {format(new Date(record.date), 'HH:mm')}
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredRecords.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-2xl border border-slate-200 border-dashed text-center flex flex-col items-center justify-center gap-3">
            <Archive size={48} className="text-slate-200" />
            <p className="text-sm text-slate-400 font-medium">No archived reports found or synced.</p>
          </div>
        )}
      </div>
    </div>
  );
};
