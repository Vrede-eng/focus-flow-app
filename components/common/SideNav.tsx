
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
    
    // FIX: Changed usernameColor to username_color
    const isGold = currentUser.username_color === '#FFD700';
    const usernameStyle: React.CSSProperties = {
        // FIX: Changed equippedFont to equipped_font
        fontFamily: currentUser.equipped_font ? FONTS[currentUser.equipped_font]?.family : 'inherit',
    };
     if (!isGold) {
        // FIX: Changed usernameColor to username_color
        usernameStyle.color = currentUser.username_color || 'var(--color-text-primary)';
    }
    
    const navItems = [
        { tab: Tab.Home, icon: <HomeIcon isActive={activeTab === Tab.Home} />, label: 'Home' },
        { tab: Tab.Friends, icon: <FriendsIcon isActive={activeTab === Tab.Friends} />, label: 'Friends', notification: hasNotifications },
        { tab: Tab.Challenges, icon: <TrophyIcon isActive={activeTab === Tab.Challenges} />, label: 'Challenges' },
        { tab: Tab.AIAssistant, icon: <AIAssistantIcon isActive={activeTab === Tab.AIAssistant} />, label: 'AI Assistant' },
        { tab: Tab.Leaderboards, icon: <LeaderboardIcon isActive={activeTab === Tab.Leaderboards} />, label: 'Leaderboards' },
        { tab: Tab.Shop, icon: <ShopIcon isActive={activeTab === Tab.Shop} />, label: 'Shop' },
        { tab: Tab.Settings, icon: <SettingsIcon isActive={activeTab === Tab.Settings} />, label: 'Settings' },
    ];

    if (currentUser.isAdmin) {
        navItems.push({ tab: Tab.Admin, icon: <AdminIcon isActive={activeTab === Tab.Admin} />, label: 'Admin' });
    }

    return (
        <aside className="w-64 flex-shrink-0 flex-col p-4 border-r h-full hidden md:flex" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-bg-tertiary)' }}>
            <div className="flex-1 flex flex-col space-y-8">
                <button onClick={onViewProfile} className="flex items-center space-x-3 text-left hover:opacity-80 transition-opacity">
                    {/* FIX: Changed camelCase props to snake_case */}
                    <Avatar profilePic={currentUser.profile_pic} equippedFrame={currentUser.equipped_frame} equippedHat={currentUser.equipped_hat} equippedPet={currentUser.equipped_pet} customPetUrl={currentUser.custom_pet_url} className="h-12 w-12" />
                    <div>
                        <h2 className={`font-bold text-lg truncate ${isGold ? 'gold-username' : ''}`} style={usernameStyle}>{currentUser.name}</h2>
                        {/* FIX: Changed equippedTitle to equipped_title */}
                        <p className="text-xs truncate" style={{color: 'var(--color-accent-primary)'}}>{currentUser.equipped_title || currentUser.title}</p>
                    </div>
                </button>
                <nav className="space-y-2">
                    {navItems.map(item => (
                        <SideNavItem
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
            <div className="flex-shrink-0">
                <button onClick={onLogout} className="flex items-center w-full space-x-4 p-3 rounded-lg transition-colors hover:bg-white/10 text-left">
                    <LogoutIcon />
                    <span className="font-semibold">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default SideNav;
