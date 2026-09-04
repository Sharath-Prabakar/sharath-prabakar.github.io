import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './HabitStacker.css';

const STORAGE_KEY = 'habit_stacker_data';
const EMOJI_OPTIONS = ['📖','🏃','💪','🧘','💧','🎸','✍️','🎨','🧹','💤','📝','🥗','🍎','☕','🌅','🌙','🔬','🎯','🧠','💊'];
const COLOR_OPTIONS = ['#4da3ff','#52c41a','#ff6b35','#e50914','#d4af37','#9b59b6','#1abc9c','#e91e8f','#00bcd4','#ff9800'];

const API_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/habits` : 'http://localhost:8080/api/habits';

const toDateKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const todayKey = () => toDateKey(new Date());

const getMonthDays = (year, month) => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startDay = first.getDay();
    const days = [];
    // Previous month padding
    for (let i = startDay - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        days.push({ date: d, key: toDateKey(d), otherMonth: true });
    }
    // Current month
    for (let i = 1; i <= last.getDate(); i++) {
        const d = new Date(year, month, i);
        days.push({ date: d, key: toDateKey(d), otherMonth: false });
    }
    // Next month padding
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
        for (let i = 1; i <= remaining; i++) {
            const d = new Date(year, month + 1, i);
            days.push({ date: d, key: toDateKey(d), otherMonth: true });
        }
    }
    return days;
};

const getWeekDays = (refDate) => {
    const d = new Date(refDate);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
        const wd = new Date(start);
        wd.setDate(start.getDate() + i);
        return { date: wd, key: toDateKey(wd) };
    });
};

const computeStreak = (habit, completions) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    let current = 0, longest = 0;

    if (habit.frequency === 'daily' || habit.frequency === 'weekly') {
        const targetDays = habit.frequency === 'weekly' ? (habit.targetDays || [1]) : [0,1,2,3,4,5,6];
        const d = new Date(today);
        
        // If today is a target day and not done, start from previous day
        const todayDone = (completions[toDateKey(d)] || []).includes(habit.id);
        if (targetDays.includes(d.getDay()) && !todayDone) {
            d.setDate(d.getDate() - 1);
        } else if (!targetDays.includes(d.getDay())) {
            d.setDate(d.getDate() - 1);
        }

        // Count current streak
        let safety = 0; // prevent infinite loop if no target days
        while (safety < 1000) {
            if (targetDays.length === 0) break;
            if (targetDays.includes(d.getDay())) {
                const k = toDateKey(d);
                if ((completions[k] || []).includes(habit.id)) {
                    current++;
                    d.setDate(d.getDate() - 1);
                } else break;
            } else {
                d.setDate(d.getDate() - 1);
            }
            safety++;
        }

        // Longest: scan last 365 days
        const scan = new Date(today);
        scan.setDate(scan.getDate() - 365);
        let tempStreak = 0;
        for (let i = 0; i < 366; i++) {
            if (targetDays.includes(scan.getDay())) {
                const k = toDateKey(scan);
                if ((completions[k] || []).includes(habit.id)) { 
                    tempStreak++; 
                    longest = Math.max(longest, tempStreak); 
                } else tempStreak = 0;
            }
            scan.setDate(scan.getDate() + 1);
        }
    } else {
        // Biweekly (14 day windows)
        const d = new Date(today);
        while (true) {
            let found = false;
            for (let i = 0; i < 14; i++) {
                const bd = new Date(d);
                bd.setDate(d.getDate() - i);
                if ((completions[toDateKey(bd)] || []).includes(habit.id)) { found = true; break; }
            }
            if (found) { current++; d.setDate(d.getDate() - 14); }
            else break;
        }
        longest = current;
    }
    return { current, longest };
};

const computeCompletionRate = (habitId, completions, days = 30) => {
    const today = new Date();
    let done = 0;
    for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if ((completions[toDateKey(d)] || []).includes(habitId)) done++;
    }
    return Math.round((done / days) * 100);
};

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_NAMES_SHORT = ['S','M','T','W','T','F','S'];

const HabitStacker = () => {
    const [data, setData] = useState({ habits: [], completions: {} });
    const [isLoading, setIsLoading] = useState(true);
    const [viewMonth, setViewMonth] = useState(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() }; });
    const [activeView, setActiveView] = useState('calendar');
    const [selectedHabitId, setSelectedHabitId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [dayPopover, setDayPopover] = useState(null);

    // Modal form state
    const [formName, setFormName] = useState('');
    const [formEmoji, setFormEmoji] = useState('🎯');
    const [formFreq, setFormFreq] = useState('daily');
    const [formColor, setFormColor] = useState('#4da3ff');
    const [formTargetDays, setFormTargetDays] = useState([1]);

    const fetchHabits = async () => {
        try {
            const res = await fetch(API_URL);
            const apiHabits = await res.json();
            const habits = [];
            const completions = {};
            apiHabits.forEach(h => {
                const habitObj = { ...h };
                if (!habitObj.targetDays) habitObj.targetDays = [];
                habits.push(habitObj);
                if (h.completions) {
                    h.completions.forEach(dateStr => {
                        if (!completions[dateStr]) completions[dateStr] = [];
                        completions[dateStr].push(h.id);
                    });
                }
            });
            setData({ habits, completions });
        } catch (e) {
            console.error('Failed to fetch habits', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHabits();
    }, []);

    const habits = data.habits;
    const completions = data.completions;

    const toggleCompletion = async (habitId, dateKey) => {
        let newHabitComps = [];
        setData(prev => {
            const newCompletions = { ...prev.completions };
            const dayList = newCompletions[dateKey] ? [...newCompletions[dateKey]] : [];
            const idx = dayList.indexOf(habitId);
            if (idx >= 0) dayList.splice(idx, 1);
            else dayList.push(habitId);
            newCompletions[dateKey] = dayList;
            
            Object.keys(newCompletions).forEach(k => {
                if (newCompletions[k].includes(habitId)) newHabitComps.push(k);
            });

            return { ...prev, completions: newCompletions };
        });

        // The state isn't immediately updated here, but we compute newHabitComps inline
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
            const payload = { ...habit, completions: newHabitComps };
            try {
                await fetch(`${API_URL}/${habitId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            } catch (e) { console.error(e); }
        }
    };

    const openAddModal = () => {
        setEditingHabit(null);
        setFormName('');
        setFormEmoji('🎯');
        setFormFreq('daily');
        setFormColor('#4da3ff');
        setFormTargetDays([1]);
        setShowModal(true);
    };

    const openEditModal = (habit) => {
        setEditingHabit(habit);
        setFormName(habit.name);
        setFormEmoji(habit.emoji);
        setFormFreq(habit.frequency);
        setFormColor(habit.color);
        setFormTargetDays(habit.targetDays || [1]);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formName.trim()) return;
        if (formFreq === 'weekly' && formTargetDays.length === 0) return; // require at least one day
        
        const payload = {
            name: formName.trim(),
            emoji: formEmoji,
            frequency: formFreq,
            color: formColor,
            targetDays: formFreq === 'weekly' ? formTargetDays : []
        };

        if (editingHabit) {
            payload.id = editingHabit.id;
            payload.createdAt = editingHabit.createdAt;
            const habitComps = Object.keys(data.completions).filter(k => data.completions[k].includes(editingHabit.id));
            payload.completions = habitComps;
            
            try {
                await fetch(`${API_URL}/${editingHabit.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                fetchHabits();
            } catch (e) { console.error(e); }
        } else {
            payload.completions = [];
            try {
                await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                fetchHabits();
            } catch (e) { console.error(e); }
        }
        setShowModal(false);
    };

    const handleDelete = async () => {
        if (!editingHabit) return;
        try {
            await fetch(`${API_URL}/${editingHabit.id}`, { method: 'DELETE' });
            fetchHabits();
        } catch(e) { console.error(e); }
        setShowModal(false);
        if (selectedHabitId === editingHabit.id) setSelectedHabitId(null);
    };

    // Derived
    const tk = todayKey();
    const todayCompletions = completions[tk] || [];
    const dailyHabits = habits.filter(h => h.frequency === 'daily');
    const weeklyHabits = habits.filter(h => h.frequency === 'weekly');
    const biweeklyHabits = habits.filter(h => h.frequency === 'biweekly');

    const todayDone = dailyHabits.filter(h => todayCompletions.includes(h.id)).length;
    const todayTotal = dailyHabits.length;

    const bestStreak = useMemo(() => {
        if (!habits.length) return 0;
        return Math.max(...habits.map(h => computeStreak(h, completions).current), 0);
    }, [habits, completions]);

    const monthRate = useMemo(() => {
        if (!dailyHabits.length) return 0;
        const rates = dailyHabits.map(h => computeCompletionRate(h.id, completions));
        return Math.round(rates.reduce((a,b) => a+b, 0) / rates.length);
    }, [dailyHabits, completions]);

    const filteredHabits = selectedHabitId ? habits.filter(h => h.id === selectedHabitId) : habits;

    // Calendar days
    const monthDays = useMemo(() => getMonthDays(viewMonth.year, viewMonth.month), [viewMonth]);

    const navMonth = (dir) => {
        setViewMonth(prev => {
            let m = prev.month + dir;
            let y = prev.year;
            if (m < 0) { m = 11; y--; }
            if (m > 11) { m = 0; y++; }
            return { year: y, month: m };
        });
    };

    const goToday = () => {
        const n = new Date();
        setViewMonth({ year: n.getFullYear(), month: n.getMonth() });
    };

    const getHeatLevel = (day) => {
        const dayComps = completions[day.key] || [];
        const dueHabits = filteredHabits.filter(h => h.frequency !== 'weekly' || (h.targetDays || [1]).includes(day.date.getDay()));
        const relevant = dueHabits.filter(h => dayComps.includes(h.id)).length;
        if (relevant === 0) return 0;
        const ratio = relevant / Math.max(dueHabits.length, 1);
        if (ratio >= 1) return 4;
        if (ratio >= 0.66) return 3;
        if (ratio >= 0.33) return 2;
        return 1;
    };

    const renderSidebar = () => {
        const tk = todayKey();
        const today = new Date();
        const todayDueHabits = habits.filter(h => h.frequency === 'daily' || (h.frequency === 'weekly' && (h.targetDays || [1]).includes(today.getDay())) || h.frequency === 'biweekly');
        const todayComps = completions[tk] || [];

        return (
            <div className="habit-sidebar">
                <div className="habit-sidebar-section">
                    <h3 className="habit-sidebar-title">Today's Habits</h3>
                    {todayDueHabits.length === 0 && <p style={{ color: '#666', fontSize: '0.85rem' }}>No habits due today.</p>}
                    {todayDueHabits.map(h => {
                        const done = todayComps.includes(h.id);
                        return (
                            <div key={h.id} className="habit-list-item" onClick={() => toggleCompletion(h.id, tk)}>
                                <div className={`habit-day-check ${done ? 'checked' : ''}`} style={done ? {} : { borderColor: h.color }}>
                                    {done ? '✓' : ''}
                                </div>
                                <div className="habit-list-info" style={{ marginLeft: '10px' }}>
                                    <div className="habit-list-name" style={{ textDecoration: done ? 'line-through' : 'none', color: done ? '#888' : '#e0e0e0' }}>{h.emoji} {h.name}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button className="habit-add-btn" onClick={openAddModal}>+ Add Habit</button>
            </div>
        );
    };

    const renderCalendar = () => (
        <div className="habit-calendar-area" style={{ maxWidth: '450px' }}>
            <div className="habit-cal-nav">
                <button className="habit-cal-nav-btn" onClick={() => navMonth(-1)}>‹</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="habit-cal-month">{MONTH_NAMES[viewMonth.month]} {viewMonth.year}</span>
                    <button className="habit-cal-today-btn" onClick={goToday}>Today</button>
                </div>
                <button className="habit-cal-nav-btn" onClick={() => navMonth(1)}>›</button>
            </div>
            <div className="habit-cal-grid">
                {DAY_NAMES_SHORT.map((d, i) => (
                    <div key={i} className="habit-cal-weekday">{d}</div>
                ))}
                {monthDays.map((day, i) => {
                    const heat = getHeatLevel(day);
                    const isToday = day.key === tk;
                    const isFuture = day.date > new Date();
                    const dayComps = completions[day.key] || [];
                    const dots = filteredHabits.filter(h => dayComps.includes(h.id));
                    return (
                        <div
                            key={i}
                            className={`habit-cal-cell ${day.otherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isFuture && !isToday ? 'future' : ''} heat-${heat}`}
                            onClick={() => !day.otherMonth && setDayPopover(day)}
                        >
                            <span className="habit-cal-day-num">{day.date.getDate()}</span>
                            <div className="habit-cal-emojis">
                                {dots.slice(0, 4).map(h => (
                                    <span key={h.id} className="habit-cal-emoji" title={h.name}>{h.emoji}</span>
                                ))}
                                {dots.length > 4 && <span className="habit-cal-emoji-more">+{dots.length - 4}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderAllHabits = () => (
        <div className="habit-all-habits-section" style={{ marginTop: '40px', maxWidth: '1200px', margin: '40px auto 0' }}>
            <h2 className="habit-sidebar-title" style={{ fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center' }}>All Habits</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {[['📅 Daily', dailyHabits], ['📆 Weekly', weeklyHabits], ['🗓️ Biweekly', biweeklyHabits]].map(([label, list]) => (
                    list.length > 0 && (
                        <div className="habit-sidebar-section" key={label}>
                            <h3 className="habit-sidebar-title">{label}</h3>
                            {list.map(h => {
                                const streak = computeStreak(h, completions);
                                return (
                                    <div key={h.id}
                                        className={`habit-list-item ${selectedHabitId === h.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedHabitId(selectedHabitId === h.id ? null : h.id)}
                                        onDoubleClick={() => openEditModal(h)}
                                    >
                                        <div className="habit-list-emoji">{h.emoji}</div>
                                        <div className="habit-list-info">
                                            <div className="habit-list-name">{h.name}</div>
                                            <div className="habit-list-streak">🔥 {streak.current} streak</div>
                                        </div>
                                        <div className="habit-color-dot" style={{ backgroundColor: h.color }} />
                                    </div>
                                );
                            })}
                        </div>
                    )
                ))}
            </div>
        </div>
    );

    const renderWeekly = () => {
        const weekDays = getWeekDays(new Date());
        return (
            <div className="habit-weekly-grid">
                {weekDays.map(wd => {
                    const isToday = wd.key === tk;
                    const dayComps = completions[wd.key] || [];
                    return (
                        <div key={wd.key} className={`habit-weekly-col ${isToday ? 'today-col' : ''}`}>
                            <div className={`habit-weekly-day-label ${isToday ? 'today-label' : ''}`}>
                                {DAY_NAMES[wd.date.getDay()]} {wd.date.getDate()}
                            </div>
                            {filteredHabits.filter(h => h.frequency === 'daily' || (h.frequency === 'weekly' && (h.targetDays || [1]).includes(wd.date.getDay()))).map(h => {
                                const done = dayComps.includes(h.id);
                                return (
                                    <div key={h.id}
                                        className={`habit-weekly-item ${done ? 'done' : ''}`}
                                        onClick={() => toggleCompletion(h.id, wd.key)}
                                    >
                                        <span className="emoji">{h.emoji}</span>
                                        <span className="name">{h.name}</span>
                                        {done && <span style={{ color: '#52c41a' }}>✓</span>}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderStreaks = () => (
        <div className="habit-streaks-grid">
            {(filteredHabits.length ? filteredHabits : habits).map(h => {
                const streak = computeStreak(h, completions);
                const rate = computeCompletionRate(h.id, completions);
                return (
                    <div key={h.id} className="habit-streak-card" onClick={() => openEditModal(h)}>
                        <div className="habit-streak-header">
                            <div className="habit-streak-emoji">{h.emoji}</div>
                            <div>
                                <div className="habit-streak-name">{h.name}</div>
                                <div className="habit-streak-freq">{h.frequency}</div>
                            </div>
                        </div>
                        <div className="habit-streak-stats">
                            <div className="habit-streak-stat">
                                <div className="habit-streak-stat-val fire">🔥 {streak.current}</div>
                                <div className="habit-streak-stat-label">Current</div>
                            </div>
                            <div className="habit-streak-stat">
                                <div className="habit-streak-stat-val">{streak.longest}</div>
                                <div className="habit-streak-stat-label">Longest</div>
                            </div>
                            <div className="habit-streak-stat">
                                <div className="habit-streak-stat-val green">{rate}%</div>
                                <div className="habit-streak-stat-label">30-Day</div>
                            </div>
                        </div>
                        <div className="habit-progress-bar">
                            <div className="habit-progress-fill" style={{ width: `${rate}%`, backgroundColor: h.color }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="habit-stacker-container">
            <header className="habit-stacker-header">
                <h1 className="habit-stacker-title">🔥 HABIT STACKER</h1>
                <p className="habit-stacker-subtitle">Build powerful routines. Track streaks. Stay consistent.</p>
            </header>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>Loading habits...</div>
            ) : (
                <>
                    {/* Stats Bar */}
                    <div className="habit-stats-bar">
                <div className="habit-stat-card">
                    <div className="habit-stat-val" style={{ color: '#4da3ff' }}>{todayDone}/{todayTotal}</div>
                    <div className="habit-stat-label">Today</div>
                </div>
                <div className="habit-stat-card">
                    <div className="habit-stat-val" style={{ color: '#ff6b35' }}>🔥 {bestStreak}</div>
                    <div className="habit-stat-label">Best Streak</div>
                </div>
                <div className="habit-stat-card">
                    <div className="habit-stat-val" style={{ color: '#52c41a' }}>{monthRate}%</div>
                    <div className="habit-stat-label">30-Day Rate</div>
                </div>
                <div className="habit-stat-card">
                    <div className="habit-stat-val">{habits.length}</div>
                    <div className="habit-stat-label">Total Habits</div>
                </div>
            </div>

            {/* View Tabs */}
            <div className="habit-view-tabs">
                {[['calendar', '📅 Monthly Calendar'], ['weekly', '📊 Weekly Overview'], ['streaks', '🔥 Streaks']].map(([key, label]) => (
                    <button key={key} className={`habit-view-tab ${activeView === key ? 'active' : ''}`} onClick={() => setActiveView(key)}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            {activeView === 'calendar' && (
                <>
                    <div className="habit-main-layout">
                        {renderSidebar()}
                        {habits.length === 0 ? (
                            <div className="habit-empty-state">
                                <div className="emoji">📋</div>
                                <div className="message">No habits yet!</div>
                                <div className="sub-message">Click "+ Add Habit" to start building your routine.</div>
                            </div>
                        ) : renderCalendar()}
                    </div>
                    {habits.length > 0 && renderAllHabits()}
                </>
            )}
            {activeView === 'weekly' && (
                <div>
                    <div className="habit-main-layout" style={{ marginBottom: '20px' }}>
                        {renderSidebar()}
                        <div className="habit-calendar-area">
                            {habits.length === 0 ? (
                                <div className="habit-empty-state">
                                    <div className="emoji">📋</div>
                                    <div className="message">No habits yet!</div>
                                    <div className="sub-message">Click "+ Add Habit" to get started.</div>
                                </div>
                            ) : renderWeekly()}
                        </div>
                    </div>
                </div>
            )}
            {activeView === 'streaks' && (
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                        <button className="habit-add-btn" style={{ width: 'auto', padding: '10px 24px' }} onClick={openAddModal}>+ Add Habit</button>
                    </div>
                    {habits.length === 0 ? (
                        <div className="habit-empty-state">
                            <div className="emoji">🏆</div>
                            <div className="message">No streaks to show yet!</div>
                            <div className="sub-message">Add some habits and start tracking.</div>
                        </div>
                    ) : renderStreaks()}
                </div>
            )}

            {/* Day Detail Popover */}
            {dayPopover && (
                <div className="habit-day-popover-overlay" onClick={() => setDayPopover(null)}>
                    <div className="habit-day-popover" onClick={e => e.stopPropagation()}>
                        <h3 className="habit-day-popover-title">
                            {dayPopover.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                        {habits.length === 0 && <p style={{ color: '#666' }}>No habits defined yet.</p>}
                        {habits.filter(h => h.frequency !== 'weekly' || (h.targetDays || [1]).includes(dayPopover.date.getDay())).map(h => {
                            const done = (completions[dayPopover.key] || []).includes(h.id);
                            return (
                                <div key={h.id} className="habit-day-popover-item" onClick={() => toggleCompletion(h.id, dayPopover.key)}>
                                    <div className={`habit-day-check ${done ? 'checked' : ''}`} style={done ? {} : { borderColor: h.color }}>
                                        {done ? '✓' : ''}
                                    </div>
                                    <span style={{ fontSize: '1.1rem' }}>{h.emoji}</span>
                                    <span className={`habit-day-item-name ${done ? 'completed' : ''}`}>{h.name}</span>
                                    <span style={{ fontSize: '0.7rem', color: '#555', marginLeft: 'auto', textTransform: 'capitalize' }}>{h.frequency}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="habit-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="habit-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="habit-modal-title">{editingHabit ? 'Edit Habit' : 'Add New Habit'}</h3>
                        
                        <div className="habit-modal-field">
                            <label className="habit-modal-label">Habit Name</label>
                            <input className="habit-modal-input" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Morning Run" autoFocus />
                        </div>

                        <div className="habit-modal-field">
                            <label className="habit-modal-label">Emoji</label>
                            <div className="habit-emoji-picker">
                                {EMOJI_OPTIONS.map(em => (
                                    <div key={em} className={`habit-emoji-option ${formEmoji === em ? 'selected' : ''}`} onClick={() => setFormEmoji(em)}>{em}</div>
                                ))}
                            </div>
                        </div>

                        <div className="habit-modal-field">
                            <label className="habit-modal-label">Frequency</label>
                            <div className="habit-modal-freq-group">
                                {['daily','weekly','biweekly'].map(f => (
                                    <button key={f} className={`habit-modal-freq-btn ${formFreq === f ? 'active' : ''}`} onClick={() => setFormFreq(f)}>
                                        {f === 'daily' ? '📅 Daily' : f === 'weekly' ? '📆 Weekly' : '🗓️ Biweekly'}
                                    </button>
                                ))}
                            </div>
                            {formFreq === 'weekly' && (
                                <div className="habit-modal-days-picker" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    {['S','M','T','W','T','F','S'].map((d, i) => {
                                        const selected = formTargetDays.includes(i);
                                        return (
                                            <button 
                                                key={i} 
                                                style={{ 
                                                    flex: 1, 
                                                    padding: '8px 0', 
                                                    borderRadius: '8px', 
                                                    border: `1px solid ${selected ? formColor : '#333'}`, 
                                                    background: selected ? `${formColor}33` : '#0d0d0d', 
                                                    color: selected ? formColor : '#888',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }}
                                                onClick={() => setFormTargetDays(prev => prev.includes(i) ? prev.filter(day => day !== i) : [...prev, i].sort())}
                                            >
                                                {d}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="habit-modal-field">
                            <label className="habit-modal-label">Color</label>
                            <div className="habit-color-picker">
                                {COLOR_OPTIONS.map(c => (
                                    <div key={c} className={`habit-color-option ${formColor === c ? 'selected' : ''}`} style={{ backgroundColor: c }} onClick={() => setFormColor(c)} />
                                ))}
                            </div>
                        </div>

                        <div className="habit-modal-actions">
                            {editingHabit && <button className="habit-modal-delete" onClick={handleDelete}>Delete</button>}
                            <button className="habit-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="habit-modal-save" onClick={handleSave}>
                                {editingHabit ? 'Save Changes' : 'Add Habit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
                </>
            )}
        </div>
    );
};

export default HabitStacker;
