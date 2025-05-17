'use client';

/**
 * Утиліта для роботи з Google Calendar API
 * Дозволяє додавати та синхронізувати задачі з Google Calendar
 */

/**
 * Функція для додавання задачі в Google Calendar
 * @param task Дані задачі
 */
export const addTaskToGoogleCalendar = (task: {
  title: string;
  description?: string;
  deadline?: string;
  projectName?: string;
}) => {
  // Перевіряємо наявність дедлайну
  if (!task.deadline) {
    throw new Error('Для додавання в календар необхідно вказати дедлайн');
  }
      
  // Формуємо URL для Google Calendar
  const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
  googleCalendarUrl.searchParams.append('action', 'TEMPLATE');
  googleCalendarUrl.searchParams.append('text', task.title);
      
  if (task.description) {
    googleCalendarUrl.searchParams.append('details', task.description);
  }
      
  // Додаємо інформацію про проект
  if (task.projectName) {
    googleCalendarUrl.searchParams.append('location', `Проект: ${task.projectName}`);
  }
      
  // Форматуємо дедлайн для Google Calendar
  const deadlineDate = new Date(task.deadline);
  const endDate = new Date(deadlineDate);
  endDate.setHours(deadlineDate.getHours() + 1); // Додаємо годину за замовчуванням
      
  // Форматуємо дати в правильному форматі для Google Calendar (YYYYMMDDTHHMMSSZ)
  const formattedStart = deadlineDate.toISOString().replace(/-|:|\.\d+/g, '');
  const formattedEnd = endDate.toISOString().replace(/-|:|\.\d+/g, '');
      
  googleCalendarUrl.searchParams.append('dates', `${formattedStart}/${formattedEnd}`);
      
  // Відкриваємо URL в новому вікні
  window.open(googleCalendarUrl.toString(), '_blank');
};

/**
 * Наступні функції можуть бути додані в майбутньому
 * для розширення інтеграції з Google Calendar API
 */

// Функція для синхронізації задач з Google Calendar
// Вимагає налаштування OAuth авторизації
export const syncTasksWithGoogleCalendar = async (tasks: any[], calendarId?: string) => {
  throw new Error('Ця функція ще не реалізована. Потрібна OAuth авторизація з Google Calendar API');
  
  // В майбутньому можна реалізувати повну синхронізацію:
  // 1. Авторизувати користувача з Google Calendar API
  // 2. Отримати список календарів користувача
  // 3. Створити новий календар, якщо потрібно
  // 4. Синхронізувати задачі в обох напрямках
};

// Функція для отримання списку подій з Google Calendar
export const getGoogleCalendarEvents = async (startDate: Date, endDate: Date, calendarId?: string) => {
  throw new Error('Ця функція ще не реалізована. Потрібна OAuth авторизація з Google Calendar API');
  
  // В майбутньому можна реалізувати отримання подій:
  // 1. Авторизувати користувача з Google Calendar API
  // 2. Отримати події для вказаного діапазону дат
  // 3. Перетворити їх у формат задач додатку
};

// Функція для зв'язування облікового запису з Google Calendar
export const connectGoogleCalendar = async () => {
  throw new Error('Ця функція ще не реалізована. Потрібна OAuth авторизація з Google Calendar API');
  
  // В майбутньому можна реалізувати з'єднання акаунтів:
  // 1. Відкрити діалог OAuth авторизації з Google
  // 2. Отримати доступ до календаря користувача
  // 3. Зберегти токени доступу для майбутнього використання
};

export default {
  addTaskToGoogleCalendar,
  syncTasksWithGoogleCalendar,
  getGoogleCalendarEvents,
  connectGoogleCalendar
};