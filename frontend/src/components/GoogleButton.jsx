import React, { useContext } from 'react';
import { auth } from '../firebase'; 
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-hot-toast'; 

import { UserContext, API } from '../context/userContext'; 

const GoogleButton = ({ disabled, giftCode }) => {
    const navigate = useNavigate();
    
    const { setUser } = useContext(UserContext);

    const handleGoogleSignIn = async () => {
        
        const provider = new GoogleAuthProvider();
        if (disabled) {
            return toast.error("Please agree to the terms first!");
        }
        
        provider.setCustomParameters({ prompt: 'select_account' });

        try {
            const result = await signInWithPopup(auth, provider);
            
            const idToken = await result.user.getIdToken();

            const { data } = await API.post('/google-login', { idToken, giftCode });

            if (data.error) {
                toast.error(data.error);
            } else {
            
                setUser(data); 

                toast.success(`Welcome, ${data.name}`);
                
                if (!data.onboarded) {
                    navigate('/onboarding');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            console.error("Authentication Failed:", error);
            toast.error("Google sign-in was interrupted.");
        }
    };

    return (
        <button 
            type="button"
            onClick={handleGoogleSignIn}
          className={`w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-700 transition-all active:scale-95 shadow-sm
                ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-slate-50'}`}
        >
            <FcGoogle size={24} />
            <span className="tracking-tight font-black uppercase text-[11px]">Continue with Google</span>
        </button>
    );
};

export default GoogleButton;