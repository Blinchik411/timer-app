import { useEffect, useRef } from 'react';


const COLORS = {
    active: '#2ecc71',
    inactive: '#95a5a6',
    bg: 'transparent'
};

export const useDynamicFavicon = (isRunning: boolean): void => {

    const lastStateRef = useRef<boolean | null>(null);

    useEffect(() => {

        if (lastStateRef.current === isRunning) {
            return;
        }
        lastStateRef.current = isRunning;


        let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }

        // Создаем Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 30;
        canvas.height = 30;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;


        ctx.clearRect(0, 0, canvas.width, canvas.height);


        const circleColor = isRunning ? COLORS.active : COLORS.inactive;


        ctx.fillStyle = circleColor;
        ctx.beginPath();
        ctx.arc(15, 15, 10, 0, 2 * Math.PI);
        ctx.fill();


        link.href = canvas.toDataURL('image/png');
    }, [isRunning]);
};