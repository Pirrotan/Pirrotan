// src/screens/Home.js - исправленная версия с улучшенным скроллингом
import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Animated,
  BackHandler,
  Alert,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';
import AnxietyMeter from '../components/AnxietyMeter';
import TaskItem from '../components/TaskItem';
import { useTask } from '../context/TaskContext';
import { useAnxiety } from '../context/AnxietyContext';
import { useUser } from '../context/UserContext';

// Получаем размеры экрана
const { width, height } = Dimensions.get('window');

// Компонент кнопки быстрого доступа с улучшенной анимацией
const QuickAccessButton = ({ icon, label, onPress, color }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 15,  // Снижено для более плавной анимации
      bounciness: 2  // Снижено для менее агрессивной анимации
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 15,
      bounciness: 2
    }).start();
  };
  
  return (
    <TouchableOpacity 
      style={styles.quickAccessButton} 
      onPress={onPress} 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      delayPressIn={0}  // Мгновенная реакция на нажатие
    >
      <Animated.View 
        style={[
          styles.quickAccessIcon, 
          { backgroundColor: color, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Icon name={icon} size={24} color={Colors.textPrimary} />
      </Animated.View>
      <Text style={styles.quickAccessLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const Home = ({ navigation }) => {
  const { tasks, toggleTaskComplete } = useTask();
  const { anxietyLevel } = useAnxiety();
  const { userData } = useUser();
  
  // Получение задач на сегодня с использованием useMemo для оптимизации производительности
  const todayTasks = useMemo(() => {
    return tasks.filter(task =>
      !task.isCompleted || (task.isCompleted && new Date(task.createdAt).toDateString() === new Date().toDateString())
    ).slice(0, 3); // Берем только первые 3 задачи для главного экрана
  }, [tasks]);
  
  // Аним-значение для анимации появления контента
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  // Анимация появления контента
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    return () => {
      // Очистка анимации при размонтировании
      fadeAnim.stopAnimation();
    };
  }, []);
  
  // Обработка нажатия кнопки "назад" для подтверждения выхода из приложения
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Выход из приложения',
        'Вы уверены, что хотите выйти из приложения?',
        [
          {
            text: 'Отмена',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'Выйти',
            onPress: () => BackHandler.exitApp(),
          },
        ]
      );
      return true; // Предотвращаем действие по умолчанию
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Добрый день</Text>
          <Text style={styles.userName}>{userData.name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Icon name="account" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      {/* Улучшенный ScrollView с анимацией */}
      <Animated.ScrollView 
        style={[
          styles.content,
          { opacity: fadeAnim }
        ]} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
      >
        <AnxietyMeter level={anxietyLevel} />
        
        <Text style={styles.sectionTitle}>Быстрый доступ</Text>
        <View style={styles.quickAccessContainer}>
          <QuickAccessButton 
            icon="meditation" 
            label="Дыхание" 
            onPress={() => navigation.navigate('Calm')}
            color="#4A00E0"
          />
          <QuickAccessButton 
            icon="heart" 
            label="Благодарность" 
            onPress={() => navigation.navigate('Gratitude')}
            color="#9C27B0"
          />
          <QuickAccessButton 
            icon="emoticon-outline" 
            label="Настроение" 
            onPress={() => {
              // Показываем раздел с измерением тревожности
              navigation.navigate('Calm');
            }}
            color="#03A9F4"
          />
          <QuickAccessButton 
            icon="clock-outline" 
            label="Фокус" 
            onPress={() => navigation.navigate('Focus')}
            color="#FF9800"
          />
        </View>
        
        <View style={styles.tasksHeader}>
          <Text style={styles.sectionTitle}>Задачи на сегодня</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Tasks')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>Все задачи</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tasksList}>
          {todayTasks.length === 0 ? (
            <View style={styles.emptyTasksContainer}>
              <Icon name="check-circle-outline" size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyTasksText}>Нет активных задач на сегодня</Text>
              <TouchableOpacity 
                style={styles.addTaskButton}
                onPress={() => navigation.navigate('NewTask')}
                activeOpacity={0.7}
              >
                <Text style={styles.addTaskButtonText}>Добавить задачу</Text>
              </TouchableOpacity>
            </View>
          ) : (
            todayTasks.map(task => (
              <TaskItem
                key={task.id}
                title={task.title}
                deadline={task.deadline}
                priority={task.priority}
                context={task.context}
                isCompleted={task.isCompleted}
                onToggleComplete={() => toggleTaskComplete(task.id)}
                onPress={() => navigation.navigate('NewTask', { task })}
              />
            ))
          )}
        </View>
        
        {/* Добавляем пространство для прокрутки под футером */}
        <View style={styles.footerSpacer} />
      </Animated.ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerTab}>
          <Icon name="home" size={24} color={Colors.primary} />
          <Text style={[styles.footerTabText, { color: Colors.primary }]}>Главная</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => navigation.navigate('Tasks')}
          activeOpacity={0.7}
        >
          <Icon name="checkbox-marked-outline" size={24} color={Colors.textSecondary} />
          <Text style={styles.footerTabText}>Задачи</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 10,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 120, // Увеличенный отступ снизу для прокрутки под футером
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 12,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap', // Добавляем перенос на новую строку при недостатке места
    width: '100%',
  },
  quickAccessButton: {
    alignItems: 'center',
    width: '22%', // Немного уменьшаем ширину для гибкости
    marginVertical: 5, // Добавляем вертикальные отступы
  },
  quickAccessIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    width: '100%',
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
  },
  tasksList: {
    marginBottom: 20,
    width: '100%',
  },
  emptyTasksContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginVertical: 6,
  },
  emptyTasksText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
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
  footerSpacer: {
    height: 80, // Пространство для прокрутки под футером
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
});

export default Home;