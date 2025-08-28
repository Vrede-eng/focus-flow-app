import React from 'react';

interface ProgressBarProps {
    progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));

    return (
        <div className="w-full rounded-full h-2.5" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <div
                className="h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${clampedProgress}%`, backgroundColor: 'var(--color-accent-primary)' }}
            ></div>
        </div>
    );
};

export default ProgressBar;