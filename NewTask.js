// src/screens/NewTask.js - с поддержкой повторяющихся задач и проектов
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';
import { useTask } from '../context/TaskContext';
import { useProject } from '../context/ProjectContext'; // Импортируем проектный контекст

const PriorityButton = ({ label, color, isSelected, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.priorityButton, 
      { borderColor: color },
      isSelected && { backgroundColor: color }
    ]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text 
      style={[
        styles.priorityButtonText,
        isSelected && styles.priorityButtonTextSelected
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const ContextButton = ({ label, isSelected, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.contextButton, 
      isSelected && styles.contextButtonSelected
    ]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text 
      style={[
        styles.contextButtonText,
        isSelected && styles.contextButtonTextSelected
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// Компонент выбора проекта
const ProjectSelector = ({ selectedProject, onSelectProject, projects }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScrollContainer}>
      <TouchableOpacity 
        style={[
          styles.projectButton, 
          !selectedProject && styles.projectButtonSelected
        ]} 
        onPress={() => onSelectProject(null)}
        activeOpacity={0.7}
      >
        <Icon name="folder-outline" size={16} color={!selectedProject ? Colors.textPrimary : Colors.textSecondary} />
        <Text 
          style={[
            styles.projectButtonText,
            !selectedProject && styles.projectButtonTextSelected
          ]}
        >
          Без проекта
        </Text>
      </TouchableOpacity>
      
      {projects.map(project => (
        <TouchableOpacity 
          key={project.id}
          style={[
            styles.projectButton, 
            { borderColor: project.color },
            selectedProject?.id === project.id && { backgroundColor: project.color }
          ]} 
          onPress={() => onSelectProject(project)}
          activeOpacity={0.7}
        >
          <Icon 
            name={project.icon || 'folder'} 
            size={16} 
            color={selectedProject?.id === project.id ? Colors.textPrimary : project.color} 
          />
          <Text 
            style={[
              styles.projectButtonText,
              selectedProject?.id === project.id && styles.projectButtonTextSelected
            ]}
          >
            {project.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Компонент выбора шаблона повторения
const RecurrenceSelector = ({ isRecurring, pattern, onPatternChange }) => {
  if (!isRecurring) return null;
  
  return (
    <View style={styles.recurrencePatternContainer}>
      <TouchableOpacity 
        style={[
          styles.recurrenceButton, 
          pattern === 'daily' && styles.recurrenceButtonSelected
        ]} 
        onPress={() => onPatternChange('daily')}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.recurrenceButtonText,
            pattern === 'daily' && styles.recurrenceButtonTextSelected
          ]}
        >
          Ежедневно
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.recurrenceButton, 
          pattern === 'weekly' && styles.recurrenceButtonSelected
        ]} 
        onPress={() => onPatternChange('weekly')}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.recurrenceButtonText,
            pattern === 'weekly' && styles.recurrenceButtonTextSelected
          ]}
        >
          Еженедельно
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.recurrenceButton, 
          pattern === 'monthly' && styles.recurrenceButtonSelected
        ]} 
        onPress={() => onPatternChange('monthly')}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.recurrenceButtonText,
            pattern === 'monthly' && styles.recurrenceButtonTextSelected
          ]}
        >
          Ежемесячно
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Компонент календаря для выбора даты (код для календаря с предыдущего файла)
const SimpleCalendar = ({ onSelectDate, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Функция получения дней текущего месяца
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Получение дня недели для первого дня месяца
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  // Названия месяцев
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  
  // Изменение месяца
  const changeMonth = (increment) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
  };
  
  // Выбор даты
  const handleDateSelect = (day) => {
    const selectedDate = new Date(year, month, day);
    onSelectDate(selectedDate);
    onClose();
  };
  
  // Генерация элементов календарной сетки
  const renderCalendarGrid = () => {
    const days = [];
    // Заполнение пустыми днями до первого дня месяца
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Заполнение днями месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = 
        new Date().getDate() === day && 
        new Date().getMonth() === month && 
        new Date().getFullYear() === year;
      
      days.push(
        <TouchableOpacity 
          key={`day-${day}`} 
          style={[
            styles.calendarDay,
            isToday && styles.todayDay
          ]}
          onPress={() => handleDateSelect(day)}
          activeOpacity={0.7}
        >
          <Text style={[styles.calendarDayText, isToday && styles.todayDayText]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };
  
  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.calendarArrow}>
          <Icon name="chevron-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.calendarMonthTitle}>
          {monthNames[month]} {year}
        </Text>
        
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.calendarArrow}>
          <Icon name="chevron-right" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.calendarWeekDays}>
        {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day, index) => (
          <Text key={index} style={styles.calendarWeekDay}>{day}</Text>
        ))}
      </View>
      
      <View style={styles.calendarGrid}>
        {renderCalendarGrid()}
      </View>
      
      <View style={styles.calendarActions}>
        <TouchableOpacity onPress={onClose} style={styles.calendarButton}>
          <Text style={styles.calendarButtonText}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const NewTask = ({ navigation, route }) => {
  const { addTask, updateTask } = useTask();
  const { projects } = useProject(); // Получаем список проектов
  const editingTask = route.params?.task;
  
  const [title, setTitle] = useState(editingTask?.title || '');
  const [priority, setPriority] = useState(editingTask?.priority || 'normal');
  const [dueDate, setDueDate] = useState(editingTask?.deadline || '');
  const [context, setContext] = useState(editingTask?.context || '');
  const [steps, setSteps] = useState(editingTask?.steps || ['', '']);
  const [notes, setNotes] = useState(editingTask?.notes || '');
  
  // Добавляем новые состояния
  const [selectedProject, setSelectedProject] = useState(null);
  const [isRecurring, setIsRecurring] = useState(editingTask?.isRecurring || false);
  const [recurrencePattern, setRecurrencePattern] = useState(editingTask?.recurrencePattern || 'weekly');
  const [notificationTime, setNotificationTime] = useState(editingTask?.notificationTime || 30);
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Загрузка проекта задачи при редактировании
  useEffect(() => {
    if (editingTask?.projectId) {
      const taskProject = projects.find(p => p.id === editingTask.projectId);
      if (taskProject) {
        setSelectedProject(taskProject);
      }
    }
  }, [editingTask, projects]);
  
  const handleAddStep = () => {
    setSteps([...steps, '']);
  };
  
  const handleUpdateStep = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };
  
  const handleRemoveStep = (index) => {
    if (steps.length <= 1) {
      // Если это последний шаг, очищаем его вместо удаления
      setSteps(['']);
    } else {
      const newSteps = [...steps];
      newSteps.splice(index, 1);
      setSteps(newSteps);
    }
  };
  
  const handleSelectDate = (date) => {
    const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    setDueDate(formattedDate);
  };
  
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Ошибка", "Пожалуйста, введите название задачи");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Создаем объект задачи
      const task = {
        id: editingTask?.id, // Если редактируем, сохраняем id
        title,
        priority,
        deadline: dueDate,
        context,
        steps: steps.filter(step => step.trim() !== ''),
        notes,
        isCompleted: editingTask?.isCompleted || false,
        
        // Добавляем новые поля
        projectId: selectedProject?.id || null,
        isRecurring: isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : null,
        notificationTime: notificationTime,
      };
      
      if (editingTask) {
        // Обновляем существующую задачу
        await updateTask(task);
        console.log("Задача обновлена");
      } else {
        // Добавляем новую задачу
        await addTask(task);
        console.log("Новая задача добавлена");
      }
      
      // Показываем уведомление об успешном сохранении
      Alert.alert(
        "Успешно", 
        editingTask ? "Задача успешно обновлена" : "Задача успешно добавлена",
        [{ 
          text: "OK", 
          onPress: () => {
            // Возвращаемся на предыдущий экран после закрытия алерта
            navigation.goBack();
          } 
        }]
      );
    } catch (error) {
      console.error("Ошибка при сохранении задачи:", error);
      Alert.alert("Ошибка", "Не удалось сохранить задачу. Пожалуйста, попробуйте снова.");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editingTask ? 'Редактирование задачи' : 'Новая задача'}
          </Text>
          <TouchableOpacity 
            onPress={handleSave}
            activeOpacity={0.7}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.saveButton}>Сохранить</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Название задачи</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Введите название задачи"
              placeholderTextColor={Colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Проект</Text>
            <ProjectSelector 
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
              projects={projects}
            />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Приоритет</Text>
            <View style={styles.priorityContainer}>
              <PriorityButton 
                label="Критический" 
                color={Colors.critical}
                isSelected={priority === 'critical'}
                onPress={() => setPriority('critical')}
              />
              <PriorityButton 
                label="Важный" 
                color={Colors.important}
                isSelected={priority === 'important'}
                onPress={() => setPriority('important')}
              />
              <PriorityButton 
                label="Обычный" 
                color={Colors.normal}
                isSelected={priority === 'normal'}
                onPress={() => setPriority('normal')}
              />
              <PriorityButton 
                label="Низкий" 
                color={Colors.low}
                isSelected={priority === 'low'}
                onPress={() => setPriority('low')}
              />
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Срок выполнения</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowCalendar(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateInputText, dueDate ? { color: Colors.textPrimary } : {}]}>
                {dueDate || 'Выберите дату'}
              </Text>
              <Icon name="calendar" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {/* Новый раздел - Повторяющаяся задача */}
          <View style={styles.section}>
            <View style={styles.switchRow}>
              <Text style={styles.sectionTitle}>Повторяющаяся задача</Text>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: '#767577', true: Colors.primary }}
                thumbColor={Colors.textPrimary}
              />
            </View>
            
            <RecurrenceSelector 
              isRecurring={isRecurring}
              pattern={recurrencePattern}
              onPatternChange={setRecurrencePattern}
            />
          </View>
          
          {/* Новый раздел - Уведомление */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Уведомление</Text>
            <View style={styles.notificationContainer}>
              <TouchableOpacity 
                style={[
                  styles.notificationButton, 
                  notificationTime === 15 && styles.notificationButtonSelected
                ]} 
                onPress={() => setNotificationTime(15)}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.notificationButtonText,
                    notificationTime === 15 && styles.notificationButtonTextSelected
                  ]}
                >
                  За 15 мин
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.notificationButton, 
                  notificationTime === 30 && styles.notificationButtonSelected
                ]} 
                onPress={() => setNotificationTime(30)}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.notificationButtonText,
                    notificationTime === 30 && styles.notificationButtonTextSelected
                  ]}
                >
                  За 30 мин
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.notificationButton, 
                  notificationTime === 60 && styles.notificationButtonSelected
                ]} 
                onPress={() => setNotificationTime(60)}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.notificationButtonText,
                    notificationTime === 60 && styles.notificationButtonTextSelected
                  ]}
                >
                  За 1 час
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.notificationButton, 
                  notificationTime === 120 && styles.notificationButtonSelected
                ]} 
                onPress={() => setNotificationTime(120)}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.notificationButtonText,
                    notificationTime === 120 && styles.notificationButtonTextSelected
                  ]}
                >
                  За 2 часа
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Контекст</Text>
            <View style={styles.contextContainer}>
              <ContextButton 
                label="Работа" 
                isSelected={context === 'Работа'}
                onPress={() => setContext('Работа')}
              />
              <ContextButton 
                label="Дом" 
                isSelected={context === 'Дом'}
                onPress={() => setContext('Дом')}
              />
              <ContextButton 
                label="Личное" 
                isSelected={context === 'Личное'}
                onPress={() => setContext('Личное')}
              />
              <ContextButton 
                label="Здоровье" 
                isSelected={context === 'Здоровье'}
                onPress={() => setContext('Здоровье')}
              />
              <ContextButton 
                label="Финансы" 
                isSelected={context === 'Финансы'}
                onPress={() => setContext('Финансы')}
              />
            </View>
          </View>
          
          <View style={styles.section}>
            <View style={styles.stepsSectionHeader}>
              <Text style={styles.sectionTitle}>Разбить на шаги</Text>
              <TouchableOpacity 
                onPress={handleAddStep}
                activeOpacity={0.7}
              >
                <Text style={styles.addStepButton}>+ Добавить шаг</Text>
              </TouchableOpacity>
            </View>
            
            {steps.map((step, index) => (
              <View key={index} style={styles.stepContainer}>
                <TouchableOpacity 
                  style={styles.stepCheckbox}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name="checkbox-blank-circle-outline" 
                    size={20} 
                    color={Colors.textSecondary} 
                  />
                </TouchableOpacity>
                <TextInput
                  style={styles.stepInput}
                  placeholder={`Шаг ${index + 1}`}
                  placeholderTextColor={Colors.textSecondary}
                  value={step}
                  onChangeText={(text) => handleUpdateStep(index, text)}
                />
                <TouchableOpacity 
                  style={styles.removeStepButton}
                  onPress={() => handleRemoveStep(index)}
                  activeOpacity={0.7}
                >
                  <Icon name="trash-can-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Заметки</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Добавьте заметки или дополнительную информацию"
              placeholderTextColor={Colors.textSecondary}
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Модальное окно с календарем */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SimpleCalendar 
              onSelectDate={handleSelectDate} 
              onClose={() => setShowCalendar(false)} 
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  saveButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    width: '24%',
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  priorityButtonTextSelected: {
    color: Colors.textPrimary,
  },
  dateInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  contextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  contextButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  contextButtonSelected: {
    backgroundColor: Colors.primary,
  },
  contextButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  contextButtonTextSelected: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  stepsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addStepButton: {
    fontSize: 14,
    color: Colors.primary,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCheckbox: {
    marginRight: 8,
  },
  stepInput: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    color: Colors.textPrimary,
  },
  removeStepButton: {
    marginLeft: 8,
  },
  notesInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    color: Colors.textPrimary,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  
  // Стили для модального окна и календаря
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
  },
  calendarContainer: {
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarArrow: {
    padding: 8,
  },
  calendarMonthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  calendarWeekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarWeekDay: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: 36,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  todayDay: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  todayDayText: {
    fontWeight: 'bold',
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  calendarButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  calendarButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  
  // Новые стили для проектов
  projectScrollContainer: {
    maxHeight: 50,
    marginBottom: 8,
  },
  projectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  projectButtonSelected: {
    backgroundColor: Colors.primary,
  },
  projectButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  projectButtonTextSelected: {
    fontWeight: '500',
  },
  
  // Стили для повторяющихся задач
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recurrencePatternContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  recurrenceButton: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  recurrenceButtonSelected: {
    backgroundColor: Colors.primary,
  },
  recurrenceButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  recurrenceButtonTextSelected: {
    fontWeight: '500',
  },
  
  // Стили для уведомлений
  notificationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationButton: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  notificationButtonSelected: {
    backgroundColor: Colors.primary,
  },
  notificationButtonText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  notificationButtonTextSelected: {
    fontWeight: '500',
  }
});

export default NewTask;