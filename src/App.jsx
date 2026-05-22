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
