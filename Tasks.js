// src/screens/Tasks.js
import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';
import SwipeableTaskItem from '../components/SwipeableTaskItem';
import { useTask } from '../context/TaskContext';
import { useProject } from '../context/ProjectContext';

// Получаем размеры экрана
const { width, height } = Dimensions.get('window');

// Константные размеры для расположения табов и контента
const TAB_HEIGHT = 44;
const HEADER_HEIGHT = 60;

// Компонент для заголовка группы проектов
const ProjectHeader = ({ project, count }) => {
  if (!project) return null;
  
  return (
    <View style={[styles.projectHeader, { borderColor: project.color || Colors.primary }]}>
      <View style={styles.projectHeaderLeft}>
        <View style={[styles.projectIcon, { backgroundColor: project.color || Colors.primary }]}>
          <Icon name={project.icon || 'folder'} size={16} color={Colors.textPrimary} />
        </View>
        <Text style={styles.projectName}>{project?.name || 'Без проекта'}</Text>
      </View>
      <View style={[styles.projectBadge, { backgroundColor: project.color || Colors.primary }]}>
        <Text style={styles.projectCount}>{count}</Text>
      </View>
    </View>
  );
};

// Компонент быстрого добавления задачи
const QuickAddTask = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  
  const handleSubmit = () => {
    if (title.trim()) {
      onAdd(title);
      setTitle('');
    }
  };
  
  return (
    <View style={styles.quickAddContainer}>
      <TextInput
        style={styles.quickAddInput}
        placeholder="Быстрое добавление задачи"
        placeholderTextColor={Colors.textSecondary}
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
      />
      <TouchableOpacity style={styles.quickAddButton} onPress={handleSubmit} activeOpacity={0.7}>
        <Icon name="plus" size={20} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const TasksScreen = ({ navigation }) => {
  // Добавляем обработку ошибок и проверки для избежания вылетов
  const { 
    tasks = [], 
    toggleTaskComplete, 
    deleteTask, 
    updateTask,
    loading, 
    error, 
    quickAddTask,
    clearError 
  } = useTask() || {};
  
  const { projects = [] } = useProject() || {}; // Получаем список проектов с проверкой на null
  
  const [filter, setFilter] = useState('all'); // all, today, upcoming, completed, projects
  const [selectedProjectId, setSelectedProjectId] = useState(null); // ID выбранного проекта для фильтрации
  const [refreshing, setRefreshing] = useState(false);
  
  // Получение задач на сегодня, которые выполнены
  const completedTasks = useMemo(() => {
    return tasks.filter(task => task.isCompleted);
  }, [tasks]);
  
  // Обработчик обновления данных (Pull to Refresh)
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      // Здесь можно добавить логику обновления данных
      // Например, повторная загрузка задач
      
      // Симулируем задержку
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Сброс ошибок, если они были
      if (typeof clearError === 'function') {
        clearError();
      }
    } catch (err) {
      console.error('Ошибка при обновлении данных:', err);
    } finally {
      setRefreshing(false);
    }
  }, [clearError]);
  
  // Выбор проекта для фильтрации
  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    setFilter('projects');
  };
  
  // Обработчик редактирования задачи
  const handleEditTask = (task) => {
    navigation.navigate('NewTask', { task });
  };
  
  // Обработчик удаления задачи
  const handleDeleteTask = (taskId, taskTitle) => {
    if (!deleteTask) {
      Alert.alert("Ошибка", "Функция удаления задачи недоступна");
      return;
    }
    
    Alert.alert(
      'Удаление задачи',
      `Вы уверены, что хотите удалить задачу "${taskTitle || 'без названия'}"?`,
      [
        {
          text: 'Отмена',
          style: 'cancel'
        },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              await deleteTask(taskId);
            } catch (err) {
              console.error('Ошибка при удалении задачи:', err);
              Alert.alert('Ошибка', 'Не удалось удалить задачу');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  // Обработчик быстрого добавления задачи
  const handleQuickAdd = async (title) => {
    try {
      if (!quickAddTask) {
        Alert.alert("Ошибка", "Функция быстрого добавления задачи недоступна");
        return;
      }
      
      const result = await quickAddTask(title, selectedProjectId);
      if (result) {
        Alert.alert("Успешно", "Срочная задача добавлена");
      }
    } catch (error) {
      console.error("Ошибка при добавлении задачи:", error);
      Alert.alert("Ошибка", "Не удалось добавить задачу");
    }
  };
  
  // Получаем отфильтрованные задачи с использованием useMemo для оптимизации
  // Добавляем проверки на null, чтобы избежать вылетов
  const filteredTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return [];
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Фильтруем так, чтобы выполненные задачи не показывались в других фильтрах, кроме 'completed'
    if (filter === 'completed') {
      return tasks.filter(task => task?.isCompleted);
    }
    
    // Для остальных фильтров показываем только невыполненные задачи
    const nonCompletedTasks = tasks.filter(task => !task?.isCompleted);
    
    // Если выбран проект, фильтруем по нему вместо стандартных фильтров
    if (filter === 'projects' && selectedProjectId) {
      return nonCompletedTasks.filter(task => task?.projectId === selectedProjectId);
    }
    
    switch (filter) {
      case 'today':
        return nonCompletedTasks.filter(task => {
          if (!task?.deadline) return false;
          
          // Для демонстрационных целей, если deadline - строка "Сегодня", считаем как сегодня
          if (task.deadline === 'Сегодня') return true;
          
          try {
            const taskDate = new Date(task.deadline);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime();
          } catch (e) {
            // Если deadline не может быть преобразован в дату
            return false;
          }
        });
      case 'upcoming':
        return nonCompletedTasks.filter(task => {
          if (!task?.deadline) return false;
          
          try {
            const taskDate = new Date(task.deadline);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() > today.getTime();
          } catch (e) {
            // Если deadline не может быть преобразован в дату
            return false;
          }
        });
      default: // 'all'
        return nonCompletedTasks;
    }
  }, [tasks, filter, selectedProjectId]);
  
  // Группируем задачи по приоритету и проектам
  const groupedTasks = useMemo(() => {
    if (!filteredTasks || filteredTasks.length === 0) {
      return {};
    }
    
    if (filter === 'projects') {
      // Если выбрана группировка по проектам, задачи уже отфильтрованы по проекту
      // Просто группируем их по приоритету
      const grouped = {};
      
      filteredTasks.forEach(task => {
        if (task && task.priority) {
          if (!grouped[task.priority]) {
            grouped[task.priority] = [];
          }
          
          grouped[task.priority].push(task);
        }
      });
      
      return grouped;
    } else {
      // Для других фильтров создаем группировку по проектам
      const grouped = {};
      
      // Создаем группу "Без проекта"
      grouped["no-project"] = [];
      
      // Создаем группы для каждого проекта
      if (projects && projects.length > 0) {
        projects.forEach(project => {
          if (project && project.id) {
            grouped[project.id] = [];
          }
        });
      }
      
      // Распределяем задачи по группам
      filteredTasks.forEach(task => {
        if (!task) return;
        
        if (task.projectId && grouped[task.projectId]) {
          grouped[task.projectId].push(task);
        } else {
          grouped["no-project"].push(task);
        }
      });
      
      // Удаляем пустые группы
      Object.keys(grouped).forEach(key => {
        if (grouped[key].length === 0) {
          delete grouped[key];
        }
      });
      
      return grouped;
    }
  }, [filteredTasks, projects, filter]);
  
  // Порядок отображения приоритетов
  const priorityOrder = ['critical', 'important', 'normal', 'low'];
  
  // Получение названия приоритета
  const getPriorityTitle = (priority) => {
    switch (priority) {
      case 'critical':
        return 'Критический';
      case 'important':
        return 'Важный';
      case 'normal':
        return 'Обычный';
      case 'low':
        return 'Низкий';
      default:
        return priority || 'Без приоритета';
    }
  };
  
  // Получение текста для пустого состояния
  const getEmptyStateText = () => {
    switch (filter) {
      case 'today':
        return 'Задач на сегодня нет';
      case 'upcoming':
        return 'Предстоящих задач нет';
      case 'completed':
        return 'Выполненных задач нет';
      case 'projects':
        return selectedProjectId ? 'В этом проекте нет задач' : 'Выберите проект';
      default:
        return 'Задач пока нет';
    }
  };
  
  // Вспомогательная функция для определения цвета приоритета
  const getPriorityColor = (priority) => {
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
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Загрузка задач...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Задачи</Text>
        <TouchableOpacity onPress={() => navigation.navigate('NewTask')} activeOpacity={0.7}>
          <Icon name="plus" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      {/* Фиксированный контейнер для табов фильтрации */}
      <View style={styles.filterTabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              Все
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'today' && styles.filterButtonActive]}
            onPress={() => setFilter('today')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterButtonText, filter === 'today' && styles.filterButtonTextActive]}>
              Сегодня
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
            onPress={() => setFilter('upcoming')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterButtonText, filter === 'upcoming' && styles.filterButtonTextActive]}>
              Предстоящие
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
            onPress={() => setFilter('completed')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterButtonText, filter === 'completed' && styles.filterButtonTextActive]}>
              Выполненные
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'projects' && styles.filterButtonActive]}
            onPress={() => setFilter('projects')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterButtonText, filter === 'projects' && styles.filterButtonTextActive]}>
              Проекты
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Отображаем выбор проекта, если активен фильтр "Проекты" */}
      {filter === 'projects' && (
        <View style={styles.projectSelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {projects && projects.length > 0 ? (
              projects.map(project => (
                <TouchableOpacity 
                  key={project.id}
                  style={[
                    styles.projectSelectorItem,
                    selectedProjectId === project.id && { backgroundColor: project.color }
                  ]}
                  onPress={() => handleSelectProject(project.id)}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name={project.icon || 'folder'} 
                    size={18} 
                    color={selectedProjectId === project.id ? Colors.textPrimary : project.color} 
                  />
                  <Text 
                    style={[
                      styles.projectSelectorText,
                      selectedProjectId === project.id && { color: Colors.textPrimary, fontWeight: 'bold' }
                    ]}
                  >
                    {project.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noProjectsText}>Проекты не найдены</Text>
            )}
          </ScrollView>
        </View>
      )}
      
      {/* Компонент быстрого добавления задачи (не отображаем в разделе выполненных) */}
      {filter !== 'completed' && (
        <QuickAddTask onAdd={handleQuickAdd} />
      )}
      
      {/* Основной контейнер задач с фиксированной высотой */}
      <View style={styles.tasksContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                // Сброс ошибки и повторная попытка загрузки
                if (typeof clearError === 'function') clearError();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>Повторить</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={true}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            bounces={true}
          >
            {/* Отображение выполненных задач в отдельном разделе */}
            {filter === 'completed' ? (
              completedTasks.length > 0 ? (
                <>
                  <Text style={styles.sectionTitle}>Выполненные задачи</Text>
                  {completedTasks.map(task => (
                    <SwipeableTaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={() => toggleTaskComplete(task.id)}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onPress={() => navigation.navigate('NewTask', { task })}
                    />
                  ))}
                </>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Icon name="checkbox-marked-circle-outline" size={64} color={Colors.textSecondary} />
                  <Text style={styles.emptyStateTitle}>Нет выполненных задач</Text>
                  <Text style={styles.emptyStateDescription}>
                    Выполненные задачи будут отображаться здесь
                  </Text>
                </View>
              )
            ) : (
              // Отображение активных задач в зависимости от фильтра
              (!filteredTasks.length ? (
                <View style={styles.emptyStateContainer}>
                  <Icon name="checkbox-marked-circle-outline" size={64} color={Colors.textSecondary} />
                  <Text style={styles.emptyStateTitle}>{getEmptyStateText()}</Text>
                  <Text style={styles.emptyStateDescription}>
                    Добавьте новую задачу, нажав на "+" в верхнем правом углу
                  </Text>
                  <TouchableOpacity 
                    style={styles.addTaskButton}
                    onPress={() => navigation.navigate('NewTask')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.addTaskButtonText}>Добавить задачу</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filter === 'projects' && selectedProjectId ? (
                  // Если выбран проект, группируем задачи по приоритету
                  priorityOrder.map(priority => {
                    if (!groupedTasks[priority] || groupedTasks[priority].length === 0) {
                      return null;
                    }
                    
                    return (
                      <View key={priority} style={styles.prioritySection}>
                        <View style={styles.priorityHeader}>
                          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(priority) }]} />
                          <Text style={styles.priorityTitle}>{getPriorityTitle(priority)}</Text>
                        </View>
                        
                        {groupedTasks[priority].map(task => (
                          <SwipeableTaskItem
                            key={task.id}
                            task={task}
                            onToggleComplete={() => toggleTaskComplete(task.id)}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            onPress={() => navigation.navigate('NewTask', { task })}
                          />
                        ))}
                      </View>
                    );
                  })
                ) : (
                  // Для других фильтров группируем по проектам
                  Object.keys(groupedTasks).map(groupKey => {
                    // Особая обработка для задач без проекта
                    if (groupKey === "no-project") {
                      return (
                        <View key={groupKey} style={styles.projectGroup}>
                          <View style={styles.projectHeader}>
                            <Text style={styles.projectName}>Без проекта</Text>
                            <View style={styles.projectBadge}>
                              <Text style={styles.projectCount}>{groupedTasks[groupKey].length}</Text>
                            </View>
                          </View>
                          
                          {groupedTasks[groupKey].map(task => (
                            <SwipeableTaskItem
                              key={task.id}
                              task={task}
                              onToggleComplete={() => toggleTaskComplete(task.id)}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                              onPress={() => navigation.navigate('NewTask', { task })}
                            />
                          ))}
                        </View>
                      );
                    }
                    
                    // Для задач с проектом
                    const project = projects.find(p => p.id === groupKey);
                    if (!project) return null;
                    
                    return (
                      <View key={groupKey} style={styles.projectGroup}>
                        <ProjectHeader project={project} count={groupedTasks[groupKey].length} />
                        
                        {groupedTasks[groupKey].map(task => (
                          <SwipeableTaskItem
                            key={task.id}
                            task={task}
                            onToggleComplete={() => toggleTaskComplete(task.id)}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            onPress={() => navigation.navigate('NewTask', { task })}
                          />
                        ))}
                      </View>
                    );
                  })
                )
              ))
            )}
            
            {/* Добавляем пространство для прокрутки под футером */}
            <View style={styles.footerSpacer} />
          </ScrollView>
        )}
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Icon name="home" size={24} color={Colors.textSecondary} />
          <Text style={styles.footerTabText}>Главная</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab}
          activeOpacity={0.7}
        >
          <Icon name="checkbox-marked-outline" size={24} color={Colors.primary} />
          <Text style={[styles.footerTabText, { color: Colors.primary }]}>Задачи</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => navigation.navigate('Finance')}
          activeOpacity={0.7}
        >
          <Icon name="wallet-outline" size={24} color={Colors.textSecondary} />
          <Text style={styles.footerTabText}>Финансы</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => navigation.navigate('Calm')}
          activeOpacity={0.7}
        >
          <Icon name="heart-pulse" size={24} color={Colors.textSecondary} />
          <Text style={styles.footerTabText}>Спокойствие</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: HEADER_HEIGHT,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  filterTabsContainer: {
    height: TAB_HEIGHT,
    backgroundColor: Colors.background,
    zIndex: 9,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    height: TAB_HEIGHT,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.cardBackground,
    height: 36,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  // Стили для селектора проектов
  projectSelectorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  projectSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.cardBackground,
  },
  projectSelectorText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  noProjectsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingVertical: 8,
  },
  // Стили для быстрого добавления задачи
  quickAddContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  quickAddInput: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  quickAddButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  tasksContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContentContainer: {
    paddingBottom: 120, // Увеличен отступ снизу для скролла под футером
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60, // Увеличен отступ сверху
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 20,
  },
  addTaskButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addTaskButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  prioritySection: {
    marginBottom: 24,
    width: '100%',
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  // Стили для группировки по проектам
  projectGroup: {
    marginBottom: 24,
    width: '100%',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  projectHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  projectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  projectCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 12,
  },
  footerSpacer: {
    height: 80, // Обеспечивает пространство внизу для прокрутки под футером
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    paddingVertical: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  footerTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerTabText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
});

export default TasksScreen;