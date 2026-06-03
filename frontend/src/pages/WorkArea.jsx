import React, { useState, useEffect } from 'react';
import { 
  HiOutlineUpload, HiOutlineDocumentText, HiOutlineQuestionMarkCircle, 
  HiOutlineChatAlt2, HiOutlineX, HiOutlinePhotograph, 
  HiOutlineCube, HiOutlineTrash, HiOutlineRefresh, HiOutlineClock, HiOutlineEye
} from 'react-icons/hi';
import { FaMix } from "react-icons/fa";

const WorkArea = ({ activeLab, onExit, user, openChat }) => {
  const [modelType, setModelType] = useState('gemini');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  const handleStreamCommand = async (selectedFile, action) => {
  setStreamingText("");
  setLoading(true);

  const formData = new FormData();
  if (selectedFile) formData.append('file', selectedFile);
  formData.append('prompt', `Action: ${action}. Please analyze this content.`);
  formData.append('profile', JSON.stringify(user?.profile));
  formData.append('modelType', modelType);

  try {
    const response = await fetch('/api/chat', {
  method: 'POST',
  body: formData,
});

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        lines.forEach(line => {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const cleanedLine = line.replace('data: ', '').trim();
              const data = JSON.parse(cleanedLine);
              setStreamingText((prev) => prev + data.text);
            // eslint-disable-next-line no-unused-vars
            } catch (e) {
              // Ignore partial chunks
            }
          }
        });
      }
    } catch (err) {
      console.error("Stream failed", err);
    } finally {
      setLoading(false);
    }
  };
  // Auto-revoke blob URLs to free up browser memory
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setLoading(true);
      if (file) setHistory(prev => [file, ...prev].slice(0, 3)); // Keep last 3
      
      const objectUrl = URL.createObjectURL(uploadedFile);
      setFile(uploadedFile);
      setFilePreview(objectUrl);
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setFilePreview(null);
  };

  return (
    <div className="fixed inset-0 z-100 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-7xl h-[92vh] bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative border border-white/20">
        
        {/* CLOSE BUTTON */}
        <button onClick={onExit} className="absolute top-6 right-8 z-50 p-3 bg-slate-900 text-white rounded-full hover:bg-red-600 transition-all shadow-xl active:scale-90">
          <HiOutlineX />
        </button>

        {/* LEFT PANEL: COMPACT PREVIEW & HISTORY (35% Width) */}
        <div className="w-full md:w-100 bg-slate-50 border-r border-slate-100 flex flex-col">
          <div className="p-8 border-b border-slate-200/60">
             <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <HiOutlineEye className="text-red-500" /> Neural Preview
             </h2>
             
             {/* PREVIEW CONTAINER */}
             <div className="aspect-3/4 w-full bg-slate-200/50 rounded-4xl border-2 border-dashed border-slate-300 overflow-hidden relative group shadow-inner">
  {file ? (
    <div className="h-full w-full animate-in zoom-in-95 duration-300">
      {file.type === "application/pdf" ? (
        <iframe 
          key={file.name} 
          src={`${filePreview}#toolbar=0&navpanes=0`} 
          className="w-full h-full border-none pointer-events-auto"
        />
      ) : file.name.endsWith('.docx') ? (
        /* DOCX Placeholder since iframes can't render Word docs natively */
        <div className="h-full w-full flex flex-col items-center justify-center bg-white p-6">
          <HiOutlineDocumentText className="text-6xl text-blue-500 mb-4" />
          <p className="text-[10px] font-black text-slate-800 uppercase text-center">
            Word Document Linked
          </p>
          <p className="text-[9px] text-slate-400 mt-2 text-center truncate w-full px-4">
            {file.name}
          </p>
        </div>
      ) : (
        <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
      )}
      
      {/* Delete Hover */}
      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
         <button onClick={handleClear} className="p-4 bg-white text-red-600 rounded-full shadow-xl">
            <HiOutlineTrash className="text-xl" />
         </button>
      </div>
    </div>
  ) : (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <HiOutlineUpload className="text-3xl text-slate-300 mb-3" />
      <p className="text-[10px] font-black uppercase text-slate-400">No Source Linked</p>
    </div>
  )}
</div>
</div>

          {/* HISTORY (Scrollable) */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
              <HiOutlineClock /> Previous
            </p>
            <div className="space-y-3">
              {history.map((h, i) => (
                <button 
                  key={i} 
                  onClick={() => { setFile(h); setFilePreview(URL.createObjectURL(h)); }}
                  className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-red-400 transition-all text-left group"
                >
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-red-50 text-slate-400 group-hover:text-red-500">
                    <HiOutlineDocumentText />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 truncate">{h.name}</span>
                </button>
              ))}
              {history.length === 0 && <p className="text-[9px] font-bold text-slate-300 uppercase italic">Empty Cache</p>}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: ACTIONS & UPLOAD (65% Width) */}
<div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
  
  {/* Scrollable Content Wrapper */}
  <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar space-y-10">
    
    {!file ? (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95">
         <div className="space-y-3">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Initialize <br/> {activeLab === 'blue' ? 'Document' : 'Visual'} Lab</h3>
            <p className="text-slate-400 font-bold text-sm">Synchronize your local files with MikeAI's neural core.</p>
         </div>
         <label className="block w-fit px-12 py-5 bg-slate-900 text-white rounded-4xl font-black uppercase text-xs tracking-[0.2em] cursor-pointer hover:bg-red-600 transition-all shadow-2xl active:scale-95">
            {loading ? 'Processing...' : 'Upload Source File'}
            <input type="file" className="hidden" onChange={handleUpload} accept={activeLab === 'blue' ? ".pdf,.docx" : "image/*"} />
         </label>
      </div>
    ) : (
      <div className="max-w-3xl mx-auto w-full space-y-10 pb-12">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-8">
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Active Session</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Link Established</p>
            </div>
          </div>
          <label className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 rounded-xl text-slate-600 font-black uppercase text-[10px] cursor-pointer hover:bg-slate-200 transition-all">
             <HiOutlineRefresh /> Swap Source
             <input type="file" className="hidden" onChange={handleUpload} accept={activeLab === 'blue' ? ".pdf,.docx" : "image/*"}/>
          </label>
        </div>
      <div className="flex justify-center gap-4 mb-6">
        <p className="text-[10px] font-black text-slate-400 uppercase self-center">Processing Core:</p>
        <button 
          onClick={() => setModelType('gemini')}
          className={`px-6 py-2 rounded-full border text-[10px] font-black transition-all ${modelType === 'gemini' ? 'bg-slate-900 text-white border-slate-900' : 'bg-transparent border-slate-200 text-slate-400'}`}
        >GEMINI FLASH</button>
        <button 
          onClick={() => setModelType('openai')}
          className={`px-6 py-2 rounded-full border text-[10px] font-black transition-all ${modelType === 'openai' ? 'bg-slate-900 text-white border-slate-900' : 'bg-transparent border-slate-200 text-slate-400'}`}
        >OPENAI GPT-4</button>
      </div>
        {/* INTERACTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeLab === 'blue' ? (
            <>
              <CommandBtn icon={<HiOutlineDocumentText />} label="Summarize PDF" onClick={() => handleStreamCommand(file, 'summarize')} />
              <CommandBtn icon={<HiOutlineCube />} label="Generate Notes" onClick={() => handleStreamCommand(file, 'notes')} />
              <CommandBtn icon={<HiOutlineQuestionMarkCircle />} label="Interactive Quiz" onClick={() => handleStreamCommand(file, 'quiz')} />
              <CommandBtn icon={<FaMix />} label="Draft Document" onClick={() => handleStreamCommand(file, 'doc')} />
            </>
          ) : (
            <>
              <CommandBtn icon={<HiOutlinePhotograph />} label="Vision Analysis" onClick={() => handleStreamCommand(file, 'describe')} />
              <CommandBtn icon={<HiOutlineCube />} label="Smart Notes" onClick={() => handleStreamCommand(file, 'notes')} />
              <CommandBtn icon={<FaMix />} label="Modify Image" onClick={() => handleStreamCommand(file, 'modify')} />
            </>
          )}
          
          <button 
            onClick={() => openChat(file, 'chat')}
            className="md:col-span-2 flex items-center justify-center gap-4 p-7 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-600 transition-all active:scale-95 group shadow-xl"
          >
            <HiOutlineChatAlt2 className="text-xl group-hover:rotate-12 transition-transform" />
            Open Neural Chat
          </button>
        </div>

        {/* NEURAL OUTPUT AREA (THE TERMINAL) */}
        {/* NEURAL OUTPUT AREA (THE TERMINAL) */}
{(loading || streamingText) && (
  <div className="mt-10 animate-in slide-in-from-top-8 duration-700">
    <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 relative">
      
      {/* Terminal Header */}
      <div className="bg-white/5 border-b border-white/10 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-red-500 animate-pulse' : 'bg-red-900'}`} />
            <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-red-500 animate-pulse [animation-delay:0.2s]' : 'bg-red-900'}`} />
            <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-red-500 animate-pulse [animation-delay:0.4s]' : 'bg-red-900'}`} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
            {loading ? 'Neural Processing...' : 'Process Output'}
          </span>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        className="p-8 md:p-10 max-h-112.5 min-h-50 overflow-y-auto overscroll-contain selection:bg-red-500/30 custom-scrollbar-dark flex flex-col"
        onWheel={(e) => e.stopPropagation()}
      >
        {/* THINKING ANIMATION: Shown only when loading starts but before text arrives */}
        {loading && !streamingText && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
            <div className="relative">
              {/* Outer Ring */}
              <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin"></div>
              {/* Inner Core */}
              <div className="absolute inset-0 m-auto w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_#dc2626]"></div>
            </div>
            <p className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">
              Synthesizing Response
            </p>
          </div>
        )}

        {/* STREAMING CONTENT */}
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-200 text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap tracking-wide">
            {streamingText}
            {loading && streamingText && (
              <span className="inline-block w-2 h-5 bg-red-600 ml-2 animate-pulse shadow-[0_0_10px_#dc2626]" />
            )}
          </p>
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="bg-black/20 px-8 py-3 flex justify-between items-center">
         <span className="text-[9px] font-bold text-slate-600 uppercase">
           Status: {loading ? 'Processing' : 'Standby'}
         </span>
         <span className="text-[9px] font-bold text-slate-600 uppercase">
           Mode: {modelType}
         </span>
      </div>
    </div>
  </div>
)}
      </div>
    )}
  </div>
</div>
      </div>
    </div>
  );
};

const CommandBtn = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-5 p-6 bg-white border border-slate-200 rounded-4xl hover:border-red-500/40 hover:shadow-xl hover:-translate-y-1 transition-all text-left group active:scale-95"
  >
    <span className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-800 group-hover:bg-red-50 group-hover:text-red-500 transition-colors shadow-inner">{icon}</span>
    <span className="font-black text-slate-800 uppercase tracking-tighter text-[11px]">{label}</span>
  </button>
);


export default WorkArea;