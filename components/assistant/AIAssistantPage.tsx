

import React, { useState, useRef, useEffect } from 'react';
import { AIMessage, User, CoachMood } from '../../types';
import Avatar from '../common/Avatar';
import AIAssistantIcon from '../common/icons/AIAssistantIcon';

type AssistantMode = 'planner' | 'coach' | 'answer_bot' | 'helper_bot';
type UploadedFile = { name: string; type: string; data: string; };

const AIAvatar: React.FC = () => (
    <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{background: 'var(--gradient-accent)'}}>
        <div className="text-white">
            <AIAssistantIcon isActive={false} />
        </div>
    </div>
);

interface AIAssistantPageProps {
    plannerMessages: AIMessage[];
    coachMessages: AIMessage[];
    answerBotMessages: AIMessage[];
    helperBotMessages: AIMessage[];
    onSendPlannerMessage: (prompt: string) => void;
    onSendCoachMessage: (prompt: string) => void;
    onSendAnswerBotMessage: (prompt: string) => void;
    onSendHelperBotMessage: (prompt: string) => void;
    onResetPlannerChat: () => void;
    onResetCoachChat: () => void;
    onResetAnswerBotChat: () => void;
    onResetHelperBotChat: () => void;
    isLoading: boolean;
    currentUser: User;
    onPlannerFileUpload: (file: UploadedFile) => void;
    onCoachFileUpload: (file: UploadedFile) => void;
    onAnswerBotFileUpload: (file: UploadedFile) => void;
    onHelperBotFileUpload: (file: UploadedFile) => void;
    plannerFile: UploadedFile | null;
    coachFile: UploadedFile | null;
    answerBotFile: UploadedFile | null;
    helperBotFile: UploadedFile | null;
    onRemovePlannerFile: () => void;
    onRemoveCoachFile: () => void;
    onRemoveAnswerBotFile: () => void;
    onRemoveHelperBotFile: () => void;
    coachMood: CoachMood;
    onSetCoachMood: (mood: CoachMood) => void;
}

const AIAssistantPage: React.FC<AIAssistantPageProps> = (props) => {
    const {
        plannerMessages, coachMessages, answerBotMessages, helperBotMessages,
        onSendPlannerMessage, onSendCoachMessage, onSendAnswerBotMessage, onSendHelperBotMessage,
        onResetPlannerChat, onResetCoachChat, onResetAnswerBotChat, onResetHelperBotChat,
        isLoading, currentUser,
        onPlannerFileUpload, onCoachFileUpload, onAnswerBotFileUpload, onHelperBotFileUpload,
        plannerFile, coachFile, answerBotFile, helperBotFile,
        onRemovePlannerFile, onRemoveCoachFile, onRemoveAnswerBotFile, onRemoveHelperBotFile,
        coachMood, onSetCoachMood
    } = props;

    const [mode, setMode] = useState<AssistantMode>('planner');
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const messages = {
        planner: plannerMessages,
        coach: coachMessages,
        answer_bot: answerBotMessages,
        helper_bot: helperBotMessages,
    }[mode];

    const currentFile = {
        planner: plannerFile,
        coach: coachFile,
        answer_bot: answerBotFile,
        helper_bot: helperBotFile,
    }[mode];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    useEffect(scrollToBottom, [messages, isLoading]);
    
    useEffect(() => {
        setInputText('');
    }, [mode]);

    const handleSend = () => {
        if ((inputText.trim() || currentFile) && !isLoading) {
            switch(mode) {
                case 'planner': onSendPlannerMessage(inputText.trim()); break;
                case 'coach': onSendCoachMessage(inputText.trim()); break;
                case 'answer_bot': onSendAnswerBotMessage(inputText.trim()); break;
                case 'helper_bot': onSendHelperBotMessage(inputText.trim()); break;
            }
            setInputText('');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                const uploadedFile = { name: file.name, type: file.type, data: base64String };
                switch(mode) {
                    case 'planner': onPlannerFileUpload(uploadedFile); break;
                    case 'coach': onCoachFileUpload(uploadedFile); break;
                    case 'answer_bot': onAnswerBotFileUpload(uploadedFile); break;
                    case 'helper_bot': onHelperBotFileUpload(uploadedFile); break;
                }
            }
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveFile = () => {
        switch(mode) {
            case 'planner': onRemovePlannerFile(); break;
            case 'coach': onRemoveCoachFile(); break;
            case 'answer_bot': onRemoveAnswerBotFile(); break;
            case 'helper_bot': onRemoveHelperBotFile(); break;
        }
    };
    
    const handleResetChat = () => {
        switch(mode) {
            case 'planner': onResetPlannerChat(); break;
            case 'coach': onResetCoachChat(); break;
            case 'answer_bot': onResetAnswerBotChat(); break;
            case 'helper_bot': onResetHelperBotChat(); break;
        }
    }

    const ModeButton: React.FC<{ label: string; value: AssistantMode; }> = ({ label, value }) => (
        <button
            onClick={() => setMode(value)}
            className={`w-full text-sm font-bold py-2 rounded-lg transition ${
                mode !== value && 'hover:opacity-80'
            }`}
            style={{
                background: mode === value ? 'var(--gradient-accent)' : 'var(--color-bg-tertiary)',
                color: mode === value ? 'white' : 'var(--color-text-primary)'
            }}
        >
            {label}
        </button>
    );
    
    const CoachMoodButton: React.FC<{ label: string; value: CoachMood; }> = ({ label, value }) => (
        <button
            onClick={() => onSetCoachMood(value)}
            className={`w-full text-sm font-bold py-2 rounded-lg transition ${
                coachMood !== value && 'hover:opacity-80'
            }`}
            style={{
                background: coachMood === value ? 'var(--gradient-accent)' : 'var(--color-bg-tertiary)',
                color: coachMood === value ? 'white' : 'var(--color-text-primary)'
            }}
        >
            {label}
        </button>
    );

    const renderInitialMessage = () => {
        const initialMessages: Record<AssistantMode, string> = {
            planner: "Hello! I'm your AI Planner.\n\nTell me what you need to study and your deadline. You can also upload a file like a syllabus or your notes for a more accurate plan.\n\nFor example: \"I need to prepare for my calculus final in 3 weeks.\"",
            coach: "Ready for a study session? I'm your AI Coach.\n\nChoose a personality for me above, and let's get started. You can talk to me about your challenges, ask for motivation, or upload a problem you're stuck on.",
            answer_bot: "I'm the Answer Bot. Ask me a question, and I'll give you a direct answer. You can also upload a document for me to analyze.",
            helper_bot: "I'm the Helper Bot. If you're stuck on a concept, I can help break it down for you. Let me know what you're struggling with.",
        };

        return (
            <div className="flex items-start gap-3 justify-start">
                <AIAvatar />
                <div className="max-w-[85%] px-4 py-2 rounded-2xl rounded-bl-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
                    <p className="whitespace-pre-wrap break-words">
                        {initialMessages[mode]}
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 flex items-center justify-between p-4 z-10 sticky top-0 border-b" style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-bg-tertiary)'
            }}>
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>AI Assistant</h1>
                <button 
                    onClick={handleResetChat}
                    className="text-sm font-medium hover:opacity-80"
                    style={{color: 'var(--color-accent-primary)'}}
                >
                    Reset Chat
                </button>
            </header>

            <div className="p-4 flex-shrink-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <ModeButton label="Planner" value="planner" />
                    <ModeButton label="Coach" value="coach" />
                    <ModeButton label="Answer Bot" value="answer_bot" />
                    <ModeButton label="Helper Bot" value="helper_bot" />
                </div>
            </div>
            
             {mode === 'coach' && (
                <div className="px-4 pb-4 flex-shrink-0">
                    <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <CoachMoodButton label="Motivational" value="motivational" />
                        <CoachMoodButton label="Talkative" value="talkative" />
                        <CoachMoodButton label="Drill Sergeant" value="drill_sergeant" />
                    </div>
                </div>
            )}

            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !isLoading && renderInitialMessage()}
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
                         {msg.role === 'user' && <Avatar profilePic={currentUser.profilePic} equippedFrame={currentUser.equippedFrame} equippedHat={currentUser.equippedHat} equippedPet={currentUser.equippedPet} className="h-8 w-8" />}
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
                        <button onClick={handleRemoveFile} className="p-1 rounded-full hover:bg-white/10">
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
                        placeholder={mode === 'planner' ? "Tell me what to plan..." : "Let's talk..."}
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

export default AIAssistantPage;