// src/components/kanban/Task.tsx
import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { uk } from 'date-fns/locale';
import EditTaskModal from './EditTaskModal';
import TaskDetailsModal from './TaskDetails';
import { Task as TaskType } from './Board';
import styles from './Task.module.css';

interface TaskProps {
  task: TaskType;
  index: number;
  columnId: string;
  onUpdateTask: (taskId: string, updatedTask: Partial<TaskType>) => Promise<void>;
  onDeleteTask: (taskId: string, columnId: string) => Promise<void>;
  isColumnDeleting?: boolean;
}

const Task: React.FC<TaskProps> = ({ 
  task, 
  index, 
  columnId, 
  onUpdateTask, 
  onDeleteTask,
  isColumnDeleting = false
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Функція для форматування дедлайну
  const formatDeadline = (dateString?: string) => {
    if (!dateString) return null;
    
    const deadline = new Date(dateString);
    const now = new Date();
    
    // Перевірка на минулий дедлайн
    if (isPast(deadline) && !isToday(deadline)) {
      return {
        text: `Протерміновано: ${formatDistanceToNow(deadline, { addSuffix: true, locale: uk })}`,
        className: styles.deadlineOverdue
      };
    }
    
    // Дедлайн сьогодні
    if (isToday(deadline)) {
      return {
        text: 'Дедлайн: Сьогодні',
        className: styles.deadlineToday
      };
    }
    
    // Дедлайн завтра
    if (isTomorrow(deadline)) {
      return {
        text: 'Дедлайн: Завтра',
        className: styles.deadlineTomorrow
      };
    }
    
    // Майбутній дедлайн
    return {
      text: `Дедлайн: ${formatDistanceToNow(deadline, { addSuffix: true, locale: uk })}`,
      className: styles.deadlineFuture
    };
  };
  
  const deadlineInfo = task.deadline ? formatDeadline(task.deadline) : null;
  
  // Обробка видалення задачі
  const handleDeleteTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    setIsOptionsOpen(false);
    
    try {
      await onDeleteTask(task.id, columnId);
    } catch (error) {
      console.error('Error deleting task:', error);
      setIsDeleting(false);
    }
  };
  
  // Відкриття модального вікна редагування
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
    setIsOptionsOpen(false);
  };
  
  // Додавання до Google Calendar
  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Формуємо URL для Google Calendar
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.append('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.append('text', task.title);
    
    if (task.description) {
      googleCalendarUrl.searchParams.append('details', task.description);
    }
    
    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      const endDate = new Date(deadlineDate);
      endDate.setHours(deadlineDate.getHours() + 1); // Додаємо годину тривалості за замовчуванням
      
      // Форматуємо дати в правильному форматі для Google Calendar (YYYYMMDDTHHMMSSZ)
      const formattedStart = deadlineDate.toISOString().replace(/-|:|\.\d+/g, '');
      const formattedEnd = endDate.toISOString().replace(/-|:|\.\d+/g, '');
      
      googleCalendarUrl.searchParams.append('dates', `${formattedStart}/${formattedEnd}`);
    }
    
    // Відкриваємо в новому вікні
    window.open(googleCalendarUrl.toString(), '_blank');
    setIsOptionsOpen(false);
  };
  
  // Обробка оновлення задачі
  const handleUpdateTask = async (updatedTask: Partial<TaskType>) => {
    setIsUpdating(true);
    
    try {
      await onUpdateTask(task.id, updatedTask);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Зупиняємо подію кліку, щоб не закривати випадаюче меню опцій
  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOptionsOpen(!isOptionsOpen);
  };
  
  // Відкриває детальне представлення задачі
  const handleTaskClick = () => {
    if (!isColumnDeleting && !isDeleting) {
      setIsDetailsModalOpen(true);
    }
  };
  
  // Обрізає текст до певної довжини
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  // Обробник для видалення задачі з модального вікна
  const handleModalDelete = async () => {
    setIsDetailsModalOpen(false);
    setIsDeleting(true);
    
    try {
      await onDeleteTask(task.id, columnId);
    } catch (error) {
      console.error('Error deleting task:', error);
      setIsDeleting(false);
    }
  };

  return (
    <Draggable 
      draggableId={task.id} 
      index={index}
      isDragDisabled={isColumnDeleting || isDeleting}
    >
      {(provided, snapshot) => (
        <div
          className={`${styles.taskCard} ${snapshot.isDragging ? styles.dragging : ''} ${isDeleting ? styles.deleting : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleTaskClick}
        >
          <div className={styles.taskHeader}>
            <h4 className={styles.taskTitle}>{truncateText(task.title, 50)}</h4>
            
            <div className={styles.taskOptionsContainer}>
              <button
                className={styles.taskActionButton}
                onClick={handleOptionsClick}
                aria-label="Опції задачі"
                disabled={isColumnDeleting || isDeleting}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
              
              {isOptionsOpen && (
                <div className={styles.taskOptions}>
                  <button
                    className={styles.taskOption}
                    onClick={handleEditClick}
                    disabled={isColumnDeleting || isDeleting}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Редагувати
                  </button>
                  
                  <button
                    className={styles.taskOption}
                    onClick={handleAddToCalendar}
                    disabled={isColumnDeleting || isDeleting || !task.deadline}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Додати в Календар
                  </button>
                  
                  <button
                    className={`${styles.taskOption} ${styles.deleteOption}`}
                    onClick={handleDeleteTask}
                    disabled={isColumnDeleting || isDeleting}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    {isDeleting ? 'Видалення...' : 'Видалити'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {task.description && (
            <p className={styles.taskDescription}>
              {truncateText(task.description, 100)}
            </p>
          )}
          
          <div className={styles.taskFooter}>
            {deadlineInfo && (
              <div className={`${styles.taskDeadline} ${deadlineInfo.className}`}>
                {deadlineInfo.text}
              </div>
            )}
            
            {task.labels && task.labels.length > 0 && (
              <div className={styles.taskLabels}>
                {task.labels.map((label, idx) => (
                  <span key={idx} className={styles.taskLabel}>
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Модальні вікна */}
          <EditTaskModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            task={task}
            onUpdateTask={handleUpdateTask}
            isLoading={isUpdating}
          />
          
          <TaskDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            task={task}
            onEdit={() => {
              setIsDetailsModalOpen(false);
              setIsEditModalOpen(true);
            }}
            onDelete={handleModalDelete}
            onAddToCalendar={handleAddToCalendar}
          />
        </div>
      )}
    </Draggable>
  );
};

export default Task;