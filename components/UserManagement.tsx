
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUserRole: UserRole;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, currentUserRole }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({ name: '', role: UserRole.STAFF, pin: '' });

  const resetForm = () => {
    setFormData({ name: '', role: UserRole.STAFF, pin: '' });
    setIsAdding(false);
    setEditingUserId(null);
  };

  const handleAction = () => {
    if (!formData.name || !formData.pin || formData.pin.length !== 4) return;

    if (editingUserId) {
      // Edit Mode
      setUsers(prev => prev.map(u => u.id === editingUserId ? { 
        ...u, 
        name: formData.name!, 
        role: formData.role!, 
        pin: formData.pin!,
        password: formData.pin! // Update password to match pin for simplicity
      } : u));
    } else {
      // Add Mode
      setUsers(prev => [...prev, { 
        id: crypto.randomUUID(),
        companyId: users[0]?.companyId || 'SYSTEM',
        name: formData.name!,
        email: `${formData.name?.toLowerCase().replace(/\s/g, '')}@trackr.com`,
        password: formData.pin!,
        pin: formData.pin!,
        role: formData.role || UserRole.STAFF
      } as User]);
    }
    resetForm();
  };

  const startEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormData({ name: user.name, role: user.role, pin: user.pin });
    setIsAdding(true);
  };

  const deleteUser = (id: string) => {
    if (confirm('Remove this staff member?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.02] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tightest">Staff Hub</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage Permissions</p>
        </div>
        <button onClick={() => { isAdding ? resetForm() : setIsAdding(true); }} className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg active-scale transition-all ${isAdding ? 'bg-black text-white dark:bg-white dark:text-black rotate-45' : 'bg-black text-white dark:bg-white dark:text-black'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] premium-shadow border-2 border-black/5 dark:border-white/5 space-y-6 animate-in zoom-in-95 duration-300">
           <h3 className="text-lg font-black uppercase tracking-tightest">{editingUserId ? 'Modify Member' : 'Provision New Seat'}</h3>
           <div className="space-y-1">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Full Name</label>
             <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none focus:ring-1 focus:ring-black/10" placeholder="Azeem Ahmed" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Security PIN</label>
                <input maxLength={4} value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none text-center tracking-widest" placeholder="xxxx" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Assign Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-[10px] border-none uppercase appearance-none">
                   <option value={UserRole.STAFF}>Staff (Operations)</option>
                   <option value={UserRole.MANAGER}>Manager (Control)</option>
                   <option value={UserRole.ADMIN}>Company Admin</option>
                </select>
              </div>
           </div>
           <div className="flex gap-2">
              <button onClick={handleAction} className="flex-1 py-5 bg-black text-white dark:bg-white dark:text-black rounded-full font-black text-xs uppercase tracking-widest active-scale">
                {editingUserId ? 'Save Changes' : 'Confirm Provision'}
              </button>
              {editingUserId && (
                <button onClick={resetForm} className="px-6 py-5 bg-slate-100 dark:bg-slate-800 rounded-full font-black text-[10px] uppercase tracking-widest">Cancel</button>
              )}
           </div>
        </div>
      )}

      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 premium-shadow border border-black/[0.02] flex items-center justify-between group">
            <div className="flex items-center gap-4">
               <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-black dark:text-white font-black text-xl uppercase">
                 {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name[0]}
               </div>
               <div>
                 <h4 className="font-black text-sm">{u.name}</h4>
                 <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${u.role === UserRole.SUPER_ADMIN ? 'bg-rose-100 text-rose-600' : (u.role === UserRole.ADMIN ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-slate-100 text-slate-400')}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                    <span className="text-[7px] font-black text-slate-300 uppercase">PIN: {u.pin}</span>
                 </div>
               </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => startEdit(u)} className="h-10 w-10 text-slate-400 hover:text-black dark:hover:text-white rounded-xl flex items-center justify-center transition-colors active-scale">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </button>
              {u.role !== UserRole.SUPER_ADMIN && (
                <button onClick={() => deleteUser(u.id)} className="h-10 w-10 text-rose-500 hover:bg-rose-50 rounded-xl flex items-center justify-center transition-colors active-scale">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
