
import React, { useState } from 'react';
import { User, Clan } from '../../types';
import { determineTitle, getPrestigeConfig } from '../../lib/levels';
import Avatar from '../common/Avatar';
import FireIcon from '../common/icons/FireIcon';
import LevelIcon from '../common/icons/LevelIcon';
import CalendarIcon from '../common/icons/CalendarIcon';
import PrestigeIcon from '../common/icons/PrestigeIcon';
import { FONTS } from '../../lib/fonts';
import AchievementsList from '../settings/AchievementsList';
import { ACHIEVEMENTS_LIST } from '../../lib/achievements';
import ClanBanner from '../friends/ClanBanner';

interface ProfilePageProps {
    userToView: User;
    currentUser: User;
    allUsers: User[];
    allClans: Clan[];
    onBack: () => void;
    onViewProfile: (username: string) => void;
    onStartChat: (userToChat: User) => void;
    onSendRequest: (toUsername: string) => void;
    onInviteToClan: (username: string) => string | null;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userToView, currentUser, allUsers, allClans, onBack, onViewProfile, onStartChat, onSendRequest, onInviteToClan }) => {
    const [requestJustSent, setRequestJustSent] = useState(false);
    const isOwnProfile = currentUser.name === userToView.name;
    const isFriend = currentUser.friends.includes(userToView.name);
    // FIX: Changed isPrivate to is_private
    const canViewFullProfile = isOwnProfile || isFriend || !userToView.is_private;
    
    // FIX: Changed friendRequests to friend_requests
    const hasRequestAlready = userToView.friend_requests?.some(req => req.from === currentUser.name);
    const requestSent = hasRequestAlready || requestJustSent;
    // FIX: Changed friendRequests to friend_requests
    const requestReceived = currentUser.friend_requests?.some(req => req.from === userToView.name);

    const friendsWithDetails = userToView.friends
        .map(friendName => allUsers.find(u => u.name === friendName))
        .filter((u): u is User => u !== undefined);

    // FIX: Changed clanId to clan_id
    const userClan = allClans.find(c => c.id === userToView.clan_id);
    // FIX: Changed clanId to clan_id
    const currentUserClan = allClans.find(c => c.id === currentUser.clan_id);
    const isLeader = currentUserClan?.leader === currentUser.name;

    // FIX: Changed clanInvites to clan_invites
    const alreadyInvited = userToView.clan_invites?.some(inv => inv.clanId === currentUserClan?.id);
    const [inviteSent, setInviteSent] = useState(alreadyInvited);

    const handleInvite = () => {
        const result = onInviteToClan(userToView.name);
        if (result === null) {
            setInviteSent(true);
        } else {
            alert(result); // Show error messages like "User already in a clan."
        }
    };

    // FIX: Changed equippedTitle to equipped_title
    const displayedTitle = userToView.equipped_title || userToView.title || determineTitle(userToView.level, userToView.prestige);
    
    // FIX: Changed createdAt to created_at
    const joinDate = userToView.created_at 
        ? new Date(userToView.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
        : 'N/A';
        
    const prestigeInfo = getPrestigeConfig(userToView.prestige);

    // FIX: Changed usernameColor to username_color
    const isGold = userToView.username_color === '#FFD700';
    const usernameStyle: React.CSSProperties = {
        // FIX: Changed equippedFont to equipped_font
        fontFamily: userToView.equipped_font ? FONTS[userToView.equipped_font]?.family : 'inherit',
    };
    if (!isGold) {
        // FIX: Changed usernameColor to username_color
        usernameStyle.color = userToView.username_color || 'var(--color-text-primary)';
    }

    const profileContainerStyle: React.CSSProperties = {
        backgroundColor: 'var(--color-bg-primary)',
    };
    // FIX: Changed profileTheme to profile_theme
    if (userToView.profile_theme?.bg) {
        if(userToView.profile_theme.bg.startsWith('data:image')) {
            profileContainerStyle.backgroundImage = `url(${userToView.profile_theme.bg})`;
            profileContainerStyle.backgroundSize = 'cover';
            profileContainerStyle.backgroundPosition = 'center';
        } else {
            profileContainerStyle.backgroundColor = userToView.profile_theme.bg;
        }
    }


    return (
        <div className="h-full flex flex-col" style={profileContainerStyle}>
            <header className="flex-shrink-0 flex items-center p-4 z-10 sticky top-0 border-b" style={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-bg-primary) 80%, transparent)',
                borderColor: 'var(--color-bg-tertiary)'
            }}>
                <button onClick={onBack} className="p-2 -ml-2 mr-2 rounded-full hover:opacity-80">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{color: 'var(--color-accent-primary)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{userToView.name}'s Profile</h1>
            </header>

            <main className="flex-grow overflow-y-auto p-6 space-y-6">
                 <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)' }}>
                    {/* FIX: Changed camelCase props to snake_case */}
                    <Avatar profilePic={userToView.profile_pic} equippedFrame={userToView.equipped_frame} equippedHat={userToView.equipped_hat} equippedPet={userToView.equipped_pet} customPetUrl={userToView.custom_pet_url} className="h-24 w-24 border-4" style={{borderColor: 'var(--color-bg-secondary)'}} />
                    <div>
                        <h2 className={`text-2xl font-bold ${isGold ? 'gold-username' : ''}`} style={usernameStyle}>{userToView.name}</h2>
                        {userClan && <p className="font-semibold text-sm" style={{color: 'var(--color-text-secondary)'}}>Clan: {userClan.name}</p>}
                        <p className="font-semibold" style={{color: 'var(--color-accent-primary)'}}>{displayedTitle}</p>
                    </div>
                    {userToView.status && (
                        <p className="text-sm italic break-words" style={{ color: 'var(--color-text-secondary)' }}>"{userToView.status}"</p>
                    )}
                     {!isOwnProfile && isFriend && (
                        <button 
                            onClick={() => onStartChat(userToView)}
                            style={{ background: 'var(--gradient-accent)' }}
                            className="w-full max-w-xs text-white font-bold py-2 px-4 rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-300"
                        >
                            Send Message
                        </button>
                    )}
                    {!isOwnProfile && !isFriend && (
                        <div className="w-full max-w-xs mt-2">
                        {requestSent ? (
                             <button disabled style={{ background: 'var(--color-bg-tertiary)' }} className="w-full text-white font-bold py-2 px-4 rounded-xl opacity-70 cursor-not-allowed">Request Sent</button>
                        ) : requestReceived ? (
                             <button disabled style={{ background: 'var(--color-bg-tertiary)' }} className="w-full text-white font-bold py-2 px-4 rounded-xl opacity-70 cursor-not-allowed">Check Friend Requests</button>
                        ) : (
                            <button onClick={() => { onSendRequest(userToView.name); setRequestJustSent(true); }} style={{ background: 'var(--gradient-accent)' }} className="w-full text-white font-bold py-2 px-4 rounded-xl hover:opacity-90">Add Friend</button>
                        )}
                        </div>
                    )}
                    {/* FIX: Changed clanId to clan_id */}
                    {!isOwnProfile && isLeader && !userToView.clan_id && (
                        <button 
                            onClick={handleInvite} 
                            disabled={inviteSent}
                            className="w-full max-w-xs font-bold py-2 px-4 rounded-xl hover:opacity-80 mt-2 disabled:opacity-60 disabled:cursor-not-allowed" 
                            style={{
                                backgroundColor: 'var(--color-bg-tertiary)',
                                color: inviteSent ? 'var(--color-text-secondary)' : 'var(--color-text-primary)'
                            }}
                        >
                            {inviteSent ? 'Invite Sent' : 'Invite to Clan'}
                        </button>
                    )}
                </div>

                {canViewFullProfile ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-4 rounded-xl flex flex-col items-center justify-center space-y-1 backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)' }}>
                                <div className="bg-orange-500/20 p-2 rounded-full"><FireIcon /></div>
                                <p className="font-bold text-lg">{userToView.streak}</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Streak</p>
                            </div>
                            <div className="p-4 rounded-xl flex flex-col items-center justify-center space-y-1 backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)' }}>
                                <div className="p-2 rounded-full" style={{backgroundColor: 'color-mix(in srgb, var(--color-accent-primary) 20%, transparent)'}}><LevelIcon /></div>
                                <p className="font-bold text-lg">{userToView.level}</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Level</p>
                            </div>
                             <div className="p-4 rounded-xl flex flex-col items-center justify-center space-y-1 backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)' }}>
                                <div className="p-2 rounded-full" style={{backgroundColor: 'color-mix(in srgb, var(--color-accent-primary) 20%, transparent)'}}><PrestigeIcon /></div>
                                <p className="font-bold text-lg">{userToView.prestige || 0}</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Prestige</p>
                            </div>
                            <div className="p-4 rounded-xl flex flex-col items-center justify-center space-y-1 backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)' }}>
                                <div className="p-2 rounded-full" style={{backgroundColor: 'color-mix(in srgb, var(--color-accent-primary) 20%, transparent)'}}><CalendarIcon /></div>
                                <p className="font-bold text-lg">{joinDate}</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Joined</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)' }}>
                            <h3 className="font-bold text-lg mb-4">Friends ({friendsWithDetails.length})</h3>
                            {friendsWithDetails.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {friendsWithDetails.slice(0, 8).map(friend => (
                                        <button key={friend.name} onClick={() => onViewProfile(friend.name)} className="flex flex-col items-center text-center space-y-2 hover:opacity-80 transition-opacity">
                                            {/* FIX: Changed camelCase props to snake_case */}
                                            <Avatar profilePic={friend.profile_pic} equippedFrame={friend.equipped_frame} className="h-16 w-16" />
                                            <p className="text-sm font-semibold truncate w-full">{friend.name}</p>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-secondary)' }}>{userToView.name} has no friends yet.</p>
                            )}
                        </div>
                        
                        <div className="p-4 rounded-xl backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)' }}>
                             <h3 className="font-bold text-lg mb-4">Achievements</h3>
                             <AchievementsList allAchievements={ACHIEVEMENTS_LIST} userAchievements={userToView.achievements || []} />
                        </div>

                    </>
                ) : (
                    <div className="text-center p-8 rounded-xl backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)' }}>
                        <h3 className="font-bold text-lg">This profile is private</h3>
                        <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>Add {userToView.name} as a friend to view their full profile and stats.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProfilePage;
