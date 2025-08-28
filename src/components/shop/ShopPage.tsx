
import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import { SHOP_ITEMS, ShopItem } from '../../lib/shop';
import CoinsIcon from '../common/icons/CoinsIcon';
import LockIcon from '../common/icons/LockIcon';
import { PETS } from '../../lib/pets';
import { getPrestigeConfig } from '../../lib/levels';

interface ShopPageProps {
    currentUser: User;
    onPurchase: (itemId: string) => void;
    onUse: (itemId: string) => void;
}

type ShopTab = 'store' | 'my_items';

const FilterButton: React.FC<{
    label: string;
    value: string;
    currentValue: string;
    setter: (value: any) => void;
}> = ({ label, value, currentValue, setter }) => (
    <button
        onClick={() => setter(value)}
        className={`w-full text-sm font-bold py-2 rounded-lg transition ${
            currentValue !== value && 'hover:opacity-80'
        }`}
        style={{
            background: currentValue === value ? 'var(--gradient-accent)' : 'var(--color-bg-tertiary)',
            color: currentValue === value ? 'white' : 'var(--color-text-primary)'
        }}
    >
        {label}
    </button>
);

const ShopPage: React.FC<ShopPageProps> = ({ currentUser, onPurchase, onUse }) => {
    const [activeTab, setActiveTab] = useState<ShopTab>('store');
    
    const unlockedItems = useMemo(() => new Set(currentUser.unlocks || []), [currentUser.unlocks]);
    const prestigeInfo = getPrestigeConfig(currentUser.prestige);

    const storeSections = useMemo(() => {
        const sections: Record<ShopItem['type'], ShopItem[]> = {
            consumable: [],
            feature: [],
            color: [],
            font: [],
            frame: [],
            theme: [],
            avatar: [],
            pet: [],
        };
        SHOP_ITEMS.forEach(item => {
            if (sections[item.type]) {
                sections[item.type].push(item);
            }
        });
        return sections;
    }, []);

    const myConsumables = useMemo(() => {
        const items = [];
        if (currentUser.inventory?.streakShield && currentUser.inventory.streakShield > 0) {
            items.push(SHOP_ITEMS.find(i => i.id === 'consumable-streak-shield'));
        }
        if (currentUser.inventory?.xpPotions) {
            Object.keys(currentUser.inventory.xpPotions).forEach(potionId => {
                if(currentUser.inventory?.xpPotions?.[potionId] && currentUser.inventory.xpPotions[potionId] > 0) {
                    const potionInfo = SHOP_ITEMS.find(i => i.id === potionId);
                    if (potionInfo) items.push(potionInfo);
                }
            });
        }
        return items.filter((i): i is ShopItem => !!i);
    }, [currentUser.inventory]);

    const renderStore = () => (
        <>
            {(Object.keys(storeSections) as Array<keyof typeof storeSections>).map(sectionKey => {
                if (storeSections[sectionKey].length === 0) return null;
                const sortedItems = [...storeSections[sectionKey]].sort((a,b) => a.price - b.price);
                return (
                <div key={sectionKey} className="space-y-4">
                    <h2 className="text-xl font-bold capitalize" style={{ color: 'var(--color-text-primary)' }}>{sectionKey}s</h2>
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${sectionKey === 'pet' ? 'md:grid-cols-3' : ''}`}>
                        {sortedItems.map(item => {
                            const isUnlocked = unlockedItems.has(item.id);
                            const canAfford = (currentUser.coins || 0) >= item.price;
                            let isSoldOut = isUnlocked;
                            if (item.id === 'consumable-streak-shield' && (currentUser.inventory?.streakShield || 0) >= 1) {
                                isSoldOut = true;
                            }

                            return (
                                <div key={item.id} className="p-4 rounded-xl flex flex-col justify-between" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                    <div>
                                        {item.type === 'pet' && (
                                            <div className="w-16 h-16 mx-auto mb-2 p-1 rounded-lg" style={{backgroundColor: 'var(--color-bg-tertiary)'}}
                                                dangerouslySetInnerHTML={{ __html: PETS[item.id]?.svg || '' }} />
                                        )}
                                        <h3 className={`font-bold ${item.type === 'pet' ? 'text-center' : ''}`}>{item.name}</h3>
                                        <p className={`text-sm mt-1 ${item.type === 'pet' ? 'text-center' : ''}`} style={{ color: 'var(--color-text-secondary)' }}>{item.description}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex items-center space-x-1 font-bold" style={{color: 'var(--color-accent-primary)'}}>
                                            <CoinsIcon />
                                            <span>{item.price.toLocaleString()}</span>
                                        </div>
                                        <button 
                                            onClick={() => onPurchase(item.id)}
                                            disabled={isSoldOut || !canAfford}
                                            className="font-bold text-sm py-2 px-4 rounded-lg text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                            style={{ background: isSoldOut ? 'var(--color-bg-tertiary)' : 'var(--gradient-accent)' }}
                                        >
                                            {isSoldOut ? 'Owned' : 'Buy'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )})}
        </>
    );

    const renderMyItems = () => {
        const xpPotions = SHOP_ITEMS.find(i => i.id === 'consumable-xp-potion-100');
        const xpPotionCount = currentUser.inventory?.xpPotions?.['consumable-xp-potion-100'] || 0;
        
        return (
         <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>My Items</h2>
             {myConsumables.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentUser.inventory?.streakShield && currentUser.inventory.streakShield > 0 && (() => {
                        const streakShieldInfo = SHOP_ITEMS.find(i => i.id === 'consumable-streak-shield');
                        return streakShieldInfo ? (
                            <div key={streakShieldInfo.id} className="p-4 rounded-xl flex flex-col justify-between" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                <div>
                                    <h3 className="font-bold">{streakShieldInfo.name} <span className="text-xs" style={{color: 'var(--color-text-secondary)'}}>x1</span></h3>
                                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{streakShieldInfo.description}</p>
                                </div>
                                <div className="flex justify-end items-center mt-4">
                                    <p className="text-sm font-semibold italic" style={{color: 'var(--color-accent-primary)'}}>Passive Effect</p>
                                </div>
                            </div>
                        ) : null;
                    })()}
                    {xpPotions && xpPotionCount > 0 && (
                        <div key={xpPotions.id} className="p-4 rounded-xl flex flex-col justify-between" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                            <div>
                                <h3 className="font-bold">{xpPotions.name} <span className="text-xs" style={{color: 'var(--color-text-secondary)'}}>x{xpPotionCount}</span></h3>
                                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{xpPotions.description}</p>
                            </div>
                            <div className="flex justify-end items-center mt-4">
                                <button 
                                    onClick={() => onUse(xpPotions.id)}
                                    className="font-bold text-sm py-2 px-4 rounded-lg text-white transition"
                                    style={{ background: 'var(--gradient-accent)' }}
                                >
                                    Use
                                </button>
                            </div>
                        </div>
                    )}
                </div>
             ) : (
                <div className="text-center py-10 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <p style={{ color: 'var(--color-text-secondary)' }}>You don't have any consumable items.</p>
                </div>
             )}
        </div>
        )
    };


    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Shop</h1>
                <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg text-right" style={{ backgroundColor: 'var(--color-bg-secondary)'}}>
                        <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            Prestige Coin Multi
                        </p>
                        <p className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                            {prestigeInfo.multiplier}x
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-full font-bold" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-accent-primary)'}}>
                        <CoinsIcon />
                        <span>{(currentUser.coins || 0).toLocaleString()}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <FilterButton label="Store" value="store" currentValue={activeTab} setter={setActiveTab} />
                <FilterButton label="My Items" value="my_items" currentValue={activeTab} setter={setActiveTab} />
            </div>
            
            <div className="space-y-8">
                {activeTab === 'store' ? renderStore() : renderMyItems()}
            </div>
        </div>
    );
};

export default ShopPage;
