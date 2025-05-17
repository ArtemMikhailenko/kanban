// src/app/analytics/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  format,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  addDays,
} from 'date-fns';
import { uk } from 'date-fns/locale';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button/Button';
import { analytics, auth, tasks as tasksApi } from '@/api/api'; // Импортируем API
import styles from './page.module.css';

// Типы данных
interface Project {
  id: string;
  name: string;
  tasksCount: number;
  completedTasksCount: number;
  columnsCount: number;
  createdAt: string;
  updatedAt: string;
  // Новые поля для аналитики
  filteredTasksCount?: number;
  filteredCompletedTasksCount?: number;
  completionRate?: number;
}

interface Task {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  createdAt: string;
  deadline: string | null;
  completed: boolean;
  columnId: string;
  columnName: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
}

interface Statistics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  projectsData: Project[];
}

interface RecentProject {
  id: string;
  name: string;
}

// Типы для фільтрації
type TimeFilter = 'all' | 'week' | 'month' | 'custom';

// Интерфейсы для данных API
interface ApiStatistics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  projects: {
    id: string;
    name: string;
    tasksCount: number;
    completedTasksCount: number;
    columnsCount: number;
    createdAt: string;
    updatedAt: string;
    filteredTasksCount: number;
    filteredCompletedTasksCount: number;
    completionRate: number;
  }[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  
  // Функция для выхода из системы
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/auth/login');
  };
  
  // Получаем данные о пользователе
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await auth.me();
        setUser(response.data);
        
        // Здесь также можно получить недавние проекты, если это предусмотрено в API
        // Например:
        // const projectsResponse = await projects.getAll();
        // setRecentProjects(projectsResponse.data.slice(0, 3));
        
        // Временный вариант из-за отсутствия метода API для получения недавних проектов
        const projectsData = response.data.recentProjects || [];
        setRecentProjects(projectsData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/auth/login');
      }
    };
    
    fetchUserData();
  }, [router]);
  
  // Загрузка аналитических данных при изменении фильтра времени
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Вызываем соответствующий метод API в зависимости от выбранного фильтра времени
        const params: { timeRange: string; startDate?: string; endDate?: string } = { 
          timeRange: timeFilter === 'all' ? 'all' : timeFilter 
        };
        
        if (timeFilter === 'custom') {
          params.startDate = customDateRange.start;
          params.endDate = customDateRange.end;
        }
        
        // Получаем статистику
        const statsResponse = await analytics.getStatistics(
          params.timeRange, 
          params.startDate, 
          params.endDate
        );
        
        // Приводим данные к требуемому формату
        const apiStats: ApiStatistics = statsResponse.data;
        
        setStatistics({
          totalTasks: apiStats.totalTasks,
          completedTasks: apiStats.completedTasks,
          completionRate: apiStats.completionRate,
          overdueTasks: apiStats.overdueTasks,
          upcomingDeadlines: apiStats.upcomingDeadlines,
          projectsData: apiStats.projects
        });
        
        // Получаем предстоящие задачи с дедлайнами
        const upcomingResponse = await tasksApi.getUpcoming(7);
        setUpcomingTasks(upcomingResponse.data);
        
        // Получаем просроченные задачи
        const overdueResponse = await tasksApi.getOverdue();
        setOverdueTasks(overdueResponse.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeFilter, customDateRange, user]);
  
  // Форматування дати
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd.MM.yyyy', { locale: uk });
  };
  
  // Відображення заглушки під час завантаження
  if (isLoading) {
    return (
      <MainLayout 
        user={user || undefined} 
        recentProjects={recentProjects}
        onLogout={handleLogout}
      >
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Завантаження аналітики...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      user={user || undefined} 
      recentProjects={recentProjects}
      onLogout={handleLogout}
    >
      <div className={styles.analyticsContainer}>
        <div className={styles.analyticsHeader}>
          <div className={styles.analyticsTitle}>
            <h1>Аналітика</h1>
          </div>
          
          <div className={styles.filterControls}>
            <div className={styles.timeFilterLabel}>
              Період:
            </div>
            <div className={styles.timeFilterButtons}>
              <Button 
                variant={timeFilter === 'week' ? 'primary' : 'outline'} 
                size="sm"
                onClick={() => setTimeFilter('week')}
              >
                Тиждень
              </Button>
              <Button 
                variant={timeFilter === 'month' ? 'primary' : 'outline'} 
                size="sm"
                onClick={() => setTimeFilter('month')}
              >
                Місяць
              </Button>
              <Button 
                variant={timeFilter === 'all' ? 'primary' : 'outline'} 
                size="sm"
                onClick={() => setTimeFilter('all')}
              >
                Всі
              </Button>
              <Button 
                variant={timeFilter === 'custom' ? 'primary' : 'outline'} 
                size="sm"
                onClick={() => setTimeFilter('custom')}
              >
                Інший...
              </Button>
            </div>
            
            {timeFilter === 'custom' && (
              <div className={styles.customDateRange}>
                <div className={styles.dateRangeInputs}>
                  <div className={styles.dateInput}>
                    <label htmlFor="start-date">Від:</label>
                    <input
                      id="start-date"
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange({
                        ...customDateRange,
                        start: e.target.value,
                      })}
                    />
                  </div>
                  <div className={styles.dateInput}>
                    <label htmlFor="end-date">До:</label>
                    <input
                      id="end-date"
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange({
                        ...customDateRange,
                        end: e.target.value,
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {statistics && (
          <div className={styles.analyticsGrid}>
            {/* Карточки зі статистикою */}
            <div className={styles.statsCards}>
              <div className={styles.statsCard}>
                <div className={styles.statsIconContainer}>
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>
                <div className={styles.statsContent}>
                  <div className={styles.statsValue}>{statistics.totalTasks}</div>
                  <div className={styles.statsLabel}>Всього задач</div>
                </div>
              </div>
              
              <div className={styles.statsCard}>
                <div className={styles.statsIconContainer}>
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className={styles.statsContent}>
                  <div className={styles.statsValue}>{statistics.completedTasks}</div>
                  <div className={styles.statsLabel}>Завершено задач</div>
                </div>
              </div>
              
              <div className={styles.statsCard}>
                <div className={styles.statsIconContainer}>
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div className={styles.statsContent}>
                  <div className={styles.statsValue}>{statistics.upcomingDeadlines}</div>
                  <div className={styles.statsLabel}>Наближаються дедлайни</div>
                </div>
              </div>
              
              <div className={styles.statsCard}>
                <div className={styles.statsIconContainer}>
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                    <path d="M20 10a8 8 0 1 0-16 0" />
                    <path d="M2 10h10v10" />
                  </svg>
                </div>
                <div className={styles.statsContent}>
                  <div className={styles.statsValue}>{statistics.completionRate}%</div>
                  <div className={styles.statsLabel}>Відсоток виконання</div>
                </div>
              </div>
            </div>
            
            {/* Графік прогресу по проектам */}
            <div className={styles.projectsProgressSection}>
              <h2 className={styles.sectionTitle}>Прогрес проектів</h2>
              
              <div className={styles.projectsProgressList}>
                {statistics.projectsData.map((project) => (
                  <div key={project.id} className={styles.projectProgressItem}>
                    <div className={styles.projectInfoHeader}>
                      <div className={styles.projectName}>{project.name}</div>
                      <div className={styles.projectCompletionRate}>
                        {project.completionRate}%
                      </div>
                    </div>
                    
                    <div className={styles.progressBarContainer}>
                      <div 
                        className={styles.progressBar}
                        style={{ width: `${project.completionRate}%` }}
                      ></div>
                    </div>
                    
                    <div className={styles.projectStats}>
                      <div className={styles.projectStat}>
                        <span className={styles.statLabel}>Задачі:</span>
                        <span className={styles.statValue}>
                          {project.filteredCompletedTasksCount} / {project.filteredTasksCount}
                        </span>
                      </div>
                      <div className={styles.projectStat}>
                        <span className={styles.statLabel}>Оновлено:</span>
                        <span className={styles.statValue}>
                          {formatDate(project.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {statistics.projectsData.length === 0 && (
                  <div className={styles.emptyState}>
                    <p>Немає проектів для відображення в обраному періоді.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Список задач з дедлайнами */}
            <div className={styles.upcomingDeadlinesSection}>
              <h2 className={styles.sectionTitle}>Наближаються дедлайни</h2>
              
              <div className={styles.deadlinesList}>
                {upcomingTasks.map((task) => (
                  <div key={task.id} className={styles.deadlineItem}>
                    <div className={styles.deadlineItemHeader}>
                      <div className={styles.deadlineDate}>
                        {task.deadline && formatDate(task.deadline)}
                      </div>
                      <div className={styles.projectBadge}>
                        {task.projectName}
                      </div>
                    </div>
                    <div className={styles.deadlineTitle}>
                      {task.title}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/dashboard/${task.projectId}`)}
                    >
                      Перейти до задачі
                    </Button>
                  </div>
                ))}
                  
                {upcomingTasks.length === 0 && (
                  <div className={styles.emptyState}>
                    <p>Немає наближених дедлайнів на наступний тиждень.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Список прострочених задач */}
            <div className={styles.overdueTasksSection}>
              <h2 className={styles.sectionTitle}>Прострочені задачі</h2>
              
              <div className={styles.overdueList}>
                {overdueTasks.map((task) => (
                  <div key={task.id} className={styles.overdueItem}>
                    <div className={styles.overdueItemHeader}>
                      <div className={styles.overdueDate}>
                        {task.deadline && formatDate(task.deadline)}
                      </div>
                      <div className={styles.projectBadge}>
                        {task.projectName}
                      </div>
                    </div>
                    <div className={styles.overdueTitle}>
                      {task.title}
                    </div>
                    <div className={styles.overdueActions}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/dashboard/${task.projectId}`)}
                      >
                        Перейти до задачі
                      </Button>
                    </div>
                  </div>
                ))}
                
                {overdueTasks.length === 0 && (
                  <div className={styles.emptyState}>
                    <p>Немає прострочених задач. Чудова робота!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}