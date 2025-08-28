
import React from 'react';
import { StudySession } from '../../types';

interface CalendarHeatmapProps {
    studyLog: StudySession[];
    timezone: string;
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ studyLog, timezone }) => {
    const studyData = React.useMemo(() => {
        const map = new Map<string, number>();
        studyLog.forEach(log => {
            map.set(log.date, (map.get(log.date) || 0) + log.hours);
        });
        return map;
    }, [studyLog]);

    const { days, monthLabels } = React.useMemo(() => {
        const days: { date: Date; dateStr: string; hours: number }[] = [];
        const monthLabels = new Map<number, { label: string; index: number }>();
        const today = new Date();
        const endDate = new Date(today.toLocaleString('en-US', { timeZone: timezone }));
        // Start from 14 weeks ago from Sunday
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - (14 * 7) - startDate.getDay());

        let currentMonth = -1;
        let dayCounter = 0;

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
            const hours = studyData.get(dateStr) || 0;
            days.push({ date: new Date(d), dateStr, hours });
            
            const month = d.getMonth();
            if (month !== currentMonth) {
                currentMonth = month;
                 // Add month label if it's not the very first column
                if (dayCounter > 6) {
                    monthLabels.set(dayCounter, {
                        label: d.toLocaleDateString(undefined, { month: 'short' }),
                        index: dayCounter,
                    });
                }
            }
            dayCounter++;
        }
        return { days, monthLabels };
    }, [studyData, timezone]);

    const maxHours = React.useMemo(() => {
        if (studyLog.length === 0) return 1;
        return Math.max(...studyData.values(), 1);
    }, [studyData, studyLog.length]);
    
    const getColor = (hours: number) => {
        if (hours === 0) return 'var(--color-bg-tertiary)';
        const intensity = Math.min(1, hours / (maxHours * 0.75)); // Scale intensity, max out at 75% of max hours
        const alpha = 0.2 + intensity * 0.8;
        return `color-mix(in srgb, var(--color-accent-primary) ${alpha * 100}%, transparent)`;
    };
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>Study Activity</h2>
            
            <div className="flex justify-between text-xs px-4" style={{color: 'var(--color-text-secondary)'}}>
                {Array.from(monthLabels.values()).map(({label, index}) => (
                    <div key={label+index} style={{minWidth: `${(index / 7) * 4}px`}}>{label}</div>
                ))}
            </div>

            <div className="grid grid-cols-15 gap-1">
                {/* Cells */}
                {days.map(({ date, dateStr, hours }) => (
                    <div key={dateStr} className="group relative aspect-square rounded-sm" style={{ backgroundColor: getColor(hours) }}>
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white rounded-md shadow-lg z-10" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                            {hours > 0 ? `${hours.toFixed(1)} hours` : 'No activity'} on {dateStr}
                        </div>
                    </div>
                ))}
            </div>
             <div className="grid grid-cols-15 mt-2">
                 {weekDays.map((day, i) => (
                    <div key={day} className={`col-start-${i*2+2} text-xs`} style={{color: 'var(--color-text-secondary)'}}>{day}</div>
                 ))}
             </div>
             <style>{`
                .grid-cols-15 {
                    display: grid;
                    grid-template-columns: repeat(15, minmax(0, 1fr));
                }
                .col-start-1 { grid-column-start: 1; }
                .col-start-2 { grid-column-start: 2; }
                .col-start-3 { grid-column-start: 3; }
                .col-start-4 { grid-column-start: 4; }
                .col-start-5 { grid-column-start: 5; }
                .col-start-6 { grid-column-start: 6; }
                .col-start-7 { grid-column-start: 7; }
                .col-start-8 { grid-column-start: 8; }
                .col-start-9 { grid-column-start: 9; }
                .col-start-10 { grid-column-start: 10; }
                .col-start-11 { grid-column-start: 11; }
                .col-start-12 { grid-column-start: 12; }
                .col-start-13 { grid-column-start: 13; }
                .col-start-14 { grid-column-start: 14; }
                .col-start-15 { grid-column-start: 15; }
             `}</style>
        </div>
    );
};

export default CalendarHeatmap;