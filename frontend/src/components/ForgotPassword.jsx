import { useState } from 'react';
import { API } from '../context/userContext';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/forgot-password', { email });
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(data.message);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-[#F2F2F7] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-5%] right-[-10%] w-150 h-150 bg-red-500/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md liquid-glass rounded-[3rem] p-10 relative z-10 border border-white shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">
            Reset <span className="text-red-600">Access</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
            Enter your email to receive a recovery link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
            <input 
              type="email" 
              placeholder="your@email.com" 
              required
              className="w-full bg-white/40 border border-white/80 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:bg-white transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200 uppercase text-[11px] disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-bold text-slate-400">
          Remembered? <Link to="/login" className="text-red-600 hover:underline">Go Back</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;