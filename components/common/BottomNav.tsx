
import React from 'react';
import { Tab } from '../../constants';
import HomeIcon from './icons/HomeIcon';
import FriendsIcon from './icons/FriendsIcon';
import SettingsIcon from './icons/SettingsIcon';
import AIAssistantIcon from './icons/AIAssistantIcon';
import LeaderboardIcon from './icons/LeaderboardIcon';
import ShopIcon from './icons/ShopIcon';
import TrophyIcon from './icons/TrophyIcon';
import AdminIcon from './icons/AdminIcon';
import { User } from '../../types';

interface BottomNavProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    currentUser: User;
    hasNotifications?: boolean;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    hasNotification?: boolean;
}> = ({ icon, label, isActive, onClick, hasNotification }) => {
    return (
        <button 
            onClick={onClick} 
            className={`relative flex flex-col items-center justify-center flex-shrink-0 h-full w-20 space-y-1 transition-colors hover:opacity-80`}
            style={{ color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)'}}
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
        >
            {icon}
            <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>{label}</span>
            {hasNotification && (
                <span className="absolute top-1 right-[calc(50%-1.25rem)] h-2.5 w-2.5 bg-red-500 rounded-full border-2" style={{borderColor: 'var(--color-bg-primary)'}}></span>
            )}
        </button>
    );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, currentUser, hasNotifications }) => {
    const navItems = [
        { tab: Tab.Home, icon: <HomeIcon isActive={activeTab === Tab.Home} />, label: 'Home' },
        { tab: Tab.Friends, icon: <FriendsIcon isActive={activeTab === Tab.Friends} />, label: 'Friends', notification: hasNotifications },
        { tab: Tab.Challenges, icon: <TrophyIcon isActive={activeTab === Tab.Challenges} />, label: 'Challenges' },
        { tab: Tab.AIAssistant, icon: <AIAssistantIcon isActive={activeTab === Tab.AIAssistant} />, label: 'Assistant' },
        { tab: Tab.Leaderboards, icon: <LeaderboardIcon isActive={activeTab === Tab.Leaderboards} />, label: 'Leaders' },
        { tab: Tab.Shop, icon: <ShopIcon isActive={activeTab === Tab.Shop} />, label: 'Shop' },
        { tab: Tab.Settings, icon: <SettingsIcon isActive={activeTab === Tab.Settings} />, label: 'Settings' },
    ];

    if (currentUser.isAdmin) {
        navItems.push({ tab: Tab.Admin, icon: <AdminIcon isActive={activeTab === Tab.Admin} />, label: 'Admin' });
    }

    return (
        <div className="border-t overflow-x-auto" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-bg-tertiary)'}}>
            <nav className="flex justify-start items-center h-16 min-w-max">
                {navItems.map(item => (
                    <NavItem 
                        key={item.tab}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeTab === item.tab}
                        onClick={() => setActiveTab(item.tab)}
                        hasNotification={item.notification}
                    />
                ))}
            </nav>
        </div>
    );
};

export default BottomNav;