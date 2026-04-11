import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { API } from '../context/userContext';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');

    console.log("Token from URL:", token);

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/reset-password', { token, password });
            if (data.error) {
                toast.error(data.error);
            } else {
                toast.success(data.message);
                navigate('/login');
            }
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
            <form onSubmit={handleReset} className="liquid-glass p-10 rounded-4xl w-full max-w-md shadow-2xl border border-white">
                <h2 className="text-2xl font-black mb-6">New <span className="text-red-600">Password</span></h2>
                <input 
                    type="password" 
                    placeholder="Enter new password"
                    className="w-full p-4 rounded-2xl bg-white/50 border border-white outline-none mb-4"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs">
                    Update Password
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;