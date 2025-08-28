import React from 'react';

interface AgreementModalProps {
    isOpen: boolean;
    onAgree: () => void;
    isReviewOnly?: boolean;
}

const AgreementModal: React.FC<AgreementModalProps> = ({ isOpen, onAgree, isReviewOnly = false }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            aria-modal="true"
            role="dialog"
        >
            <div
                className="p-6 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] flex flex-col"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
                <h2 className="text-xl font-bold mb-4 flex-shrink-0" style={{ color: 'var(--color-text-primary)' }}>
                    Community Guidelines
                </h2>
                <div className="space-y-4 text-sm overflow-y-auto pr-2" style={{ color: 'var(--color-text-secondary)' }}>
                    <p>Welcome to FocusFlow! To ensure a positive and productive environment for everyone, please agree to the following guidelines:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            <strong style={{ color: 'var(--color-text-primary)' }}>Be Respectful:</strong> Treat all users with kindness and respect. Harassment, hate speech, or bullying will not be tolerated.
                        </li>
                        <li>
                            <strong style={{ color: 'var(--color-text-primary)' }}>Appropriate Content:</strong> Do not upload any content that is offensive, explicit, illegal, or infringes on copyright. This includes avatars, hats, pets, profile backgrounds, and any files shared with the AI.
                        </li>
                        <li>
                            <strong style={{ color: 'var(--color-text-primary)' }}>Stay on Topic:</strong> Keep discussions in public areas like clan chats focused on studying and personal growth.
                        </li>
                    </ul>
                    <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        By continuing, you agree to abide by these rules. Failure to do so may result in account suspension.
                    </p>
                </div>
                <div className="flex justify-end mt-6 flex-shrink-0">
                    <button
                        onClick={onAgree}
                        className="px-6 py-2 rounded-lg text-white font-semibold transition"
                        style={{ background: 'var(--gradient-accent)' }}
                    >
                        {isReviewOnly ? 'Close' : 'I Agree & Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgreementModal;
