// src/components/SwipeableTaskItem.js
import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  I18nManager
} from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';
import TaskItem from './TaskItem';

// Компонент-обертка для TaskItem с поддержкой свайпов
const SwipeableTaskItem = ({ 
  task, 
  onToggleComplete, 
  onEdit, 
  onDelete,
  onPress 
}) => {
  const swipeableRef = useRef(null);
  
  // Функция для закрытия свайпа
  const close = () => {
    swipeableRef.current?.close();
  };
  
  // Действие при нажатии на кнопку редактирования
  const handleEdit = () => {
    close();
    onEdit(task);
  };
  
  // Действие при нажатии на кнопку удаления
  const handleDelete = () => {
    close();
    onDelete(task.id, task.title);
  };
  
  // Компонент для рендера кнопок справа (удаление)
  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={styles.rightActionsContainer}>
        <Animated.View style={[
          styles.rightAction, 
          {
            transform: [{ translateX: trans }],
          }
        ]}>
          <RectButton style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
            <Icon name="trash-can-outline" size={24} color={Colors.textPrimary} />
          </RectButton>
        </Animated.View>
      </View>
    );
  };
  
  // Компонент для рендера кнопок слева (редактирование)
  const renderLeftActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [-80, 0],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={styles.leftActionsContainer}>
        <Animated.View style={[
          styles.leftAction,
          {
            transform: [{ translateX: trans }],
          }
        ]}>
          <RectButton style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
            <Icon name="pencil" size={24} color={Colors.textPrimary} />
          </RectButton>
        </Animated.View>
      </View>
    );
  };
  
  // Обработчик нажатия на задачу
  const handlePressTask = () => {
    close();
    onPress(task);
  };
  
  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={30}
      rightThreshold={30}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableLeftOpen={handleEdit} // Автоматически вызывает редактирование при свайпе влево
    >
      <TaskItem
        title={task.title}
        deadline={task.deadline}
        priority={task.priority}
        context={task.context}
        isCompleted={task.isCompleted}
        onToggleComplete={() => onToggleComplete(task.id)}
        onPress={handlePressTask}
        isRecurring={task.isRecurring}
        projectId={task.projectId}
      />
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  rightActionsContainer: {
    width: 80,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
  },
  leftActionsContainer: {
    width: 80,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  rightAction: {
    flex: 1,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  leftAction: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
});

export default SwipeableTaskItem;