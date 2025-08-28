
import React from 'react';

const AICoachIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h6l2-2h2l-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11h6" />
        {isActive && <circle cx="12" cy="19" r="2" fill="currentColor" />}
    </svg>
);

export default AICoachIcon;
