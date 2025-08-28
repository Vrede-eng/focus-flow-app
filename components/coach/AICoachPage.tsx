

import React, { useState, useRef, useEffect } from 'react';
import { AIMessage, User, CoachMood } from '../../types';
import Avatar from '../common/Avatar';
import AICoachIcon from '../common/icons/AICoachIcon';

type UploadedFile = { name: string; type: string; data: string; };

const AIAvatar: React.FC = () => (
    <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{background: 'var(--gradient-accent)'}}>
        <div className="text-white">
            <AICoachIcon isActive={false} />
        </div>
    </div>
);

interface AICoachPageProps {
    messages: AIMessage[];
    onSendMessage: (prompt: string) => void;
    onResetChat: () => void;
    isLoading: boolean;
    currentUser: User;
    onFileUpload: (file: UploadedFile) => void;
    currentFile: UploadedFile | null;
    onRemoveFile: () => void;
    mood: CoachMood;
    onSetMood: (mood: CoachMood) => void;
}

const AICoachPage: React.FC<AICoachPageProps> = ({ 
    messages, onSendMessage, onResetChat, isLoading, currentUser, 
    onFileUpload, currentFile, onRemoveFile, mood, onSetMood 
}) => {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSend = () => {
        if ((inputText.trim() || currentFile) && !isLoading) {
            onSendMessage(inputText.trim());
            setInputText('');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                onFileUpload({ name: file.name, type: file.type, data: base64String });
            }
            reader.readAsDataURL(file);
        }
    };

    const MoodButton: React.FC<{ label: string; value: CoachMood; }> = ({ label, value }) => (
        <button
            onClick={() => onSetMood(value)}
            className={`w-full text-sm font-bold py-2 rounded-lg transition ${
                mood !== value && 'hover:opacity-80'
            }`}
            style={{
                background: mood === value ? 'var(--gradient-accent)' : 'var(--color-bg-tertiary)',
                color: mood === value ? 'white' : 'var(--color-text-primary)'
            }}
        >
            {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 flex items-center justify-between p-4 z-10 sticky top-0 border-b" style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-bg-tertiary)'
            }}>
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>AI Coach</h1>
                <button 
                    onClick={onResetChat}
                    className="text-sm font-medium hover:opacity-80"
                    style={{color: 'var(--color-accent-primary)'}}
                >
                    Reset Chat
                </button>
            </header>

            <div className="p-4 flex-shrink-0">
                <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <MoodButton label="Motivational" value="motivational" />
                    <MoodButton label="Talkative" value="talkative" />
                    <MoodButton label="Drill Sergeant" value="drill_sergeant" />
                </div>
            </div>

            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <AIAvatar />
                        <div className="max-w-[85%] px-4 py-2 rounded-2xl rounded-bl-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
                            <p className="whitespace-pre-wrap break-words">
                                Ready for a study session? I'm your AI Coach.
                                <br/><br/>
                                Choose a personality for me above, and let's get started. You can talk to me about your challenges, ask for motivation, or upload a problem you're stuck on.
                            </p>
                        </div>
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <AIAvatar />}
                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'text-white rounded-br-lg' : 'rounded-bl-lg'}`}
                             style={{ 
                                background: msg.role === 'user' ? 'var(--gradient-accent)' : 'var(--color-bg-secondary)',
                                color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)'
                             }}>
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
{/* FIX: Changed camelCase props on currentUser to snake_case to match User type. */}
                         {msg.role === 'user' && <Avatar profilePic={currentUser.profile_pic} equippedFrame={currentUser.equipped_frame} equippedHat={currentUser.equipped_hat} equippedPet={currentUser.equipped_pet} customPetUrl={currentUser.custom_pet_url} className="h-8 w-8" />}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-start gap-3 justify-start">
                        <AIAvatar />
                        <div className="max-w-[85%] px-4 py-2 rounded-2xl rounded-bl-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                            <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-current rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-current rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-current rounded-full animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </main>

            <footer className="flex-shrink-0 p-2 sm:p-4 backdrop-blur-md border-t" style={{
                 backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)',
                 borderColor: 'var(--color-bg-tertiary)'
            }}>
                {currentFile && (
                     <div className="px-3 pb-2 flex items-center justify-between">
                        <div className="text-sm flex items-center space-x-2 truncate" style={{color: 'var(--color-text-secondary)'}}>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                            <span className="truncate">{currentFile.name}</span>
                        </div>
                        <button onClick={onRemoveFile} className="p-1 rounded-full hover:bg-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{color: 'var(--color-text-secondary)'}} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                )}
                <div className="flex items-center space-x-2">
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                     <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full hover:opacity-80 transition" style={{ backgroundColor: 'var(--color-bg-tertiary)' }} aria-label="Attach file">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: 'var(--color-text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>
                    <textarea
                        rows={1}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Let's talk..."
                        className="w-full px-4 py-3 rounded-full border-transparent focus:outline-none focus:ring-2 resize-none max-h-24"
                        style={{
                            backgroundColor: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-accent-primary)'
                        }}
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || (!inputText.trim() && !currentFile)} className="p-3 rounded-full hover:opacity-90 transition disabled:opacity-50" style={{background: 'var(--gradient-accent)'}} aria-label="Send message">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default AICoachPage;