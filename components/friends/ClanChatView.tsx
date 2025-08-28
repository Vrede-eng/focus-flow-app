import React, { useState, useRef, useEffect } from 'react';
import { User, Clan, ClanChatMessage } from '../../types';
import Avatar from '../common/Avatar';

interface ClanChatViewProps {
    currentUser: User;
    clan: Clan;
    allUsers: User[];
    messages: ClanChatMessage[];
    onSendMessage: (clanId: string, text: string) => void;
    onBack: () => void;
    onViewProfile: (username: string) => void;
}

const ClanChatView: React.FC<ClanChatViewProps> = ({ currentUser, clan, allUsers, messages, onSendMessage, onBack, onViewProfile }) => {
    const [text, setText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    useEffect(scrollToBottom, [messages]);
    
    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(clan.id, text.trim());
            setText('');
        }
    };

    const getSender = (username: string) => allUsers.find(u => u.name === username);
    
    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 flex items-center p-4 backdrop-blur-md border-b z-10" style={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)',
                borderColor: 'var(--color-bg-tertiary)'
            }}>
                <button onClick={onBack} className="p-2 -ml-2 mr-2 rounded-full hover:opacity-80">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{color: 'var(--color-accent-primary)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg" style={{backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-accent-primary)'}}>{clan.name.charAt(0)}</div>
                    <h1 className="text-xl font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{clan.name}</h1>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto p-4 space-y-2">
                {messages.map(msg => {
                    const isCurrentUser = msg.from_name === currentUser.name;
                    const sender = getSender(msg.from_name);
                    return (
                        <div key={msg.id} className={`flex items-start gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                             {!isCurrentUser && sender && (
                                 <button onClick={() => onViewProfile(sender.name)}>
                                    <Avatar profilePic={sender.profile_pic} className="h-8 w-8 mt-1" />
                                 </button>
                             )}
                            <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${isCurrentUser ? 'text-white rounded-br-lg' : 'rounded-bl-lg'}`}
                                 style={{ 
                                    background: isCurrentUser ? 'var(--gradient-accent)' : 'var(--color-bg-secondary)',
                                    color: isCurrentUser ? 'white' : 'var(--color-text-primary)'
                                 }}>
                                {!isCurrentUser && <p className="text-xs font-bold" style={{color: 'var(--color-accent-primary)'}}>{msg.from_name}</p>}
                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], {timeZone: currentUser.timezone, hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                        </div>
                    )
                })}
                 <div ref={messagesEndRef} />
            </main>

            <footer className="flex-shrink-0 p-2 sm:p-4 backdrop-blur-md border-t" style={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)',
                borderColor: 'var(--color-bg-tertiary)'
            }}>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="w-full px-4 py-3 rounded-full border-transparent focus:outline-none focus:ring-2"
                        style={{
                            backgroundColor: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-accent-primary)'
                        }}
                    />
                    <button onClick={handleSend} style={{ background: 'var(--gradient-accent)' }} className="p-3 rounded-full hover:opacity-90 transition">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ClanChatView;
