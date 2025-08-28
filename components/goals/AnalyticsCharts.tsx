import React from 'react';
import { StudySession } from '../../types';

interface AnalyticsChartsProps {
    studyLog: StudySession[];
    timezone: string;
}

const CumulativeHoursChart: React.FC<{ studyLog: StudySession[] }> = ({ studyLog }) => {
    const data = React.useMemo(() => {
        if (studyLog.length === 0) {
            const today = new Date();
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            // Create a flat line at 0 for the chart
            return [
                { date: weekAgo, hours: 0 },
                { date: today, hours: 0 }
            ];
        }

        const sortedLog = [...studyLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let cumulativeHours = 0;
        const cumulativeData = sortedLog.map(log => {
            cumulativeHours += log.hours;
            return { date: new Date(log.date), hours: cumulativeHours };
        });

        // Add a zero point at the beginning if the log doesn't start from zero
        if (cumulativeData.length > 0) {
            const firstDate = cumulativeData[0].date;
            const dayBefore = new Date(firstDate);
            dayBefore.setDate(firstDate.getDate() - 1);
            return [{ date: dayBefore, hours: 0 }, ...cumulativeData];
        }

        return cumulativeData;
    }, [studyLog]);
    
    const maxHours = data.length > 0 ? data[data.length - 1].hours : 0;
    const displayMax = maxHours > 0 ? maxHours : 1; // Avoid division by zero
    const minDate = data[0].date.getTime();
    const maxDate = data[data.length - 1].date.getTime();
    const dateRange = maxDate - minDate || 1; // Avoid division by zero

    const points = data.map(d => {
        const x = ((d.date.getTime() - minDate) / dateRange) * 100;
        const y = 100 - (d.hours / displayMax) * 90 - 5; // 5% padding top/bottom
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>Cumulative Hours Studied</h2>
            <div className="relative h-48">
                 <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                        fill="none"
                        stroke="var(--color-accent-primary)"
                        strokeWidth="2"
                        points={points}
                        style={{ transition: 'all 0.5s ease-out' }}
                    />
                </svg>
                 <div className="absolute top-0 left-0 text-xs" style={{color: 'var(--color-text-secondary)'}}>{displayMax.toFixed(0)}h</div>
                 <div className="absolute bottom-0 left-0 text-xs" style={{color: 'var(--color-text-secondary)'}}>0h</div>
                 <div className="absolute bottom-0 left-0 text-xs" style={{color: 'var(--color-text-secondary)'}}>{data[0].date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
                 <div className="absolute bottom-0 right-0 text-xs" style={{color: 'var(--color-text-secondary)'}}>{data[data.length - 1].date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
            </div>
        </div>
    );
};

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ studyLog, timezone }) => {
    return (
        <div className="space-y-8">
            <CumulativeHoursChart studyLog={studyLog} />
        </div>
    );
};

export default AnalyticsCharts;