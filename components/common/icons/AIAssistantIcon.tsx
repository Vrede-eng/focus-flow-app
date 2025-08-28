
import React from 'react';

const AIAssistantIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m11-1a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 100-4 2 2 0 000 4z" />
        {isActive && <circle cx="12" cy="19" r="2" fill="currentColor" />}
    </svg>
);

export default AIAssistantIcon;