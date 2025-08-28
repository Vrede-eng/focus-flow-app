
import React from 'react';
import { User, Clan } from '../../types';
import BarChart from './BarChart';

interface AdminAnalyticsProps {
    allUsers: User[];
    allClans: Clan[];
    dauData: { label: string, value: number }[];
    mauData: { label: string, value: number }[];
    newUsersData: { label: string, value: number }[];
}

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="p-4 rounded-xl flex items-center space-x-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="p-3 rounded-full" style={{backgroundColor: 'color-mix(in srgb, var(--color-accent-primary) 20%, transparent)', color: 'var(--color-accent-primary)'}}>
            {icon}
        </div>
        <div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
        </div>
    </div>
);


const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ allUsers, allClans, dauData, mauData, newUsersData }) => {
    
    const nonAdminUsers = allUsers.filter(u => !u.isAdmin);
    const totalUsers = nonAdminUsers.length;
    const totalClans = allClans.length;
    const totalXp = nonAdminUsers.reduce((sum, u) => sum + u.xp, 0);
    const averageLevel = totalUsers > 0 ? nonAdminUsers.reduce((sum, u) => sum + u.level, 0) / totalUsers : 0;
    
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={totalUsers.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                <StatCard title="Total Clans" value={totalClans.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <StatCard title="Total XP Logged" value={totalXp.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
                <StatCard title="Average Level" value={averageLevel.toFixed(1)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BarChart title="Daily Active Users (Last 30 Days)" data={dauData} unit="Users" />
                <BarChart title="New Users (Last 30 Days)" data={newUsersData} unit="Users" />
            </div>

             <div className="grid grid-cols-1 gap-8">
                <BarChart title="Monthly Active Users (Last 12 Months)" data={mauData} unit="Users" />
            </div>
        </div>
    );
};

export default AdminAnalytics;
