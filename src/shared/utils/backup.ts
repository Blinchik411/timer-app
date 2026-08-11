import { get, set } from 'idb-keyval';

// Ключ, под которым Zustand сpersist'ил данные в IndexedDB
const STORAGE_KEY = 'coder-tracker-storage';

/**
 * Экспорт: скачивает JSON-файл с сохраненными данными из IndexedDB
 */
export const exportUserData = async (): Promise<void> => {
    try {
        const data = await get(STORAGE_KEY);

        if (!data) {
            alert('Нет данных для экспорта');
            return;
        }

        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `coder-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Ошибка при экспорте:', error);
        alert('Не удалось экспортировать данные');
    }
};

/**
 * Импорт: читает JSON-файл и перезаписывает IndexedDB
 */
export const importUserData = async (file: File): Promise<void> => {
    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            const content = e.target?.result as string;

            // Проверяем валидность JSON перед записью
            JSON.parse(content);

            // Записываем строковый JSON обратно в IndexedDB под нужным ключом
            await set(STORAGE_KEY, content);

            // Перезагружаем страницу, чтобы Zustand при старте перечитал IndexedDB
            window.location.reload();
        } catch (err) {
            console.error('Ошибка при импорте:', err);
            alert('Ошибка при импорте: невалидный файл бэкапа');
        }
    };

    reader.readAsText(file);
};