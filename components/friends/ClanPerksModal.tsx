import React from 'react';
import { Clan } from '../../types';
import { getClanPerks } from '../../lib/clans';

interface ClanPerksModalProps {
    isOpen: boolean;
    onClose: () => void;
    clan: Clan;
}

const PerkRow: React.FC<{ label: string, value: string | number, isHeader?: boolean }> = ({ label, value, isHeader }) => (
    <div className={`grid grid-cols-2 text-sm ${isHeader ? 'font-bold' : ''}`}>
        <span style={{color: isHeader ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'}}>{label}</span>
        <span className="text-right font-semibold" style={{color: 'var(--color-accent-primary)'}}>{value}</span>
    </div>
);

const ClanPerksModal: React.FC<ClanPerksModalProps> = ({ isOpen, onClose, clan }) => {
    if (!isOpen) return null;

    const currentPerks = getClanPerks(clan.level);
    const nextLevelPerks = getClanPerks(clan.level + 1);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="p-6 rounded-2xl w-full max-w-sm" style={{ backgroundColor: 'var(--color-bg-secondary)' }} onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Clan Perks</h2>
                <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>
                        <PerkRow label="Current Daily Rewards" value={`Level ${clan.level}`} isHeader />
                        <div className="border-t my-2" style={{borderColor: 'var(--color-bg-secondary)'}} />
                        <PerkRow label="Bonus XP" value={`+${currentPerks.xp} XP`} />
                        <PerkRow label="Bonus Coins" value={`+${currentPerks.coins} Coins`} />
                    </div>
                     <div className="p-4 rounded-lg opacity-80" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>
                        <PerkRow label="Next Level Rewards" value={`Level ${clan.level + 1}`} isHeader />
                        <div className="border-t my-2" style={{borderColor: 'var(--color-bg-secondary)'}} />
                        <PerkRow label="Bonus XP" value={`+${nextLevelPerks.xp} XP`} />
                        <PerkRow label="Bonus Coins" value={`+${nextLevelPerks.coins} Coins`} />
                    </div>
                </div>
                <button onClick={onClose} className="mt-6 w-full py-2 rounded-lg font-semibold" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>Close</button>
            </div>
        </div>
    );
};

export default ClanPerksModal;
