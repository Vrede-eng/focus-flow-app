
import React, { useMemo } from 'react';

interface BarChartProps {
    title: string;
    data: { label: string; value: number }[];
    unit: string;
}

const BarChart: React.FC<BarChartProps> = ({ title, data, unit }) => {
    
    const maxValue = useMemo(() => {
        if (data.length === 0) return 1;
        const max = Math.max(...data.map(d => d.value));
        return max === 0 ? 10 : max * 1.1; // Add 10% padding or default to 10 if all values are 0
    }, [data]);

    return (
        <div className="p-6 rounded-2xl shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
            <div className="flex justify-between items-end h-64 pt-4 space-x-1" role="figure" aria-label={`${title} chart`}>
                {data.map((dataPoint, index) => (
                    <div key={index} className="group relative flex flex-col items-center h-full w-full justify-end">
                        <div className="hidden group-hover:block absolute bottom-full mb-1 px-2 py-1 text-xs text-white rounded-md shadow-lg z-10" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                            {dataPoint.value.toLocaleString()} {unit}
                        </div>
                        <div 
                            className="w-full rounded-t-sm" 
                            style={{ 
                                height: `${(dataPoint.value / maxValue) * 100}%`, 
                                background: 'var(--gradient-accent)',
                                transition: 'height 0.5s ease-out'
                            }}
                            aria-label={`${dataPoint.label}: ${dataPoint.value.toLocaleString()} ${unit}`}
                        ></div>
                        <div className="text-xs mt-1 text-center" style={{ color: 'var(--color-text-secondary)' }}>{dataPoint.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BarChart;
