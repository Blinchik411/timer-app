import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLogStore } from '@/features/analytics/store/useLogStore';
import { getLocalDateString } from '@/features/analytics/utils/calculateStreakTime';
import { formatMinutes } from '@/shared/utils/formatMinutes';
import { formatDate } from '@/shared/utils/formateDate';
import styles from './DayEditor.module.scss';

export const DayEditor: React.FC = () => {
    const todayStr = useMemo(() => getLocalDateString(), []);
    const yesterdayStr = useMemo(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return getLocalDateString(yesterday);
    }, []);

    const [selectedDate, setSelectedDate] = useState<string>(todayStr);
    const [hours, setHours] = useState<string>('');
    const [minutes, setMinutes] = useState<string>('');
    const [feedback, setFeedback] = useState<string | null>(null);

    const sessions = useLogStore((state) => state.sessions);
    const addManualTime = useLogStore((state) => state.addManualTime);
    const setDayTime = useLogStore((state) => state.setDayTime);
    const clearDayTime = useLogStore((state) => state.clearDayTime);

    // Подсчитываем записанное время за выбранный день
    const dayMinutes = useMemo(() => {
        return sessions
            .filter((s) => getLocalDateString(new Date(s.startTime)) === selectedDate)
            .reduce((sum, s) => sum + Math.round(s.duration / 60), 0);
    }, [sessions, selectedDate]);

    // Вычисляем общее введенное время в минутах
    const enteredMinutes = useMemo(() => {
        const h = Math.max(0, parseInt(hours || '0', 10) || 0);
        const m = Math.max(0, parseInt(minutes || '0', 10) || 0);
        return h * 60 + m;
    }, [hours, minutes]);

    // Сброс фидбека по таймеру
    useEffect(() => {
        if (!feedback) return;
        const timer = setTimeout(() => setFeedback(null), 3500);
        return () => clearTimeout(timer);
    }, [feedback]);

    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val === '') {
            setHours('');
            return;
        }
        const num = Math.min(24, parseInt(val, 10));
        setHours(String(num));
    };

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val === '') {
            setMinutes('');
            return;
        }
        const num = Math.min(59, parseInt(val, 10));
        setMinutes(String(num));
    };

    const handleAddPreset = (addH: number, addM: number) => {
        const currentH = parseInt(hours || '0', 10) || 0;
        const currentM = parseInt(minutes || '0', 10) || 0;
        const total = currentH * 60 + currentM + addH * 60 + addM;
        const newH = Math.floor(total / 60);
        const newM = total % 60;
        setHours(newH > 0 ? String(newH) : '');
        setMinutes(newM > 0 ? String(newM) : '');
    };

    const handleAdd = useCallback(() => {
        if (enteredMinutes <= 0) return;

        addManualTime(selectedDate, enteredMinutes);
        setFeedback(`✓ Добавлено ${formatMinutes(enteredMinutes)} на ${formatDate(selectedDate)}`);
        setHours('');
        setMinutes('');
    }, [enteredMinutes, selectedDate, addManualTime]);

    const handleReplace = useCallback(() => {
        if (enteredMinutes <= 0) return;

        setDayTime(selectedDate, enteredMinutes);
        setFeedback(`✓ Установлено ровно ${formatMinutes(enteredMinutes)} на ${formatDate(selectedDate)}`);
        setHours('');
        setMinutes('');
    }, [enteredMinutes, selectedDate, setDayTime]);

    const handleClear = useCallback(() => {
        if (dayMinutes <= 0) return;

        const confirmed = window.confirm(
            `Удалить всю активность (${formatMinutes(dayMinutes)}) за ${formatDate(selectedDate)}?`
        );
        if (confirmed) {
            clearDayTime(selectedDate);
            setFeedback(`✓ Активность за ${formatDate(selectedDate)} очищена`);
        }
    }, [dayMinutes, selectedDate, clearDayTime]);

    return (
        <div className={styles.editorContainer}>
            <h3 className={styles.title}>Редактирование дней</h3>

            <div className={styles.formGrid}>
                {/* Выбор даты */}
                <div className={styles.fieldGroup}>
                    <div className={styles.label}>
                        <span>Дата</span>
                        <div className={styles.quickRow}>
                            <button
                                type="button"
                                className={`${styles.quickBtn} ${selectedDate === todayStr ? styles.active : ''}`}
                                onClick={() => setSelectedDate(todayStr)}
                            >
                                Сегодня
                            </button>
                            <button
                                type="button"
                                className={`${styles.quickBtn} ${selectedDate === yesterdayStr ? styles.active : ''}`}
                                onClick={() => setSelectedDate(yesterdayStr)}
                            >
                                Вчера
                            </button>
                        </div>
                    </div>

                    <div className={styles.dateInputWrapper}>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className={styles.dateInput}
                        />
                    </div>
                </div>

                {/* Ввод времени в формате ЧЧ Мин */}
                <div className={styles.fieldGroup}>
                    <div className={styles.label}>
                        <span>Время (ЧЧ : Мин)</span>
                    </div>

                    <div className={styles.timeInputWrapper}>
                        <div className={styles.timeField}>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="00"
                                value={hours}
                                onChange={handleHoursChange}
                                className={styles.numberInput}
                                aria-label="Часы"
                            />
                            <span className={styles.unitLabel}>ч</span>
                        </div>

                        <span className={styles.colon}>:</span>

                        <div className={styles.timeField}>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="00"
                                value={minutes}
                                onChange={handleMinutesChange}
                                className={styles.numberInput}
                                aria-label="Минуты"
                            />
                            <span className={styles.unitLabel}>мин</span>
                        </div>
                    </div>

                    {/* Быстрые пресеты */}
                    <div className={styles.presetsRow}>
                        <button type="button" className={styles.presetChip} onClick={() => handleAddPreset(0, 30)}>
                            +30 мин
                        </button>
                        <button type="button" className={styles.presetChip} onClick={() => handleAddPreset(1, 0)}>
                            +1 ч
                        </button>
                        <button type="button" className={styles.presetChip} onClick={() => handleAddPreset(2, 0)}>
                            +2 ч
                        </button>
                        <button type="button" className={styles.presetChip} onClick={() => handleAddPreset(4, 0)}>
                            +4 ч
                        </button>
                    </div>
                </div>
            </div>

            {/* Кнопки действий */}
            <div className={styles.actionsRow}>
                <button
                    type="button"
                    className={styles.button}
                    onClick={handleAdd}
                    disabled={enteredMinutes <= 0}
                    title="Прибавить указанные часы и минуты к выбранному дню"
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Добавить время
                </button>

                <button
                    type="button"
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={handleReplace}
                    disabled={enteredMinutes <= 0}
                    title="Установить ровно указанное время за этот день (перезаписать)"
                >
                    Заменить время
                </button>

                {dayMinutes > 0 && (
                    <button
                        type="button"
                        className={`${styles.button} ${styles.danger}`}
                        onClick={handleClear}
                        title="Удалить все записи за этот день"
                    >
                        Сбросить день
                    </button>
                )}
            </div>

            {/* Уведомление об успешном действии */}
            {feedback && (
                <div className={styles.alertSuccess}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{feedback}</span>
                </div>
            )}
        </div>
    );
};
