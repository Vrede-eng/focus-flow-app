

import React, { useState } from 'react';

interface LoginPageProps {
    onLogin: (name: string, password: string) => Promise<string | null>;
    switchToSignup: () => void;
    isOnline: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, switchToSignup, isOnline }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name && password && !isLoading) {
            if (!isOnline && name.toLowerCase() !== 'admin') {
                setError("Sign in is currently unavailable. The app is in offline mode.");
                return;
            }

            setIsLoading(true);
            setError(null);
            const errorMessage = await onLogin(name, password);
            setIsLoading(false);
            if (errorMessage) {
                setError(errorMessage);
            }
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-6">
             <div className="text-center absolute top-16">
                 <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-secondary)' }}>FocusFlow</h2>
             </div>
             <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>Welcome Back</h1>
                <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Sign in to continue your progress.</p>
            </div>
            <div className="w-full max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Username"
                            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)', 
                                color: 'var(--color-text-primary)',
                                borderColor: error ? '#f43f5e' : 'var(--color-bg-tertiary)',
                            }}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition"
                             style={{
                                backgroundColor: 'var(--color-bg-secondary)', 
                                color: 'var(--color-text-primary)',
                                borderColor: error ? '#f43f5e' : 'var(--color-bg-tertiary)',
                            }}
                            required
                            disabled={isLoading}
                        />
                    </div>
                     {error && (
                        <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-lg">
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        style={{ background: 'var(--gradient-accent)' }}
                        className="w-full text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                <p className="text-center text-sm mt-8" style={{ color: 'var(--color-text-secondary)' }}>
                    Don't have an account?{' '}
                    <button onClick={switchToSignup} className="font-semibold hover:opacity-80" style={{color: 'var(--color-accent-primary)'}}>
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
