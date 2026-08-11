import React, { useRef } from 'react';
import { exportUserData, importUserData } from '@/shared/utils/backup';
import styles from './BackupSettings.module.scss';

export const BackupSettings: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const confirmed = window.confirm(
                'Вы уверены? Текущие данные будут полностью заменены данными из файла бэкапа.'
            );
            if (confirmed) {
                await importUserData(file);
            }
        }
        event.target.value = '';
    };

    return (
        <div className={styles.backupContainer}>
            <h3 className={styles.title}>Резервное копирование данных</h3>

            <div className={styles.buttonGroup}>
                {/* Кнопка экспорта (главная фиолетовая) */}
                <button type="button" className={styles.button} onClick={exportUserData}>
                    Скачать резервную копию (.json)
                </button>

                {/* Скрытый input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className={styles.fileInput}
                />

                {/* Кнопка импорта (второстепенная тёмно-серая) */}
                <button
                    type="button"
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    Загрузить из бэкапа
                </button>
            </div>
        </div>
    );
};