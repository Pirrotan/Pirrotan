// src/context/FinanceContext.js - обновленная версия с функцией удаления платежей
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
  const [financialData, setFinancialData] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
    budgets: [],
    transactions: [],
    upcomingPayments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка финансовых данных при запуске
  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        setLoading(true);
        const storedData = await AsyncStorage.getItem('financialData');
        if (storedData) {
          setFinancialData(JSON.parse(storedData));
          console.log('Данные финансов загружены успешно');
        } else {
          // Демо-данные для первого запуска
          setFinancialData({
            balance: 42500,
            income: 65000,
            expenses: 22500,
            savings: 35, // Процент экономии
            month: getCurrentMonth(),
            
            // Бюджеты по категориям
            budgets: [
              {
                id: '1',
                title: 'Жильё',
                current: 15000,
                total: 18000,
                percentage: 83,
                icon: 'home',
              },
              {
                id: '2',
                title: 'Продукты',
                current: 4500,
                total: 10000,
                percentage: 45,
                icon: 'food-apple',
              },
              {
                id: '3',
                title: 'Развлечения',
                current: 3000,
                total: 3000,
                percentage: 100,
                icon: 'movie-open',
              },
            ],
            
            // История транзакций
            transactions: [
              {
                id: '1',
                title: 'Зарплата',
                amount: 65000,
                type: 'income',
                category: 'Зарплата',
                date: new Date(2023, 4, 10).toISOString(),
              },
              {
                id: '2',
                title: 'Аренда квартиры',
                amount: 15000,
                type: 'expense',
                category: 'Жильё',
                date: new Date(2023, 4, 5).toISOString(),
              },
              {
                id: '3',
                title: 'Продукты в Пятёрочке',
                amount: 4500,
                type: 'expense',
                category: 'Продукты',
                date: new Date(2023, 4, 12).toISOString(),
              },
              {
                id: '4',
                title: 'Кино',
                amount: 1000,
                type: 'expense',
                category: 'Развлечения',
                date: new Date(2023, 4, 15).toISOString(),
              },
              {
                id: '5',
                title: 'Ресторан',
                amount: 2000,
                type: 'expense',
                category: 'Развлечения',
                date: new Date(2023, 4, 20).toISOString(),
              },
            ],
            
            // Предстоящие платежи
            upcomingPayments: [
              {
                id: '1',
                title: 'Электричество',
                amount: 1200,
                dueDate: getDateInDays(3),
                category: 'Коммунальные услуги',
                icon: 'flash',
                color: '#FF9800',
              },
              {
                id: '2',
                title: 'Netflix',
                amount: 799,
                dueDate: getDateInDays(5),
                category: 'Подписки',
                icon: 'television-play',
                color: '#F44336',
              },
            ],
          });
          
          // Сохраняем демо-данные в AsyncStorage
          await saveFinancialDataToStorage({
            balance: 42500,
            income: 65000,
            expenses: 22500,
            savings: 35,
            month: getCurrentMonth(),
            budgets: [
              {
                id: '1',
                title: 'Жильё',
                current: 15000,
                total: 18000,
                percentage: 83,
                icon: 'home',
              },
              {
                id: '2',
                title: 'Продукты',
                current: 4500,
                total: 10000,
                percentage: 45,
                icon: 'food-apple',
              },
              {
                id: '3',
                title: 'Развлечения',
                current: 3000,
                total: 3000,
                percentage: 100,
                icon: 'movie-open',
              },
            ],
            transactions: [
              {
                id: '1',
                title: 'Зарплата',
                amount: 65000,
                type: 'income',
                category: 'Зарплата',
                date: new Date(2023, 4, 10).toISOString(),
              },
              {
                id: '2',
                title: 'Аренда квартиры',
                amount: 15000,
                type: 'expense',
                category: 'Жильё',
                date: new Date(2023, 4, 5).toISOString(),
              },
              {
                id: '3',
                title: 'Продукты в Пятёрочке',
                amount: 4500,
                type: 'expense',
                category: 'Продукты',
                date: new Date(2023, 4, 12).toISOString(),
              },
              {
                id: '4',
                title: 'Кино',
                amount: 1000,
                type: 'expense',
                category: 'Развлечения',
                date: new Date(2023, 4, 15).toISOString(),
              },
              {
                id: '5',
                title: 'Ресторан',
                amount: 2000,
                type: 'expense',
                category: 'Развлечения',
                date: new Date(2023, 4, 20).toISOString(),
              },
            ],
            upcomingPayments: [
              {
                id: '1',
                title: 'Электричество',
                amount: 1200,
                dueDate: getDateInDays(3),
                category: 'Коммунальные услуги',
                icon: 'flash',
                color: '#FF9800',
              },
              {
                id: '2',
                title: 'Netflix',
                amount: 799,
                dueDate: getDateInDays(5),
                category: 'Подписки',
                icon: 'television-play',
                color: '#F44336',
              },
            ],
          });
          console.log('Демо-данные финансов установлены');
        }
      } catch (error) {
        console.error('Ошибка загрузки финансовых данных:', error);
        setError('Не удалось загрузить финансовые данные');
      } finally {
        setLoading(false);
      }
    };

    loadFinancialData();
  }, []);

  // Функция для сохранения в AsyncStorage
  const saveFinancialDataToStorage = async (data) => {
    try {
      await AsyncStorage.setItem('financialData', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Ошибка сохранения финансовых данных:', error);
      return false;
    }
  };

  // Функция для сохранения данных при их изменении
  const saveFinancialData = useCallback(async (updatedData) => {
    try {
      setLoading(true);
      const success = await saveFinancialDataToStorage(updatedData);
      
      if (success) {
        setFinancialData(updatedData);
        setError(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка сохранения финансовых данных:', error);
      setError('Не удалось сохранить изменения');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Добавление транзакции
  const addTransaction = useCallback((transaction) => {
    try {
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      
      // Обновляем баланс
      const newBalance = transaction.type === 'income'
        ? financialData.balance + transaction.amount
        : financialData.balance - transaction.amount;
      
      // Обновляем доходы или расходы
      const newIncome = transaction.type === 'income'
        ? financialData.income + transaction.amount
        : financialData.income;
      
      const newExpenses = transaction.type === 'expense'
        ? financialData.expenses + transaction.amount
        : financialData.expenses;
      
      // Обновляем экономию
      const newSavings = newIncome > 0
        ? Math.round(((newIncome - newExpenses) / newIncome) * 100)
        : 0;
      
      // Обновляем бюджеты если это расход
      let newBudgets = [...financialData.budgets];
      if (transaction.type === 'expense') {
        newBudgets = newBudgets.map(budget => {
          if (budget.title === transaction.category) {
            const newCurrent = budget.current + transaction.amount;
            const newPercentage = Math.round((newCurrent / budget.total) * 100);
            return {
              ...budget,
              current: newCurrent,
              percentage: newPercentage,
            };
          }
          return budget;
        });
      }
      
      const updatedData = {
        ...financialData,
        balance: newBalance,
        income: newIncome,
        expenses: newExpenses,
        savings: newSavings,
        budgets: newBudgets,
        transactions: [...financialData.transactions, newTransaction],
      };
      
      saveFinancialData(updatedData);
      return newTransaction;
    } catch (error) {
      console.error('Ошибка при добавлении транзакции:', error);
      setError('Не удалось добавить транзакцию');
      return null;
    }
  }, [financialData, saveFinancialData]);

  // Добавление предстоящего платежа
  const addUpcomingPayment = useCallback((payment) => {
    try {
      const newPayment = {
        ...payment,
        id: Date.now().toString(),
      };
      
      const updatedData = {
        ...financialData,
        upcomingPayments: [...financialData.upcomingPayments, newPayment],
      };
      
      saveFinancialData(updatedData);
      return newPayment;
    } catch (error) {
      console.error('Ошибка при добавлении платежа:', error);
      setError('Не удалось добавить платеж');
      return null;
    }
  }, [financialData, saveFinancialData]);

  // НОВАЯ ФУНКЦИЯ: Удаление предстоящего платежа
  const deleteUpcomingPayment = useCallback(async (paymentId) => {
    try {
      // Проверяем, существует ли платеж с таким id
      const payment = financialData.upcomingPayments.find(p => p.id === paymentId);
      if (!payment) {
        throw new Error('Платеж не найден');
      }
      
      const updatedPayments = financialData.upcomingPayments.filter(p => p.id !== paymentId);
      
      const updatedData = {
        ...financialData,
        upcomingPayments: updatedPayments,
      };
      
      const success = await saveFinancialData(updatedData);
      
      if (success) {
        console.log('Платеж удален, ID:', paymentId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка при удалении платежа:', error);
      setError('Не удалось удалить платеж');
      return false;
    }
  }, [financialData, saveFinancialData]);

  // НОВАЯ ФУНКЦИЯ: Редактирование предстоящего платежа
  const updateUpcomingPayment = useCallback(async (updatedPayment) => {
    try {
      // Проверяем, существует ли платеж с таким id
      if (!financialData.upcomingPayments.find(p => p.id === updatedPayment.id)) {
        throw new Error('Платеж не найден');
      }
      
      const updatedPayments = financialData.upcomingPayments.map(payment => 
        payment.id === updatedPayment.id ? updatedPayment : payment
      );
      
      const updatedData = {
        ...financialData,
        upcomingPayments: updatedPayments,
      };
      
      const success = await saveFinancialData(updatedData);
      
      if (success) {
        console.log('Платеж обновлен:', updatedPayment);
        return updatedPayment;
      }
      
      return null;
    } catch (error) {
      console.error('Ошибка при обновлении платежа:', error);
      setError('Не удалось обновить платеж');
      return null;
    }
  }, [financialData, saveFinancialData]);

  // Оплата предстоящего платежа
  const payUpcomingPayment = useCallback((paymentId) => {
    try {
      const payment = financialData.upcomingPayments.find(p => p.id === paymentId);
      
      if (!payment) {
        throw new Error('Платеж не найден');
      }
      
      // Создаем транзакцию из платежа
      const transaction = {
        title: payment.title,
        amount: payment.amount,
        type: 'expense',
        category: payment.category,
        date: new Date().toISOString(),
      };
      
      // Добавляем транзакцию
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
      };
      
      // Обновляем баланс
      const newBalance = financialData.balance - payment.amount;
      
      // Обновляем расходы
      const newExpenses = financialData.expenses + payment.amount;
      
      // Обновляем экономию
      const newSavings = financialData.income > 0
        ? Math.round(((financialData.income - newExpenses) / financialData.income) * 100)
        : 0;
      
      // Обновляем бюджеты
      let newBudgets = [...financialData.budgets];
      newBudgets = newBudgets.map(budget => {
        if (budget.title === payment.category) {
          const newCurrent = budget.current + payment.amount;
          const newPercentage = Math.round((newCurrent / budget.total) * 100);
          return {
            ...budget,
            current: newCurrent,
            percentage: newPercentage,
          };
        }
        return budget;
      });
      
      // Удаляем платеж из списка предстоящих
      const updatedPayments = financialData.upcomingPayments.filter(p => p.id !== paymentId);
      
      const updatedData = {
        ...financialData,
        balance: newBalance,
        expenses: newExpenses,
        savings: newSavings,
        budgets: newBudgets,
        transactions: [...financialData.transactions, newTransaction],
        upcomingPayments: updatedPayments,
      };
      
      saveFinancialData(updatedData);
      return true;
    } catch (error) {
      console.error('Ошибка при оплате платежа:', error);
      setError('Не удалось оплатить платеж');
      return false;
    }
  }, [financialData, saveFinancialData]);

  // Получение текущего месяца в формате "Май 2023"
  const getCurrentMonth = () => {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    const date = new Date();
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Получение даты через указанное количество дней
  const getDateInDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return `Через ${days} ${getDayWord(days)}`;
  };
  
  // Функция для правильного склонения слова "день"
  const getDayWord = (days) => {
    if (days % 10 === 1 && days % 100 !== 11) {
      return 'день';
    } else if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) {
      return 'дня';
    } else {
      return 'дней';
    }
  };

  // Очистка ошибок
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        financialData,
        loading,
        error,
        addTransaction,
        addUpcomingPayment,
        deleteUpcomingPayment, // Новая функция
        updateUpcomingPayment, // Новая функция
        payUpcomingPayment,
        clearError,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export default { FinanceProvider, useFinance };