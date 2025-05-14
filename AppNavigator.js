// src/navigation/AppNavigator.js - обновленная версия с улучшенными анимациями
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Animated, Easing, ActivityIndicator, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';

// Импорт всех экранов
import Onboarding from '../screens/Onboarding';
import Home from '../screens/Home';
import Tasks from '../screens/Tasks';
import NewTask from '../screens/NewTask';
import Finance from '../screens/Finance';
import FinancialAnalytics from '../screens/FinancialAnalytics';
import Calm from '../screens/Calm';
import Gratitude from '../screens/Gratitude';
import Focus from '../screens/Focus';
import Settings from '../screens/Settings';

const Stack = createStackNavigator();

// Конфигурация улучшенных анимаций перехода между экранами
const config = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 50,
    mass: 3,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

// Стандартная анимация перехода между экранами (улучшенная версия)
const standardTransition = {
  transitionSpec: {
    open: config,
    close: config,
  },
  cardStyleInterpolator: ({ current, next, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
              extrapolate: 'clamp',
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
              extrapolate: 'clamp',
            }),
          },
        ],
        opacity: current.progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.7, 1],
        }),
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

// Анимация свайпа назад (новая)
const swipeBackTransition = {
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: config,
    close: config,
  },
  cardStyleInterpolator: ({ current, next, layouts }) => {
    // Анимация для текущего экрана
    const currentTranslate = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [layouts.screen.width, 0],
      extrapolate: 'clamp',
    });
    
    // Анимация для следующего экрана (при свайпе назад)
    const nextTranslate = next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -layouts.screen.width / 4],
          extrapolate: 'clamp',
        })
      : 0;
    
    // Анимация затемнения при свайпе
    const opacity = current.progress.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [0, 0.7, 1],
      extrapolate: 'clamp',
    });
    
    // Анимация масштаба
    const scale = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.92, 1],
      extrapolate: 'clamp',
    });
    
    return {
      cardStyle: {
        transform: [
          { translateX: currentTranslate },
          { scale: scale }
        ],
        opacity,
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.7],
        }),
      },
      containerStyle: {
        transform: [
          { translateX: nextTranslate }
        ]
      }
    };
  },
};

// Анимация модального окна (снизу вверх) - улучшенная
const modalTransition = {
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 350,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 300,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      },
    },
  },
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
              extrapolate: 'clamp',
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.95, 0.97, 1],
              extrapolate: 'clamp',
            }),
          },
        ],
        opacity: current.progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.7, 1],
        }),
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.7],
        }),
      },
    };
  },
};

// Анимация перехода с затуханием
const fadeTransition = {
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 400,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 300,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      },
    },
  },
  cardStyleInterpolator: ({ current }) => {
    return {
      cardStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.7, 1],
        }),
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.7],
        }),
      },
    };
  },
};

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  
  // Анимация загрузки приложения
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Проверяем, был ли ранее запуск приложения
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        
        if (hasLaunched === null) {
          // Это первый запуск
          await AsyncStorage.setItem('hasLaunched', 'true');
          setIsFirstLaunch(true);
        } else {
          // Это не первый запуск
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Ошибка проверки первого запуска:', error);
        // По умолчанию считаем, что это не первый запуск
        setIsFirstLaunch(false);
      } finally {
        setIsLoading(false);
        
        // Запускаем анимацию появления после загрузки
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }).start();
      }
    };

    checkFirstLaunch();
  }, []);

  if (isLoading) {
    // Показываем загрузку, пока проверяем состояние первого запуска
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, color: Colors.textPrimary }}>Загрузка приложения...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isFirstLaunch ? "Onboarding" : "Home"}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#1A1F25' },
            ...swipeBackTransition, // Применяем улучшенную анимацию свайпа назад по умолчанию
          }}
        >
          {isFirstLaunch && (
            <Stack.Screen 
              name="Onboarding" 
              component={Onboarding} 
              options={{ ...fadeTransition }}
            />
          )}
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Tasks" component={Tasks} />
          <Stack.Screen 
            name="NewTask" 
            component={NewTask} 
            options={{ ...modalTransition }}
          />
          <Stack.Screen name="Finance" component={Finance} />
          <Stack.Screen 
            name="FinancialAnalytics" 
            component={FinancialAnalytics}
          />
          <Stack.Screen name="Calm" component={Calm} />
          <Stack.Screen name="Gratitude" component={Gratitude} />
          <Stack.Screen name="Focus" component={Focus} />
          <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
      </NavigationContainer>
    </Animated.View>
  );
};

export default AppNavigator;