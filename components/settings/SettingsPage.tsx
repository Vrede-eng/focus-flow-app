import React, { useRef, useState, useMemo } from 'react';
import { User } from '../../types';
import { PREDEFINED_AVATARS } from '../../lib/avatars';
import { THEMES } from '../../lib/themes';
import { FRAMES } from '../../lib/frames';
import { PETS } from '../../lib/pets';
import { ACHIEVEMENTS_LIST } from '../../lib/achievements';
import Avatar from '../common/Avatar';
import LockIcon from '../common/icons/LockIcon';
import { FONTS } from '../../lib/fonts';
import { USERNAME_COLORS } from '../../lib/username_colors';
import { determineTitle } from '../../lib/levels';
import AgreementModal from '../common/AgreementModal';

interface SettingsPageProps {
    currentUser: User;
    onUpdateProfilePic: (newPic: string) => void;
    onUpdateTimezone: (newTimezone: string) => void;
    onUpdateTheme: (newThemeId: string) => void;
    onUpdateStatus: (newStatus: string) => void;
    onUpdatePrivacy: (isPrivate: boolean) => void;
    onEquipTitle: (title: string | null) => void;
    onEquipFrame: (frameId: string | null) => void;
    onUpdateName: (newName: string) => Promise<string | null>;
    onUpdatePassword: (oldPass: string, newPass: string) => Promise<string | null>;
    onViewProfile: () => void;
    onUpdateHat: (newHat: string | null) => void;
    onEquipPet: (petId: string | null) => void;
    onUpdateCustomPet: (petUrl: string | null) => void;
    onUpdateProfileTheme: (bg: string) => void;
    onEquipFont: (fontId: string | null) => void;
    onUpdateUsernameColor: (color: string | null) => void;
}

const CustomizationItem: React.FC<{
    onClick: () => void;
    isEquipped?: boolean;
    isUnlocked: boolean;
    children: React.ReactNode;
    name?: string;
    style?: React.CSSProperties;
    className?: string;
}> = ({ onClick, isEquipped = false, isUnlocked, children, name, style, className = '' }) => (
    <div className="flex flex-col items-center text-center">
        <button
            onClick={onClick}
            disabled={!isUnlocked}
            className={`relative aspect-square w-full rounded-lg flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-50 border-2 ${className}`}
            style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                borderColor: isEquipped ? 'var(--color-accent-primary)' : 'transparent',
                ...style
            }}
        >
            {children}
            {!isUnlocked && <LockIcon className="h-1/2 w-1/2 absolute" />}
        </button>
        {name && <span className="text-xs mt-1 truncate w-full" style={{ color: 'var(--color-text-secondary)' }}>{name}</span>}
    </div>
);

const LockedOverlay: React.FC<{ featureName: string }> = ({ featureName }) => (
    <div className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center text-center p-2 z-10 backdrop-blur-sm">
        <LockIcon className="h-8 w-8 mb-2" />
        <p className="text-sm font-semibold">Unlock "{featureName}"</p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Available in the Shop!</p>
    </div>
);


const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    const { currentUser, onUpdateProfilePic, onUpdateTimezone, onUpdateTheme, onUpdateStatus, onUpdatePrivacy, onEquipTitle, onEquipFrame, onUpdateName, onUpdatePassword, onViewProfile, onUpdateHat, onEquipPet, onUpdateCustomPet, onUpdateProfileTheme, onEquipFont, onUpdateUsernameColor } = props;
    
    const fileInputRefs = {
        avatar: useRef<HTMLInputElement>(null),
        hat: useRef<HTMLInputElement>(null),
        customPet: useRef<HTMLInputElement>(null),
        profileBg: useRef<HTMLInputElement>(null),
    };
    
    const [status, setStatus] = useState(currentUser.status || '');
    const [newName, setNewName] = useState(currentUser.name);
    const [nameError, setNameError] = useState<string | null>(null);
    const [nameSuccess, setNameSuccess] = useState(false);
    const [isNameLoading, setIsNameLoading] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passError, setPassError] = useState<string | null>(null);
    const [passSuccess, setPassSuccess] = useState(false);
    const [isPassLoading, setIsPassLoading] = useState(false);
    const [showAgreement, setShowAgreement] = useState(false);

    const [profileBgColor, setProfileBgColor] = useState(
        // FIX: Changed profileTheme to profile_theme
        currentUser.profile_theme?.bg?.startsWith('#') ? currentUser.profile_theme.bg : '#1e293b'
    );
    
    const unlocked = useMemo(() => new Set(currentUser.unlocks || []), [currentUser.unlocks]);
    const hasCustomAvatar = unlocked.has('feature-custom-avatar');
    const hasCustomStatus = unlocked.has('feature-custom-status');
    const hasCustomHat = unlocked.has('feature-custom-hat');
    const hasCustomPet = unlocked.has('feature-custom-pet');
    const hasProfileTheme = unlocked.has('feature-profile-theme');

    const timezones = useMemo(() => (Intl && typeof (Intl as any).supportedValuesOf === 'function') ? (Intl as any).supportedValuesOf('timeZone') : ['UTC'], []);
    const formatTimezone = (tz: string) => tz.replace(/_/g, ' ').replace(/\//g, ' / ');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'hat' | 'custom_pet' | 'profile_bg') => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                switch(type) {
                    case 'avatar': if(hasCustomAvatar) onUpdateProfilePic(result); break;
                    case 'hat': if(hasCustomHat) onUpdateHat(result); break;
                    case 'custom_pet': if(hasCustomPet) onUpdateCustomPet(result); break;
                    case 'profile_bg': if(hasProfileTheme) onUpdateProfileTheme(result); break;
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleStatusBlur = () => { if (hasCustomStatus) onUpdateStatus(status); }

    const handleNameUpdate = async (e: React.FormEvent) => { e.preventDefault(); if (isNameLoading) return; setIsNameLoading(true); setNameError(null); setNameSuccess(false); const error = await onUpdateName(newName); if (error) setNameError(error); else { setNameSuccess(true); setTimeout(() => setNameSuccess(false), 3000); } setIsNameLoading(false); };
    const handlePasswordUpdate = async (e: React.FormEvent) => { e.preventDefault(); if (isPassLoading) return; setPassError(null); setPassSuccess(false); if (newPassword.length < 4) { setPassError("New password must be at least 4 characters."); return; } if (newPassword !== confirmPassword) { setPassError("New passwords do not match."); return; } setIsPassLoading(true); const error = await onUpdatePassword(oldPassword, newPassword); if (error) { setPassError(error); } else { setPassSuccess(true); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setTimeout(() => setPassSuccess(false), 3000); } setIsPassLoading(false); };
    const handleProfileBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => { const color = e.target.value; setProfileBgColor(color); onUpdateProfileTheme(color); };
    
    const unlockedAchievementIds = useMemo(() => new Set((currentUser.achievements || []).map(a => a.id)), [currentUser.achievements]);
    const unlockedTitles = useMemo(() => ACHIEVEMENTS_LIST.filter(ach => unlockedAchievementIds.has(ach.id)).map(ach => ach.reward.title), [unlockedAchievementIds]);
    const unlockedColors = useMemo(() => Object.values(USERNAME_COLORS).filter(c => c.id !== 'gold' && unlocked.has(`color-${c.id}`)), [unlocked]);
    const unlockedFonts = useMemo(() => Object.values(FONTS).filter(font => unlocked.has(font.id)), [unlocked]);

    return (
        <div>
            <header className="flex items-center p-4 z-10 sticky top-0" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <h1 className="text-xl font-bold mx-auto" style={{ color: 'var(--color-text-primary)' }}>Settings</h1>
            </header>

            <main className="p-6 space-y-8">
                <button onClick={onViewProfile} className="flex flex-col items-center space-y-4 text-center hover:opacity-80 transition-opacity w-full">
                    {/* FIX: Changed camelCase props to snake_case */}
                    <Avatar profilePic={currentUser.profile_pic} equippedFrame={currentUser.equipped_frame} equippedHat={currentUser.equipped_hat} equippedPet={currentUser.equipped_pet} customPetUrl={currentUser.custom_pet_url} className="h-32 w-32" />
                    <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                </button>
                
                 {/* --- ACCOUNT & PROFILE --- */}
                 <div className="p-6 rounded-2xl space-y-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Account</h3>
                    <form onSubmit={handleNameUpdate} className="space-y-2">
                         <label className="text-sm font-medium block" style={{ color: 'var(--color-text-secondary)' }}>Update Name</label>
                         <div className="flex space-x-2">
                            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-bg-tertiary)' }} />
                            <button type="submit" disabled={isNameLoading || newName === currentUser.name} className="px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50" style={{background: 'var(--gradient-accent)'}}>{isNameLoading ? '...' : 'Save'}</button>
                         </div>
                         {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                         {nameSuccess && <p className="text-green-500 text-xs mt-1">Name updated successfully!</p>}
                    </form>

                    <form onSubmit={handlePasswordUpdate} className="space-y-2">
                        <label className="text-sm font-medium block" style={{ color: 'var(--color-text-secondary)' }}>Update Password</label>
                        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Current Password" required className="w-full px-4 py-2 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-bg-tertiary)' }} />
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" required className="w-full px-4 py-2 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-bg-tertiary)' }} />
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required className="w-full px-4 py-2 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-bg-tertiary)' }} />
                         <button type="submit" disabled={isPassLoading} className="w-full px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50" style={{background: 'var(--gradient-accent)'}}>{isPassLoading ? 'Updating...' : 'Update Password'}</button>
                        {passError && <p className="text-red-500 text-xs mt-1">{passError}</p>}
                        {passSuccess && <p className="text-green-500 text-xs mt-1">Password updated successfully!</p>}
                    </form>
                    <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>Timezone</label>
                        <select value={currentUser.timezone || ''} onChange={(e) => onUpdateTimezone(e.target.value)} className="w-full px-4 py-2 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-bg-tertiary)', appearance: 'none' }}>
                            <option value="">Not Set</option>
                            {timezones.map(tz => <option key={tz} value={tz}>{formatTimezone(tz)}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>Profile Privacy</label>
                        <div className="flex items-center justify-between p-3 rounded-lg" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>
                            {/* FIX: Changed isPrivate to is_private */}
                            <span>Make profile private? <span className="text-xs">({currentUser.is_private ? "Enabled" : "Disabled"})</span></span>
                            {/* FIX: Changed isPrivate to is_private */}
                            <button onClick={() => onUpdatePrivacy(!currentUser.is_private)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${currentUser.is_private ? 'bg-green-500' : 'bg-gray-600'}`}>
                                {/* FIX: Changed isPrivate to is_private */}
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${currentUser.is_private ? 'translate-x-6' : 'translate-x-1'}`}/>
                            </button>
                        </div>
                    </div>
                 </div>

                {/* --- PROFILE CUSTOMIZATION --- */}
                <div className="p-6 rounded-2xl space-y-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Profile Customization</h3>
                    {/* Status */}
                    <div className="relative">
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>Your Status</label>
                        <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} onBlur={handleStatusBlur} placeholder="Set a status..." maxLength={100} className="w-full px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }} disabled={!hasCustomStatus} />
                        {!hasCustomStatus && <LockedOverlay featureName="Custom Status" />}
                    </div>
                    {/* Title */}
                    <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>Title</label>
                        {/* FIX: Changed equippedTitle to equipped_title */}
                        <select value={currentUser.equipped_title || ''} onChange={(e) => onEquipTitle(e.target.value || null)} className="w-full px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', appearance: 'none' }}>
                            <option value="">{determineTitle(currentUser.level, currentUser.prestige)} (Default)</option>
                            {unlockedTitles.map(title => <option key={title} value={title}>{title}</option>)}
                        </select>
                    </div>
                    {/* Profile Background */}
                    <div className="relative">
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>Profile Background</label>
                        <div className="p-3 rounded-lg space-y-3" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="bg-color-picker" className="text-sm">Color:</label>
                                <input id="bg-color-picker" type="color" value={profileBgColor} onChange={handleProfileBgColorChange} className="w-10 h-10 rounded border-none" style={{backgroundColor: 'transparent', cursor: 'pointer'}} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="file" ref={fileInputRefs.profileBg} onChange={(e) => handleFileChange(e, 'profile_bg')} accept="image/*" className="hidden" />
                                <button onClick={() => fileInputRefs.profileBg.current?.click()} className="text-sm font-semibold py-2 px-3 rounded-lg w-full" style={{backgroundColor: 'var(--color-bg-secondary)'}}>Upload Image</button>
                                <button onClick={() => { onUpdateProfileTheme(''); setProfileBgColor('#1e293b'); }} className="text-sm font-semibold py-2 px-3 rounded-lg" style={{backgroundColor: 'var(--color-bg-secondary)'}}>Reset</button>
                            </div>
                        </div>
                        {!hasProfileTheme && <LockedOverlay featureName="Custom Profile Theme" />}
                    </div>
                    {/* Avatar */}
                    <div>
                         <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>Avatar</label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {/* FIX: Changed profilePic to profile_pic */}
                            {PREDEFINED_AVATARS.map(avatarId => <CustomizationItem key={avatarId} onClick={() => onUpdateProfilePic(avatarId)} isUnlocked={unlocked.has(avatarId)} isEquipped={currentUser.profile_pic === avatarId}><Avatar profilePic={avatarId} className="w-full h-full p-1" /></CustomizationItem>)}
                             <input type="file" ref={fileInputRefs.avatar} onChange={(e) => handleFileChange(e, 'avatar')} accept="image/*" className="hidden" />
                             {/* FIX: Changed profilePic to profile_pic */}
                             <CustomizationItem onClick={() => fileInputRefs.avatar.current?.click()} isUnlocked={hasCustomAvatar} isEquipped={currentUser.profile_pic.startsWith('data:image')}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></CustomizationItem>
                        </div>
                    </div>
                     {/* Frame */}
                    <div>
                         <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>Avatar Frame</label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {/* FIX: Changed equippedFrame to equipped_frame */}
                            <CustomizationItem onClick={() => onEquipFrame(null)} isUnlocked={true} isEquipped={!currentUser.equipped_frame}>None</CustomizationItem>
                            {/* FIX: Changed equippedFrame to equipped_frame */}
                            {Object.values(FRAMES).map(frame => <CustomizationItem key={frame.id} name={frame.name} onClick={() => onEquipFrame(frame.id)} isUnlocked={unlocked.has(frame.id)} isEquipped={currentUser.equipped_frame === frame.id}><div className="w-full h-full p-1" dangerouslySetInnerHTML={{ __html: frame.svg }}/></CustomizationItem>)}
                        </div>
                    </div>
                    {/* Hat */}
                    <div className="relative">
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>Hat</label>
                         <div className="p-3 rounded-lg flex items-center space-x-2" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>
                            <input type="file" ref={fileInputRefs.hat} onChange={(e) => handleFileChange(e, 'hat')} accept="image/*" className="hidden" />
                            <button onClick={() => fileInputRefs.hat.current?.click()} className="text-sm font-semibold py-2 px-3 rounded-lg w-full" style={{backgroundColor: 'var(--color-bg-secondary)'}}>Upload Custom Hat</button>
                            {/* FIX: Changed equippedHat to equipped_hat */}
                            {currentUser.equipped_hat && <button onClick={() => onUpdateHat(null)} className="text-sm font-semibold py-2 px-3 rounded-lg" style={{backgroundColor: 'var(--color-bg-secondary)'}}>Remove Hat</button>}
                        </div>
                        {!hasCustomHat && <LockedOverlay featureName="Custom Hat" />}
                    </div>
                     {/* Pet */}
                    <div>
                         <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>Pet</label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                             {/* FIX: Changed equippedPet to equipped_pet */}
                             <CustomizationItem onClick={() => onEquipPet(null)} isUnlocked={true} isEquipped={!currentUser.equipped_pet}>None</CustomizationItem>
                            {/* FIX: Changed equippedPet to equipped_pet */}
                            {Object.values(PETS).map(pet => <CustomizationItem key={pet.id} name={pet.name} onClick={() => onEquipPet(pet.id)} isUnlocked={unlocked.has(pet.id)} isEquipped={currentUser.equipped_pet === pet.id}><div className="w-full h-full p-1" dangerouslySetInnerHTML={{ __html: pet.svg }}/></CustomizationItem>)}
                            <input type="file" ref={fileInputRefs.customPet} onChange={(e) => handleFileChange(e, 'custom_pet')} accept="image/*" className="hidden" />
                             {/* FIX: Changed equippedPet to equipped_pet */}
                             <CustomizationItem onClick={() => fileInputRefs.customPet.current?.click()} isUnlocked={hasCustomPet} isEquipped={currentUser.equipped_pet === 'custom'}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></CustomizationItem>
                        </div>
                    </div>
                </div>

                {/* --- GLOBAL CUSTOMIZATION --- */}
                <div className="p-6 rounded-2xl space-y-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Global Customization</h3>
                    {/* Themes */}
                    <div>
                         <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>App Theme</label>
                         <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {THEMES.map(theme => <CustomizationItem key={theme.id} name={theme.name} onClick={() => onUpdateTheme(theme.id)} isUnlocked={unlocked.has(theme.id)} isEquipped={currentUser.theme === theme.id} className="aspect-video" style={{ background: theme.accent.gradient }}><></></CustomizationItem>)}
                         </div>
                    </div>
                     {/* Username Appearance */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Username Appearance</h4>
                        {/* Font */}
                         <div>
                            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>Font</label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {/* FIX: Changed equippedFont to equipped_font */}
                                <CustomizationItem onClick={() => onEquipFont(null)} isUnlocked={true} isEquipped={!currentUser.equipped_font} name="Default" className="text-sm">Aa</CustomizationItem>
                                {/* FIX: Changed equippedFont to equipped_font */}
                                {Object.values(FONTS).map(font => <CustomizationItem key={font.id} name={font.name} onClick={() => onEquipFont(font.id)} isUnlocked={unlocked.has(font.id)} isEquipped={currentUser.equipped_font === font.id} className="text-sm" style={{fontFamily: font.family}}>Aa</CustomizationItem>)}
                            </div>
                        </div>
                         {/* Color */}
                         <div>
                            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>Color</label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {/* FIX: Changed usernameColor to username_color */}
                                <CustomizationItem onClick={() => onUpdateUsernameColor(null)} isUnlocked={true} isEquipped={!currentUser.username_color} name="Default"><></></CustomizationItem>
                                {/* FIX: Changed usernameColor to username_color */}
                                {unlockedColors.map(color => <CustomizationItem key={color.id} name={color.name} onClick={() => onUpdateUsernameColor(color.color)} isUnlocked={true} isEquipped={currentUser.username_color === color.color} style={{backgroundColor: color.color}}><></></CustomizationItem>)}
                            </div>
                            <div className="relative mt-2">
                                <button
                                    onClick={() => onUpdateUsernameColor(USERNAME_COLORS['gold'].color)}
                                    disabled={!unlocked.has('username-color-gold')}
                                    className="w-full py-2 rounded-lg font-bold transition text-base relative overflow-hidden disabled:cursor-not-allowed"
                                    // FIX: Changed usernameColor to username_color
                                    style={{ background: 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728)', color: '#422c07', textShadow: '0 1px 1px rgba(255, 255, 255, 0.3)', border: currentUser.username_color === USERNAME_COLORS['gold'].color ? '2px solid white' : '2px solid #AA771C' }}
                                >
                                    Equip Gold Username
                                </button>
                                {!unlocked.has('username-color-gold') && <LockedOverlay featureName="Gold Username"/>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- COMMUNITY GUIDELINES LINK --- */}
                <div className="text-center py-4 border-t" style={{borderColor: 'var(--color-bg-tertiary)'}}>
                    <button 
                        onClick={() => setShowAgreement(true)}
                        className="text-sm font-medium hover:opacity-80" 
                        style={{color: 'var(--color-text-secondary)'}}
                    >
                        View Community Guidelines
                    </button>
                </div>
            </main>
             {showAgreement && (
                <AgreementModal
                    isOpen={showAgreement}
                    onAgree={() => setShowAgreement(false)}
                    isReviewOnly={true}
                />
            )}
        </div>
    );
};

export default SettingsPage;