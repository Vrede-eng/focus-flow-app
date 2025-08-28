import React from 'react';

interface NotificationModalProps {
    title: string;
    message: string;
    onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ title, message, onClose }) => {
    // Automatically close after a delay for a "toast-like" feel, but keep it interactive.
    React.useEffect(() => {
        const timer = setTimeout(() => {
            // It's better not to auto-close something important like a level up.
            // Let the user close it.
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="p-6 rounded-2xl w-full max-w-sm text-center shadow-xl animate-fade-in-up" style={{ backgroundColor: 'var(--color-bg-secondary)' }} onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-accent-primary)' }}>{title}</h2>
                <p className="mb-6" style={{ color: 'var(--color-text-primary)' }}>{message}</p>
                <button
                    onClick={onClose}
                    style={{ background: 'var(--gradient-accent)' }}
                    className="w-full text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                    Continue
                </button>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default NotificationModal;
