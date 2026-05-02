import React, { useMemo } from 'react';
import './HorizontalCalendar.css';

const HorizontalCalendar = ({ summaries }) => {
    // Generate an array of 7 days: 5 past, 1 today, 1 future
    const days = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        
        const daysArray = [];
        for (let i = -5; i <= 1; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            daysArray.push(date);
        }
        return daysArray;
    }, []);

    // Aggregate productivity data by date string (YYYY-MM-DD)
    const productivityByDate = useMemo(() => {
        const data = {};
        summaries.forEach(summary => {
            if (!summary.createdAt) return;
            const dateObj = new Date(summary.createdAt);
            // Use local date string to avoid timezone shifts (YYYY-MM-DD)
            const dateStr = dateObj.toLocaleDateString('en-CA');
            
            if (!data[dateStr]) {
                data[dateStr] = { tasks: 0, timeSec: 0 };
            }
            
            // Use totalTasks and totalTimeSeconds fields
            data[dateStr].tasks += summary.totalTasks || 0;
            data[dateStr].timeSec += summary.totalTimeSeconds || 0;
        });
        return data;
    }, [summaries]);

    const todayStr = new Date().toLocaleDateString('en-CA');

    const formatTime = (totalSeconds) => {
        if (totalSeconds === 0) return '0s';
        if (totalSeconds < 60) return `${totalSeconds.toFixed(0)}s`;
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        if (secs === 0) return `${mins}m`;
        return `${mins}m ${secs.toFixed(0)}s`;
    };

    return (
        <div className="horizontal-calendar-container glass-card">
            <h3 className="calendar-title">AI Productivity Tracker</h3>
            <div className="calendar-days-row">
                {days.map((date, index) => {
                    const dateStr = date.toLocaleDateString('en-CA');
                    const isToday = dateStr === todayStr;
                    const isFuture = date > new Date() && !isToday;
                    const stats = productivityByDate[dateStr] || { tasks: 0, timeSec: 0 };
                    
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNumber = date.getDate();
                    
                    let dayClass = 'calendar-day-box';
                    if (isToday) dayClass += ' is-today';
                    if (isFuture) dayClass += ' is-future';
                    if (!isFuture && stats.tasks > 0) dayClass += ' has-activity';

                    return (
                        <div key={dateStr} className={dayClass}>
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
                                    <span className="stat-icon">⏱️</span>
                                    <span className="stat-value">{formatTime(stats.timeSec)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HorizontalCalendar;
