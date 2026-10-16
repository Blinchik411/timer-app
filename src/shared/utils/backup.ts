import { get, set } from 'idb-keyval'
import { format } from 'date-fns'

// Ключ, под которым Zustand сpersist'ил данные в IndexedDB
const STORAGE_KEY = 'coder-tracker-storage'

export interface BackupResult {
  success: boolean
  message: string
}

/**
 * Экспорт: скачивает JSON-файл с сохраненными данными из IndexedDB
 */
export const exportUserData = async (): Promise<BackupResult> => {
  try {
    const data = await get(STORAGE_KEY)

    if (!data) {
      return {
        success: false,
        message: 'Нет сохранённых данных для экспорта',
      }
    }

    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `coder-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    link.click()


    URL.revokeObjectURL(url)
    return {
      success: true,
      message: 'Резервная копия успешно экспортирована',
    }
  } catch (error) {
    console.error('Ошибка при экспорте:', error)
    return {
      success: false,
      message: 'Не удалось экспортировать данные',
    }
  }
}

/**
 * Импорт: читает JSON-файл и перезаписывает IndexedDB с валидацией структуры
 */
export const importUserData = async (file: File): Promise<BackupResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const rawContent = e.target?.result
        if (typeof rawContent !== 'string') {
          resolve({
            success: false,
            message: 'Не удалось прочитать содержимое файла',
          })
          return
        }

        // Проверяем валидность структуры JSON перед записью в IndexedDB
        const parsed: unknown = JSON.parse(rawContent)
        if (!parsed || typeof parsed !== 'object') {
          resolve({
            success: false,
            message: 'Ошибка при импорте: невалидная структура данных',
          })
          return
        }

        // Записываем строковый JSON обратно в IndexedDB
        await set(STORAGE_KEY, rawContent)

        // Перезагружаем страницу, чтобы Zustand при старте гидрировал свежие данные
        window.location.reload()
        resolve({
          success: true,
          message: 'Данные успешно восстановлены',
        })
      } catch (err) {
        console.error('Ошибка при импорте:', err)
        resolve({
          success: false,
          message: 'Ошибка при импорте: невалидный JSON файл',
        })
      }
    }

    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Ошибка чтения файла бэкапа',
      })
    }

    reader.readAsText(file)
  })
}
