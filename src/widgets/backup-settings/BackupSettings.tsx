import React, { useRef, useState, useEffect } from 'react'
import { exportUserData, importUserData, type BackupResult } from '@/shared/utils/backup'
import styles from './BackupSettings.module.scss'

export const BackupSettings: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [feedback, setFeedback] = useState<BackupResult | null>(null)

  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), 4000)
    return () => clearTimeout(timer)
  }, [feedback])

  const handleExport = async () => {
    const result = await exportUserData()
    setFeedback(result)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const confirmed = window.confirm(
        'Вы уверены? Текущие данные будут полностью заменены данными из файла бэкапа.',
      )
      if (confirmed) {
        const result = await importUserData(file)
        if (!result.success) {
          setFeedback(result)
        }
      }
    }
    event.target.value = ''
  }

  return (
    <div className={styles.backupContainer}>
      <h3 className={styles.title}>Резервное копирование данных</h3>

      <div className={styles.buttonGroup}>
        <button type="button" className={styles.button} onClick={handleExport}>
          Скачать резервную копию (.json)
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className={styles.fileInput}
        />

        <button
          type="button"
          className={`${styles.button} ${styles.secondary}`}
          onClick={() => fileInputRef.current?.click()}
        >
          Загрузить из бэкапа
        </button>
      </div>

      {feedback && (
        <div className={`${styles.feedback} ${feedback.success ? styles.success : styles.error}`}>
          {feedback.message}
        </div>
      )}
    </div>
  )
}
