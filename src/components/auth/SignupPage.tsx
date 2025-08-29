

import React, { useState, useMemo } from 'react';
import AgreementModal from '../common/AgreementModal';

interface SignupPageProps {
    onSignup: (name: string, password: string) => Promise<string | null>;
    switchToLogin: () => void;
    isOnline: boolean;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, switchToLogin, isOnline }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showAgreement, setShowAgreement] = useState(false);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        // Basic real-time validation for UX
        if (newName && !/^[a-zA-Z0-9 ]+$/.test(newName)) {
            setNameError('Name can only contain letters, numbers, and spaces.');
        } else if (newName.length > 20) {
            setNameError('Name must be 20 characters or less.');
        }
        else {
            setNameError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (isLoading || !isOnline) return;

        if (nameError) {
             setError(nameError);
             return;
        }
        if (!name.trim()) {
            setError("Please enter a name.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords don't match. Please try again.");
            return;
        }

        setShowAgreement(true);
    };

    const handleAgreeAndSignup = async () => {
        setShowAgreement(false);
        setIsLoading(true);
        const errorMessage = await onSignup(name, password);
        setIsLoading(false);
        if (errorMessage) {
            setError(errorMessage);
        }
    };


    const hasError = !!error || !!nameError;

    return (
        <div className="h-full flex flex-col items-center justify-center p-6">
            <div className="text-center absolute top-16">
                 <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-secondary)' }}>FocusFlow</h2>
            </div>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>Create Account</h1>
                <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Start your learning journey with us.</p>
            </div>
            <div className="w-full max-w-sm">
                {!isOnline && (
                    <div className="text-center p-3 rounded-lg mb-6 bg-yellow-500/10 text-yellow-300">
                        <p className="font-bold">Site Currently Down</p>
                        <p className="text-sm">Account creation is temporarily unavailable.</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                         <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            placeholder="Display Name"
                            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)', 
                                color: 'var(--color-text-primary)',
                                borderColor: hasError ? '#f43f5e' : 'var(--color-bg-tertiary)',
                            }}
                            required
                            disabled={isLoading || !isOnline}
                            aria-invalid={!!nameError}
                            aria-describedby="name-error"
                        />
                        {nameError && <p id="name-error" className="text-red-500 text-xs mt-1">{nameError}</p>}
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password (min. 6 characters)"
                            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition"
