

import React from 'react';
import PredefinedAvatar from './avatars/PredefinedAvatar';
import { FRAMES } from '../../lib/frames';
import { PETS } from '../../lib/pets';

interface AvatarProps {
    profilePic: string;
    className?: string;
    equippedFrame?: string;
    equippedHat?: string;
    equippedPet?: string; // Can be pet ID or 'custom'
    customPetUrl?: string;
    style?: React.CSSProperties;
}

const AvatarContent: React.FC<Pick<AvatarProps, 'profilePic' | 'className'>> = ({ profilePic, className }) => {
    const isCustom = profilePic.startsWith('data:image/');
    const isPredefined = profilePic.startsWith('avatar-');

    const baseClasses = "rounded-full object-cover flex-shrink-0";

    if (isCustom) {
        return <img src={profilePic} alt="User Avatar" className={`${baseClasses} ${className}`} />;
    }

    if (isPredefined) {
        return (
            <div className={`${baseClasses} ${className}`} style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <PredefinedAvatar avatarId={profilePic} />
            </div>
        );
    }

    // Fallback for users without a profile pic
    return (
         <div className={`${baseClasses} ${className} flex items-center justify-center`} style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2/3 w-2/3" style={{ color: 'var(--color-text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        </div>
    );
};


const Avatar: React.FC<AvatarProps> = ({ profilePic, className = 'h-10 w-10', equippedFrame, equippedHat, equippedPet, customPetUrl, style }) => {
    const frameData = equippedFrame ? FRAMES[equippedFrame] : null;
    
    const isCustomPet = equippedPet === 'custom' && customPetUrl;
    const petData = equippedPet && equippedPet !== 'custom' ? PETS[equippedPet] : null;

    return (
        <div className={`relative ${className} flex-shrink-0`} style={style}>
            <AvatarContent profilePic={profilePic} className="h-full w-full" />
            
            {frameData && (
                <div 
                  className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: frameData.svg }}
                />
            )}
            
            {equippedHat && (
                <img 
                    src={equippedHat} 
                    alt="User hat" 
                    className="absolute w-[70%] h-auto top-[-25%] left-1/2 -translate-x-1/2 z-20 pointer-events-none object-contain"
                />
            )}

            {isCustomPet && (
                 <img 
                    src={customPetUrl}
                    alt="Custom pet"
                    className="absolute w-[45%] h-[45%] bottom-[-5%] right-[-10%] z-20 pointer-events-none object-contain"
                />
            )}

            {petData && (
                 <div 
                  className="absolute w-[45%] h-[45%] bottom-[-5%] right-[-10%] z-20 pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: petData.svg }}
                />
            )}
        </div>
    );
};

export default Avatar;