export const formatMinutes = (totalMinutes: number): string => {
    if (!totalMinutes || totalMinutes <= 0) return '0 мин';

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes} ХУЙ`;
    if (minutes === 0) return `${hours} ч`;

    return `${hours} ч ${minutes} мин`;
};