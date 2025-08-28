import React from 'react';

// A collection of simple, distinct SVG avatars.
const avatarSvgs: { [key: string]: React.ReactNode } = {
    'avatar-1': <svg viewBox="0 0 36 36"><path fill="#FFC107" d="M36 18c0 9.941-8.059 18-18 18S0 27.941 0 18 8.059 0 18 0s18 8.059 18 18"></path><path fill="#9C27B0" d="M18 25c-6.075 0-11-4.925-11-11S11.925 3 18 3s11 4.925 11 11-4.925 11-11 11z"></path></svg>,
    'avatar-2': <svg viewBox="0 0 36 36"><path fill="#4CAF50" d="M18 36c9.941 0 18-8.059 18-18S27.941 0 18 0 0 8.059 0 18s8.059 18 18 18z"></path><rect fill="#FFF" x="12" y="12" width="12" height="12" rx="3"></rect></svg>,
    'avatar-3': <svg viewBox="0 0 36 36"><path fill="#2196F3" d="M18 0L36 18 18 36 0 18z"></path><circle fill="#FFF" cx="18" cy="18" r="6"></circle></svg>,
    'avatar-4': <svg viewBox="0 0 36 36"><path fill="#F44336" d="M0 0h36v36H0z"></path><path fill="#FFF" d="M18 10l-6 12h12z"></path></svg>,
    'avatar-5': <svg viewBox="0 0 36 36"><rect fill="#9E9E9E" width="36" height="36" rx="18"></rect><path fill="#FFF" d="M18 11l8 14H10z" transform="rotate(180 18 18)"></path></svg>,
    'avatar-6': <svg viewBox="0 0 36 36"><path fill="#E91E63" d="M18 36l-18-18L18 0l18 18z"></path><path fill="#FFF" d="M18 13l5 5-5 5-5-5z"></path></svg>,
    'avatar-7': <svg viewBox="0 0 36 36"><path fill="#00BCD4" d="M36 18c0 9.941-8.059 18-18 18S0 27.941 0 18 8.059 0 18 0s18 8.059 18 18"></path><path fill="#FFF" d="M12 18h12v2H12zM12 14h12v2H12zM12 22h12v2H12z"></path></svg>,
    'avatar-8': <svg viewBox="0 0 36 36"><path fill="#CDDC39" d="M0 18C0 8.059 8.059 0 18 0s18 8.059 18 18v18H0z"></path><circle fill="#333" cx="13" cy="15" r="3"></circle><circle fill="#333" cx="23" cy="15" r="3"></circle></svg>,
    'avatar-9': <svg viewBox="0 0 36 36"><path fill="#795548" d="M18 0L33 9v18l-15 9L3 27V9z"></path><path fill="#FFF" d="M18 5L28 11v14l-10 6-10-6V11z"></path></svg>,
    'avatar-10': <svg viewBox="0 0 36 36"><path fill="#FF9800" d="M0 36L36 0H0v36z"></path><path fill="#FFF" d="M10 10h6v6h-6z"></path></svg>,
    'avatar-11': <svg viewBox="0 0 36 36"><path fill="#673AB7" d="M18 0 C18 0 36 0 36 18 S18 36 18 36 0 36 0 18 18 0 18 0z"></path><path fill="#FFF" d="M18 12 L22 18 L18 24 L14 18 Z"></path></svg>,
    'avatar-12': <svg viewBox="0 0 36 36"><path fill="#03A9F4" d="M0 0 L18 18 L0 36 Z M18 18 L36 0 V36 Z"></path></svg>,
    'avatar-13': <svg viewBox="0 0 36 36"><path fill="#8BC34A" d="M18 36c9.941 0 18-8.059 18-18S27.941 0 18 0 0 8.059 0 18s8.059 18 18 18z"></path><path fill="#FFF" d="M25 13 L11 13 11 11 25 11 Z M25 18 L11 18 11 16 25 16 Z M25 23 L11 23 11 21 25 21 Z"></path></svg>,
    'avatar-14': <svg viewBox="0 0 36 36"><path fill="#FF5722" d="M18 36c9.941 0 18-8.059 18-18S27.941 0 18 0 0 8.059 0 18s8.059 18 18 18z"></path><path fill="#FFF" d="M17 17h-5v-5h5v5zm7 0h-5v-5h5v5zm-7 7h-5v-5h5v5zm7 0h-5v-5h5v5z"></path></svg>,
    'avatar-15': <svg viewBox="0 0 36 36"><rect fill="#607D8B" width="36" height="36" rx="5"></rect><circle cx="18" cy="18" r="10" fill="none" stroke="#FFF" strokeWidth="3"></circle></svg>,
    'avatar-16': <svg viewBox="0 0 36 36"><path fill="#009688" d="M18 36c9.941 0 18-8.059 18-18S27.941 0 18 0 0 8.059 0 18s8.059 18 18 18z"></path><path fill="#FFF" d="M12 12h12v12H12z" transform="rotate(45 18 18)"></path></svg>,
    'avatar-17': <svg viewBox="0 0 36 36"><path fill="#FFEB3B" d="M18 36c9.941 0 18-8.059 18-18S27.941 0 18 0 0 8.059 0 18s8.059 18 18 18z"></path><path fill="#3F51B5" d="M18 2.055C13.62 2.055 10 7.82 10 18s3.62 15.945 8 15.945S26 28.18 26 18 22.38 2.055 18 2.055z"></path></svg>,
    'avatar-18': <svg viewBox="0 0 36 36"><path fill="#FF5722" d="M18,0 A18,18 0 0,1 36,18 L18,18 Z"></path><path fill="#2196F3" d="M36,18 A18,18 0 0,1 18,36 L18,18 Z"></path><path fill="#4CAF50" d="M18,36 A18,18 0 0,1 0,18 L18,18 Z"></path><path fill="#FFC107" d="M0,18 A18,18 0 0,1 18,0 L18,18 Z"></path></svg>,
    'avatar-19': <svg viewBox="0 0 36 36"><path fill="#9C27B0" d="M18 36c9.941 0 18-8.059 18-18S27.941 0 18 0 0 8.059 0 18s8.059 18 18 18z"></path><path fill="#FFF" d="M18,18 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 M18,8 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 M18,28 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0"></path></svg>,
    'avatar-20': <svg viewBox="0 0 36 36"><path fill="#3F51B5" d="M18 36c9.941 0 18-8.059 18-18S27.941 0 18 0 0 8.059 0 18s8.059 18 18 18z"></path><path stroke="#FFF" strokeWidth="2" d="M10 13L26 13 M10 18L26 18 M10 23L26 23"></path></svg>,
};


const PredefinedAvatar: React.FC<{ avatarId: string }> = ({ avatarId }) => {
    return avatarSvgs[avatarId] || null;
};

export default PredefinedAvatar;
