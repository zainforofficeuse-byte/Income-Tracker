
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
  onLogout: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [pin, setPin] = useState(user.pin); // user.pin is now correctly typed in User interface

  const handleSave = () => {
    if (name.trim() === '' || pin.length !== 4) return;
    onSave({ ...user, name, pin });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-white/20 dark:border-white/5 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center mb-8">
           <div className="h-20 w-20 rounded-[2.5rem] bg-indigo-50 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden mb-4 text-3xl font-black text-indigo-500">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name[0]}
           </div>
           <h3 className="text-xl font-black">Profile Settings</h3>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage Credentials</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Display Name</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none focus:ring-2 focus:ring-indigo-500/20" 
              placeholder="Your Name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Security PIN</label>
            <input 
              maxLength={4} 
              value={pin} 
              onChange={e => setPin(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none text-center tracking-widest focus:ring-2 focus:ring-indigo-500/20" 
              placeholder="xxxx"
            />
          </div>

          <div className="pt-4 space-y-3">
            <button 
              onClick={handleSave} 
              className="w-full py-4 bg-indigo-600 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-widest active-scale shadow-lg shadow-indigo-500/20"
            >
              Update Profile
            </button>
            <button 
              onClick={onLogout} 
              className="w-full py-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-[1.8rem] font-black text-xs uppercase tracking-widest active-scale border border-rose-100 dark:border-rose-900/30"
            >
              Terminate Session
            </button>
          </div>
          
          <button 
            onClick={onClose} 
            className="w-full text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors py-2"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;