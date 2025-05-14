// src/screens/Calm.js - обновленная версия с улучшенной прокруткой
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Alert,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';
import { useAnxiety } from '../context/AnxietyContext';

// Получаем размеры экрана для правильного расчета отступов
const { width, height } = Dimensions.get('window');

// Компонент дыхательного упражнения с улучшенной анимацией
const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('ready'); // ready, inhale, hold, exhale
  const [seconds, setSeconds] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const totalDuration = 20; // Общая длительность упражнения в секундах
  const inhaleDuration = 4;
  const holdDuration = 4;
  const exhaleDuration = 6;
  
  // Анимированный пульс для начального состояния
  useEffect(() => {
    if (currentPhase === 'ready') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      // Останавливаем пульсацию при начале упражнения
      scaleAnim.setValue(1);
    }
    
    return () => {
      // Очистка анимации при размонтировании компонента
      Animated.timing(scaleAnim).stop();
    };
  }, [currentPhase]);
  
  const startExercise = () => {
    setIsActive(true);
    setCurrentPhase('inhale');
    setSeconds(0);
    // Сбрасываем значение анимации
    animatedValue.setValue(0);
    
    // Запускаем первую анимацию вдоха
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: inhaleDuration * 1000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  
  const stopExercise = () => {
    setIsActive(false);
    setCurrentPhase('ready');
    setSeconds(0);
    animatedValue.setValue(0);
  };
  
  // Управление анимацией
  useEffect(() => {
    let animation;
    if (isActive && seconds === 0) {
      if (currentPhase === 'inhale') {
        animation = Animated.timing(animatedValue, {
          toValue: 1,
          duration: inhaleDuration * 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        });
      } else if (currentPhase === 'hold') {
        // Для фазы удержания мы не меняем значение анимации,
        // но всё равно создаём анимацию для таймера
        animation = Animated.timing(animatedValue, {
          toValue: animatedValue._value, // Остаемся на том же значении
          duration: holdDuration * 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        });
      } else if (currentPhase === 'exhale') {
        animation = Animated.timing(animatedValue, {
          toValue: 0,
          duration: exhaleDuration * 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        });
      }
      
      if (animation) {
        animation.start();
      }
    }
    
    return () => {
      // Очистка анимации при изменении состояния
      if (animation) {
        animation.stop();
      }
    };
  }, [currentPhase, isActive, seconds]);
  
  // Управление таймером
  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1;
          
          // Переключение фаз
          if (currentPhase === 'inhale' && newSeconds >= inhaleDuration) {
            setCurrentPhase('hold');
            return 0;
          } else if (currentPhase === 'hold' && newSeconds >= holdDuration) {
            setCurrentPhase('exhale');
            return 0;
          } else if (currentPhase === 'exhale' && newSeconds >= exhaleDuration) {
            setCurrentPhase('inhale');
            return 0;
          }
          
          return newSeconds;
        });
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, seconds, currentPhase]);
  
  const getInstructions = () => {
    switch (currentPhase) {
      case 'ready':
        return 'Нажмите, чтобы начать';
      case 'inhale':
        return 'Вдохните...';
      case 'hold':
        return 'Задержите дыхание...';
      case 'exhale':
        return 'Выдохните...';
      default:
        return '';
    }
  };
  
  const circleScale = isActive
    ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.4],
      })
    : scaleAnim; // Используем пульсацию в режиме ожидания
  
  const getCircleColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return Colors.primary;
      case 'hold':
        return Colors.warning;
      case 'exhale':
        return Colors.calm;
      default:
        return Colors.secondary;
    }
  };
  
  return (
    <View style={styles.breathingContainer}>
      <Text style={styles.breathingTitle}>Дыхательное упражнение</Text>
      <Text style={styles.breathingDescription}>
        Простой цикл 4-4-6: вдох на 4 секунды, задержка на 4 секунды, выдох на 6 секунд
      </Text>
      
      <TouchableOpacity 
        style={styles.breathingCircleOuter}
        onPress={isActive ? stopExercise : startExercise}
        activeOpacity={0.9}
      >
        <Animated.View 
          style={[
            styles.breathingCircleInner, 
            { 
              backgroundColor: getCircleColor(),
              transform: [{ scale: circleScale }] 
            }
          ]}
        >
          <Text style={styles.breathingInstruction}>{getInstructions()}</Text>
          {isActive && (
            <Text style={styles.breathingTimer}>{seconds}</Text>
          )}
        </Animated.View>
      </TouchableOpacity>
      
      {isActive && (
        <TouchableOpacity 
          style={styles.stopButton}
          onPress={stopExercise}
          activeOpacity={0.7}
        >
          <Text style={styles.stopButtonText}>Остановить</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Компонент для выбора уровня тревожности с улучшенной анимацией
const AnxietyTracker = () => {
  const { anxietyLevel, updateAnxietyLevel } = useAnxiety();
  const [localLevel, setLocalLevel] = useState(anxietyLevel);
  
  // Синхронизируем локальный уровень с глобальным при инициализации
  useEffect(() => {
    setLocalLevel(anxietyLevel);
  }, [anxietyLevel]);
  
  const handleSaveAnxiety = () => {
    updateAnxietyLevel(localLevel);
    Alert.alert(
      "Уровень тревожности сохранен", 
      `Текущий уровень: ${localLevel}/10`,
      [{ text: "OK" }]
    );
  };
  
  return (
    <View style={styles.anxietyTrackerCard}>
      <Text style={styles.anxietyTrackerTitle}>Отслеживание тревожности</Text>
      <Text style={styles.anxietyQuestion}>Какой у вас уровень тревожности сейчас?</Text>
      
      <View style={styles.anxietyDotsContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(dotLevel => (
          <TouchableOpacity 
            key={dotLevel}
            onPress={() => setLocalLevel(dotLevel)}
            style={[
              styles.anxietyDot,
              localLevel === dotLevel && styles.anxietyDotSelected,
              {
                backgroundColor: 
                  dotLevel <= 3 ? Colors.success :
                  dotLevel <= 6 ? Colors.warning :
                  Colors.error
              }
            ]}
            activeOpacity={0.7}
          />
        ))}
      </View>
      
      <View style={styles.anxietyLabelsContainer}>
        <Text style={styles.anxietyLabel}>Спокойно</Text>
        <Text style={styles.anxietyLabel}>Тревожно</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSaveAnxiety}
        activeOpacity={0.7}
      >
        <Text style={styles.saveButtonText}>Сохранить</Text>
      </TouchableOpacity>
    </View>
  );
};

const Calm = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Спокойствие</Text>
      </View>
      
      {/* Улучшенный ScrollView с правильными настройками */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <AnxietyTracker />
        <BreathingExercise />
        
        <View style={styles.gratitudeSection}>
          <TouchableOpacity 
            style={styles.gratitudeCard}
            onPress={() => navigation.navigate('Gratitude')}
            activeOpacity={0.7}
          >
            <View style={styles.gratitudeHeader}>
              <Icon name="heart" size={24} color={Colors.primary} />
              <Text style={styles.gratitudeTitle}>Дневник благодарности</Text>
            </View>
            <Text style={styles.gratitudeDescription}>
              Запись благодарностей помогает снизить тревожность и улучшить настроение
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.gratitudeSection}>
          <TouchableOpacity 
            style={styles.gratitudeCard}
            onPress={() => navigation.navigate('Focus')}
            activeOpacity={0.7}
          >
            <View style={styles.gratitudeHeader}>
              <Icon name="clock-outline" size={24} color={Colors.important} />
              <Text style={styles.gratitudeTitle}>Фокус и концентрация</Text>
            </View>
            <Text style={styles.gratitudeDescription}>
              Техника Помодоро поможет вам сосредоточиться на важных задачах и повысить продуктивность
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Добавляем пространство для прокрутки под футером */}
        <View style={styles.footerSpacer} />
      </ScrollView>
      
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
          activeOpacity={0.7}
        >
          <Icon name="heart-pulse" size={24} color={Colors.primary} />
          <Text style={[styles.footerTabText, { color: Colors.primary }]}>Спокойствие</Text>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 10,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContentContainer: {
    paddingBottom: 120, // Достаточно большой отступ для прокрутки под футером
  },
  anxietyTrackerCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    width: '100%',
  },
  anxietyTrackerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  anxietyQuestion: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  anxietyDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  anxietyDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    // Добавляем отступы для улучшения отзывчивости
    padding: 10,
    margin: -8, // Компенсируем padding, но сохраняем большую площадь касания
  },
  anxietyDotSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
  },
  anxietyLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  anxietyLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  breathingContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  breathingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  breathingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  breathingCircleOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  breathingCircleInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingInstruction: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    padding: 5,
  },
  breathingTimer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  stopButton: {
    marginTop: 16,
    padding: 8,
  },
  stopButtonText: {
    fontSize: 16,
    color: Colors.primary,
  },
  gratitudeSection: {
    marginVertical: 10,
    width: '100%',
  },
  gratitudeCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  gratitudeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gratitudeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  gratitudeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footerSpacer: {
    height: 80, // Дополнительное пространство снизу
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

export default Calm;