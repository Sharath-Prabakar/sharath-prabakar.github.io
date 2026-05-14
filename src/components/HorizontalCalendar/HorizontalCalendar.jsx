import React, { useMemo, useState } from 'react';
import './HorizontalCalendar.css';

const HorizontalCalendar = ({ summaries, onDayClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        d.setHours(0, 0, 0, 0);
        return d;
    });

    // Generate an array of 7 days: 5 past, 1 today, 1 future
    const weeklyDays = useMemo(() => {
        const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        today.setHours(0, 0, 0, 0); 
        
        const daysArray = [];
        for (let i = -5; i <= 1; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            daysArray.push(date);
        }
        return daysArray;
    }, []);

    // Generate days for the monthly grid
    const monthlyDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const days = [];
        const startingDay = firstDay.getDay(); // 0 is Sunday
        
        // Previous month days to fill the first row
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDay - i),
                currentMonth: false
            });
        }
        
        // Current month days
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push({
                date: new Date(year, month, d),
                currentMonth: true
            });
        }
        
        // Next month days to fill the last row
        const totalCells = 42; // 6 rows of 7 days
        const remainingCells = totalCells - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                currentMonth: false
            });
        }
        
        return days;
    }, [viewDate]);

    // Aggregate productivity data by date string (YYYY-MM-DD)
    const productivityByDate = useMemo(() => {
        const data = {};
        summaries.forEach(summary => {
            if (!summary.createdAt) return;
            const dateObj = new Date(summary.createdAt);
            // Use local date string to avoid timezone shifts (YYYY-MM-DD)      
            const dateStr = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

            if (!data[dateStr]) {
                data[dateStr] = { tasks: 0, timeSec: 0 };
            }

            // Use totalTasks and totalTimeSeconds fields
            data[dateStr].tasks += summary.totalTasks || 0;
            data[dateStr].timeSec += summary.totalTimeSeconds || 0;
        });
        return data;
    }, [summaries]);

    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const nowInKolkata = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    const formatTime = (totalSeconds) => {
        if (totalSeconds === 0) return '0s';
        if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.round(totalSeconds % 60);
        if (secs === 0) return `${mins}m`;
        return `${mins}m ${secs}s`;
    };


    const goToToday = () => {
        const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        d.setHours(0, 0, 0, 0);
        setViewDate(d);
    };
    const changeMonth = (offset) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(newDate);
    };

    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    const year = viewDate.getFullYear();

    const renderDayBox = (date, isWeekly = false, isCurrentMonth = true) => {
        const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const isToday = dateStr === todayStr;
        const isFuture = date > nowInKolkata && !isToday;
        const stats = productivityByDate[dateStr] || { tasks: 0, timeSec: 0 };

        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumber = date.getDate();

        let dayClass = isWeekly ? 'calendar-day-box' : 'calendar-month-cell';
        if (isToday) dayClass += ' is-today';
        if (isFuture) dayClass += ' is-future';
        if (!isFuture && stats.tasks > 0) dayClass += ' has-activity';
        if (onDayClick && !isFuture) dayClass += ' clickable';
        if (!isCurrentMonth) dayClass += ' other-month';

        return (
            <div
                key={dateStr}
                className={dayClass}
                onClick={() => {
                    if (onDayClick && !isFuture) {
                        onDayClick(dateStr);
                    }
                }}
            >
                <div className="day-header">
                    <span className="day-name">{dayName}</span>     
                    <span className="day-number">{dayNumber}</span> 
                </div>
                <div className="day-stats">
                    <div className="stat-row">
                        <span className="stat-icon">✅</span>      
                        <span className="stat-value">{stats.tasks}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-icon">⏳</span>     
                        <span className="stat-value">{formatTime(stats.timeSec)}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`horizontal-calendar-container glass-card ${isExpanded ? 'expanded' : ''}`}>
            <div className="calendar-header-main">
                <h3 className="calendar-title">AI Productivity Tracker</h3>
                <button 
                    className="view-toggle-btn" 
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? 'Show Weekly' : 'Show Monthly'}
                </button>
            </div>

            {!isExpanded ? (
                <div className="calendar-days-row">
                    {weeklyDays.map(date => renderDayBox(date, true))}
                </div>
            ) : (
                <div className="monthly-view-container">
                    <div className="month-navigation">
                        <button onClick={() => changeMonth(-1)} className="nav-btn">←</button>
                        <h4 className="current-month-display" onClick={goToToday} style={{cursor: "pointer"}} title="Go to Today">{monthName} {year}</h4>
                        <button onClick={() => changeMonth(1)} className="nav-btn">→</button>
                    </div>
                    <div className="calendar-month-grid">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="grid-weekday-header">{day}</div>
                        ))}
                        {monthlyDays.map(({ date, currentMonth }) => renderDayBox(date, false, currentMonth))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HorizontalCalendar;
