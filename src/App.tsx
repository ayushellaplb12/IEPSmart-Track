import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { MonitoringInput } from './components/MonitoringInput';
import { MonthlyDashboard } from './components/MonthlyDashboard';
import { StudentDatabase } from './components/StudentDatabase';
import { ReportArchives } from './components/ReportArchives';
import { id } from 'date-fns/locale';
import { format } from 'date-fns';
import { DailyRecord, Student } from './types';
import { STUDENTS, MOCK_RECORDS } from './constants';
import { Search, Bell, Calendar as CalendarIcon, Settings, ChevronDown, User, LogOut, GraduationCap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // set default tab to dashboard review
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('edutrack_students');
    return saved && JSON.parse(saved).length > 0 ? JSON.parse(saved) : STUDENTS;
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<DailyRecord[]>(() => {
    const saved = localStorage.getItem('edutrack_records');
    return saved && JSON.parse(saved).length > 0 ? JSON.parse(saved) : MOCK_RECORDS;
  });

  // Assign initial selected student if none selected yet
  useEffect(() => {
    if (!selectedStudent && students.length > 0) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  const [currentDate] = useState(new Date());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('edutrack_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('edutrack_records', JSON.stringify(records));
  }, [records]);

  const handleSaveRecord = (newRecord: DailyRecord) => {
    setRecords(prev => [newRecord, ...prev]);
    // Navigate to dashboard to see the update
    setActiveTab('dashboard');
  };

  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setStudents(prev => [...prev, newStudent]);
    if (!selectedStudent) setSelectedStudent(newStudent);
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student profile and all associated data?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      setRecords(prev => prev.filter(r => r.studentId !== id));
      if (selectedStudent?.id === id) {
        setSelectedStudent(students.find(s => s.id !== id) || null);
      }
    }
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    if (selectedStudent?.id === updatedStudent.id) {
      setSelectedStudent(updatedStudent);
    }
  };

  const studentRecords = records.filter(r => r.studentId === selectedStudent?.id);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header Section */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-8 flex-1">
            <div className="relative w-full max-w-md group">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search students, indicators, or reports..." 
                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-slate-50 rounded-xl border border-slate-100 divide-x divide-slate-200">
               <div className="flex items-center gap-3 px-4 py-2">
                 <CalendarIcon size={16} className="text-blue-500" />
                 <span className="text-xs font-bold text-slate-600">
                  {format(currentDate, 'EEEE, d MMM yyyy', { locale: id })}
                 </span>
               </div>
               {selectedStudent && (
                 <div className="flex items-center gap-3 px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-widest bg-white rounded-r-xl">
                    Synced Account
                 </div>
               )}
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-blue-500 rounded-xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-3 bg-slate-50 border border-slate-100 rounded-full hover:bg-white transition-all shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black">
                    T
                  </div>
                  <ChevronDown size={14} className="text-slate-400 mr-1" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-xs font-black text-slate-800">Teacher Account</p>
                      <p className="text-[10px] text-slate-400">tiara@lazuardi.sch.id</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                      <Settings size={14} /> Profile Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col p-8 gap-8">
          <div className="flex justify-between items-end shrink-0">
            <div>
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">
                {activeTab === 'input' ? 'Active Monitoring' : 
                 activeTab === 'dashboard' ? 'IEP Progress Review' :
                 activeTab === 'students' ? 'Student Enrollment' : 'Archive Management'}
              </div>
              <div className="flex items-center gap-3">
                {selectedStudent ? (
                  <>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                      {selectedStudent.name}
                    </h2>
                    <div className="relative group">
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 shadow-sm hover:border-blue-200 transition-colors">
                        {selectedStudent.class}
                        <ChevronDown size={14} />
                      </button>
                      {students.length > 1 && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 py-1">
                          {students.map(s => (
                            <button
                              key={s.id}
                              onClick={() => setSelectedStudent(s)}
                              className={`w-full text-left px-3 py-2 text-[11px] font-bold hover:bg-slate-50 flex items-center gap-2 ${selectedStudent.id === s.id ? 'text-blue-600' : 'text-slate-600'}`}
                            >
                              <User size={12} className={selectedStudent.id === s.id ? 'text-blue-500' : 'text-slate-300'} />
                              {s.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <h2 className="text-3xl font-black text-slate-300 tracking-tight italic">
                    No active student selected
                  </h2>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {selectedStudent && (
                <>
                  <button 
                    onClick={() => setActiveTab(activeTab === 'input' ? 'dashboard' : 'input')}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    {activeTab === 'input' ? 'View Analysis' : 'Daily Entry'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {activeTab === 'input' && selectedStudent && (
              <MonitoringInput student={selectedStudent} onSave={handleSaveRecord} />
            )}
            {activeTab === 'dashboard' && selectedStudent && (
              <MonthlyDashboard 
                student={selectedStudent} 
                records={studentRecords} 
                allRecords={records}
                onUpdateRecords={setRecords}
              />
            )}
            {activeTab === 'students' && (
              <StudentDatabase 
                students={students} 
                onAddStudent={handleAddStudent}
                onDeleteStudent={handleDeleteStudent}
                onUpdateStudent={handleUpdateStudent}
              />
            )}
            {activeTab === 'reports' && (
              <ReportArchives records={records} />
            )}
            
            {!selectedStudent && activeTab !== 'students' && (
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm p-12 text-center text-slate-400 gap-4">
                <GraduationCap size={64} className="text-slate-100" />
                <div>
                  <p className="text-lg font-black text-slate-800 tracking-tight">Setup Required</p>
                  <p className="text-xs font-medium text-slate-400 mt-1 max-w-xs mx-auto">
                    Please register or select a student in the <strong>Student Database</strong> to start monitoring.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('students')}
                  className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Go to Database
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
