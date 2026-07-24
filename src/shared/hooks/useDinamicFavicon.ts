// src/shared/hooks/useDynamicFavicon.ts
import { useEffect } from 'react';

export const useDynamicFavicon = (isRunning: boolean): void => {
    useEffect(() => {
        let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");

        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }

        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Отрисовка темного фона
        ctx.fillStyle = '#1e1e2e';
        ctx.beginPath();
        ctx.arc(16, 16, 15, 0, 2 * Math.PI);
        ctx.fill();

        // Отрисовка символа
        ctx.fillStyle = '#cba6f7';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('C', 13, 16);

        // Зеленая точка активности
        if (isRunning) {
            ctx.fillStyle = '#1e1e2e';
            ctx.beginPath();
            ctx.arc(24, 24, 6, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = '#a6e3a1';
            ctx.beginPath();
            ctx.arc(24, 24, 4.5, 0, 2 * Math.PI);
            ctx.fill();
        }

        link.href = canvas.toDataURL('image/png');
    }, [isRunning]);
};

export default useDynamicFavicon