'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Board, { KanbanBoard } from '@/components/kanban/Board';
import styles from './page.module.css';
import { auth, projects as projectsApi, columns as columnsApi, tasks as tasksApi } from '@/api/api';

interface ProjectClientProps {
  projectId: string;
}

export default function ProjectClient({ projectId }: ProjectClientProps) {
  const router = useRouter();
  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  
  // Ефект для завантаження даних дошки
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        // First check if projectId is valid
        if (!projectId) {
          setLoadError('Недійсний ID проекту');
          setIsLoading(false);
          return;
        }
        
        // Перевіряємо авторизацію
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        // Отримуємо дані користувача
        const userResponse = await auth.me();
        setUser(userResponse.data);
        
        // Отримуємо останні проекти для сайдбару
        const projectsResponse = await projectsApi.getAll();
        setRecentProjects(projectsResponse.data.slice(0, 3));
        
        // Отримуємо дані проекту
        const projectResponse = await projectsApi.getById(projectId);
        const project = projectResponse.data;
        
        // Отримуємо колонки проекту
        const columnsResponse = await columnsApi.getAll(projectId);
        const columns = columnsResponse.data;
        
        // Отримуємо задачі проекту
        const tasksResponse = await tasksApi.getAll(projectId);
        const tasksData = tasksResponse.data;
        
        // Формуємо дані для дошки
        const boardData: KanbanBoard = {
          id: project._id || project.id,
          title: project.name,
          columns: {},
          columnOrder: project.columnOrder || [],
          tasks: {},
        };
        
        // Заповнюємо колонки
        columns.forEach((column: any) => {
          const columnId = column._id || column.id;
          boardData.columns[columnId] = {
            id: columnId,
            title: column.title,
            taskIds: column.taskIds || [],
          };
          
          // Додаємо ID колонки до порядку, якщо його ще немає
          if (!boardData.columnOrder.includes(columnId)) {
            boardData.columnOrder.push(columnId);
          }
        });
        
        // Оновлюємо порядок колонок на сервері, якщо він змінився
        if (JSON.stringify(boardData.columnOrder) !== JSON.stringify(project.columnOrder || [])) {
          try {
            await projectsApi.updateColumnOrder(projectId, boardData.columnOrder);
          } catch (err) {
            console.error('Error updating column order:', err);
          }
        }
        
        // Заповнюємо задачі
        tasksData.forEach((task: any) => {
          const taskId = task._id || task.id;
          boardData.tasks[taskId] = {
            id: taskId,
            title: task.title,
            description: task.description || '',
            createdAt: task.createdAt,
            deadline: task.deadline || undefined,
            labels: task.labels || [],
          };
          
          // Перевіряємо, чи є задача у відповідній колонці
          const columnId = task.columnId;
          if (columnId && boardData.columns[columnId]) {
            // Додаємо задачу в колонку, якщо її там ще немає
            if (!boardData.columns[columnId].taskIds.includes(taskId)) {
              boardData.columns[columnId].taskIds.push(taskId);
            }
          }
        });
        
        // Оновлюємо порядок задач у колонках
        for (const columnId in boardData.columns) {
          const column = boardData.columns[columnId];
          try {
            await columnsApi.updateTaskOrder(columnId, column.taskIds);
          } catch (err) {
            console.error(`Error updating task order for column ${columnId}:`, err);
          }
        }
        
        setBoard(boardData);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching board data:', error);
        setLoadError(error.response?.data?.message || error.message || 'Помилка при завантаженні дошки');
        setIsLoading(false);
      }
    };
    
    fetchBoard();
  }, [projectId, router]);
  
  // Функція оновлення дошки
  const handleBoardChange = async (updatedBoard: KanbanBoard) => {
    setBoard(updatedBoard);
    
    try {
      // Якщо змінився порядок колонок, оновлюємо його на сервері
      if (board && updatedBoard.columnOrder.join(',') !== board.columnOrder.join(',')) {
        await projectsApi.updateColumnOrder(projectId, updatedBoard.columnOrder);
      }
      
      // Перевіряємо зміни в колонках
      if (board) {
        for (const columnId in updatedBoard.columns) {
          const updatedColumn = updatedBoard.columns[columnId];
          const originalColumn = board.columns[columnId];
          
          // Якщо змінився порядок задач в колонці, оновлюємо його на сервері
          if (originalColumn && updatedColumn.taskIds.join(',') !== originalColumn.taskIds.join(',')) {
            await columnsApi.updateTaskOrder(columnId, updatedColumn.taskIds);
          }
        }
      }
    } catch (error) {
      console.error('Error updating board:', error);
    }
  };
  
  // Функція виходу з системи
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/auth/login');
  };
  
  // Відображаємо лоадер під час завантаження даних
  if (isLoading) {
    return (
      <MainLayout 
        user={null} 
        recentProjects={[]}
        onLogout={handleLogout}
      >
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Завантаження дошки...</p>
        </div>
      </MainLayout>
    );
  }
  
  // Якщо є помилка при завантаженні
  if (loadError) {
    return (
      <MainLayout 
        user={user} 
        recentProjects={recentProjects}
        onLogout={handleLogout}
      >
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Помилка при завантаженні дошки</h2>
          <p>{loadError}</p>
          <div className={styles.errorActions}>
            <button 
              className={styles.errorButton}
              onClick={() => router.push('/dashboard')}
            >
              Перейти до списку проектів
            </button>
            <button 
              className={styles.errorButton}
              onClick={() => window.location.reload()}
            >
              Спробувати знову
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Якщо дошка не знайдена, перенаправляємо на список проектів
  if (!board) {
    router.push('/dashboard');
    return null;
  }

  return (
    <MainLayout 
      user={user} 
      recentProjects={recentProjects}
      onLogout={handleLogout}
    >
      <div className={styles.boardContainer}>
        <Board board={board} onBoardChange={handleBoardChange} />
      </div>
    </MainLayout>
  );
}