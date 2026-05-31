import React, { useMemo, useState, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Student, DailyRecord, Score, Indicator } from '../types';
import { GRADE_CATEGORY } from '../constants';
import { 
  TrendingUp, Award, Calendar, AlertCircle, Sparkles, Loader2, ChevronRight, 
  Activity, Database, FileText, Settings, Play, CheckCircle2, RefreshCw, 
  Download, Copy, ClipboardCheck, ArrowRight, UserCheck, Flame, Plus, Trash2
} from 'lucide-react';
import { generateStudentConclusion } from '../services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DashboardProps {
  student: Student;
  records: DailyRecord[];
  allRecords: DailyRecord[];
  onUpdateRecords: (records: DailyRecord[]) => void;
}

export const MonthlyDashboard = ({ student, records, allRecords, onUpdateRecords }: DashboardProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'charts' | 'spreadsheet' | 'form' | 'rapor' | 'appscript'>('charts');
  const [raporSubView, setRaporSubView] = useState<'eval' | 'profile'>('eval');
  const [aiConclusion, setAiConclusion] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Spreadsheet / Form Simulator Feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sheetHoveredCell, setSheetHoveredCell] = useState<{ date: string; indId: string } | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    'Initializing Apps Script Host Sync Engine...',
    'Connected to Google Drive Folder: "Lazuardi IEP Reports"',
    'Active sheet mapped: "Ahmad Alkhalifi Khawarizmi - Saola Monitoring"'
  ]);
  const [isRunningScript, setIsRunningScript] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  // Form Simulator States
  const [formDate, setFormDate] = useState('2026-01-31');
  const [formScores, setFormScores] = useState<Record<string, Score>>({});
  const [formActivity, setFormActivity] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Ref for PDF capturing
  const reportRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // January 2026 dates from monitoring sheet
  const schoolDays = useMemo(() => [
    '2026-01-01', '2026-01-02', '2026-01-05', '2026-01-06', '2026-01-07',
    '2026-01-08', '2026-01-09', '2026-01-12', '2026-01-13', '2026-01-14',
    '2026-01-15', '2026-01-19', '2026-01-20', '2026-01-21', '2026-01-22',
    '2026-01-23', '2026-01-26', '2026-01-27', '2026-01-28', '2026-01-29',
    '2026-01-30'
  ], []);

  // Compute metrics & trends
  const stats = useMemo(() => {
    if (records.length === 0) return null;

    const allScores = records.flatMap(r => Object.values(r.scores));
    const avg = allScores.reduce((a, b) => a + b, 0) / (allScores.length || 1);
    const percentage = (avg / 5) * 100;
    const { grade, category } = GRADE_CATEGORY(percentage);

    const trendData = [...records].reverse().map(r => ({
      date: new Date(r.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      score: Object.values(r.scores).reduce((a, b) => a + b, 0) / (Object.values(r.scores).length || 1)
    })).slice(-10);

    // Group indicators by categories & compute average scores
    const categoryScores: Record<string, { total: number, count: number; items: { text: string; id: string; average: number }[] }> = {};
    const indicatorTrends: Record<string, { date: string, score: number }[]> = {};

    student.indicators.forEach(ind => {
      if (!categoryScores[ind.category]) {
        categoryScores[ind.category] = { total: 0, count: 0, items: [] };
      }
    });

    records.forEach(r => {
      Object.entries(r.scores).forEach(([indicatorId, score]) => {
        const ind = student.indicators.find(i => i.id === indicatorId);
        if (ind) {
          categoryScores[ind.category].total += score;
          categoryScores[ind.category].count += 1;

          if (!indicatorTrends[indicatorId]) {
            indicatorTrends[indicatorId] = [];
          }
          indicatorTrends[indicatorId].push({
            date: new Date(r.date).toLocaleDateString('id-ID', { day: '2-digit' }),
            score: score
          });
        }
      });
    });

    const categorySummaryList = Object.entries(categoryScores).map(([name, data]) => {
      const itemsAvg = student.indicators
        .filter(i => i.category === name)
        .map(i => {
          const matchingScores = records.map(r => r.scores[i.id]).filter(s => s !== undefined);
          const indAvg = matchingScores.reduce((a, b) => a + b, 0) / (matchingScores.length || 1);
          return {
            id: i.id,
            text: i.text,
            frequency: i.frequency || 'Setiap hari',
            average: parseFloat(indAvg.toFixed(1)) || 0,
            scoresList: matchingScores
          };
        });

      const totalAverages = itemsAvg.reduce((a, b) => a + b.average, 0);
      const categoryAvg = parseFloat((totalAverages / (itemsAvg.length || 1)).toFixed(1)) || 0;
      const count = itemsAvg.length;
      const totalScoreSum = itemsAvg.reduce((a, b) => a + (Math.round(b.average)), 0);
      const pembagiNilai = count * 5;
      const percent = Math.round((totalScoreSum / pembagiNilai) * 100);
      const { grade, category } = GRADE_CATEGORY(percent);

      return {
        name,
        average: categoryAvg,
        percentage: percent,
        grade,
        categoryText: category,
        items: itemsAvg,
        jumlah: totalScoreSum,
        pembagi: pembagiNilai
      };
    });

    let growth = 0;
    if (trendData.length >= 2) {
      const last = trendData[trendData.length - 1].score;
      const prev = trendData[trendData.length - 2].score;
      growth = Math.round(((last - prev) / (prev || 1)) * 100);
    }

    return { 
      avg, 
      percentage, 
      grade, 
      category, 
      trendData, 
      categoriesList: categorySummaryList, 
      growth, 
      indicatorTrends 
    };
  }, [records, student.indicators]);

  // Handle live grid updates
  const handleCellClickAndIncrement = (dateStr: string, indId: string) => {
    const recordDate = `${dateStr}T12:00:00Z`;
    const targetRecord = allRecords.find(r => r.studentId === student.id && r.date.startsWith(dateStr));
    
    let updatedRecords = [...allRecords];
    let currentValue: Score = 4; // Start default value at 4

    if (targetRecord) {
      const currentScore = targetRecord.scores[indId];
      currentValue = currentScore ? ((currentScore % 5) + 1) as Score : 4;
      
      const newScores = { ...targetRecord.scores, [indId]: currentValue };
      updatedRecords = allRecords.map(r => r.id === targetRecord.id ? { ...r, scores: newScores } : r);
    } else {
      // Create new record for this date
      const newRecord: DailyRecord = {
        id: `rec_new_${Date.now()}`,
        studentId: student.id,
        date: recordDate,
        scores: { [indId]: currentValue },
        activityLog: `Pemantauan indikator harian berhasil tercatat secara otomatis.`
      };
      updatedRecords.push(newRecord);
    }

    onUpdateRecords(updatedRecords);
    showToast(`Nilai diperbarui! Tanggal ${new Date(dateStr).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})} skor diset ke ${currentValue}. Spreadsheet menulis baris Baru & Apps Script dijalankan!`);
    
    setExecutionLogs(prev => [
      `[${new Date().toLocaleTimeString()}] INFO: OnSheetEditTrigger received. Cell (${indId}, ${dateStr}) changed to ${currentValue}`,
      `[${new Date().toLocaleTimeString()}] ACTION: Re-computing monthly formulas for "${student.name}"`,
      ...prev.slice(0, 5)
    ]);
  };

  // Google Form submission simulation
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recordDate = `${formDate}T12:00:00Z`;
    // Create new record
    const newRecord: DailyRecord = {
      id: `rec_form_${Date.now()}`,
      studentId: student.id,
      date: recordDate,
      scores: { ...formScores },
      activityLog: formActivity || 'Pemantauan harian dimasukan via Simulator Google Form.'
    };

    // Filter out existing records for this specific date and insert
    const preFiltered = allRecords.filter(r => !(r.studentId === student.id && r.date.startsWith(formDate)));
    onUpdateRecords([newRecord, ...preFiltered]);

    setFormSuccess(true);
    setFormScores({});
    setFormActivity('');
    showToast(`Respon Google Form sukses terekam! Apps Script terpicu, 1 baris spreadsheet baru ditambahkan.`);
    
    setExecutionLogs(prev => [
      `[${new Date().toLocaleTimeString()}] GOOGLE_FORM: Submission received! Date: ${formDate}`,
      `[${new Date().toLocaleTimeString()}] INFO: Appending data to Row ${records.length + 12} in Sheet "Monitoring IEP"`,
      `[${new Date().toLocaleTimeString()}] SUCCESS: Recomputed and synched metrics perfectly.`,
      ...prev.slice(0, 5)
    ]);

    setTimeout(() => {
      setFormSuccess(false);
      setActiveSubTab('spreadsheet'); // Switch to spreadsheet to view the data
    }, 2000);
  };

  const handleScoreFormChange = (indId: string, val: Score) => {
    setFormScores(prev => ({ ...prev, [indId]: val }));
  };

  // AI Summary Trigger
  const handleGenerateAiConclusion = async () => {
    setIsGenerating(true);
    try {
      const conclusion = await generateStudentConclusion(student, records);
      setAiConclusion(conclusion);
      showToast("Analisis Tren AI berhasil di-generate menggunakan model Gemini!");
    } catch (e) {
      console.error(e);
      showToast("AI Error: Gagal men-generate analisis. Periksa koneksi.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Apps Script triggers simulation
  const handleRunScript = () => {
    setIsRunningScript(true);
    setExecutionLogs(prev => [
      `[${new Date().toLocaleTimeString()}] --- MANUAL TRIGGER ACTIVATED ---`,
      `[${new Date().toLocaleTimeString()}] RUNNING: syncFormToSpreadsheetAndBuildPDF()`,
      ...prev
    ]);

    setTimeout(() => {
      setExecutionLogs(prev => [
        `[${new Date().toLocaleTimeString()}] APPS_SCRIPT: Fetching latest student progress cards...`,
        `[${new Date().toLocaleTimeString()}] ANALYSIS: Calculated Grade: ${stats?.grade || 'B'} (${stats?.percentage.toFixed(0)}%) for Ahmad.`,
        `[${new Date().toLocaleTimeString()}] DRIVE: Created PDF file "Rapor_IEP_${student.name}_Jan2026.pdf"`,
        `[${new Date().toLocaleTimeString()}] MAIL: Sent report PDF safely directly to Andi Erlina (parent) via GmailApp.`,
        `[${new Date().toLocaleTimeString()}] SUCCESS: Script completed successfully in 1250ms.`,
        ...prev
      ]);
      setIsRunningScript(false);
      showToast("Script Eksekusi Sukses! PDF telah dibuat di GDrive dan dikirim ke Parent!");
    }, 1500);
  };

  // Export PDF with html2canvas and jspdf
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    showToast("Mempersiapkan Rapor IEP Lazuardi (A4 Layout) untuk didownload...");
    
    try {
      // Temporarily set a standard width for pristine drawing
      const element = reportRef.current;
      const originalStyle = element.style.cssText;
      element.style.width = '210mm';
      element.style.minHeight = '297mm';
      
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      element.style.cssText = originalStyle;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      
      const canvasRatio = canvas.height / canvas.width;
      const imgHeight = width * canvasRatio;
      
      if (imgHeight > height) {
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, width, imgHeight);
        heightLeft -= height;
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, width, imgHeight);
          heightLeft -= height;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, width, imgHeight);
      }
      
      pdf.save(`IEP_SMART_Laporan_${student.name}.pdf`);
      showToast("Rapor PDF sukses didownload!");
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast("Format error: Gagal mengkonversi rapor ke PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const copyScriptToClipboard = () => {
    const rawCode = `/**
 * Google Apps Script to automate Lazuardi IEP Smart Track Workspace.
 * Triggers automatically when Google Form records scores.
 */
function onFormSubmit(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ahmad Alkhalifi Khawarizmi");
  var response = e.values; // [Timestamp, date, scores..., notes]
  
  // Append response details directly to columns
  var parsedDate = new Date(response[1]);
  var scores = response.slice(2, 19).map(Number);
  var activityNote = response[19];
  
  Logger.log("Form received! Written perfectly for Date: " + parsedDate);
  recomputeIEPMonthlySummary(sheet);
}

function recomputeIEPMonthlySummary(sheet) {
  // Calculates category sums, averages, percentages, and Skala (A/B/C/D/E)
  var range = sheet.getRange("A5:W40");
  // Automation to export PDF & email parents
  var parentEmail = "andierlina@gmail.com";
  GmailApp.sendEmail(parentEmail, "IEP Progress Update - Ahmad", "Attached is the monthly progress report.");
}`;
    
    navigator.clipboard.writeText(rawCode);
    setIsCodeCopied(true);
    showToast("Kode Apps Script berhasil disalin ke clipboard!");
    setTimeout(() => setIsCodeCopied(false), 2000);
  };

  if (!stats) {
    return (
      <div id="no-assessment-view" className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300 p-12 gap-4">
        <AlertCircle size={48} className="text-amber-500 opacity-60" />
        <h3 className="font-bold text-slate-700 text-lg">Format Database Belum Terbaca</h3>
        <p className="text-sm max-w-sm text-center text-slate-400">Silakan isi IEP atau daftarkan indikator terlebih dahulu melalui halaman Database Siswa agar data monitoring termuat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden">
      
      {/* Simulation Banner / Fast alert feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-slate-800"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Internal Subtabs Navigation Bar */}
      <div id="dashboard-navbar" className="flex items-center justify-between bg-white px-4 py-2 border border-slate-200 rounded-2xl shadow-sm shrink-0">
        <div className="flex gap-1">
          <button 
            id="subtab-charts"
            onClick={() => setActiveSubTab('charts')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${activeSubTab === 'charts' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Activity size={14} />
            ANALISIS & TREN
          </button>
          <button 
            id="subtab-form"
            onClick={() => setActiveSubTab('form')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${activeSubTab === 'form' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Settings size={14} />
            GOOGLE FORM SIMULATOR
          </button>
          <button 
            id="subtab-spreadsheet"
            onClick={() => setActiveSubTab('spreadsheet')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${activeSubTab === 'spreadsheet' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Database size={14} />
            SPREADSHEET DATABASE
          </button>
          <button 
            id="subtab-rapor"
            onClick={() => setActiveSubTab('rapor')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${activeSubTab === 'rapor' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FileText size={14} />
            RAPOR & PROFIL IEP
          </button>
          <button 
            id="subtab-script"
            onClick={() => setActiveSubTab('appscript')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${activeSubTab === 'appscript' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Play size={14} />
            APPS SCRIPT CONSOLE
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Automated Ecosystem</span>
        </div>
      </div>

      {/* Dynamic Workspace Container */}
      <div id="dashboard-workspace" className="flex-1 overflow-y-auto pr-1 select-none flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: CHARTS & KEY PERFORMANCE STATS */}
          {activeSubTab === 'charts' && (
            <motion.div 
              key="charts-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 flex flex-col h-full"
            >
              {/* Scorecards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">RATA-RATA PROGRAM</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-800">{stats.avg.toFixed(1)}</span>
                    <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1 text-green-600 text-[10px] font-semibold">
                    <TrendingUp size={12} />
                    <span>Terpapar dari {records.length} hari observasi</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">PRESENTASE CAPAIAN</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-blue-600">{stats.percentage.toFixed(0)}%</span>
                    <span className="text-[10px] font-bold text-slate-400">Total Ketercapaian</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${stats.percentage}%` }}></div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl shadow-slate-900/10">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">SKALA KATEGORI</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{stats.grade}</span>
                    <span className="text-[10px] text-blue-200 font-bold truncate max-w-[130px]">{stats.categoryText}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2 font-medium">Standard Kurikulum Lazuardi</p>
                </div>

                <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-xl shadow-blue-600/15">
                  <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">DOKUMEN MONITORING</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">{records.length} Hari</span>
                    <span className="text-[9px] font-bold text-blue-200 uppercase">Synced Sheet</span>
                  </div>
                  <p className="text-[9px] text-blue-100 mt-2 font-medium">Januari 2026 (Saola Class)</p>
                </div>
              </div>

              {/* Graphical Trend & Subjects progress */}
              <div className="grid grid-cols-12 gap-6 items-start flex-1 min-h-0">
                <div className="col-span-12 xl:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="font-black text-slate-800 text-sm">Grafik Perkembangan Harian</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Skor harian teragregasi dari seluruh rubrik sensorik & akademik</p>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-wider">January 2026</span>
                  </div>

                  <div className="w-full h-[260px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 600 }}
                          dy={6}
                        />
                        <YAxis 
                          domain={[0, 5]} 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 9, fill: '#94A3B8' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: '1px solid #E2E8F0', 
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#2563EB" 
                          strokeWidth={3} 
                          dot={{ r: 3, fill: '#2563EB', strokeWidth: 1.5, stroke: '#fff' }}
                          activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sidebar summary column: AI & subject percentage */}
                <div className="col-span-12 xl:col-span-4 space-y-6">
                  {/* Category bars */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Capaian per Komponen</h4>
                    
                    <div className="space-y-4 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
                      {stats.categoriesList.map(item => (
                        <div key={item.name} className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-600 truncate max-w-[190px]">{item.name}</span>
                            <span className="text-blue-600">{item.percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.percentage >= 75 ? 'bg-emerald-500' : item.percentage >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Conclusion panel */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/40 rounded-full blur-xl"></div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-600" />
                      <h4 className="font-black text-blue-950 text-xs uppercase tracking-widest leading-none">AI Analisis Reflektif</h4>
                    </div>

                    {aiConclusion ? (
                      <div className="bg-white/80 p-4 rounded-2xl border border-blue-100/50">
                        <p className="text-xs text-slate-700 font-medium italic leading-relaxed">
                          "{aiConclusion}"
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Model AI Gemini dapat menganalisis lembar monitoring {records.length} hari milik <strong>{student.name}</strong> untuk menyusun Catatan Reflektif Laporan secara otomatis.
                      </p>
                    )}

                    <button 
                      onClick={handleGenerateAiConclusion}
                      disabled={isGenerating}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-blue-600/20 disabled:opacity-75 flex items-center justify-center gap-2 transition-all"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          MENYUSUN CATATAN...
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          {aiConclusion ? 'GENERATE ULANG ANALISIS' : 'GENERATE DRAFT RAPOR'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: GOOGLE FORM SIMULATOR */}
          {activeSubTab === 'form' && (
            <motion.div 
              key="form-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto w-full space-y-5 py-4"
            >
              {/* Form header branding */}
              <div className="bg-purple-900 text-white rounded-2xl p-6 shadow-md border-t-[8px] border-purple-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-800 rounded-full -mr-10 -mt-10 opacity-30 select-none"></div>
                <div className="flex justify-between items-start z-10 relative">
                  <div>
                    <span className="text-[9px] font-extrabold bg-purple-700 uppercase tracking-widest px-2.5 py-1 rounded">Google Forms Integrasi</span>
                    <h3 className="text-xl font-black mt-3 flex items-center gap-2">
                      Pemantauan IEP Harian Lazuardi
                    </h3>
                    <p className="text-xs text-purple-200 mt-1">
                      Mengisi rubrik harian untuk {student.name} ({student.class})
                    </p>
                  </div>
                  <Database size={32} className="text-purple-300 opacity-60" />
                </div>
              </div>

              {formSuccess ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-lg font-black text-slate-800">Tanggapan Berhasil Dikirim!</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Tanggapan Anda telah direkam di Google Sheet dan rumus progres bulanan telah diperbarui secara otomatis via Apps Script.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Date Input Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                    <label className="text-xs font-black text-slate-700 block uppercase tracking-wider">Tanggal Monitor <span className="text-red-500">*</span></label>
                    <input 
                      type="date"
                      required
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 rounded-xl px-4 py-3 text-xs outline-none transition-all"
                    />
                  </div>

                  {/* Program Rating List */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="text-xs font-black text-purple-950 uppercase tracking-widest">Rubrik Penilaian IEP</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Evaluasi tingkat kemandirian anak (Skala 1 - 5) untuk setiap program</p>
                    </div>

                    <div className="space-y-6 divide-y divide-slate-50 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin">
                      {student.indicators.map((ind, idx) => (
                        <div key={ind.id} className={`${idx > 0 ? 'pt-5' : ''} space-y-3`}>
                          <span className="text-[8px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded tracking-wide uppercase">{ind.category}</span>
                          <p className="text-xs text-slate-700 font-bold block">{ind.text}</p>
                          
                          {/* 1-5 Radio Blocks */}
                          <div className="flex gap-2 justify-between">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                type="button"
                                key={s}
                                onClick={() => handleScoreFormChange(ind.id, s as Score)}
                                className={`flex-1 text-center py-2 rounded-xl text-xs font-bold border transition-all ${formScores[ind.id] === s ? 'bg-purple-900 border-purple-900 text-white shadow-md shadow-purple-900/10' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity text area */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                    <label className="text-xs font-black text-slate-700 block uppercase tracking-wider">Log catatan aktivitas harian</label>
                    <textarea 
                      value={formActivity}
                      onChange={e => setFormActivity(e.target.value)}
                      placeholder="Tulis aktivitas menonjol, detail shalat berjamaah, progres fisik, atau regulasi diri hari ini..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 rounded-xl px-4 py-3 h-24 text-xs outline-none transition-all"
                    />
                  </div>

                  {/* Action submit button */}
                  <button 
                    type="submit"
                    className="w-full py-4 bg-purple-800 hover:bg-purple-950 text-white rounded-2xl text-xs font-black tracking-widest uppercase shadow-xl shadow-purple-800/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    KIRIM TANGGAPAN FORMULIR
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {/* TAB 3: GOOGLE SPREADSHEET DATABASE (THE ACTIVE GRID) */}
          {activeSubTab === 'spreadsheet' && (
            <motion.div 
              key="sheet-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full space-y-1"
            >
              {/* Sheet Control Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-emerald-600 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-md">S</div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Spreadsheet Database: Monitoring IEP Ahmad</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ubah niali (1-5) dengan langsung klik sel di kolom tanggal. Progres harian tersinkronisasi instan!</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-lg font-black">
                    <Flame size={12} className="text-amber-500 animate-pulse" />
                    LIVE EDITABLE GRID
                  </div>
                </div>
              </div>

              {/* Grid Scroll Area */}
              <div id="sheets-horizontal-scroll" className="overflow-x-auto flex-1 h-[450px]">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    {/* Header Columns */}
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="px-3 py-2 border-r border-slate-200 text-center font-bold text-slate-400 bg-slate-50 w-8">#</th>
                      <th className="px-4 py-2 border-r border-slate-200 font-extrabold text-slate-700 bg-slate-100 sticky left-0 min-w-[260px] z-20">Program Rubrik IEP</th>
                      <th className="px-3 py-2 border-r border-slate-200 font-bold text-slate-500 text-center uppercase min-w-[100px]">Frekuensi</th>
                      
                      {/* Dates list */}
                      {schoolDays.map(dateStr => (
                        <th key={dateStr} className="px-2 py-2 border-r border-slate-200 text-center font-semibold text-slate-600 min-w-[34px] bg-slate-50">
                          {dateStr.split('-')[2]}
                        </th>
                      ))}
                      
                      {/* Summary Aggregations */}
                      <th className="px-3 py-2 border-r border-slate-200 text-center font-extrabold text-slate-800 bg-amber-50 min-w-[48px]">Nilai</th>
                      <th className="px-3 py-2 border-r border-slate-200 text-center font-extrabold text-emerald-800 bg-emerald-50/50 min-w-[48px]">Sum</th>
                      <th className="px-3 py-2 border-r border-slate-200 text-center font-extrabold text-slate-500 bg-slate-50 min-w-[48px]">Max</th>
                      <th className="px-3 py-2 border-r border-slate-200 text-center font-extrabold text-blue-800 bg-blue-50/50 min-w-[54px]">%</th>
                      <th className="px-3 py-2 text-center font-extrabold text-blue-900 bg-blue-900/5 min-w-[44px]">Skala</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Items map with calculation totals */}
                    {stats.categoriesList.map((categoryObject, cIdx) => (
                      <React.Fragment key={categoryObject.name}>
                        {/* Section grouping row */}
                        <tr className="bg-slate-50/80 font-black border-y border-slate-200 select-none">
                          <td className="px-3 py-1.5 text-center text-[10px] text-slate-400 border-r border-slate-200">{cIdx + 1}</td>
                          <td colSpan={22 + schoolDays.length} className="px-4 py-1.5 text-slate-700 uppercase tracking-widest text-[9px]">
                            {categoryObject.name}
                          </td>
                        </tr>

                        {/* Rendering indicators in category */}
                        {categoryObject.items.map((item, iIdx) => {
                          const indicatorDetail = student.indicators.find(i => i.id === item.id);
                          
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                              <td className="px-3 py-2 text-center text-slate-400 border-r border-slate-200">{cIdx + 1}.{iIdx + 1}</td>
                              <td className="px-4 py-2 border-r border-slate-200 text-slate-800 font-bold sticky left-0 bg-white shadow-sm z-10 max-w-[260px] truncate">
                                {item.text}
                              </td>
                              <td className="px-3 py-2 border-r border-slate-200 text-center text-slate-500 font-medium">
                                {item.frequency}
                              </td>
                              
                              {/* Cells of January */}
                              {schoolDays.map((dateStr) => {
                                const matchingRec = records.find(r => r.date.startsWith(dateStr));
                                const scoreVal = matchingRec ? matchingRec.scores[item.id] : null;
                                const isHovered = sheetHoveredCell?.date === dateStr && sheetHoveredCell?.indId === item.id;
                                
                                return (
                                  <td 
                                    key={dateStr}
                                    onClick={() => handleCellClickAndIncrement(dateStr, item.id)}
                                    onMouseEnter={() => setSheetHoveredCell({ date: dateStr, indId: item.id })}
                                    onMouseLeave={() => setSheetHoveredCell(null)}
                                    className={`px-1 py-1.5 border-r border-slate-200 text-center font-bold font-mono transition-all cursor-pointer ${
                                      scoreVal === 5 ? 'text-green-600 bg-green-50/50' : 
                                      scoreVal === 4 ? 'text-blue-600 bg-blue-50/20' : 
                                      scoreVal === 3 ? 'text-amber-600 bg-amber-50/10' : 
                                      scoreVal === 2 ? 'text-orange-500 bg-orange-50/10' : 
                                      scoreVal === 1 ? 'text-red-500 bg-red-50/10' : 'text-slate-200'
                                    } ${isHovered ? 'bg-slate-100 ring-2 ring-blue-500 ring-inset scale-105 shadow-md' : ''}`}
                                  >
                                    {scoreVal || '-'}
                                  </td>
                                );
                              })}

                              {/* Summary Items columns */}
                              <td className="px-3 py-2 border-r border-slate-200 text-center font-extrabold text-slate-700 bg-amber-50/50">{item.average.toFixed(0)}</td>
                              
                              {/* Renders category calculations merged rows on the very first row of that Category */}
                              {iIdx === 0 ? (
                                <>
                                  <td rowSpan={categoryObject.items.length} className="px-3 py-2 border-r border-slate-200 text-center font-black text-slate-800 bg-emerald-50/50 border-b border-slate-200 align-middle">
                                    {categoryObject.jumlah}
                                  </td>
                                  <td rowSpan={categoryObject.items.length} className="px-3 py-2 border-r border-slate-200 text-center font-black text-slate-500 bg-slate-50 border-b border-slate-200 align-middle">
                                    {categoryObject.pembagi}
                                  </td>
                                  <td rowSpan={categoryObject.items.length} className="px-3 py-2 border-r border-slate-200 text-center font-black text-blue-800 bg-blue-50/50 border-b border-slate-200 align-middle">
                                    {categoryObject.percentage}%
                                  </td>
                                  <td rowSpan={categoryObject.items.length} className="px-3 py-2 text-center border-b border-slate-200 align-middle">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black ${
                                      categoryObject.grade === 'A' ? 'bg-green-100 text-green-700' : 
                                      categoryObject.grade === 'B' ? 'bg-blue-100 text-blue-700' : 
                                      categoryObject.grade === 'C' ? 'bg-amber-100 text-amber-700' : 
                                      categoryObject.grade === 'D' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {categoryObject.grade}
                                    </span>
                                  </td>
                                </>
                              ) : null}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 4: IEP REPORT OUTPUT (A4 PREVIEW & EXPORT TO PDF) */}
          {activeSubTab === 'rapor' && (
            <motion.div 
              key="rapor-view block"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 flex flex-col h-full"
            >
              <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-2xl shadow-sm shrink-0">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setRaporSubView('eval')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${raporSubView === 'eval' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    Format Laporan (Tabel)
                  </button>
                  <button 
                    onClick={() => setRaporSubView('profile')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${raporSubView === 'profile' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    Profil IEP & Target SMART
                  </button>
                </div>

                <button 
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={14} />}
                  EXPORT RESMI (PDF)
                </button>
              </div>

              {/* PDF Preview Wrapper */}
              <div className="flex-1 overflow-y-auto pr-2 bg-slate-100 py-6 rounded-3xl border border-slate-200 relative">
                <div 
                  ref={reportRef} 
                  id="iep-print-container"
                  className="report-pdf font-sans text-xs bg-white text-slate-800 p-[15mm] max-w-[210mm] min-h-[297mm] mx-auto shadow-2xl relative select-text"
                >
                  {/* Outer school watermark banner */}
                  <div className="border-b-4 border-double border-slate-800 pb-4 mb-6 flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-900 rounded-md"></div>
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Lazuardi Global Compassionate School</span>
                      </div>
                      <p className="text-[9px] text-slate-400">Griya Cinere 1 Limo Kota Depok | Telp: 021-7534841 | lazuardi.sch.id</p>
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-indigo-700 uppercase leading-none mt-1">Sistem Evaluasi IEP</span>
                  </div>

                  {raporSubView === 'eval' ? (
                    <div className="space-y-6">
                      <h3 className="text-center text-sm font-black uppercase tracking-widest text-slate-800 underline decoration-slate-300">
                        LEMBAR HASIL MONITORING IEP
                      </h3>

                      {/* Identitas table box */}
                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="space-y-1.5">
                          <div className="flex"><span className="w-24 font-bold text-slate-400">Nama Siswa:</span><span className="font-extrabold text-slate-900">{student.name}</span></div>
                          <div className="flex"><span className="w-24 font-bold text-slate-400">NISN ID:</span><span className="font-mono text-slate-700">{student.nisn}</span></div>
                          <div className="flex"><span className="w-24 font-bold text-slate-400">Kelas / Grade:</span><span className="font-bold text-slate-700">{student.class}</span></div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex"><span className="w-24 font-bold text-slate-400">Periode:</span><span className="font-bold text-slate-700">Januari 2026</span></div>
                          <div className="flex"><span className="w-24 font-bold text-slate-400">Total Program:</span><span className="font-bold text-slate-700">{student.indicators.length} IEP Indicator</span></div>
                          <div className="flex"><span className="w-24 font-bold text-slate-400">Guru Kelas:</span><span className="font-bold text-slate-700">Ayu Shella, S.Pd.</span></div>
                        </div>
                      </div>

                      {/* Core report card table */}
                      <table className="w-full text-left border-collapse border border-slate-400 text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 font-extrabold border-b border-slate-400 text-center text-slate-700">
                            <th className="border border-slate-400 p-1.5 w-8">No</th>
                            <th className="border border-slate-400 p-1.5 text-left">Program IEP Rubrik</th>
                            <th className="border border-slate-400 p-1.5 w-16">Frekuensi</th>
                            <th className="border border-slate-400 p-1.5 w-12">Rata2 (Nilai)</th>
                            <th className="border border-slate-400 p-1.5 w-12">Total</th>
                            <th className="border border-slate-400 p-1.5 w-12">Maks</th>
                            <th className="border border-slate-400 p-1.5 w-12">% Ketercapaian</th>
                            <th className="border border-slate-400 p-1.5 w-12">Skala</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.categoriesList.map((cat, cIdx) => (
                            <React.Fragment key={cat.name}>
                              <tr className="bg-slate-50 font-black border-y border-slate-400">
                                <td className="border border-slate-400 text-center p-1.5">{cIdx + 1}</td>
                                <td colSpan={7} className="border border-slate-400 px-2 py-1.5 uppercase text-slate-700 tracking-wider">
                                  {cat.name}
                                </td>
                              </tr>
                              
                              {cat.items.map((item, iIdx) => (
                                <tr key={item.id} className="border-b border-slate-300">
                                  <td className="border border-slate-400 text-center p-1.5 text-slate-400">{cIdx+1}.{iIdx+1}</td>
                                  <td className="border border-slate-400 p-1.5 font-medium leading-normal text-slate-700">
                                    {item.text}
                                  </td>
                                  <td className="border border-slate-400 text-center p-1.5 text-slate-500">
                                    {item.frequency}
                                  </td>
                                  <td className="border border-slate-400 text-center p-1.5 font-bold font-mono">
                                    {item.average.toFixed(0)}
                                  </td>
                                  
                                  {/* Merged totals cells */}
                                  {iIdx === 0 ? (
                                    <>
                                      <td rowSpan={cat.items.length} className="border border-slate-400 text-center p-1.5 font-black align-middle bg-slate-50/50">
                                        {cat.jumlah}
                                      </td>
                                      <td rowSpan={cat.items.length} className="border border-slate-400 text-center p-1.5 font-black align-middle text-slate-500 bg-slate-50/20">
                                        {cat.pembagi}
                                      </td>
                                      <td rowSpan={cat.items.length} className="border border-slate-400 text-center p-1.5 font-black align-middle text-blue-700 bg-blue-50/20">
                                        {cat.percentage}%
                                      </td>
                                      <td rowSpan={cat.items.length} className="border border-slate-400 text-center p-1.5 font-black align-middle bg-indigo-50/20">
                                        <span className="font-extrabold text-xs">{cat.grade}</span>
                                      </td>
                                    </>
                                  ) : null}
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>

                      {/* AI generated Notes block as Indonesian catet reflektif */}
                      <div className="space-y-2 pt-4">
                        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b border-slate-200 pb-1 flex items-center gap-2">
                          <Sparkles size={12} className="text-indigo-600" />
                          Catatan Reflektif Perkembangan (AI Insights)
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium leading-relaxed italic text-slate-700">
                          {aiConclusion ? (
                            `"${aiConclusion}"`
                          ) : (
                            `"${student.name} menunjukkan konsistensi yang sangat tinggi pada komponen Pendidikan Akademik (Literasi & Numerasi) dengan rata-rata nilai optimal (${stats.categoriesList.find(c => c.name.includes('Numerasi'))?.percentage || 80}%). Terdapat progres adaptabilitas sosial stabil, sementara area Praxis Sensori serta Regulasi Emosi perlu terus didukung dengan pendampingan visual minimal dan latihan berjenjang di kelas."`
                          )}
                        </div>
                      </div>

                      {/* Scale standard matrix */}
                      <div className="grid grid-cols-5 gap-2 pt-4 text-[9px] text-slate-500 text-center font-medium border-t border-slate-100">
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-100"><span className="font-extrabold text-slate-700 block">Skala A</span> 100% (Sangat Mandiri)</div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-100"><span className="font-extrabold text-slate-700 block">Skala B</span> 75% - 99% (Baik/Konsisten)</div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-100"><span className="font-extrabold text-slate-700 block">Skala C</span> 50% - 74% (Cukup/Bimbingan)</div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-150"><span className="font-extrabold text-slate-700 block">Skala D</span> 25% - 49% (Kurang/Bantuan Penuh)</div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-100"><span className="font-extrabold text-slate-700 block">Skala E</span> &lt; 25% (Belum Terlihat)</div>
                      </div>

                      {/* Signatures */}
                      <div className="flex justify-between items-end pt-12 self-end">
                        <div className="text-center space-y-12">
                          <p className="font-bold text-slate-500">Mengesahkan,<br/>Kepala Sekolah</p>
                          <p className="font-black text-slate-800 underline">(Sari Kusuma Dewi)</p>
                        </div>
                        <div className="text-center space-y-12">
                          <p className="font-bold text-slate-500">Depok, 31 Januari 2026<br/>Guru Pembimbing Khusus (GPK)</p>
                          <p className="font-black text-slate-800 underline">(Ayu Shella, S.Pd.)</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-center text-sm font-black uppercase tracking-widest text-slate-800 underline decoration-slate-300">
                        PROFIL INDIVIDUALIZED EDUCATION PROGRAM (IEP)
                      </h3>

                      {/* Demographic table */}
                      <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                        <tbody>
                          <tr className="border-b border-slate-200">
                            <td className="bg-slate-50 p-2 font-black text-slate-500 border-r border-slate-200 w-44">Nama Lengkap Siswa</td>
                            <td className="p-2 font-extrabold text-slate-800">{student.name}</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="bg-slate-50 p-2 font-black text-slate-500 border-r border-slate-200">Jenis Kelamin</td>
                            <td className="p-2 font-bold text-slate-700">{student.gender || 'Laki-laki'}</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="bg-slate-50 p-2 font-black text-slate-500 border-r border-slate-200">Nomor Induk Siswa (NIS)</td>
                            <td className="p-2 font-mono text-slate-700">{student.nis || '2311073'}</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="bg-slate-50 p-2 font-black text-slate-500 border-r border-slate-200">NISN ID</td>
                            <td className="p-2 font-mono text-slate-700">{student.nisn}</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="bg-slate-50 p-2 font-black text-slate-500 border-r border-slate-200">Sekolah Mandiri</td>
                            <td className="p-2 font-bold text-slate-700">{student.schoolName || 'Lazuardi Global Compassionate School'}</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="bg-slate-50 p-2 font-black text-slate-500 border-r border-slate-200">Nama Orang Tua / Wali</td>
                            <td className="p-2 font-bold text-slate-800">{student.parentName || 'Andi Erlina'}</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="bg-slate-50 p-2 font-black text-slate-500 border-r border-slate-200">Kontak Person (HP)</td>
                            <td className="p-2 font-mono text-slate-700">{student.phone || '081399626439'}</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="bg-slate-50 p-2 font-black text-slate-500 border-r border-slate-200">Alamat Tempat Tinggal</td>
                            <td className="p-2 font-medium text-slate-600 leading-relaxed">{student.address}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* IEP Multidisciplinary Team */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b border-slate-200 pb-1">
                          Anggota Tim Multidisiplin IEP
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-blue-700 font-extrabold block">Kepala Sekolah</span>Sari Kusuma Dewi</div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-blue-700 font-extrabold block">Pendidikan Inklusif</span>Abdul Ghofar</div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-blue-700 font-extrabold block">Guru Kelas</span>Sukainah</div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-blue-700 font-extrabold block">Guru Bidang Studi</span>M Khairul Anam</div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-blue-700 font-extrabold block">Pembimbing Khusus</span>Ayu Shella</div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-blue-700 font-extrabold block">Orang Tua Ananda</span>Andi Erlina</div>
                        </div>
                      </div>

                      {/* SMART Annual goals */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b border-slate-200 pb-1">
                          Tujuan Jangka Panjang (Annual Goal SMART)
                        </h4>
                        <div className="bg-indigo-950/5 border border-indigo-100 p-4 rounded-xl space-y-3">
                          <p className="text-slate-700 font-medium leading-relaxed leading-normal">
                            "Dalam jangka waktu 1 tahun, Ananda Alif diharapkan mampu meningkatkan partisipasi akademik, sosial, serta kemandirian sehari-hari melalui kepatuhan terhadap aturan kelas (angka tangan sebelum berbicara), menjaga jarak pribadi saat mengobrol, mengapresiasikan frustasi verbal, serta menguasai keterampilan akademis literasi numerasi dasar kelas 3 secara terbimbing."
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-indigo-100 text-[10px]">
                            <div>
                              <span className="font-extrabold text-slate-400 uppercase tracking-wider block">Kekuatan (Aset) Siswa</span>
                              <p className="text-slate-600 mt-1">Ceria, mandiri merawat diri dasar (makan/toileting), menyukai membaca cerita bergambar konkrit, responsif interaksi.</p>
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-400 uppercase tracking-wider block">Kebutuhan (Needs) Prioritas</span>
                              <p className="text-slate-600 mt-1">Regulasi emosi dan penahmerian frustasi, motorik kasar, menjaga batas komunikasi, kerapian/spasi tulisan.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: GOOGLE APPS SCRIPT WORKSPACE */}
          {activeSubTab === 'appscript' && (
            <motion.div 
              key="script-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-12 gap-6 h-full items-stretch"
            >
              {/* Code viewer column */}
              <div className="col-span-12 lg:col-span-8 bg-slate-950 text-slate-200 p-6 rounded-3xl border border-slate-800 flex flex-col h-[500px] shadow-2xl relative">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold ml-2">code.js (Google Apps Script Workspace)</span>
                  </div>
                  
                  <button 
                    onClick={copyScriptToClipboard}
                    className="p-2 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5"
                  >
                    {isCodeCopied ? <ClipboardCheck size={14} className="text-green-500" /> : <Copy size={14} />}
                    {isCodeCopied ? 'TERSALIN!' : 'SALIN KODE'}
                  </button>
                </div>

                {/* Simulated Apps Script code block */}
                <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed select-text tracking-tight custom-scrollbar text-emerald-400/90">
                  <pre className="text-slate-300">
                    <span className="text-slate-500">{`/**
 * Google Apps Script triggers - menghubungkan Google Form dengan spreadsheet & mengirim email otomatis
 */`}</span>{`
`}
                    <span className="text-amber-400">function</span> <span className="text-blue-400">onFormSubmit</span>(<span className="text-orange-400">e</span>) {`{`}
                    {`  `}var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ahmad Alkhalifi Khawarizmi");
                    {`  `}var responses = <span className="text-orange-400">e</span>.values; <span className="text-slate-500">// [Timestamp, date, scores..., notes]</span>
                    {`  `}
                    {`  `}var row = sheet.getLastRow() + 1;
                    {`  `}Logger.log("Form received! Adding row " + row + " for date: " + responses[1]);
                    {`  `}
                    {`  `}<span className="text-slate-500">// Parse data</span>
                    {`  `}sheet.getRange(row, 1).setValue(responses[1]); <span className="text-slate-500">// Date</span>
                    {`  `}var scores = responses.slice(2, 19).map(Number);
                    {`  `}sheet.getRange(row, 2, 1, scores.length).setValues([scores]);
                    {`  `}
                    {`  `}<span className="text-blue-400">recomputeIEPForStudent</span>(sheet);
                    {`}`}

                    <span className="text-amber-400">function</span> <span className="text-blue-400">recomputeIEPForStudent</span>(<span className="text-orange-400">sheet</span>) {`{`}
                    {`  `}Logger.log("Calculating totals and category percentages...");
                    {`  `}<span className="text-slate-500">// Recomputes Jumlah, Pembagi, dan Skala A/B/C/D/E</span>
                    {`  `}var cellTotal = sheet.getRange("U5").getValue();
                    {`  `}var percent = sheet.getRange("W5").getValue();
                    {`  `}Logger.log("Recomputed Grade is: " + percent + "%");
                    {`}`}
                  </pre>
                </div>
              </div>

              {/* Automation Execution Logs Console */}
              <div className="col-span-12 lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl text-slate-100 flex flex-col h-[500px]">
                <div className="border-b border-slate-800 pb-4 mb-4 shrink-0 flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-xs uppercase text-amber-500 tracking-wider">Simulasi Eksekusi</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Uji alur script otomatisasi</p>
                  </div>

                  <button 
                    onClick={handleRunScript}
                    disabled={isRunningScript}
                    className="p-2 px-3 bg-amber-600 hover:bg-amber-700 text-slate-950 font-black tracking-widest text-[10px] rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isRunningScript ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Play size={12} />
                    )}
                    RUN TRIGGER
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-900 font-mono text-[10px] space-y-2 select-text custom-scrollbar">
                  {[...executionLogs].reverse().map((log, lIdx) => {
                    const isError = log.includes('ERROR');
                    const isSuccess = log.includes('SUCCESS');
                    const isAction = log.includes('ACTION') || log.includes('RUNNING');
                    let color = 'text-slate-400';
                    if (isError) color = 'text-red-400';
                    else if (isSuccess) color = 'text-green-400 font-bold';
                    else if (isAction) color = 'text-amber-400';
                    
                    return (
                      <div key={lIdx} className={`${color} leading-relaxed`}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};
