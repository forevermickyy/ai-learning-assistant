/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect } from 'react';
import { UserContext, API } from '../context/userContext';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { user, setUser, theme, toggleTheme, logout } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    photo: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        role: user.profile?.role || '',
        photo: user.profile?.photo || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        profile: { ...user.profile, role: formData.role, photo: formData.photo }
      };
      const { data } = await API.post('/update-profile', payload);
      if (data.error) toast.error(data.error);
      else {
        setUser(data);
        toast.success("Neural Configuration Saved");
      }
    } catch (err) {
      toast.error("Protocol Error: Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async () => {
    setLoading(true);
    try {
        // We use the email from the already logged-in user context
        const { data } = await API.post('/forgot-password', { email: user.email });
        
        if (data.error) {
            toast.error(data.error);
        } else {
            toast.success("Reset link dispatched to " + user.email);
        }
    } catch (err) {
        toast.error("Security protocol timeout. Try again.");
    } finally {
        setLoading(false);
    }
};

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("CRITICAL WARNING: This will permanently erase your neural profile. This action cannot be undone. Proceed?");
    if (!confirmDelete) return;

    try {
      const { data } = await API.delete('/delete-account');
      if (data.error) toast.error(data.error);
      else {
        toast.success("Profile Terminated");
        logout();
      }
    } catch (err) {
      toast.error("Termination failed. System error.");
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-12 px-6 transition-colors duration-500 font-sans">
      {/* Background Orbs */}
      <div className={`absolute top-[-10%] left-[-10%] w-120 h-120 rounded-full blur-[120px] transition-opacity duration-1000 ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-500/5'}`} />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            System <span className="text-red-600">Settings</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Manage your MikeAI Core Protocol</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-2">
            {['profile', 'appearance', 'security'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
                  activeTab === tab 
                  ? 'bg-slate-900 text-white  shadow-lg' 
                  : 'bg-white/50 text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3 liquid-glass rounded-[3rem] p-8 md:p-12 border border-white/60  shadow-2xl">
            
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-linear-to-tr from-red-600 to-orange-400 p-1 shadow-lg">
                    <img src={formData.photo || 'https://via.placeholder.com/150'} className="w-full h-full rounded-full object-cover border-4 border-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 ">{formData.name}</h3>
                    <p className="text-slate-400 text-sm font-bold">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="setting-input " />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Role</label>
                    <input name="role" value={formData.role} onChange={handleChange} className="setting-input " />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-800 ">Neural Interface Style</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => theme !== 'light' && toggleTheme()} className={`p-6 rounded-3xl border-2 transition-all text-left ${theme === 'light' ? 'border-red-600 bg-white shadow-xl' : 'border-transparent bg-slate-800/40'}`}>
                    <div className="w-full h-12 bg-slate-100 rounded-lg mb-3"></div>
                    <p className={`text-[10px] font-black uppercase tracking-tighter ${theme === 'light' ? 'text-slate-900' : 'text-slate-400'}`}>Liquid Light</p>
                  </button>
                  <button onClick={() => theme !== 'dark' && toggleTheme()} className={`p-6 rounded-3xl border-2 transition-all text-left ${theme === 'dark' ? 'border-red-600 bg-slate-800 shadow-xl' : 'border-transparent bg-white/50'}`}>
                    <div className="w-full h-12 bg-slate-700 rounded-lg mb-3"></div>
                    <p className={`text-[10px] font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>Midnight Protocol</p>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                 <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-800 ">Account Security</h3>
                    <p className="text-sm text-slate-500 font-medium">
                        Request a password reset link.
                    </p>
                    <button 
                        onClick={handlePasswordResetRequest}
                        disabled={loading}
                        className="btn-brand"
                    >
                        {loading ? 'Processing...' : 'Initialize Reset Link'}
                    </button>
                 </div>
                 <div className="pt-8 border-t border-red-100 ">
                   <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-2">Danger Zone</h4>
                   <p className="text-xs text-slate-400 mb-4 font-bold">Terminating your account will permanently delete all AI interaction history and custom profiles.</p>
                   <button onClick={handleDeleteAccount} className="px-6 py-3 border-2 border-red-100  text-red-400 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                     Terminate Account
                   </button>
                 </div>
              </div>
            )}
            
            <div className="mt-12 pt-8 border-t border-white/40 flex justify-end">
                <button onClick={handleSave} disabled={loading} className="px-10 py-4 bg-linear-to-r from-red-700 via-red-600 to-orange-500 text-white font-black rounded-3xl tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-red-200 uppercase text-[11px] disabled:opacity-50">
                  {loading ? 'Updating...' : 'Save Configuration'}
                </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .setting-input {
          width: 100%;
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 1.25rem;
          padding: 1rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #1E293B;
          outline: none;
          transition: all 0.2s;
        }
        .setting-input:focus {
          border-color: #DC2626;
          box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.05);
        }
      `}</style>
    </div>
  );
};

export default Settings;