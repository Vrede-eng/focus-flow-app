
import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage } from '../../types';
import Avatar from '../common/Avatar';

interface ChatViewProps {
    currentUser: User;
    friend: User;
    messages: ChatMessage[];
    onSendMessage: (to: string, text: string, type: 'text' | 'image', imageDataUrl?: string) => void;
    onBack: () => void;
    onMarkMessagesAsRead: (partnerName: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ currentUser, friend, messages, onSendMessage, onBack, onMarkMessagesAsRead }) => {
    const [text, setText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        onMarkMessagesAsRead(friend.name);
    }, [friend.name, onMarkMessagesAsRead]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    useEffect(scrollToBottom, [messages]);
    
    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(friend.name, text.trim(), 'text');
            setText('');
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onSendMessage(friend.name, file.name, 'image', reader.result as string);
            }
            reader.readAsDataURL(file);
        } else if (file) {
            alert("Please select a valid image file.");
        }
    };

    const messagesByDate = messages.reduce((acc, msg) => {
        const date = new Date(msg.timestamp).toLocaleDateString(undefined, { timeZone: currentUser.timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(msg);
        return acc;
    }, {} as Record<string, ChatMessage[]>);

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
                    <Avatar profilePic={friend.profilePic} equippedFrame={friend.equippedFrame} equippedHat={friend.equippedHat} equippedPet={friend.equippedPet} className="h-10 w-10" />
                    <h1 className="text-xl font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{friend.name}</h1>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                {Object.entries(messagesByDate).sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()).map(([date, msgs]) => (
                    <React.Fragment key={date}>
                        <div className="text-center text-xs my-2 sticky top-2 z-0" style={{ color: 'var(--color-text-secondary)' }}>{date}</div>
                        {msgs.map(msg => (
                            <div key={msg.id} className={`flex items-end gap-2 ${msg.from === currentUser.name ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.from === currentUser.name ? 'text-white rounded-br-lg' : 'rounded-bl-lg'}`}
                                     style={{ 
                                        background: msg.from === currentUser.name ? 'var(--gradient-accent)' : 'var(--color-bg-secondary)',
                                        color: msg.from === currentUser.name ? 'white' : 'var(--color-text-primary)'
                                     }}>
                                    {msg.type === 'image' && msg.imageDataUrl ? (
                                        <img src={msg.imageDataUrl} alt={msg.text} className="max-w-full h-auto rounded-lg my-1" style={{maxWidth: '200px'}} />
                                    ) : (
                                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                    )}
                                    <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], {timeZone: currentUser.timezone, hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
                 <div ref={messagesEndRef} />
            </main>

            <footer className="flex-shrink-0 p-2 sm:p-4 backdrop-blur-md border-t" style={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)',
                borderColor: 'var(--color-bg-tertiary)'
            }}>
                <div className="flex items-center space-x-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full hover:opacity-80 transition" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: 'var(--color-text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
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

export default ChatView;
