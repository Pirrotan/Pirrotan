// src/components/TaskItem.js - обновленная версия с поддержкой повторяющихся задач
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';
import { useProject } from '../context/ProjectContext'; // Импортируем для работы с проектами

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

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'critical':
      return 'alert-circle';
    case 'important':
      return 'alert';
    case 'normal':
      return 'checkbox-marked-circle';
    case 'low':
      return 'chevron-down-circle';
    default:
      return 'checkbox-marked-circle';
  }
};

const TaskItem = ({ 
  title, 
  deadline, 
  priority, 
  context, 
  isCompleted, 
  onToggleComplete, 
  onPress,
  isRecurring = false,
  projectId = null
}) => {
  const { projects } = useProject(); // Получаем список проектов
  const priorityColor = getPriorityColor(priority);
  const priorityIcon = getPriorityIcon(priority);
  
  // Находим проект по ID
  const project = projectId ? projects.find(p => p.id === projectId) : null;
  
  // Форматируем дату дедлайна для наглядности
  const formatDeadline = (deadline) => {
    if (!deadline) return '';
    
    // Если это уже отформатированная строка (например, "Сегодня"), возвращаем как есть
    if (typeof deadline === 'string' && !deadline.includes('-') && !deadline.includes('/')) {
      return deadline;
    }
    
    try {
      const date = new Date(deadline);
      const today = new Date();
      
      // Если дата сегодня
      if (date.toDateString() === today.toDateString()) {
        return 'Сегодня';
      }
      
      // Если дата завтра
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      if (date.toDateString() === tomorrow.toDateString()) {
        return 'Завтра';
      }
      
      // Форматирование даты для остальных случаев
      const options = { day: 'numeric', month: 'short' };
      
      // Если год отличается от текущего, добавляем его в формат
      if (date.getFullYear() !== today.getFullYear()) {
        options.year = 'numeric';
      }
      
      return date.toLocaleDateString('ru-RU', options);
    } catch (error) {
      return deadline;
    }
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={onToggleComplete} style={styles.checkboxContainer}>
            <Icon
              name={isCompleted ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
              size={24}
              color={isCompleted ? Colors.success : priorityColor}
            />
          </TouchableOpacity>
          <View style={styles.contentContainer}>
            <Text style={[
              styles.title, 
              isCompleted && styles.completedText
            ]}>
              {title}
            </Text>
            <View style={styles.detailsContainer}>
              {/* Дедлайн */}
              {deadline && (
                <View style={styles.deadlineContainer}>
                  <Icon name="clock-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.deadline}>{formatDeadline(deadline)}</Text>
                </View>
              )}
              
              {/* Проект */}
              {project && (
                <View style={[styles.projectTag, { borderColor: project.color }]}>
                  <Icon name={project.icon || 'folder'} size={12} color={project.color} />
                  <Text style={[styles.projectText, { color: project.color }]}>{project.name}</Text>
                </View>
              )}
              
              {/* Контекст */}
              {context && (
                <View style={styles.contextContainer}>
                  <Text style={styles.context}>{context}</Text>
                </View>
              )}
              
              {/* Индикатор повторения */}
              {isRecurring && (
                <View style={styles.recurringContainer}>
                  <Icon name="sync" size={12} color={Colors.primary} />
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
            <Icon name={priorityIcon} size={16} color={Colors.textPrimary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  deadline: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  contextContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  context: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  projectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  projectText: {
    fontSize: 11,
    marginLeft: 4,
  },
  recurringContainer: {
    marginLeft: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TaskItem;