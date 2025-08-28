


import React from 'react';
import { Tab } from '../../constants';
import { User } from '../../types';
import HomeIcon from './icons/HomeIcon';
import LeaderboardIcon from './icons/LeaderboardIcon';
import FriendsIcon from './icons/FriendsIcon';
import SettingsIcon from './icons/SettingsIcon';
import AIAssistantIcon from './icons/AIAssistantIcon';
import AdminIcon from './icons/AdminIcon';
import Avatar from './Avatar';
import LogoutIcon from './icons/LogoutIcon';
import TrophyIcon from './icons/TrophyIcon';
import ShopIcon from './icons/ShopIcon';
import { FONTS } from '../../lib/fonts';

interface SideNavProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    currentUser: User;
    hasNotifications?: boolean;
    onLogout: () => void;
    onViewProfile: () => void;
}

const SideNavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    hasNotification?: boolean;
}> = ({ icon, label, isActive, onClick, hasNotification }) => {
    return (
        <button
            onClick={onClick}
            className={`relative flex items-center w-full space-x-4 p-3 rounded-lg transition-colors hover:bg-white/10`}
            style={{
                color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                backgroundColor: isActive ? 'color-mix(in srgb, var(--color-accent-primary) 20%, transparent)' : 'transparent',
            }}
            aria-current={isActive ? 'page' : undefined}
        >
            {icon}
            <span className={`font-semibold`}>{label}</span>
            {hasNotification && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2" style={{ borderColor: 'var(--color-bg-secondary)' }}></span>
            )}
        </button>
    );
};

const SideNav: React.FC<SideNavProps> = ({ activeTab, setActiveTab, currentUser, hasNotifications, onLogout, onViewProfile }) => {
    
    const isGold = currentUser.usernameColor === '#FFD700';
    const usernameStyle: React.CSSProperties = {
        fontFamily: currentUser.equippedFont ? FONTS[currentUser.equippedFont]?.family : 'inherit',
    };
     if (!isGold) {
        usernameStyle.color = currentUser.usernameColor || 'var(--color-text-primary)';
    }

    return (
        <aside className="w-64 flex-shrink-0 flex-col p-4 border-r h-full hidden md:flex" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-bg-tertiary)' }}>
            <div className="text-2xl font-bold mb-8 pl-2" style={{ color: 'var(--color-text-primary)' }}>FocusFlow</div>

            <nav className="flex-grow space-y-1">
                <SideNavItem icon={<HomeIcon isActive={activeTab === Tab.Home}/>} label="Home" isActive={activeTab === Tab.Home} onClick={() => setActiveTab(Tab.Home)} />
                <SideNavItem icon={<FriendsIcon isActive={activeTab === Tab.Friends}/>} label="Friends" isActive={activeTab === Tab.Friends} onClick={() => setActiveTab(Tab.Friends)} hasNotification={hasNotifications} />
                <SideNavItem icon={<TrophyIcon isActive={activeTab === Tab.Challenges}/>} label="Challenges" isActive={activeTab === Tab.Challenges} onClick={() => setActiveTab(Tab.Challenges)} />
                <SideNavItem icon={<AIAssistantIcon isActive={activeTab === Tab.AIAssistant}/>} label="AI Assistant" isActive={activeTab === Tab.AIAssistant} onClick={() => setActiveTab(Tab.AIAssistant)} />
                <SideNavItem icon={<LeaderboardIcon isActive={activeTab === Tab.Leaderboards}/>} label="Leaders" isActive={activeTab === Tab.Leaderboards} onClick={() => setActiveTab(Tab.Leaderboards)} />
                <SideNavItem icon={<ShopIcon isActive={activeTab === Tab.Shop}/>} label="Shop" isActive={activeTab === Tab.Shop} onClick={() => setActiveTab(Tab.Shop)} />
                <SideNavItem icon={<SettingsIcon isActive={activeTab === Tab.Settings}/>} label="Settings" isActive={activeTab === Tab.Settings} onClick={() => setActiveTab(Tab.Settings)} />
                {currentUser.isAdmin && (
                    <SideNavItem icon={<AdminIcon isActive={activeTab === Tab.Admin} />} label="Admin" isActive={activeTab === Tab.Admin} onClick={() => setActiveTab(Tab.Admin)} />
                )}
            </nav>

            <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--color-bg-tertiary)' }}>
                 <button onClick={onViewProfile} className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-white/10 transition-colors text-left">
                    <Avatar profilePic={currentUser.profilePic} equippedFrame={currentUser.equippedFrame} equippedHat={currentUser.equippedHat} equippedPet={currentUser.equippedPet} customPetUrl={currentUser.customPetUrl} className="h-10 w-10" />
                    <div className="truncate">
                        <p className={`font-semibold text-sm truncate ${isGold ? 'gold-username' : ''}`} style={usernameStyle}>{currentUser.name}</p>
                        <p className="text-xs truncate" style={{color: 'var(--color-text-secondary)'}}>View Profile</p>
                    </div>
                </button>
                <button onClick={onLogout} className="flex items-center space-x-4 w-full p-3 rounded-lg hover:bg-white/10 transition-colors text-left mt-2">
                    <LogoutIcon />
                    <span className="font-semibold" style={{color: 'var(--color-text-primary)'}}>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default SideNav;