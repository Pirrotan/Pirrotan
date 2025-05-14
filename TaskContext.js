// src/context/TaskContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNextRecurringTask } from '../utils/helpers';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const TaskContext = createContext();

export const useTask = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [calendarIntegrationEnabled, setCalendarIntegrationEnabled] = useState(false);

  // Инициализация уведомлений
  useEffect(() => {
    const configureNotifications = async () => {
      try {
        // Запрос разрешения на отправку уведомлений
        const { status } = await Notifications.requestPermissionsAsync();
        const enabled = status === 'granted';
        setNotificationsEnabled(enabled);
        
        if (enabled) {
          // Настройка обработчика уведомлений
          Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
            }),
          });
        }
      } catch (error) {
        console.error('Ошибка настройки уведомлений:', error);
        setNotificationsEnabled(false);
      }
    };
    
    configureNotifications();
  }, []);

  // Загрузка задач при запуске
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
          console.log('Задачи загружены успешно');
        } else {
          // Демо-данные при первом запуске
          const initialTasks = [
            {
              id: '1',
              title: 'Подготовить презентацию',
              deadline: getISODateString(new Date().setHours(18, 0, 0, 0)),
              priority: 'critical',
              context: 'Работа',
              projectId: '1', // ID проекта "Работа"
              isCompleted: false,
              createdAt: new Date().toISOString(),
              steps: ['Составить план', 'Добавить слайды', 'Подготовить заметки'],
              isRecurring: false,
              recurrencePattern: null,
              notificationTime: 60, // минут до дедлайна
              notificationId: null
            },
            {
              id: '2',
              title: 'Оплатить счет за интернет',
              deadline: getISODateString(new Date()),
              priority: 'important',
              context: 'Финансы',
              projectId: '3', // ID проекта "Дом"
              isCompleted: false,
              createdAt: new Date().toISOString(),
              isRecurring: true,
              recurrencePattern: 'monthly',
              notificationTime: 120, // минут до дедлайна
              notificationId: null
            },
            {
              id: '3',
              title: 'Купить продукты',
              deadline: null,
              priority: 'normal',
              context: 'Личное',
              projectId: '2', // ID проекта "Личное"
              isCompleted: true,
              createdAt: new Date().toISOString(),
              isRecurring: false,
              recurrencePattern: null,
              notificationTime: 30, // минут до дедлайна
              notificationId: null
            },
          ];
          setTasks(initialTasks);
          
          // Сохраняем демо-данные в AsyncStorage
          await saveTasksToStorage(initialTasks);
          console.log('Установлены демо-данные задач');
          
          // Планируем уведомления для демо-задач
          if (notificationsEnabled) {
            initialTasks.forEach(async task => {
              if (!task.isCompleted && task.deadline) {
                await scheduleTaskNotification(task);
              }
            });
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки задач:', error);
        setError('Не удалось загрузить задачи. Пожалуйста, перезапустите приложение');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [notificationsEnabled]);

  // Сохранение задач в AsyncStorage
  const saveTasksToStorage = async (tasksToSave) => {
    try {
      const jsonTasks = JSON.stringify(tasksToSave);
      await AsyncStorage.setItem('tasks', jsonTasks);
      console.log('Задачи успешно сохранены в хранилище');
      return true;
    } catch (error) {
      console.error('Ошибка сохранения задач:', error);
      setError('Не удалось сохранить изменения');
      return false;
    }
  };

  // Вспомогательная функция для получения строки ISO даты
  const getISODateString = (date) => {
    return new Date(date).toISOString();
  };

  // Форматирование дедлайна для уведомления
  const formatDeadlineForNotification = (deadline) => {
    try {
      const date = new Date(deadline);
      return date.toLocaleString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return deadline;
    }
  };

  // Планирование уведомления для задачи
  const scheduleTaskNotification = async (task) => {
    if (!notificationsEnabled || !task.deadline || task.isCompleted) {
      return null;
    }
    
    try {
      // Отменяем существующее уведомление, если оно есть
      if (task.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(task.notificationId);
      }
      
      const deadlineDate = new Date(task.deadline);
      const notificationDate = new Date(deadlineDate);
      
      // Устанавливаем время уведомления (по умолчанию за 30 минут до дедлайна)
      const minutesBefore = task.notificationTime || 30;
      notificationDate.setMinutes(notificationDate.getMinutes() - minutesBefore);
      
      // Проверяем, не наступило ли уже время уведомления
      if (notificationDate <= new Date()) {
        console.log('Время уведомления уже прошло для задачи:', task.title);
        return null;
      }
      
      // Планируем уведомление
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Напоминание: ${task.title}`,
          body: `Срок выполнения: ${formatDeadlineForNotification(task.deadline)}`,
          data: { type: 'task', taskId: task.id, priority: task.priority },
        },
        trigger: notificationDate,
      });
      
      console.log(`Запланировано уведомление для задачи ${task.title}, ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Ошибка при планировании уведомления:', error);
      return null;
    }
  };

  // Добавление задачи в календарь устройства
  const addTaskToCalendar = async (task) => {
    if (!calendarIntegrationEnabled || !task.deadline) {
      return null;
    }
    
    try {
      // Здесь будет код для добавления в календарь
      // В реальном приложении потребуется expo-calendar
      return "event-id-" + Date.now();
    } catch (error) {
      console.error('Ошибка при добавлении задачи в календарь:', error);
      return null;
    }
  };

  // Сохранение задач при изменении с использованием useCallback
  const saveTasks = useCallback(async (updatedTasks) => {
    setLoading(true);
    
    try {
      const success = await saveTasksToStorage(updatedTasks);
      if (success) {
        setTasks(updatedTasks);
        setError(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка сохранения задач:', error);
      setError('Не удалось сохранить изменения');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Добавление новой задачи с улучшенной обработкой ошибок
  const addTask = useCallback(async (task) => {
    try {
      // Добавляем проверки для обязательных полей
      if (!task.title || task.title.trim() === '') {
        throw new Error('Название задачи не может быть пустым');
      }
      
      const newTask = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        notificationId: null,
      };
      
      // Планируем уведомление, если есть дедлайн и уведомления включены
      if (notificationsEnabled && newTask.deadline) {
        const notificationId = await scheduleTaskNotification(newTask);
        newTask.notificationId = notificationId;
      }
      
      // Добавляем задачу в календарь, если интеграция включена
      if (calendarIntegrationEnabled && newTask.deadline) {
        const eventId = await addTaskToCalendar(newTask);
        newTask.calendarEventId = eventId;
      }
      
      const updatedTasks = [...tasks, newTask];
      const success = await saveTasks(updatedTasks);
      
      if (success) {
        console.log('Добавлена новая задача:', newTask);
        return newTask;
      }
      return null;
    } catch (error) {
      console.error('Ошибка при добавлении задачи:', error);
      setError(error.message || 'Не удалось добавить задачу');
      return null;
    }
  }, [tasks, saveTasks, notificationsEnabled, calendarIntegrationEnabled]);

  // Быстрое добавление срочной задачи
  const quickAddTask = useCallback(async (title, projectId = null) => {
    try {
      if (!title || title.trim() === '') {
        throw new Error('Название задачи не может быть пустым');
      }
      
      // Создаем задачу с критическим приоритетом и дедлайном на сегодня
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Конец текущего дня
      
      const newTask = {
        title: title.trim(),
        priority: 'critical',
        deadline: today.toISOString(),
        context: 'Срочно',
        projectId: projectId,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        isRecurring: false,
        recurrencePattern: null,
        notificationTime: 15, // Уведомление через 15 минут
        notificationId: null,
      };
      
      return await addTask(newTask);
    } catch (error) {
      console.error('Ошибка при быстром добавлении задачи:', error);
      setError(error.message || 'Не удалось добавить срочную задачу');
      return null;
    }
  }, [addTask]);

  // Обновление существующей задачи с улучшенной обработкой ошибок
  const updateTask = useCallback(async (updatedTask) => {
    try {
      // Проверяем, существует ли задача с таким id
      const existingTask = tasks.find(task => task.id === updatedTask.id);
      if (!existingTask) {
        throw new Error('Задача не найдена');
      }
      
      // Проверка обязательных полей
      if (!updatedTask.title || updatedTask.title.trim() === '') {
        throw new Error('Название задачи не может быть пустым');
      }
      
      // Обрабатываем изменение статуса задачи
      if (existingTask.isCompleted !== updatedTask.isCompleted) {
        // Если задача была завершена и это повторяющаяся задача
        if (!existingTask.isCompleted && updatedTask.isCompleted && updatedTask.isRecurring) {
          // Создаем следующий экземпляр задачи
          const nextTask = createNextRecurringTask(updatedTask);
          if (nextTask) {
            // Планируем уведомление для новой задачи
            if (notificationsEnabled && nextTask.deadline) {
              const notificationId = await scheduleTaskNotification(nextTask);
              nextTask.notificationId = notificationId;
            }
            
            // Добавляем задачу в календарь
            if (calendarIntegrationEnabled && nextTask.deadline) {
              const eventId = await addTaskToCalendar(nextTask);
              nextTask.calendarEventId = eventId;
            }
            
            // Добавляем новую задачу в список
            const tasksWithNext = [...tasks.filter(task => task.id !== updatedTask.id), updatedTask, nextTask];
            const success = await saveTasks(tasksWithNext);
            
            if (success) {
              console.log('Задача обновлена и создана следующая повторяющаяся:', nextTask);
              return updatedTask;
            }
            return null;
          }
        }
        
        // Отменяем уведомление, если задача завершена
        if (updatedTask.isCompleted && updatedTask.notificationId) {
          try {
            await Notifications.cancelScheduledNotificationAsync(updatedTask.notificationId);
            updatedTask.notificationId = null;
          } catch (e) {
            console.error('Ошибка при отмене уведомления:', e);
          }
        }
      }
      
      // Проверяем, изменился ли дедлайн
      const deadlineChanged = existingTask.deadline !== updatedTask.deadline;
      
      // Обновляем уведомление, если дедлайн изменился и задача не завершена
      if (deadlineChanged && !updatedTask.isCompleted && notificationsEnabled) {
        // Отменяем старое уведомление
        if (existingTask.notificationId) {
          try {
            await Notifications.cancelScheduledNotificationAsync(existingTask.notificationId);
          } catch (e) {
            console.error('Ошибка при отмене старого уведомления:', e);
          }
        }
        
        // Планируем новое уведомление
        if (updatedTask.deadline) {
          const notificationId = await scheduleTaskNotification(updatedTask);
          updatedTask.notificationId = notificationId;
        }
      }
      
      const updatedTasks = tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      
      const success = await saveTasks(updatedTasks);
      
      if (success) {
        console.log('Задача обновлена:', updatedTask);
        return updatedTask;
      }
      return null;
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
      setError(error.message || 'Не удалось обновить задачу');
      return null;
    }
  }, [tasks, saveTasks, notificationsEnabled, calendarIntegrationEnabled]);

  // Удаление задачи с улучшенной обработкой ошибок
  const deleteTask = useCallback(async (taskId) => {
    try {
      // Проверяем, существует ли задача с таким id
      const taskToDelete = tasks.find(task => task.id === taskId);
      if (!taskToDelete) {
        throw new Error('Задача не найдена');
      }
      
      // Отменяем уведомление, если оно есть
      if (taskToDelete.notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(taskToDelete.notificationId);
        } catch (e) {
          console.error('Ошибка при отмене уведомления:', e);
        }
      }
      
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      const success = await saveTasks(filteredTasks);
      
      if (success) {
        console.log('Задача удалена, ID:', taskId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      setError(error.message || 'Не удалось удалить задачу');
      return false;
    }
  }, [tasks, saveTasks]);

  // Переключение статуса завершения задачи с улучшенной обработкой ошибок
  const toggleTaskComplete = useCallback(async (taskId) => {
    try {
      // Проверяем, существует ли задача с таким id
      const taskToToggle = tasks.find(task => task.id === taskId);
      if (!taskToToggle) {
        throw new Error('Задача не найдена');
      }
      
      // Создаем обновленную версию задачи
      const updatedTask = { 
        ...taskToToggle, 
        isCompleted: !taskToToggle.isCompleted 
      };
      
      // Используем updateTask для обработки всех последствий изменения статуса
      return await updateTask(updatedTask);
    } catch (error) {
      console.error('Ошибка при изменении статуса задачи:', error);
      setError(error.message || 'Не удалось изменить статус задачи');
      return null;
    }
  }, [tasks, updateTask]);

  // Включение/отключение уведомлений
  const setNotifications = useCallback(async (enabled) => {
    try {
      if (enabled) {
        // Запрос разрешения на отправку уведомлений
        const { status } = await Notifications.requestPermissionsAsync();
        const permissionGranted = status === 'granted';
        
        if (permissionGranted) {
          setNotificationsEnabled(true);
          
          // Перепланируем уведомления для существующих задач
          tasks.forEach(async task => {
            if (!task.isCompleted && task.deadline) {
              const notificationId = await scheduleTaskNotification(task);
              if (notificationId) {
                // Обновляем задачу с новым ID уведомления
                const updatedTask = { ...task, notificationId };
                const updatedTasks = tasks.map(t => 
                  t.id === task.id ? updatedTask : t
                );
                await saveTasks(updatedTasks);
              }
            }
          });
          
          return true;
        } else {
          setNotificationsEnabled(false);
          setError('Разрешение на уведомления не предоставлено');
          return false;
        }
      } else {
        setNotificationsEnabled(false);
        
        // Отменяем все запланированные уведомления
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        for (const notification of scheduledNotifications) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
        
        // Обновляем задачи, удаляя ID уведомлений
        const updatedTasks = tasks.map(task => ({
          ...task,
          notificationId: null
        }));
        
        await saveTasks(updatedTasks);
        return true;
      }
    } catch (error) {
      console.error('Ошибка при изменении настроек уведомлений:', error);
      setError('Не удалось изменить настройки уведомлений');
      return false;
    }
  }, [tasks, saveTasks]);

  // Включение/отключение интеграции с календарем
  const setCalendarIntegration = useCallback(async (enabled) => {
    try {
      setCalendarIntegrationEnabled(enabled);
      return true;
    } catch (error) {
      console.error('Ошибка при изменении настроек интеграции с календарем:', error);
      setError('Не удалось изменить настройки интеграции с календарем');
      return false;
    }
  }, [tasks, saveTasks]);

  // Очистка ошибок
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Значение контекста с улучшенной обработкой ошибок
  const value = {
    tasks,
    loading,
    error,
    notificationsEnabled,
    calendarIntegrationEnabled,
    addTask,
    quickAddTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    setNotifications,
    setCalendarIntegration,
    clearError
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};