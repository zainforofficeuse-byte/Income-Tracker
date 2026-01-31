
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUserRole: UserRole;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, currentUserRole }) => {
  const [isAdding, setIsAdding] = useState(false);
  // pin is now part of User type in types.ts
  const [newUser, setNewUser] = useState<Partial<User>>({ name: '', role: UserRole.STAFF, pin: '' });

  const addUser = () => {
    // Corrected pin validation
    if (!newUser.name || !newUser.pin || newUser.pin.length !== 4) return;
    
    // Ensuring all mandatory User fields are provided when creating a new record
    setUsers(prev => [...prev, { 
      ...newUser, 
      id: crypto.randomUUID(),
      companyId: users[0]?.companyId || 'SYSTEM',
      email: `${newUser.name?.toLowerCase().replace(/\s/g, '')}@trackr.com`,
      password: newUser.pin || '1234',
      pin: newUser.pin || '1234'
    } as User]);
    
    setNewUser({ name: '', role: UserRole.STAFF, pin: '' });
    setIsAdding(false);
  };

  const deleteUser = (id: string) => {
    if (id === 'super-admin-1' || id === 'admin-1') return;
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
        <button onClick={() => setIsAdding(!isAdding)} className="h-12 w-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg active-scale">
          {isAdding ? '×' : '+'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] premium-shadow border-2 border-indigo-500/10 space-y-6">
           <div className="space-y-1">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Full Name</label>
             <input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Security PIN</label>
                <input maxLength={4} value={newUser.pin} onChange={e => setNewUser({...newUser, pin: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none text-center tracking-widest" placeholder="xxxx" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Assign Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-[10px] border-none uppercase">
                   <option value={UserRole.STAFF}>Staff (Basic)</option>
                   <option value={UserRole.MANAGER}>Manager (Mid)</option>
                   <option value={UserRole.ADMIN}>Company Admin</option>
                   {currentUserRole === UserRole.SUPER_ADMIN && (
                     <option value={UserRole.SUPER_ADMIN}>System Support (SUPER)</option>
                   )}
                </select>
              </div>
           </div>
           <button onClick={addUser} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale">Create Profile</button>
        </div>
      )}

      <div className="space-y-3">
        {users.filter(u => currentUserRole === UserRole.SUPER_ADMIN ? true : u.role !== UserRole.SUPER_ADMIN).map(u => (
          <div key={u.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 premium-shadow border border-black/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 font-black text-xl uppercase">
                 {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name[0]}
               </div>
               <div>
                 <h4 className="font-black text-sm">{u.name}</h4>
                 <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${u.role === UserRole.SUPER_ADMIN ? 'bg-rose-100 text-rose-600' : (u.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400')}`}>
                   {u.role.replace('_', ' ')}
                 </span>
               </div>
            </div>
            {u.id !== 'super-admin-1' && u.id !== 'admin-1' && (
              <button onClick={() => deleteUser(u.id)} className="h-10 w-10 text-rose-500 hover:bg-rose-50 rounded-xl flex items-center justify-center transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;