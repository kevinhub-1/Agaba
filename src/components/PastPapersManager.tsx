import React, { useState, useRef } from 'react';
import { PastPaper, UserRole, Teacher } from '../types';
import { 
  FileText, Upload, Download, Trash2, 
  Search, Check, X, Paperclip, Clock,
  Printer, Eye, RefreshCw, ZoomIn, ZoomOut,
  FolderOpen, ShieldCheck, CheckCircle2, FileImage, Film
} from 'lucide-react';

interface PastPapersManagerProps {
  pastPapers: PastPaper[];
  currentRole: UserRole;
  teacher: Teacher;
  onUploadPaper: (newPaper: PastPaper) => void;
  onDeletePaper: (paperId: string) => void;
  onUpdatePaper?: (paperId: string, updated: Partial<PastPaper>) => void;
}

export const PastPapersManager: React.FC<PastPapersManagerProps> = ({
  pastPapers,
  currentRole,
  teacher,
  onUploadPaper,
  onDeletePaper,
  onUpdatePaper,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForm, setSelectedForm] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  
  // Document Viewer & Print Modal State
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<PastPaper | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [paperToPrint, setPaperToPrint] = useState<PastPaper | null>(null);

  // File replacement state for teacher
  const [replacingPaperId, setReplacingPaperId] = useState<string | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Upload new document form state
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState('Official Term Document');
  const [formGrade, setFormGrade] = useState('Form 4 (Grade 12)');
  const [instructions, setInstructions] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [attachedFileSize, setAttachedFileSize] = useState('1.8 MB');
  const [attachedFileDataUrl, setAttachedFileDataUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState('Official Document Scan');
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
      const sizeMb = file.size < 1024 * 1024 
        ? `${Math.round(file.size / 1024)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      setAttachedFileSize(sizeMb);

      let detectedType = 'PDF Document';
      if (file.type.startsWith('image/')) {
        detectedType = 'Official Document Scan';
      } else if (file.type.startsWith('video/')) {
        detectedType = 'Video Document';
      } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        detectedType = 'Word Document';
      }
      setFileType(detectedType);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const fileNameToUse = attachedFileName.trim() || `${title.replace(/\s+/g, '_')}.pdf`;
    const newPaper: PastPaper = {
      id: `doc-${Date.now()}`,
      title: title.trim(),
      subject: 'Computer Studies',
      year: Number(year),
      term,
      formGrade,
      fileName: fileNameToUse,
      fileSize: attachedFileSize,
      fileType: fileType,
      fileUrl: attachedFileDataUrl || '/assets/aistudio/IMG-20261022-WA0029_356fc2b3.jpg',
      uploadedBy: teacher.name,
      uploadedAt: new Date().toISOString().split('T')[0],
      instructions: instructions.trim() || 'Official curriculum and examination document for candidate revision.',
      downloadCount: 0,
    };

    onUploadPaper(newPaper);
    setIsUploadModalOpen(false);
    setTitle('');
    setInstructions('');
    setAttachedFileName('');
    setAttachedFileDataUrl(null);
  };

  // Replace existing document file
  const handleTriggerReplace = (paperId: string) => {
    setReplacingPaperId(paperId);
    replaceFileInputRef.current?.click();
  };

  const handleExecuteReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingPaperId) return;

    const sizeFormatted = file.size < 1024 * 1024 
      ? `${Math.round(file.size / 1024)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    let detectedType = 'PDF Document';
    if (file.type.startsWith('image/')) {
      detectedType = 'Official Document Scan';
    } else if (file.type.startsWith('video/')) {
      detectedType = 'Video Document';
    } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      detectedType = 'Word Document';
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      if (onUpdatePaper) {
        onUpdatePaper(replacingPaperId, {
          fileName: file.name,
          fileSize: sizeFormatted,
          fileType: detectedType,
          fileUrl: dataUrl,
          uploadedAt: new Date().toISOString().split('T')[0],
        });
      }
      setDownloadSuccessToast(`Replaced document with "${file.name}"!`);
      setTimeout(() => setDownloadSuccessToast(null), 3000);
      setReplacingPaperId(null);
    };
    reader.readAsDataURL(file);

    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
    }
  };

  // Real Active Browser Download directly to user's Downloads folder
  const handleDownload = async (paper: PastPaper) => {
    try {
      const targetName = paper.fileName || `${paper.title.replace(/\s+/g, '_')}.pdf`;

      if (paper.fileUrl) {
        // If it is a data URL or blob URL
        if (paper.fileUrl.startsWith('data:') || paper.fileUrl.startsWith('blob:')) {
          const downloadAnchor = document.createElement('a');
          downloadAnchor.href = paper.fileUrl;
          downloadAnchor.download = targetName;
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          document.body.removeChild(downloadAnchor);
        } else {
          // Local asset path: fetch as blob to guarantee it triggers browser Downloads
          try {
            const response = await fetch(paper.fileUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const downloadAnchor = document.createElement('a');
            downloadAnchor.href = blobUrl;
            downloadAnchor.download = targetName;
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
          } catch {
            // Fallback direct link
            const downloadAnchor = document.createElement('a');
            downloadAnchor.href = paper.fileUrl;
            downloadAnchor.download = targetName;
            downloadAnchor.target = '_blank';
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
          }
        }
      } else {
        // Generate official document certificate record
        const docRecord = `========================================================================
COMTECH ACADEMY - DEPARTMENT OF COMPUTER STUDIES & ICT
OFFICIAL DOCUMENT: ${paper.title.toUpperCase()}
========================================================================
Academic Year: ${paper.year}
Term / Session: ${paper.term}
Class / Form: ${paper.formGrade}
Subject: ${paper.subject}
Instructor: ${paper.uploadedBy}
File Name: ${paper.fileName}
File Type: ${paper.fileType}
File Size: ${paper.fileSize}
Uploaded Date: ${paper.uploadedAt}

OFFICIAL DOCUMENT SUMMARY & INSTRUCTIONS:
${paper.instructions || 'Official curriculum revision document and examination reference.'}

AUTHENTICATION:
Verified by Mr. Kevin Agaba, Head of Computer Studies.
All rights reserved - Standard College Ntungamo / COMTECH Learning Platform.
========================================================================`;
        const blob = new Blob([docRecord], { type: 'text/plain;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = blobUrl;
        downloadAnchor.download = `${targetName}.txt`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      }

      setDownloadSuccessToast(`Downloaded "${targetName}" to your Downloads folder!`);
      setTimeout(() => setDownloadSuccessToast(null), 3500);
    } catch (err) {
      console.error('Download error:', err);
      setDownloadSuccessToast(`Download initiated for "${paper.fileName}".`);
      setTimeout(() => setDownloadSuccessToast(null), 3000);
    }
  };

  // Real Active Print Key: prints the actual document and official sheet
  const handlePrint = (paper: PastPaper) => {
    setPaperToPrint(paper);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const filteredPapers = pastPapers.filter((paper) => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.fileType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesForm = selectedForm === 'all' || paper.formGrade.includes(selectedForm);
    return matchesSearch && matchesForm;
  });

  return (
    <div className="space-y-6">
      {/* Hidden file input for fast document replacement */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="*/*"
        onChange={handleExecuteReplace}
        className="hidden"
      />

      {/* Printable Document View (Visible only during window.print) */}
      {paperToPrint && (
        <div id="printable-exam-paper" className="hidden print:block p-8 bg-white text-black font-sans">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <div className="text-xs uppercase tracking-widest font-mono text-slate-600 mb-1">
              Standard College Ntungamo · Department of Computer Studies & ICT
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-wide">COMTECH ACADEMY</h1>
            <h2 className="text-lg font-bold mt-1 text-slate-900">{paperToPrint.title}</h2>
            <div className="text-xs mt-3 flex justify-between font-mono border-t border-slate-300 pt-2">
              <span>Subject: {paperToPrint.subject}</span>
              <span>Year: {paperToPrint.year} ({paperToPrint.term})</span>
              <span>Class: {paperToPrint.formGrade}</span>
            </div>
            <div className="text-xs mt-1 text-slate-700 font-mono">
              Instructor: {paperToPrint.uploadedBy} · File: {paperToPrint.fileName} ({paperToPrint.fileSize})
            </div>
          </div>

          <div className="mb-6 p-4 border border-black text-xs leading-relaxed bg-slate-50">
            <strong className="block mb-1 uppercase font-bold text-slate-900">
              Official Document Instructions & Notes:
            </strong>
            <p>{paperToPrint.instructions || 'Official curriculum revision document and examination reference.'}</p>
          </div>

          {/* Render Actual Document Scan/Image if available */}
          {paperToPrint.fileUrl && !paperToPrint.fileUrl.endsWith('.mp4') && (
            <div className="my-6 border-2 border-black p-2 flex flex-col items-center">
              <div className="text-[10px] font-mono uppercase text-slate-600 mb-2">
                Attached Document Scan / Reference Plate
              </div>
              <img
                src={paperToPrint.fileUrl}
                alt={paperToPrint.title}
                className="max-h-[650px] w-auto object-contain mx-auto"
              />
            </div>
          )}

          <div className="mt-8 pt-4 border-t-2 border-black flex justify-between items-end text-xs font-mono">
            <div>
              <p>Verified by: <strong>{paperToPrint.uploadedBy}</strong></p>
              <p className="text-[10px] text-slate-600">Head of Computer Studies & ICT</p>
            </div>
            <div className="text-right">
              <p>Official Academic Document Stamp</p>
              <p className="text-[10px] text-slate-600">COMTECH Standard College Ntungamo</p>
            </div>
          </div>
        </div>
      )}

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Past Papers & Official Documents</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {currentRole === 'teacher'
              ? 'Manage official syllabus documents, past examination papers, and candidate files.'
              : 'View, preview, download, and print official computer studies past papers and revision documents.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {pastPapers.length > 0 && (
            <button
              onClick={() => handlePrint(pastPapers[0])}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print Top Document</span>
            </button>
          )}

          {currentRole === 'teacher' && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-950/40 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Attach & Upload Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Alert */}
      {downloadSuccessToast && (
        <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-xs text-cyan-300 flex items-center justify-between shadow-xl print:hidden">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccessToast}</span>
          </span>
          <button onClick={() => setDownloadSuccessToast(null)} className="text-cyan-400 underline font-semibold ml-3 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl print:hidden">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by title, file name, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Forms / Classes</option>
            <option value="Form 4">Form 4 (Grade 12)</option>
            <option value="Form 3">Form 3 (Grade 11)</option>
            <option value="Form 2">Form 2 (Grade 10)</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        {filteredPapers.map((paper) => {
          const isImageDoc = paper.fileUrl && !paper.fileUrl.endsWith('.mp4');
          const isVideoDoc = paper.fileUrl && paper.fileUrl.endsWith('.mp4');

          return (
            <div
              key={paper.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-md group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                      {isVideoDoc ? (
                        <Film className="w-5 h-5" />
                      ) : isImageDoc ? (
                        <FileImage className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                          {paper.year} · {paper.term}
                        </span>
                        <span className="text-[9px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                          {paper.fileType}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-snug mt-1">
                        {paper.title}
                      </h3>
                    </div>
                  </div>

                  {currentRole === 'teacher' && (
                    <button
                      onClick={() => onDeletePaper(paper.id)}
                      title="Remove document"
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Document Visual Preview Card */}
                {isImageDoc && (
                  <div 
                    onClick={() => {
                      setSelectedDocForPreview(paper);
                      setZoomLevel(1);
                    }}
                    className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-36 flex items-center justify-center cursor-pointer group/thumb"
                  >
                    <img
                      src={paper.fileUrl}
                      alt={paper.title}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300 opacity-90 group-hover/thumb:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Tap to View Full Document Scan</span>
                      </span>
                    </div>
                  </div>
                )}

                {isVideoDoc && (
                  <div 
                    onClick={() => setSelectedDocForPreview(paper)}
                    className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-32 flex items-center justify-center cursor-pointer group/video"
                  >
                    <video
                      src={paper.fileUrl}
                      className="w-full h-full object-cover opacity-80"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/80 text-slate-950 flex items-center justify-center group-hover/video:scale-110 transition-transform">
                        <Film className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Attachment file chip */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-mono text-slate-200 text-[11px] truncate">
                      {paper.fileName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {paper.fileSize}
                  </span>
                </div>

                {paper.instructions && (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {paper.instructions}
                  </p>
                )}

                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 flex-wrap">
                  <span className="text-slate-300 font-medium">{paper.formGrade}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {paper.uploadedAt}
                  </span>
                  <span>·</span>
                  <span>By {paper.uploadedBy}</span>
                </div>
              </div>

              {/* Action Buttons: Preview, Print, Download, and Replace */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {/* View / Preview Key */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDocForPreview(paper);
                      setZoomLevel(1);
                    }}
                    title="View Document"
                    className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  {/* Teacher: Replace Document File */}
                  {currentRole === 'teacher' && onUpdatePaper && (
                    <button
                      type="button"
                      onClick={() => handleTriggerReplace(paper.id)}
                      title="Replace this document with a new file from file manager"
                      className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Active Print Key */}
                  <button
                    type="button"
                    onClick={() => handlePrint(paper)}
                    title="Print document"
                    className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Print</span>
                  </button>

                  {/* Active Download Key */}
                  <button
                    type="button"
                    onClick={() => handleDownload(paper)}
                    title="Download document to Downloads"
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-950/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPapers.length === 0 && (
          <div className="col-span-full p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
            <p className="text-base font-medium">No documents found matching your filter.</p>
            <p className="text-xs text-slate-500 mt-1">
              {currentRole === 'teacher' ? 'Click "Attach & Upload Document" to add files.' : 'Check back later for teacher updates.'}
            </p>
          </div>
        )}
      </div>

      {/* Full Document Viewer Modal */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">
                    {selectedDocForPreview.title}
                  </h2>
                  <div className="text-xs text-slate-400 flex items-center gap-2 truncate">
                    <span className="font-mono text-cyan-400 truncate">{selectedDocForPreview.fileName}</span>
                    <span>·</span>
                    <span>{selectedDocForPreview.fileSize}</span>
                    <span>·</span>
                    <span className="capitalize">{selectedDocForPreview.fileType}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Print button inside viewer */}
                <button
                  onClick={() => handlePrint(selectedDocForPreview)}
                  className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                  title="Print document"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                {/* Download button inside viewer */}
                <button
                  onClick={() => handleDownload(selectedDocForPreview)}
                  className="p-2 text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Download to Downloads folder"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                {/* Close modal */}
                <button
                  onClick={() => setSelectedDocForPreview(null)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors ml-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[350px]">
              {selectedDocForPreview.fileUrl?.endsWith('.mp4') ? (
                <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-black">
                  <video
                    src={selectedDocForPreview.fileUrl}
                    controls
                    autoPlay
                    className="w-full h-auto max-h-[60vh]"
                  />
                </div>
              ) : selectedDocForPreview.fileUrl ? (
                <div className="flex flex-col items-center w-full">
                  {/* Zoom controls for document inspection */}
                  <div className="flex items-center gap-2 mb-3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
                      className="p-1 hover:text-white"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-cyan-400 font-semibold px-1">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                      className="p-1 hover:text-white"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="text-[10px] text-slate-400 hover:text-white border-l border-slate-800 pl-2"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="overflow-auto max-h-[65vh] w-full flex items-center justify-center p-2 rounded-2xl border border-slate-800/80 bg-slate-900/40">
                    <img
                      src={selectedDocForPreview.fileUrl}
                      alt={selectedDocForPreview.title}
                      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                      className="max-h-[60vh] w-auto object-contain rounded-lg transition-transform duration-200 shadow-2xl"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-400 space-y-2">
                  <FileText className="w-12 h-12 text-cyan-400 mx-auto" />
                  <p className="text-sm font-semibold text-white">Document Document Ready</p>
                  <p className="text-xs">Click download to save the complete document to your device.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
              <div>
                <strong>Instructions:</strong> {selectedDocForPreview.instructions}
              </div>
              <div className="shrink-0 flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified by {selectedDocForPreview.uploadedBy}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Upload New Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Attach Official Document</h2>
                <p className="text-xs text-slate-400">
                  Upload an official curriculum paper or document for students to view, download, and print.
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard College Ntungamo Senior 4 Computer Studies Mock Paper"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Term / Session
                  </label>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Form / Class
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Form 4 (Grade 12)">Form 4 (Grade 12)</option>
                    <option value="Form 3 (Grade 11)">Form 3 (Grade 11)</option>
                    <option value="Form 2 (Grade 10)">Form 2 (Grade 10)</option>
                    <option value="Form 3 & 4">Form 3 & 4</option>
                  </select>
                </div>
              </div>

              {/* File Attachment from File Manager */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Document File (PDF, Word, Images, Scans from File Manager)
                </label>
                <div 
                  onClick={() => uploadFileInputRef.current?.click()}
                  className="p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition-colors"
                >
                  <FolderOpen className="w-6 h-6 text-cyan-400" />
                  <div className="text-xs text-slate-300">
                    {attachedFileName ? (
                      <span className="font-mono text-cyan-400 font-bold">{attachedFileName} ({attachedFileSize})</span>
                    ) : (
                      <span>Tap to choose document from your device file manager</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Supports PDF, DOCX, JPG, PNG, Scans
                  </span>
                  <input
                    ref={uploadFileInputRef}
                    type="file"
                    accept="*/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document Instructions / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Official syllabus reference and revision guidelines..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Attach & Save Document</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
