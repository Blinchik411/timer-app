export const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';

    const [year, month, day] = dateStr.split('-');

    return `${day}.${month}.${year}`;
};