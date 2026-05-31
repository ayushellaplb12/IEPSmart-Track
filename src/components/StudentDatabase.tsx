import React, { useState } from 'react';
import { Search, Filter, MoreVertical, GraduationCap, Plus, Trash2, X, FileText, UploadCloud, CheckCircle2, Paperclip } from 'lucide-react';
import { Student, Indicator } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface StudentDatabaseProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onDeleteStudent: (id: string) => void;
  onUpdateStudent?: (student: Student) => void;
}

export const StudentDatabase = ({ students, onAddStudent, onDeleteStudent, onUpdateStudent }: StudentDatabaseProps) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; date: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'pdf' || extension === 'docx' || extension === 'doc') {
        const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        setUploadedFile({
          name: file.name,
          size: sizeStr,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        });
      } else {
        alert('Format file tidak didukung. Harap upload berkas PDF atau DOCX.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'pdf' || extension === 'docx' || extension === 'doc') {
        const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        setUploadedFile({
          name: file.name,
          size: sizeStr,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        });
      } else {
        alert('Format file tidak didukung. Harap upload berkas PDF atau DOCX.');
      }
    }
  };
  
  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newNisn, setNewNisn] = useState('');
  const [newNis, setNewNis] = useState('');
  const [newGender, setNewGender] = useState('Laki-laki');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newIndicators, setNewIndicators] = useState<Indicator[]>([]);
  const [tempIndicator, setTempIndicator] = useState({ category: '', text: '' });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.nisn && s.nisn.includes(search))
  );

  const handleAddIndicator = () => {
    if (!tempIndicator.category || !tempIndicator.text) return;
    setNewIndicators([...newIndicators, { ...tempIndicator, id: Math.random().toString(36).substr(2, 9) }]);
    setTempIndicator({ category: '', text: '' });
  };

  const removeIndicator = (id: string) => {
    setNewIndicators(newIndicators.filter(i => i.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStudent({
      name: newName,
      class: newClass,
      nisn: newNisn,
      nis: newNis,
      gender: newGender,
      birthDate: newBirthDate,
      chronologicalAge: newAge,
      parentName: newParentName,
      address: newAddress,
      phone: newPhone,
      schoolName: 'Lazuardi Global Compassionate School',
      indicators: newIndicators,
      uploadedFile: uploadedFile || undefined
    });
    // Reset form
    setNewName('');
    setNewClass('');
    setNewNisn('');
    setNewNis('');
    setNewGender('Laki-laki');
    setNewBirthDate('');
    setNewAge('');
    setNewParentName('');
    setNewAddress('');
    setNewPhone('');
    setNewIndicators([]);
    setUploadedFile(null);
    setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col gap-6 relative">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or NISN..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 hover:bg-blue-700 transition-all"
          >
            <Plus size={18} /> Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">NISN</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Programs</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">IEP Document File</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Synced Profile</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{student.nisn}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase">
                      {student.class}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1">
                      {student.indicators?.length || 0} Skills
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {student.uploadedFile ? (
                      <div className="flex items-center gap-2 group/file bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 max-w-xs justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={16} className="text-rose-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]" title={student.uploadedFile.name}>
                              {student.uploadedFile.name}
                            </p>
                            <span className="text-[9px] text-slate-400 block -mt-0.5">{student.uploadedFile.size}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateStudent) {
                              onUpdateStudent({
                                ...student,
                                uploadedFile: undefined
                              });
                            }
                          }}
                          className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition-all shrink-0 ml-2 animate-bounce"
                          title="Hapus Lampiran"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative inline-block">
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc"
                          id={`row-file-${student.id}`}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              const file = files[0];
                              const extension = file.name.split('.').pop()?.toLowerCase();
                              if (extension === 'pdf' || extension === 'docx' || extension === 'doc') {
                                const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
                                if (onUpdateStudent) {
                                  onUpdateStudent({
                                    ...student,
                                    uploadedFile: {
                                      name: file.name,
                                      size: sizeStr,
                                      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                    }
                                  });
                                }
                              } else {
                                alert('Format file tidak didukung. Harap upload berkas PDF atau DOCX.');
                              }
                            }
                          }}
                        />
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-slate-500 hover:text-blue-600 transition-all text-[11px] font-bold">
                          <UploadCloud size={14} className="text-blue-400 group-hover:text-blue-600" />
                          Upload IEP (.pdf/.docx)
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDeleteStudent(student.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <GraduationCap size={64} className="text-slate-100" />
            <p className="text-sm text-slate-400 font-medium tracking-tight">No student profiles found.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">New Student Profile</h3>
                  <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest">Configuration & IEP Setup</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 bg-white hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 shadow-sm"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Name</label>
                    <input 
                      required
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NISN ID</label>
                    <input 
                      required
                      value={newNisn}
                      onChange={e => setNewNisn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                      placeholder="e.g. 3164057454"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIS ID (School Number)</label>
                    <input 
                      value={newNis}
                      onChange={e => setNewNis(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                      placeholder="e.g. 2311073"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade / Class</label>
                    <input 
                      required
                      value={newClass}
                      onChange={e => setNewClass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                      placeholder="e.g. 3 Saola"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                    <select
                      value={newGender}
                      onChange={e => setNewGender(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                    <input 
                      value={newBirthDate}
                      onChange={e => setNewBirthDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="e.g. 11 Januari 2016"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chronological Age</label>
                    <input 
                      value={newAge}
                      onChange={e => setNewAge(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="e.g. 10 tahun"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Orang Tua / Wali</label>
                    <input 
                      value={newParentName}
                      onChange={e => setNewParentName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="e.g. Andi Erlina"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No. Telepon / HP</label>
                    <input 
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="e.g. 081399626439"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Rumah Lengkap</label>
                    <textarea 
                      value={newAddress}
                      onChange={e => setNewAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all h-20 outline-none"
                      placeholder="e.g. Jl. H Raisan. Komp. Villa Raisan No.47 A..."
                    />
                  </div>
                </div>

                {/* IEP Document Upload Section */}
                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Upload Dokumen Lampiran IEP (.pdf, .docx)
                  </label>
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-3xl p-6 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer relative ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : uploadedFile 
                          ? 'border-emerald-500 bg-emerald-50/10' 
                          : 'border-slate-200 hover:border-slate-400 bg-slate-50/50'
                    }`}
                  >
                    <input 
                      type="file" 
                      accept=".pdf,.docx,.doc" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    
                    {uploadedFile ? (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{uploadedFile.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{uploadedFile.size} • Diupload {uploadedFile.date}</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setUploadedFile(null);
                          }}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[10px] font-bold mt-1 transition-all"
                        >
                          Hapus File
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-sm animate-pulse">
                          <UploadCloud size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-600">Seret & letakkan berkas di sini, atau <span className="text-blue-600 hover:underline">pilih file</span></p>
                          <p className="text-[10px] text-slate-400 mt-1">Mendukung format PDF atau DOCX (Max 10 MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Plus size={14} className="text-blue-500" />
                    Personalized IEP Indicators
                  </h4>
                  <div className="bg-slate-900 rounded-3xl p-6 space-y-4 shadow-xl shadow-slate-900/10">
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-12 lg:col-span-4 space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Category</label>
                        <input 
                          value={tempIndicator.category}
                          onChange={e => setTempIndicator({...tempIndicator, category: e.target.value})}
                          className="w-full bg-slate-800 border-none rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="e.g. Literacy"
                        />
                      </div>
                      <div className="col-span-12 lg:col-span-6 space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">IEP Program Detail</label>
                        <input 
                          value={tempIndicator.text}
                          onChange={e => setTempIndicator({...tempIndicator, text: e.target.value})}
                          className="w-full bg-slate-800 border-none rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="e.g. Can solve division problems"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={handleAddIndicator}
                        className="col-span-12 lg:col-span-2 bg-blue-600 text-white rounded-xl h-[38px] flex items-center justify-center hover:bg-blue-500 transition-all font-bold text-xs"
                      >
                        ADD
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {newIndicators.map(ind => (
                        <div key={ind.id} className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-200 rounded-xl text-[10px] font-medium border border-slate-700">
                          <span className="text-blue-400 font-bold uppercase tracking-tight">{ind.category}:</span>
                          {ind.text}
                          <button 
                            type="button"
                            onClick={() => removeIndicator(ind.id)}
                            className="p-1 hover:bg-slate-700 rounded-full text-slate-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {newIndicators.length === 0 && (
                        <p className="text-[10px] text-slate-500 italic text-center w-full py-4 border border-dashed border-slate-800 rounded-2xl">
                          No customized indicators added yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    REGISTER STUDENT & PROGRAMS
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
