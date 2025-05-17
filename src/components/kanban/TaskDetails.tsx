// src/components/kanban/TaskDetails.tsx
import { useState } from 'react';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { uk } from 'date-fns/locale';
import Modal from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { Task } from './Board';
import styles from './TaskDetails.module.css';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onAddToCalendar: (e: React.MouseEvent) => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  onAddToCalendar,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Форматування дати створення
  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy, HH:mm', { locale: uk });
  };
  
  // Форматування дедлайну з врахуванням його статусу
  const formatDeadline = (dateString?: string) => {
    if (!dateString) return null;
    
    const deadline = new Date(dateString);
    
    let statusClass = styles.deadlineFuture;
    let formattedDate = format(deadline, 'd MMMM yyyy, HH:mm', { locale: uk });
    let timeRemaining = '';
    
    // Перевірка на минулий дедлайн
    if (isPast(deadline) && !isToday(deadline)) {
      statusClass = styles.deadlineOverdue;
      timeRemaining = `Протерміновано: ${formatDistanceToNow(deadline, { addSuffix: true, locale: uk })}`;
    }
    // Дедлайн сьогодні
    else if (isToday(deadline)) {
      statusClass = styles.deadlineToday;
      timeRemaining = 'Сьогодні';
    }
    // Дедлайн завтра
    else if (isTomorrow(deadline)) {
      statusClass = styles.deadlineTomorrow;
      timeRemaining = 'Завтра';
    }
    // Майбутній дедлайн
    else {
      timeRemaining = formatDistanceToNow(deadline, { addSuffix: true, locale: uk });
    }
    
    return {
      formattedDate,
      timeRemaining,
      statusClass
    };
  };
  
  const deadlineInfo = task.deadline ? formatDeadline(task.deadline) : null;
  
  // Ініціювання видалення задачі
  const initiateDelete = () => {
    setIsConfirmingDelete(true);
  };
  
  // Підтвердження видалення задачі
  const confirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
      setIsConfirmingDelete(false);
      setIsDeleting(false);
    }
  };
  
  // Скасування видалення
  const cancelDelete = () => {
    if (!isDeleting) {
      setIsConfirmingDelete(false);
    }
  };
  
  // Обробка закриття модального вікна
  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };
  
  // Компонент футера модального вікна
  const modalFooter = isConfirmingDelete ? (
    <>
      <Button 
        variant="ghost" 
        onClick={cancelDelete}
        disabled={isDeleting}
      >
        Скасувати
      </Button>
      <Button 
        variant="danger" 
        onClick={confirmDelete}
        isLoading={isDeleting}
        disabled={isDeleting}
      >
        Підтвердити видалення
      </Button>
    </>
  ) : (
    <>
      <Button 
        variant="ghost" 
        onClick={handleClose}
      >
        Закрити
      </Button>
      <div className={styles.actionButtons}>
        <Button 
          variant="outline" 
          onClick={onAddToCalendar}
          leftIcon={
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          disabled={!task.deadline}
        >
          До календаря
        </Button>
        <Button 
          variant="primary" 
          onClick={onEdit}
          leftIcon={
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          }
        >
          Редагувати
        </Button>
      </div>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={isConfirmingDelete ? cancelDelete : handleClose}
      title={isConfirmingDelete ? 'Підтвердження видалення' : task.title}
      footer={modalFooter}
      size="md"
      closeOnEsc={!isDeleting}
      closeOnOverlayClick={!isDeleting}
    >
      {isConfirmingDelete ? (
        <div className={styles.confirmationMessage}>
          <p>Ви впевнені, що хочете видалити задачу <strong>"{task.title}"</strong>?</p>
          <p>Ця дія незворотна.</p>
          {isDeleting && (
            <div className={styles.loadingMessage}>
              <div className={styles.loadingSpinner}></div>
              <p>Видалення задачі...</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.taskDetailsContent}>
          {task.description && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Опис</h4>
              <div className={styles.description}>{task.description}</div>
            </div>
          )}
          
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Інформація</h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Створено</div>
                <div className={styles.infoValue}>{formatCreatedDate(task.createdAt)}</div>
              </div>
              
              {deadlineInfo && (
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Дедлайн</div>
                  <div className={`${styles.infoValue} ${deadlineInfo.statusClass}`}>
                    <div>{deadlineInfo.formattedDate}</div>
                    <div className={styles.timeRemaining}>{deadlineInfo.timeRemaining}</div>
                  </div>
                </div>
              )}
              
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>ID задачі</div>
                <div className={styles.infoValue}>{task.id}</div>
              </div>
            </div>
          </div>
          
          {task.labels && task.labels.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Мітки</h4>
              <div className={styles.labelsList}>
                {task.labels.map((label, index) => (
                  <div key={index} className={styles.labelChip}>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className={styles.deleteSection}>
            <Button
              variant="ghost" 
              onClick={initiateDelete}
              leftIcon={
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              }
            >
              Видалити задачу
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TaskDetailsModal;