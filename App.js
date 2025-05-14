// App.js
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { LogBox } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Импортируем навигацию
import AppNavigator from './src/navigation/AppNavigator';

// Импортируем контексты
import { TaskProvider } from './src/context/TaskContext';
import { FinanceProvider } from './src/context/FinanceContext';
import { AnxietyProvider } from './src/context/AnxietyContext';
import { UserProvider } from './src/context/UserContext';
import { ProjectProvider } from './src/context/ProjectContext';

// Игнорируем некоторые предупреждения, которые могут появиться из-за особенностей React Native
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
  'Warning: Cannot update a component from inside the function body',
  'Non-serializable values were found in the navigation state',
]);

// Настраиваем уведомления для всего приложения
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Основной компонент приложения
export default function App() {
  // Настраиваем push-уведомления при запуске приложения
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Проверяем, работаем ли мы на реальном устройстве
        if (Device.isDevice) {
          // Проверка и запрос разрешений на уведомления
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          
          if (finalStatus !== 'granted') {
            console.log('Не удалось получить разрешение на отправку уведомлений!');
            return;
          }
          
          // Получаем токен для push-уведомлений (для использования с внешними сервисами)
          const token = (await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig.extra.eas.projectId,
          })).data;
          console.log('Expo Push Token:', token);
        } else {
          console.log('Необходимо использовать физическое устройство для push-уведомлений');
        }
        
        // Настройка обработчика для действий по нажатию на уведомление
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
          // Получаем данные из уведомления
          const data = response.notification.request.content.data;
          
          // Различные действия в зависимости от типа уведомления
          if (data.type === 'task') {
            // Логика для задач
            console.log('Нажатие на уведомление задачи:', data.taskId);
          } else if (data.type === 'payment') {
            // Логика для платежей
            console.log('Нажатие на уведомление платежа:', data.paymentId);
          }
        });
        
        // Обработчик для получения уведомлений, когда приложение запущено
        const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
          console.log('Получено уведомление в foreground:', notification);
        });
        
        // Очистка подписок при размонтировании компонента
        return () => {
          subscription.remove();
          foregroundSubscription.remove();
        };
      } catch (error) {
        console.error('Ошибка настройки уведомлений:', error);
      }
    };
    
    setupNotifications();
  }, []);
  
  return (
    <UserProvider>
      <ProjectProvider>
        <TaskProvider>
          <FinanceProvider>
            <AnxietyProvider>
              <StatusBar barStyle="light-content" backgroundColor="#1A1F25" />
              <AppNavigator />
            </AnxietyProvider>
          </FinanceProvider>
        </TaskProvider>
      </ProjectProvider>
    </UserProvider>
  );
}