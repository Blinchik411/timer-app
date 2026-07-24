// src/shared/hooks/useDynamicFavicon.ts
import { useEffect, useRef } from 'react';

// Определяем цвета как константы, чтобы их было легко менять
const COLORS = {
    active: '#2ecc71', // Яркий зеленый
    inactive: '#95a5a6', // Нейтральный серый
    bg: 'transparent' // Прозрачный фон
};

export const useDynamicFavicon = (isRunning: boolean): void => {
    // Защита от лишних отрисовок
    const lastStateRef = useRef<boolean | null>(null);

    useEffect(() => {
        // Если состояние не изменилось, ничего не рисуем
        if (lastStateRef.current === isRunning) {
            return;
        }
        lastStateRef.current = isRunning;

        // Находим или создаем тег иконки
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

        // Очищаем Canvas перед отрисовкой
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Выбираем цвет в зависимости от статуса таймера
        const circleColor = isRunning ? COLORS.active : COLORS.inactive;

        // Рисуем простой залитый круг
        // (чуть меньше 32px, чтобы были небольшие отступы от краев вкладки)
        ctx.fillStyle = circleColor;
        ctx.beginPath();
        ctx.arc(16, 16, 14, 0, 2 * Math.PI); // x, y, radius, startAngle, endAngle
        ctx.fill();

        // Обновляем Favicon в браузере
        link.href = canvas.toDataURL('image/png');
    }, [isRunning]);
};