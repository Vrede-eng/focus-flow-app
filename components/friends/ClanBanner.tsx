
import React from 'react';

// A collection of simple, distinct SVG icons for clan banners.
export const PREDEFINED_BANNERS: { [key: string]: React.ReactNode } = {
    'icon-1': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.27l-6.18 3.75L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    'icon-2': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    'icon-3': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 00-3.32 19.33M12 2a10 10 0 013.32 19.33"/></svg>,
    'icon-4': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8.3c-1.4-1.4-3.5-1.4-4.9 0l-3.3 3.3c-.6.6-.6 1.6 0 2.2l4.9 4.9c.6.6 1.6.6 2.2 0l3.3-3.3c1.4-1.4 1.4-3.5 0-4.9l-1.1-1.1z"/></svg>,
    'icon-5': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
};

interface ClanBannerProps {
    banner: string;
    className?: string;
    isProfileBanner?: boolean;
}

const ClanBanner: React.FC<ClanBannerProps> = ({ banner, className, isProfileBanner = false }) => {
    const isCustom = banner.startsWith('data:image/');
    const isPredefined = banner.startsWith('icon-');

    if (isCustom) {
        const style: React.CSSProperties = isProfileBanner ? { objectFit: 'cover' } : {};
        return <img src={banner} alt="Clan Banner" className={className} style={style} />;
    }

    if (isPredefined && PREDEFINED_BANNERS[banner]) {
        if (isProfileBanner) {
            // For profile headers, we create a tiled SVG pattern background
            const svgElement = PREDEFINED_BANNERS[banner] as React.ReactElement<any>;
            
            // Handle both single and multiple children for the SVG
            const children = Array.isArray(svgElement.props.children) 
                ? svgElement.props.children 
                : [svgElement.props.children];
            
            const svgPath = children
                .filter(Boolean) // Filter out any null/undefined children
                .map((p: any) => p.props.d)
                .join(' ');

            const patternSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'><path d='${svgPath}' fill='none' stroke='${'var(--color-accent-primary)'}' stroke-width='1' opacity='0.1'/></svg>`;
            const backgroundImageUrl = `url("data:image/svg+xml,${encodeURIComponent(patternSvg)}")`;
            
            return (
                <div 
                    className={className} 
                    style={{ 
                        backgroundColor: 'var(--color-bg-tertiary)',
                        backgroundImage: backgroundImageUrl
                    }}
                />
            );
        }

        // For regular display (e.g., in lists)
        return (
            <div className={`${className} flex items-center justify-center`} style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <div className="w-full h-full p-1 sm:p-2" style={{ color: 'var(--color-accent-primary)' }}>
                    {PREDEFINED_BANNERS[banner]}
                </div>
            </div>
        );
    }
    
    // Fallback for unknown banner ID
    return (
        <div className={`${className} flex items-center justify-center`} style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <span className="font-bold text-lg" style={{ color: 'var(--color-accent-primary)' }}>?</span>
        </div>
    );
};

export default ClanBanner;
