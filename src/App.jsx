import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Home, BarChart2, Users, Settings, Check, X, Trophy, Trash2, Edit3, ChevronLeft, ChevronRight, Search, ChevronRight as ArrowRight, Globe, MessageCircle, Instagram, HelpCircle, Smartphone, Layout, Palette, List } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subDays } from 'date-fns';
import './index.css';

const HABIT_LIBRARY = [
  { title: 'Learning', goal: 3, unit: 'h', icon: '🎓', color: 'bg-indigo-50', progressColor: 'bg-indigo-500' },
  { title: 'Walk', goal: 7000, unit: 'steps', icon: '🚶', color: 'bg-emerald-50', progressColor: 'bg-emerald-500' },
  { title: 'Read a book', goal: 60, unit: 'min', icon: '📚', color: 'bg-amber-50', progressColor: 'bg-amber-500' },
  { title: 'Drink water', goal: 3000, unit: 'ml', icon: '💧', color: 'bg-blue-50', progressColor: 'bg-blue-500' },
  { title: 'Workout', goal: 1, unit: 'hr', icon: '💪', color: 'bg-orange-50', progressColor: 'bg-orange-500' },
  { title: 'Yoga', goal: 30, unit: 'min', icon: '🧘‍♀️', color: 'bg-teal-50', progressColor: 'bg-teal-500' },
  { title: 'Journaling', goal: 1, unit: 'entry', icon: '✍️', color: 'bg-yellow-50', progressColor: 'bg-yellow-500' },
  { title: 'Deep Work', goal: 4, unit: 'hr', icon: '🧱', color: 'bg-stone-50', progressColor: 'bg-stone-500' },
  { title: 'Healthy Meal', goal: 3, unit: 'meals', icon: '🥗', color: 'bg-green-50', progressColor: 'bg-green-500' },
  { title: 'Vitamin Intake', goal: 1, unit: 'pill', icon: '💊', color: 'bg-orange-50', progressColor: 'bg-orange-500' },
  { title: 'Language Study', goal: 30, unit: 'min', icon: '🌎', color: 'bg-cyan-50', progressColor: 'bg-cyan-500' },
  { title: 'Sleep', goal: 8, unit: 'hr', icon: '😴', color: 'bg-indigo-50', progressColor: 'bg-indigo-500' },
];

export default function App() {
  const [view, setView] = useState('home');
  const [theme, setTheme] = useState('light');
  const [filter, setFilter] = useState('all');
  const [habits, setHabits] = useState(() => JSON.parse(localStorage.getItem('habit-pro-vfinal-v5')) || []);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingProgressId, setEditingProgressId] = useState(null);
  const [formState, setFormState] = useState({ title: '', goal: '', unit: '', icon: '🎯' });
  const [searchQuery, setSearchQuery] = useState('');

  const audioCtx = useRef(null);

  useEffect(() => localStorage.setItem('habit-pro-vfinal-v5', JSON.stringify(habits)), [habits]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const currentWeekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 1 });

  // --- STREAK LOGIC ---
  const calculateStreak = (habit) => {
    let streak = 0;
    let checkDate = new Date(); // Start from today
    
    while (true) {
      const key = format(checkDate, 'yyyy-MM-dd');
      const progress = habit.history[key] || 0;
      if (progress >= habit.goal) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        // If it's today and they haven't finished yet, don't break the streak yet, just look at yesterday
        if (isToday(checkDate)) {
            checkDate = subDays(checkDate, 1);
            continue;
        }
        break;
      }
    }
    return streak;
  };

  // --- SOUND GENERATOR ---
  const playSuccessSound = () => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.current.currentTime + 0.1);
    gain.gain.setValueAtTime(0, audioCtx.current.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioCtx.current.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.3);
    osc.connect(gain); gain.connect(audioCtx.current.destination);
    osc.start(); osc.stop(audioCtx.current.currentTime + 0.3);
  };

  // --- ACTIONS ---
  const handleSaveHabit = () => {
    if (!formState.title || !formState.goal) return;
    const isDuplicate = habits.some(h => h.title.toLowerCase().trim() === formState.title.toLowerCase().trim() && h.id !== editingHabitId);
    if (isDuplicate) { alert("You already have this habit!"); return; }

    if (editingHabitId) setHabits(prev => prev.map(h => h.id === editingHabitId ? { ...h, ...formState } : h));
    else setHabits([...habits, { ...formState, id: Date.now(), history: {}, color: formState.color || 'bg-rose-50', progressColor: formState.progressColor || 'bg-rose-500' }]);
    closeModal();
  };

  const updateProgress = (id, val) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const oldProgress = h.history[dateKey] || 0;
        if (oldProgress < h.goal && val >= h.goal) playSuccessSound();
        return { ...h, history: { ...h.history, [dateKey]: val } };
      }
      return h;
    }));
  };

  const closeModal = () => { setIsFormOpen(false); setEditingHabitId(null); setFormState({ title: '', goal: '', unit: '', icon: '🎯' }); setSearchQuery(''); };
  const deleteHabit = (id) => { if (window.confirm("Delete this habit?")) setHabits(habits.filter(h => h.id !== id)); };

  const getDailyCompletion = (dateObj = selectedDate) => {
    if (habits.length === 0) return 0;
    const key = format(dateObj, 'yyyy-MM-dd');
    let total = 0;
    habits.forEach(h => total += Math.min((h.history[key] || 0) / h.goal, 1));
    return Math.round((total / habits.length) * 100);
  };

  const filteredHabits = useMemo(() => habits.filter(h => {
    const done = (h.history[dateKey] || 0) >= h.goal;
    return filter === 'completed' ? done : filter === 'in-progress' ? !done : true;
  }), [habits, filter, dateKey]);

  return (
    <div className={`max-w-md mx-auto min-h-screen pb-40 font-sans border-x shadow-2xl relative transition-colors duration-300 ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-[#FBFBFE] text-[#1A1C1E]'}`}>
      
      {/* HEADER */}
      {view !== 'settings' && (
        <header className={`${theme === 'dark' ? 'bg-[#121212]' : 'bg-white/80'} px-6 pt-8 pb-4 backdrop-blur-md sticky top-0 z-40 border-b border-gray-50`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black italic">{format(selectedDate, 'MMMM d')}</h1>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{getDailyCompletion()}% COMPLETE</p>
            </div>
            {!isToday(selectedDate) && (
              <button onClick={() => { setWeekOffset(0); setSelectedDate(new Date()); }} className="text-[9px] font-black bg-rose-50 text-rose-500 px-3 py-1 rounded-full border border-rose-100 animate-bounce">GO TO TODAY</button>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-1 text-gray-400"><ChevronLeft size={18} /></button>
            <div className={`flex-1 flex justify-between items-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50/80'} p-1 rounded-2xl border border-gray-100`}>
              {[...Array(7)].map((_, i) => {
                const day = addDays(currentWeekStart, i);
                const active = isSameDay(day, selectedDate);
                return (
                  <button key={i} onClick={() => setSelectedDate(day)} className={`flex flex-col items-center flex-1 py-3 rounded-xl transition-all ${active ? 'bg-white shadow-sm scale-105' : 'opacity-40'}`}>
                    <span className={`text-[8px] font-black uppercase mb-1 ${active ? 'text-rose-500' : 'text-gray-400'}`}>{format(day, 'eee')}</span>
                    <span className={`text-sm font-black ${active && theme === 'dark' ? 'text-black' : ''}`}>{format(day, 'd')}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-1 text-gray-400"><ChevronRight size={18} /></button>
          </div>

          {view === 'home' && (
            <div className="flex gap-2">
              {['all', 'in-progress', 'completed'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${filter === f ? 'bg-[#1A1C1E] text-white' : 'bg-transparent text-gray-400 border-gray-100'}`}>{f}</button>
              ))}
            </div>
          )}
        </header>
      )}

      {/* HOME LIST */}
      {view === 'home' && (
        <main className="p-6 space-y-4">
          {filteredHabits.map((h) => {
            const progress = h.history[dateKey] || 0;
            const isDone = progress >= h.goal;
            const currentStreak = calculateStreak(h);
            return (
              <div key={h.id} className={`relative ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} p-5 rounded-[2.5rem] shadow-sm border flex items-center justify-between group overflow-hidden`}>
                <div className="flex items-center gap-4 z-10">
                  <div className={`w-12 h-12 rounded-2xl ${h.color} flex items-center justify-center text-xl`}>{isDone ? '✨' : h.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm">{h.title}</h4>
                        {currentStreak > 0 && <span className="text-[10px] font-black text-orange-500 flex items-center gap-0.5">🔥{currentStreak}</span>}
                    </div>
                    {editingProgressId === h.id ? (
                      <input 
                        autoFocus type="number" 
                        className="w-20 border-b-2 border-rose-500 outline-none text-xs font-bold bg-transparent"
                        onChange={(e) => updateProgress(h.id, parseFloat(e.target.value) || 0)}
                        onBlur={() => setEditingProgressId(null)}
                      />
                    ) : (
                      <p onClick={() => setEditingProgressId(h.id)} className="text-[10px] font-bold text-gray-400 cursor-text uppercase">{progress} / {h.goal} {h.unit}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 z-10">
                  <button onClick={() => setEditingProgressId(h.id)} className="w-9 h-9 rounded-full bg-gray-50/10 flex items-center justify-center text-rose-500"><Plus size={16} /></button>
                  <button onClick={() => {setFormState(h); setEditingHabitId(h.id); setIsFormOpen(true);}} className="w-9 h-9 rounded-full bg-gray-50/10 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-all"><Edit3 size={14} /></button>
                  <button onClick={() => deleteHabit(h.id)} className="w-9 h-9 rounded-full bg-gray-50/10 flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                </div>
                <div className={`absolute left-0 top-0 h-full ${h.progressColor} opacity-10 transition-all duration-700 ease-out`} style={{ width: `${Math.min((progress/h.goal)*100, 100)}%` }} />
              </div>
            );
          })}
        </main>
      )}

      {/* STATS VIEW */}
      {view === 'stats' && (
        <main className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-black italic mb-8 text-center">Analytics</h2>
          <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-50'} rounded-[3rem] p-10 flex flex-col items-center border shadow-sm mb-6`}>
             <div className="w-40 h-40 rounded-full border-[12px] border-rose-50 flex flex-col items-center justify-center relative">
                <svg className="absolute inset-[-12px] w-[184px] h-[184px] transform -rotate-90">
                  <circle cx="92" cy="92" r="86" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-rose-500 transition-all duration-1000 ease-in-out" strokeDasharray={540} strokeDashoffset={540 - (540 * getDailyCompletion()) / 100} strokeLinecap="round" />
                </svg>
                <span className="text-3xl font-black">{getDailyCompletion()}%</span>
                <span className="text-[10px] font-black opacity-30 uppercase">Today's Goal</span>
             </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-50'} rounded-[3rem] p-8 border`}>
            <div className="flex items-end justify-between h-32 gap-3">
