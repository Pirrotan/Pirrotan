// src/utils/helpers.js - расширенная версия для работы с повторяющимися задачами
import Colors from '../constants/colors';

// Генерация случайного цвета для проектов
export const generateRandomColor = () => {
  const colors = [
    '#6750A4', // фиолетовый
    '#5468FF', // синий
    '#F44336', // красный
    '#4CAF50', // зеленый
    '#2196F3', // голубой
    '#9C27B0', // пурпурный
    '#FF9800', // оранжевый
    '#607D8B', // серый
    '#E91E63', // розовый
    '#3F51B5'  // индиго
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

// Форматирование даты в человеко-читаемом виде
export const formatDate = (date) => {
  if (!date) return '';
  
  // Проверяем, является ли дата строкой с определенным форматом (например, "Сегодня")
  if (typeof date === 'string' && !date.includes('-') && !date.includes('/')) {
    return date;
  }
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return date; // Если не можем преобразовать, возвращаем как есть
    }
    
    // Сегодняшняя дата для сравнения
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Завтрашняя дата для сравнения
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Вчерашняя дата для сравнения
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Начало текущей недели
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Преобразуем входную дату к началу дня для корректного сравнения
    const inputDate = new Date(dateObj);
    inputDate.setHours(0, 0, 0, 0);
    
    // Сравниваем даты
    if (inputDate.getTime() === today.getTime()) {
      return 'Сегодня';
    } else if (inputDate.getTime() === tomorrow.getTime()) {
      return 'Завтра';
    } else if (inputDate.getTime() === yesterday.getTime()) {
      return 'Вчера';
    } else if (inputDate > today && inputDate < new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)) {
      // Если дата на этой неделе, возвращаем день недели
      const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
      return days[inputDate.getDay()];
    } else {
      // Иначе возвращаем полную дату
      const day = inputDate.getDate();
      
      const monthNames = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];
      
      const month = monthNames[inputDate.getMonth()];
      
      // Добавляем год только если он отличается от текущего
      if (inputDate.getFullYear() !== today.getFullYear()) {
        return `${day} ${month} ${inputDate.getFullYear()}`;
      } else {
        return `${day} ${month}`;
      }
    }
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return date; // В случае ошибки возвращаем исходное значение
  }
};

// Определение приоритетности задачи по цвету
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'critical':
      return Colors.critical;
    case 'important':
      return Colors.important;
    case 'normal':
      return Colors.normal;
    case 'low':
      return Colors.low;
    default:
      return Colors.normal;
  }
};

// Предсказание времени завершения задачи на основе приоритета и дедлайна
export const predictCompletionTime = (task) => {
  const { priority, deadline } = task;
  
  // Определяем базовое время на основе приоритета
  let baseHours;
  switch (priority) {
    case 'critical':
      baseHours = 1; // Критические задачи нужно делать быстро
      break;
    case 'important':
      baseHours = 2;
      break;
    case 'normal':
      baseHours = 4;
      break;
    case 'low':
      baseHours = 8;
      break;
    default:
      baseHours = 4;
  }
  
  // Если есть дедлайн, корректируем время
  if (deadline) {
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      
      // Разница в миллисекундах
      const diffMs = deadlineDate - now;
      
      if (isNaN(diffMs)) {
        return baseHours;
      }
      
      // Разница в часах
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours < 0) {
        // Дедлайн уже прошел
        return 0.5; // Срочно надо сделать
      } else if (diffHours < baseHours) {
        // Дедлайн ближе, чем базовое время
        return Math.max(0.5, diffHours * 0.9); // Немного меньше, чем до дедлайна
      } else {
        // Дедлайн далеко
        return baseHours;
      }
    } catch (error) {
      console.error('Ошибка при предсказании времени:', error);
      return baseHours;
    }
  }
  
  return baseHours;
};

// Определение, является ли дата "сегодня"
export const isToday = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    const today = new Date();
    
    return dateObj.getDate() === today.getDate() &&
           dateObj.getMonth() === today.getMonth() &&
           dateObj.getFullYear() === today.getFullYear();
  } catch (error) {
    return false;
  }
};

// Расширенная версия функции создания следующей повторяющейся задачи
export const createNextRecurringTask = (task) => {
  if (!task.isRecurring || !task.recurrencePattern) {
    return null;
  }
  
  try {
    // Создаем копию задачи
    const newTask = {...task};
    
    // Генерируем новый ID для задачи
    newTask.id = Date.now().toString();
    
    // Устанавливаем новую дату на основе паттерна повторения
    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      
      switch (task.recurrencePattern) {
        case 'daily':
          deadlineDate.setDate(deadlineDate.getDate() + 1);
          break;
        case 'weekly':
          // Если есть детали с днями недели, используем их
          if (task.recurrenceDetails?.days && task.recurrenceDetails.days.length > 0) {
            // Находим следующий день недели из выбранных
            const today = deadlineDate.getDay();
            const nextDays = task.recurrenceDetails.days.filter(day => day > today);
            
            if (nextDays.length > 0) {
              // Если есть дни недели после текущего, берем ближайший
              const daysToAdd = nextDays[0] - today;
              deadlineDate.setDate(deadlineDate.getDate() + daysToAdd);
            } else {
              // Если нет дней недели после текущего, переходим к первому дню следующей недели
              const daysToAdd = 7 - today + task.recurrenceDetails.days[0];
              deadlineDate.setDate(deadlineDate.getDate() + daysToAdd);
            }
          } else {
            // По умолчанию просто добавляем 7 дней
            deadlineDate.setDate(deadlineDate.getDate() + 7);
          }
          break;
        case 'monthly':
          // Если есть детали о том, как повторять - по дню месяца или дню недели
          if (task.recurrenceDetails?.monthlyOption === 'weekday') {
            // Вычисляем, какой по счету день недели был в месяце
            // Например, "второй вторник месяца"
            const dayOfWeek = deadlineDate.getDay();
            const dayOfMonth = deadlineDate.getDate();
            const weekNumber = Math.ceil(dayOfMonth / 7);
            
            // Переходим к следующему месяцу
            deadlineDate.setMonth(deadlineDate.getMonth() + 1);
            
            // Устанавливаем на 1-е число
            deadlineDate.setDate(1);
            
            // Находим первый день недели нужного типа
            while (deadlineDate.getDay() !== dayOfWeek) {
              deadlineDate.setDate(deadlineDate.getDate() + 1);
            }
            
            // Добавляем нужное количество недель
            deadlineDate.setDate(deadlineDate.getDate() + (weekNumber - 1) * 7);
          } else {
            // По умолчанию - тот же день следующего месяца
            const dayOfMonth = deadlineDate.getDate();
            deadlineDate.setMonth(deadlineDate.getMonth() + 1);
            
            // Проверяем, если день больше числа дней в месяце, устанавливаем последний день
            const lastDayOfMonth = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth() + 1, 0).getDate();
            if (dayOfMonth > lastDayOfMonth) {
              deadlineDate.setDate(lastDayOfMonth);
            } else {
              deadlineDate.setDate(dayOfMonth);
            }
          }
          break;
        case 'yearly':
          deadlineDate.setFullYear(deadlineDate.getFullYear() + 1);
          break;
        default:
          // По умолчанию еженедельно
          deadlineDate.setDate(deadlineDate.getDate() + 7);
      }
      
      newTask.deadline = deadlineDate.toISOString();
    }
    
    // Сбрасываем статус завершения
    newTask.isCompleted = false;
    
    // Обновляем дату создания
    newTask.createdAt = new Date().toISOString();
    
    // Сбрасываем ID уведомления и события календаря
    newTask.notificationId = null;
    newTask.calendarEventId = null;
    
    return newTask;
  } catch (error) {
    console.error('Ошибка при создании повторяющейся задачи:', error);
    return null;
  }
};

// Вычисление времени уведомления в зависимости от приоритета задачи
export const getSmartNotificationTime = (priority, deadline) => {
  if (!deadline) return 30; // По умолчанию 30 минут
  
  try {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    
    // Разница в миллисекундах
    const diffMs = deadlineDate - now;
    
    // Если дедлайн уже прошел, возвращаем минимальное время
    if (diffMs <= 0) return 15;
    
    // Разница в часах
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // В зависимости от приоритета и времени до дедлайна
    switch (priority) {
      case 'critical':
        // Для критических задач частые напоминания
        if (diffHours < 2) return 15;
        if (diffHours < 5) return 30;
        if (diffHours < 24) return 60;
        return 120;
      case 'important':
        // Для важных задач средние напоминания
        if (diffHours < 3) return 30;
        if (diffHours < 12) return 60;
        return 120;
      case 'normal':
        // Для обычных задач стандартные напоминания
        if (diffHours < 6) return 60;
        return 120;
      case 'low':
        // Для низкоприоритетных редкие напоминания
        return 240; // 4 часа
      default:
        return 60;
    }
  } catch (error) {
    console.error('Ошибка при вычислении времени уведомления:', error);
    return 60; // По умолчанию 1 час
  }
};