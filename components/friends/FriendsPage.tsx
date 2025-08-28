import React, { useState, useRef } from 'react';
import { User, Clan, ClanInvite } from '../../types';
import Avatar from '../common/Avatar';
import ChatIcon from '../common/icons/ChatIcon';
import { FONTS } from '../../lib/fonts';
import ConfirmationModal from '../common/ConfirmationModal';
import ClanBanner, { PREDEFINED_BANNERS } from './ClanBanner';
import ProgressBar from '../common/ProgressBar';
import { cxpForClanLevelUp, totalCxpToReachClanLevel } from '../../lib/clans';
import ClanPerksModal from './ClanPerksModal';

interface FriendsPageProps {
    currentUser: User;
    allUsers: User[];
    allClans: Clan[];
    unreadClanMessages: boolean;
    onSendRequest: (toUsername: string) => void;
    onRespondRequest: (fromUsername: string, accept: boolean) => void;
    onViewProfile: (username: string) => void;
    onStartChat: (userToChat: User) => void;
    unreadSenders: Set<string>;
    // Clan Props
    onCreateClan: (name: string) => Promise<string | null>;
    onInviteToClan: (username: string) => string | null;
    onRespondToClanInvite: (invite: ClanInvite, accept: boolean) => void;
    onLeaveClan: () => void;
    onKickFromClan: (username: string, clanId: string) => void;
    onUpdateClanName: (clanId: string, newName: string) => void;
    onUpdateClanBanner: (clanId: string, banner: string) => void;
    onStartClanChat: (clan: Clan) => void;
}

const FilterButton: React.FC<{
    label: string;
    value: string;
    currentValue: string;
    setter: (value: any) => void;
    hasNotification?: boolean;
}> = ({ label, value, currentValue, setter, hasNotification }) => (
    <button
        onClick={() => setter(value)}
        className={`relative w-full text-sm font-bold py-2 rounded-lg transition ${
            currentValue !== value && 'hover:opacity-80'
        }`}
        style={{
            background: currentValue === value ? 'var(--gradient-accent)' : 'var(--color-bg-tertiary)',
            color: currentValue === value ? 'white' : 'var(--color-text-primary)'
        }}
    >
        {label}
        {hasNotification && <span className="absolute top-1 right-2 h-2 w-2 bg-red-500 rounded-full"></span>}
    </button>
);


const FriendsPage: React.FC<FriendsPageProps> = (props) => {
    const { currentUser, allUsers, allClans, unreadClanMessages, onSendRequest, onRespondRequest, onViewProfile, onStartChat, unreadSenders,
            onCreateClan, onInviteToClan, onRespondToClanInvite, onLeaveClan, onKickFromClan, onUpdateClanName, onUpdateClanBanner, onStartClanChat } = props;

    const [activeView, setActiveView] = useState<'friends' | 'clan'>('friends');
    const [searchQuery, setSearchQuery] = useState('');
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [sentClanInvites, setSentClanInvites] = useState<Set<string>>(new Set());
    
    // Clan State
    const [clanName, setClanName] = useState('');
    const [clanError, setClanError] = useState<string|null>(null);
    const [isCreatingClan, setIsCreatingClan] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showPerksModal, setShowPerksModal] = useState(false);
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; confirmText: string; confirmButtonClass: string; }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: '', confirmButtonClass: '' });
    
    const userClan = allClans.find(c => c.id === currentUser.clanId);
    
    const handleCreateClanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isCreatingClan) return;
        setIsCreatingClan(true);
        setClanError(null);
        const error = await onCreateClan(clanName);
        if (error) {
            setClanError(error);
        } else {
            setClanName('');
        }
        setIsCreatingClan(false);
    };

    const handleLeaveClanConfirm = () => {
        const message = userClan?.leader === currentUser.name
            ? `As the leader, leaving will disband the clan permanently. Are you sure?`
            : `Are you sure you want to leave ${userClan?.name}?`;
        
        setConfirmation({
            isOpen: true,
            title: 'Leave Clan',
            message: message,
            onConfirm: () => {
                onLeaveClan();
                setConfirmation({ ...confirmation, isOpen: false });
            },
            confirmText: 'Leave',
            confirmButtonClass: 'bg-red-600 hover:bg-red-700',
        });
    }

    const handleKickMemberConfirm = (username: string) => {
        setConfirmation({
            isOpen: true,
            title: `Kick ${username}`,
            message: `Are you sure you want to kick ${username} from the clan?`,
            onConfirm: () => {
                onKickFromClan(username, userClan!.id);
                setConfirmation({ ...confirmation, isOpen: false });
            },
            confirmText: 'Kick',
            confirmButtonClass: 'bg-red-600 hover:bg-red-700',
        });
    }

    const renderFriendsView = () => {
        const friendRequests = currentUser.friendRequests || [];
        const friends = currentUser.friends || [];
        const searchResults = searchQuery ? allUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) && u.name !== currentUser.name && !u.isAdmin && !friends.includes(u.name)) : [];
        const friendRequestsWithDetails = friendRequests.map(req => allUsers.find(u => u.name === req.from)).filter((u): u is User => u !== undefined);
        const friendsWithDetails = friends.map(friendName => allUsers.find(u => u.name === friendName)).filter((u): u is User => u !== undefined).sort((a, b) => {
            const aUnread = unreadSenders.has(a.name); const bUnread = unreadSenders.has(b.name);
            if (aUnread && !bUnread) return -1; if (!aUnread && bUnread) return 1;
            return a.name.localeCompare(b.name);
        });
         const getUsernameStyle = (user: User): React.CSSProperties => ({ color: user.usernameColor || 'var(--color-text-primary)', fontFamily: user.equippedFont ? FONTS[user.equippedFont]?.family : 'inherit' });

        return (
            <div className="space-y-6">
                <div className="p-4 rounded-xl space-y-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Find Friends</h2>
                    <input type="text" placeholder="Search for users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-bg-tertiary)' }}/>
                    {searchQuery && (
                        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                            {searchResults.length > 0 ? ( searchResults.map(user => {
                                    const alreadySent = user.friendRequests?.some(req => req.from === currentUser.name) || sentRequests.has(user.name);
                                    const hasRequestFromUser = friendRequests.some(req => req.from === user.name);
                                    let buttonText = 'Add'; let buttonDisabled = false;
                                    if (alreadySent) { buttonText = 'Sent'; buttonDisabled = true; } 
                                    else if (hasRequestFromUser) { buttonText = 'Check Requests'; buttonDisabled = true; }
                                    return (
                                        <div key={user.name} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                                            <div className="flex items-center space-x-3 truncate">
                                                <Avatar profilePic={user.profilePic} equippedFrame={user.equippedFrame} equippedHat={user.equippedHat} equippedPet={user.equippedPet} customPetUrl={user.customPetUrl} className="h-10 w-10" />
                                                <span className="font-semibold truncate" style={getUsernameStyle(user)}>{user.name}</span>
                                            </div>
                                            <button onClick={() => { onSendRequest(user.name); setSentRequests(prev => new Set(prev).add(user.name)); }} disabled={buttonDisabled} className="text-xs font-bold py-1 px-3 rounded-full hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: buttonDisabled ? 'var(--color-bg-tertiary)' : 'var(--gradient-accent)', color: buttonDisabled ? 'var(--color-text-secondary)' : 'white' }}>
                                                {buttonText}
                                            </button>
                                        </div>
                                    )})
                            ) : ( <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>No users found.</p> )}
                        </div>
                    )}
                </div>
                {friendRequestsWithDetails.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="font-bold text-lg flex items-center space-x-2" style={{ color: 'var(--color-text-primary)' }}>
                            <span>Friend Requests ({friendRequestsWithDetails.length})</span>
                            <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                        </h2>
                        {friendRequestsWithDetails.map(user => (
                            <div key={user.name} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                <div className="flex items-center space-x-3 truncate">
                                    <Avatar profilePic={user.profilePic} equippedFrame={user.equippedFrame} equippedHat={user.equippedHat} equippedPet={user.equippedPet} customPetUrl={user.customPetUrl} className="h-10 w-10" />
                                    <span className="font-semibold truncate" style={getUsernameStyle(user)}>{user.name}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => onRespondRequest(user.name, true)} className="p-2 rounded-full hover:opacity-80" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </button>
                                    <button onClick={() => onRespondRequest(user.name, false)} className="p-2 rounded-full hover:opacity-80" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="space-y-3">
                    <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Your Friends ({friendsWithDetails.length})</h2>
                    {friendsWithDetails.length > 0 ? ( friendsWithDetails.map(friend => (
                            <div key={friend.name} className="w-full flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                <button onClick={() => onViewProfile(friend.name)} className="flex items-center space-x-3 truncate hover:opacity-80 transition-opacity text-left">
                                    <div className="relative">
                                        <Avatar profilePic={friend.profilePic} equippedFrame={friend.equippedFrame} equippedHat={friend.equippedHat} equippedPet={friend.equippedPet} customPetUrl={friend.customPetUrl} className="h-10 w-10" />
                                        {unreadSenders.has(friend.name) && (
                                            <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2" style={{borderColor: 'var(--color-bg-secondary)'}}></span>
                                        )}
                                    </div>
                                    <span className="font-semibold truncate" style={getUsernameStyle(friend)}>{friend.name}</span>
                                </button>
                                <button onClick={() => onStartChat(friend)} className="p-2 rounded-full hover:opacity-80 transition" style={{ color: 'var(--color-accent-primary)' }}>
                                    <ChatIcon />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                            <p style={{ color: 'var(--color-text-secondary)' }}>You have no friends yet.</p>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>Use the search bar to find people!</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    const renderClanView = () => {
        if (userClan) {
            const clanMembers = allUsers.filter(u => userClan.members.includes(u.name));
            const isLeader = userClan.leader === currentUser.name;
            const cxpNeeded = cxpForClanLevelUp(userClan.level);
            const totalCxpForCurrentLevel = totalCxpToReachClanLevel(userClan.level);
            const cxpSinceLastLevelUp = userClan.cxp - totalCxpForCurrentLevel;
            const progressPercentage = Math.min(100, (cxpSinceLastLevelUp / cxpNeeded) * 100);

            return (
                <div className="space-y-6">
                     <div className="p-4 rounded-xl space-y-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <div className="flex justify-between items-start">
                             <div className="flex items-center space-x-4">
                                <ClanBanner banner={userClan.banner} className="h-16 w-16 rounded-lg flex-shrink-0" />
                                <div>
                                    <h2 className="text-2xl font-bold">{userClan.name}</h2>
                                    <p className="text-sm" style={{color: 'var(--color-text-secondary)'}}>Level {userClan.level} | Members: {userClan.members.length} / {userClan.maxMembers}</p>
                                </div>
                             </div>
                            {isLeader && <button onClick={() => setShowSettingsModal(true)} className="p-2 rounded-full hover:opacity-80"><SettingsIcon/></button>}
                        </div>
                        <div>
                            <ProgressBar progress={progressPercentage} />
                            <div className="flex justify-between text-xs font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                <span>{cxpSinceLastLevelUp.toFixed(0)} CXP</span>
                                <span>{cxpNeeded} CXP</span>
                            </div>
                        </div>

                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button onClick={() => setShowPerksModal(true)} className="w-full font-bold py-2 px-4 rounded-xl hover:opacity-80" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>Perks</button>
                            <button onClick={() => onStartClanChat(userClan)} style={{ background: 'var(--gradient-accent)' }} className="relative w-full text-white font-bold py-2 px-4 rounded-xl hover:opacity-90">
                                Clan Chat
                                {unreadClanMessages && <span className="absolute top-1 right-2 h-2 w-2 bg-white rounded-full"></span>}
                            </button>
                            <button onClick={() => setShowInviteModal(true)} disabled={userClan.members.length >= userClan.maxMembers} className="w-full font-bold py-2 px-4 rounded-xl hover:opacity-80 disabled:opacity-50" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>Invite</button>
                            <button onClick={handleLeaveClanConfirm} className="w-full text-red-400 font-bold py-2 px-4 rounded-xl hover:opacity-80" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>Leave Clan</button>
                         </div>
                     </div>
                     <div className="space-y-3">
                         <h3 className="font-bold text-lg">Members</h3>
                         {clanMembers.sort((a,b) => (b.name === userClan.leader ? 1 : 0) - (a.name === userClan.leader ? 1 : 0)).map(member => (
                             <div key={member.name} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                 <button onClick={() => onViewProfile(member.name)} className="flex items-center space-x-3 truncate hover:opacity-80">
                                     <Avatar profilePic={member.profilePic} equippedFrame={member.equippedFrame} equippedHat={member.equippedHat} equippedPet={member.equippedPet} customPetUrl={member.customPetUrl} className="h-10 w-10"/>
                                     <div>
                                         <p className="font-semibold truncate">{member.name}</p>
                                         <p className="text-xs text-left" style={{color: 'var(--color-text-secondary)'}}>{userClan.leader === member.name ? 'Leader' : 'Member'}</p>
                                     </div>
                                 </button>
                                 {isLeader && member.name !== currentUser.name && (
                                     <button onClick={() => handleKickMemberConfirm(member.name)} className="text-xs text-red-400 font-bold py-1 px-3 rounded-full hover:bg-red-500/20">Kick</button>
                                 )}
                             </div>
                         ))}
                     </div>
                </div>
            )
        }
        // Not in a clan view
        return (
            <div className="space-y-6">
                <div className="p-4 rounded-xl space-y-4 text-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                     <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Join or Create a Clan</h2>
                     <p className="text-sm" style={{color: 'var(--color-text-secondary)'}}>Team up with friends, compete on leaderboards, and chat together!</p>
                     <form onSubmit={handleCreateClanSubmit} className="flex flex-col space-y-3">
                        <input type="text" value={clanName} onChange={e => setClanName(e.target.value)} placeholder="Enter Clan Name" required minLength={3} maxLength={20} className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-bg-tertiary)' }}/>
                        {clanError && <p className="text-red-500 text-xs">{clanError}</p>}
                        <button type="submit" disabled={isCreatingClan} style={{ background: 'var(--gradient-accent)' }} className="w-full text-white font-bold py-2 px-4 rounded-xl hover:opacity-90 disabled:opacity-50">
                            {isCreatingClan ? 'Creating...' : 'Create Clan'}
                        </button>
                     </form>
                </div>
                {(currentUser.clanInvites?.length || 0) > 0 && (
                    <div className="space-y-3">
                        <h2 className="font-bold text-lg">Clan Invites ({currentUser.clanInvites?.length})</h2>
                        {currentUser.clanInvites?.map(invite => (
                             <div key={invite.clanId} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                 <div>
                                     <p className="font-semibold">{invite.clanName}</p>
                                     <p className="text-xs" style={{color: 'var(--color-text-secondary)'}}>Invited by {invite.from}</p>
                                 </div>
                                 <div className="flex space-x-2">
                                     <button onClick={() => onRespondToClanInvite(invite, true)} className="p-2 rounded-full hover:opacity-80" style={{backgroundColor: 'var(--color-accent-primary)'}}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>
                                     <button onClick={() => onRespondToClanInvite(invite, false)} className="p-2 rounded-full hover:opacity-80" style={{backgroundColor: 'var(--color-bg-tertiary)'}}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                 </div>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    const InviteModal = () => {
        if (!showInviteModal || !userClan) return null;
        const friendsToInvite = allUsers.filter(u => currentUser.friends.includes(u.name) && !u.clanId && !u.clanInvites?.some(inv => inv.clanId === userClan.id));
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                <div className="p-6 rounded-2xl w-full max-w-sm" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <h2 className="text-xl font-bold mb-4">Invite Friends</h2>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {friendsToInvite.length > 0 ? friendsToInvite.map(friend => {
                            const isInvited = sentClanInvites.has(friend.name);
                            return (
                                <div key={friend.name} className="flex justify-between items-center p-2 rounded-lg" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>
                                    <p>{friend.name}</p>
                                    <button 
                                        onClick={() => { onInviteToClan(friend.name); setSentClanInvites(prev => new Set(prev).add(friend.name)); }} 
                                        disabled={isInvited}
                                        className="text-xs font-bold py-1 px-3 rounded-full hover:opacity-80 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                                        style={{background: isInvited ? 'var(--color-bg-tertiary)' : 'var(--gradient-accent)'}}
                                    >
                                        {isInvited ? 'Sent' : 'Invite'}
                                    </button>
                                </div>
                            )
                        }) : <p className="text-sm text-center" style={{color: 'var(--color-text-secondary)'}}>No friends available to invite.</p>}
                    </div>
                    <button onClick={() => { setShowInviteModal(false); setSentClanInvites(new Set()); }} className="mt-4 w-full py-2 rounded-lg" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>Close</button>
                </div>
            </div>
        )
    }
    const SettingsModal = () => {
        if (!showSettingsModal || !userClan) return null;
        const [newName, setNewName] = useState(userClan.name);
        const [selectedBanner, setSelectedBanner] = useState(userClan.banner);
        const bannerInputRef = useRef<HTMLInputElement>(null);

        const handleSave = () => {
            if (newName.trim().length >= 3 && newName.trim().length <= 20) {
                onUpdateClanName(userClan.id, newName.trim());
            }
            if (selectedBanner !== userClan.banner) {
                onUpdateClanBanner(userClan.id, selectedBanner);
            }
            setShowSettingsModal(false);
        }

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if(file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setSelectedBanner(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        };
        const canUpload = userClan.level >= 5;

        return (
             <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                <div className="p-6 rounded-2xl w-full max-w-md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <h2 className="text-xl font-bold mb-4">Clan Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm">Clan Name</label>
                            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full mt-1 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)'}} />
                        </div>
                        <div>
                            <label className="text-sm">Clan Banner</label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                                {Object.keys(PREDEFINED_BANNERS).map(bannerId => (
                                    <button key={bannerId} onClick={() => setSelectedBanner(bannerId)} className="aspect-square rounded-lg p-1" style={{outline: selectedBanner === bannerId ? '2px solid var(--color-accent-primary)' : 'none'}}>
                                        <ClanBanner banner={bannerId} className="w-full h-full rounded-md" />
                                    </button>
                                ))}
                            </div>
                             <input type="file" ref={bannerInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                             <button onClick={() => bannerInputRef.current?.click()} disabled={!canUpload} className="w-full mt-2 py-2 px-4 rounded-lg font-semibold disabled:opacity-50" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>
                                {canUpload ? 'Upload Custom Banner' : 'Unlock at Clan Level 5'}
                             </button>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                        <button onClick={() => setShowSettingsModal(false)} className="py-2 px-4 rounded-lg" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>Cancel</button>
                        <button onClick={handleSave} className="py-2 px-4 rounded-lg text-white" style={{background: 'var(--gradient-accent)'}}>Save</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <header>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Social</h1>
            </header>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <FilterButton label="Friends" value="friends" currentValue={activeView} setter={setActiveView} hasNotification={!!currentUser.friendRequests?.length} />
                <FilterButton label="Clan" value="clan" currentValue={activeView} setter={setActiveView} hasNotification={!!currentUser.clanInvites?.length || unreadClanMessages} />
            </div>

            {activeView === 'friends' ? renderFriendsView() : renderClanView()}
            <InviteModal />
            <SettingsModal />
            {userClan && <ClanPerksModal isOpen={showPerksModal} onClose={() => setShowPerksModal(false)} clan={userClan} />}
            <ConfirmationModal isOpen={confirmation.isOpen} onClose={() => setConfirmation({ ...confirmation, isOpen: false })} {...confirmation} />
        </div>
    );
};

export default FriendsPage;
// Dummy Settings Icon
const SettingsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);