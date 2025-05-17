'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import { uk } from 'date-fns/locale';
import MainLayout from '@/components/layout/MainLayout';
import TaskDetailsModal from '@/components/kanban/TaskDetails';
import { Button } from '@/components/ui/Button/Button';
import styles from './page.module.css';
import { auth, tasks as tasksApi, projects as projectsApi } from '@/api/api';
import { addTaskToGoogleCalendar } from '@/utils/googleCalendar';

// Типи даних
interface CalendarTask {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  createdAt: string;
  deadline: string;
  columnId: string;
  columnName: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [user, setUser] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  
  // Завантаження даних користувача, проектів та задач
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Перевіряємо авторизацію
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        // Отримуємо дані користувача
        const userResponse = await auth.me();
        setUser(userResponse.data);
        
        // Отримуємо проекти для сайдбару
        const projectsResponse = await projectsApi.getAll();
        setRecentProjects(projectsResponse.data.slice(0, 3));
        
        // Отримуємо всі задачі з дедлайнами
        const upcomingTasks = await tasksApi.getUpcoming(30); // Задачі на наступні 30 днів
        const overdueTasks = await tasksApi.getOverdue(); // Прострочені задачі
        
        // Об'єднуємо задачі та форматуємо їх для календаря
        const allTasks = [...upcomingTasks.data, ...overdueTasks.data];
        
        // Отримуємо деталі проектів для всіх задач
        const projectIds = [...new Set(allTasks.map(task => task.projectId))];
        const projectsData = await Promise.all(
          projectIds.map(async (id) => {
            try {
              const response = await projectsApi.getById(id);
              return response.data;
            } catch (error) {
              console.error(`Error fetching project ${id}:`, error);
              return { id, name: 'Невідомий проект' };
            }
          })
        );
        
        // Створюємо мапу проектів для швидкого доступу
        const projectsMap = projectsData.reduce((map, project) => {
          map[project.id] = project.name;
          return map;
        }, {});
        
        // Форматуємо задачі для календаря
        const formattedTasks = allTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          projectId: task.projectId,
          projectName: projectsMap[task.projectId] || 'Невідомий проект',
          createdAt: task.createdAt,
          deadline: task.deadline,
          columnId: task.columnId,
          columnName: task.columnName || 'Задачі',
        }));
        
        setTasks(formattedTasks);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [router]);
  
  // Отримання днів для календаря
  const calendarDays = useMemo(() => {
    if (viewMode === 'month') {
      // Початок та кінець місяця
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      // Початок та кінець календаря (з урахуванням днів з попереднього і наступного місяців)
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Понеділок
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      
      // Отримуємо всі дні для відображення в календарі
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else if (viewMode === 'week') {
      // Початок та кінець тижня
      const weekStart = startOfWeek(currentMonth, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentMonth, { weekStartsOn: 1 });
      
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      // Режим дня - повертаємо тільки поточний день
      return [currentMonth];
    }
  }, [currentMonth, viewMode]);
  
  // Функція для перевірки, чи є задачі на певний день
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      
      const deadlineDate = parseISO(task.deadline);
      return isSameDay(deadlineDate, day);
    });
  };
  
  // Переходи по календарю
  const nextMonth = () => {
    if (viewMode === 'month') {
      setCurrentMonth(addMonths(currentMonth, 1));
    } else if (viewMode === 'week') {
      setCurrentMonth(addMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };
  
  const prevMonth = () => {
    if (viewMode === 'month') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else if (viewMode === 'week') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(subMonths(currentMonth, 1));
    }
  };
  
  // Перехід до поточної дати
  const goToToday = () => {
    setCurrentMonth(new Date());
  };
  
  // Обробники для модального вікна задачі
  const openTaskDetails = (task: CalendarTask) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };
  
  const closeTaskDetails = () => {
    setIsTaskDetailsOpen(false);
  };
  
  // Функції роботи з задачами
  const handleEditTask = () => {
    setIsTaskDetailsOpen(false);
    // Перенаправлення на проект з фокусом на задачі
    if (selectedTask?.projectId) {
      router.push(`/dashboard/${selectedTask.projectId}`);
    }
  };
  
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    try {
      // Видаляємо задачу через API
      await tasksApi.delete(selectedTask.id);
      
      // Оновлюємо локальний стан
      setTasks(tasks.filter(task => task.id !== selectedTask.id));
      setIsTaskDetailsOpen(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      // Тут можна додати обробку помилки, наприклад, показати повідомлення користувачу
    }
  };
  
  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!selectedTask) return;
    
    try {
      // Використовуємо утиліту для додавання в Google Calendar
      addTaskToGoogleCalendar({
        title: selectedTask.title,
        description: selectedTask.description,
        deadline: selectedTask.deadline,
        projectName: selectedTask.projectName,
      });
    } catch (error) {
      console.error('Error adding to Google Calendar:', error);
      // Тут можна показати повідомлення про помилку
    }
  };
  
  // Функція для відображення карток задач на певний день
  const renderTasksForDay = (day: Date) => {
    const tasksForDay = getTasksForDay(day);
    
    if (tasksForDay.length === 0) {
      return null;
    }
    
    return (
      <div className={styles.tasksList}>
        {tasksForDay.map((task) => (
          <div
            key={task.id}
            className={styles.taskCard}
            onClick={() => openTaskDetails(task)}
          >
            <div className={styles.taskTime}>
              {format(parseISO(task.deadline), 'HH:mm', { locale: uk })}
            </div>
            <div className={styles.taskTitle}>{task.title}</div>
            <div className={styles.taskProject}>{task.projectName}</div>
          </div>
        ))}
      </div>
    );
  };
  
  // Функція для виходу з системи
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/auth/login');
  };
  
  // Відображення заглушки під час завантаження
  if (isLoading) {
    return (
      <MainLayout 
        user={null} 
        recentProjects={[]}
        onLogout={handleLogout}
      >
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Завантаження календаря...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      user={user} 
      recentProjects={recentProjects}
      onLogout={handleLogout}
    >
      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          <div className={styles.calendarTitle}>
            <h1>Календар задач</h1>
          </div>
          
          <div className={styles.calendarControls}>
            <div className={styles.viewControls}>
              <Button 
                variant={viewMode === 'month' ? 'primary' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Місяць
              </Button>
              <Button 
                variant={viewMode === 'week' ? 'primary' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Тиждень
              </Button>
              <Button 
                variant={viewMode === 'day' ? 'primary' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('day')}
              >
                День
              </Button>
            </div>
            
            <div className={styles.navigationControls}>
              <Button 
                variant="ghost"
                size="sm"
                onClick={prevMonth}
                aria-label="Попередній період"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Button>
              
              <Button 
                variant="ghost"
                onClick={goToToday}
              >
                Сьогодні
              </Button>
              
              <Button 
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                aria-label="Наступний період"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Button>
            </div>
            
            <div className={styles.currentPeriod}>
              {viewMode === 'month' && (
                <h2>{format(currentMonth, 'LLLL yyyy', { locale: uk })}</h2>
              )}
              {viewMode === 'week' && (
                <h2>
                  {format(startOfWeek(currentMonth, { weekStartsOn: 1 }), 'd MMM', { locale: uk })} - 
                  {format(endOfWeek(currentMonth, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: uk })}
                </h2>
              )}
              {viewMode === 'day' && (
                <h2>{format(currentMonth, 'd MMMM yyyy', { locale: uk })}</h2>
              )}
            </div>
          </div>
        </div>
        
        <div className={`${styles.calendar} ${styles[`view-${viewMode}`]}`}>
          {/* Дні тижня */}
          {viewMode !== 'day' && (
            <div className={styles.weekdays}>
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((day) => (
                <div key={day} className={styles.weekday}>
                  {day}
                </div>
              ))}
            </div>
          )}
          
          {/* Дні місяця */}
          <div className={styles.days}>
            {calendarDays.map((day) => (
              <div
                key={day.toString()}
                className={`
                  ${styles.day}
                  ${!isSameMonth(day, currentMonth) ? styles.otherMonth : ''}
                  ${isToday(day) ? styles.today : ''}
                `}
              >
                <div className={styles.dayHeader}>
                  {viewMode === 'day' ? (
                    <div className={styles.dayName}>
                      {format(day, 'EEEE', { locale: uk })}
                    </div>
                  ) : (
                    <div className={styles.dayNumber}>
                      {format(day, 'd', { locale: uk })}
                    </div>
                  )}
                </div>
                
                <div className={styles.dayContent}>
                  {renderTasksForDay(day)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Модальне вікно з деталями задачі */}
      {selectedTask && (
        <TaskDetailsModal
          isOpen={isTaskDetailsOpen}
          onClose={closeTaskDetails}
          task={{
            id: selectedTask.id,
            title: selectedTask.title,
            description: selectedTask.description,
            createdAt: selectedTask.createdAt,
            deadline: selectedTask.deadline,
            labels: [selectedTask.projectName, selectedTask.columnName],
          }}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onAddToCalendar={handleAddToCalendar}
        />
      )}
    </MainLayout>
  );
}