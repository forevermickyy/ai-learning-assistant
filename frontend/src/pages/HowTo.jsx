import React from 'react';
import { 
   HiOutlineChatAlt2, HiOutlineUpload, HiOutlineVideoCamera, HiOutlineMicrophone, 
  HiOutlineSparkles, HiOutlineLightningBolt 
} from 'react-icons/hi';
import { FaCodeCommit } from "react-icons/fa6";
import { CiCompass1 } from "react-icons/ci";
import { MdOutlineTipsAndUpdates } from "react-icons/md";

const HowTo = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 space-y-16">
      
      {/* Header Section */}
      <div className='mt-5'>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
          Operating <span className="text-slate-400">Manual</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-1">
          A technical guide to navigating the MikeAI ecosystem.
        </p>
      </div>

      {/* Main Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Navigation - Wide Card */}
        <div className="md:col-span-8 liquid-glass p-10 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between">
          <div className="space-y-4">
            < CiCompass1 className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white"/>
              
            
            <h3 className="text-2xl font-black text-slate-900 uppercase">Site Navigation</h3>
            <p className="text-slate-500 leading-relaxed max-w-xl">
              The Sidebar is your primary command center. Use the **toggle switch** on the top right of the sidebar to collapse it into icon-only mode. For the **Dashboard**, click the main label to view your analytics, or use the chevron to access individual generation tools.
            </p>
          </div>
          <div className="mt-8 flex gap-2">
            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Sidebar</span>
            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Navbar</span>
            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Dashboard Tree</span>
          </div>
        </div>

        {/* Chat - Small Card */}
        <div className="md:col-span-4 bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-4">
          <HiOutlineChatAlt2 size={32} className="text-red-500" />
          <h3 className="text-xl font-black uppercase">MikeAI Chat</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Click 'Chat with MikeAi' to launch the assistant. It is context-aware and uses your profile data to provide personalized learning insights.
          </p>
        </div>

        {/* Uploads - Full Width */}
        <div className="md:col-span-12 grid md:grid-cols-3 gap-6">
          <div className="p-8 rounded-4xl bg-slate-50 border border-slate-100 space-y-3">
            <HiOutlineUpload className="text-red-600" size={28} />
            <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Docs & Zips</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Upload <strong>.pdf</strong>, <strong>.docx</strong>, or <strong>.zip</strong>. Our engine automatically unzips folders to index your entire study library at once.
            </p>
          </div>
          <div className="p-8 rounded-4xl bg-slate-50 border border-slate-100 space-y-3">
            <HiOutlineMicrophone className="text-orange-500" size={28} />
            <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Audio Processing</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Drop <strong>.mp3</strong> or <strong>.wav</strong> files. MikeAI+ transcribes audio into structured notes with timestamps for easy review.
            </p>
          </div>
          <div className="p-8 rounded-4xl bg-slate-50 border border-slate-100 space-y-3">
            <HiOutlineVideoCamera className="text-slate-900" size={28} />
            <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Video Intelligence</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Upload <strong>.mp4</strong>. The system generates visual summaries and extracts key dialogue for instant learning.
            </p>
          </div>
        </div>

        {/* Generations - Wide Card */}
        <div className="md:col-span-12 liquid-glass p-10 rounded-[3rem] border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <FaCodeCommit size={120} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase mb-8">Generation Capabilities</h3>
          <div className="grid md:grid-cols-2 gap-12 text-slate-700">
            <div className="space-y-4">
              <h4 className="text-red-600 font-black text-xs uppercase tracking-widest">Output Formats</h4>
              <ul className="text-sm space-y-3 font-medium">
                <li>• Generate <strong>PDF & DOCX</strong> reports from notes</li>
                <li>• Create <strong>PPT</strong> decks for presentations</li>
                <li>• Compile resource bundles into <strong>ZIP</strong> files</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-orange-500 font-black text-xs uppercase tracking-widest">Multimedia (MikeAI+)</h4>
              <ul className="text-sm space-y-3 font-medium">
                <li>• <strong>Neural Audio:</strong> Generate .mp3 voiceovers</li>
                <li>• <strong>AI Video:</strong> Generate .mp4 visual explainers</li>
                <li>• <strong>Lyria & Veo:</strong> Integration with high-fidelity media engines</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* MikeAI Pro Tips - New Section */}
      <section className="bg-linear-to-br from-red-600 to-orange-500 p-10 rounded-[3rem] text-white shadow-2xl shadow-red-200">
        <div className="flex items-center gap-3 mb-6">
          <MdOutlineTipsAndUpdates size={24} />
          <h2 className="text-2xl font-black uppercase tracking-tighter">MikeAI Pro Tips</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h5 className="font-black text-xs uppercase opacity-80">Bulk Processing</h5>
            <p className="text-sm leading-relaxed">Zip your entire semester folder before uploading. MikeAI will cross-reference all files to find common themes.</p>
          </div>
          <div className="space-y-2">
            <h5 className="font-black text-xs uppercase opacity-80">Format Conversions</h5>
            <p className="text-sm leading-relaxed">You can upload a Video and ask the AI to "Convert this to a PDF Study Guide" in a single prompt.</p>
          </div>
          <div className="space-y-2">
            <h5 className="font-black text-xs uppercase opacity-80">Dashboard Shortcuts</h5>
            <p className="text-sm leading-relaxed">Double-click any sub-item in the Dashboard tree to open it in a new workspace tab.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HowTo;