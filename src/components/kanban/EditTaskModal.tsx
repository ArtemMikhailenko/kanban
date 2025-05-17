// src/components/kanban/EditTaskModal.tsx
import { useState, useEffect } from 'react';
import Modal from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import Input from '../ui/Input/Input';
import { Task } from './Board';
import styles from './EditTaskModal.module.css';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdateTask: (updatedTask: Partial<Task>) => Promise<void>;
  isLoading?: boolean;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdateTask,
  isLoading = false
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [errors, setErrors] = useState<{ title?: string; deadline?: string; general?: string }>({});
  
  // Ініціалізуємо форму при відкритті модального вікна
  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setDescription(task.description || '');
      
      // Форматуємо дату дедлайну для поля datetime-local
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const formattedDeadline = new Date(deadlineDate.getTime() - deadlineDate.getTimezoneOffset() * 60000)
          .toISOString()
          .substring(0, 16);
        setDeadline(formattedDeadline);
      } else {
        setDeadline('');
      }
      
      // Встановлюємо мітки
      setLabels(task.labels || []);
    }
  }, [isOpen, task]);
  
  // Очищення форми при закритті
  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      onClose();
    }
  };
  
  // Валідація форми
  const validateForm = () => {
    const newErrors: { title?: string; deadline?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Назва задачі обов\'язкова';
    }
    
    if (deadline && isNaN(Date.parse(deadline))) {
      newErrors.deadline = 'Введіть коректну дату';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Додавання нової мітки
  const handleAddLabel = () => {
    if (isLoading) return;
    
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };
  
  // Видалення мітки
  const handleRemoveLabel = (labelToRemove: string) => {
    if (isLoading) return;
    setLabels(labels.filter(label => label !== labelToRemove));
  };
  
  // Обробка відправки форми
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isLoading) {
      return;
    }
    
    try {
      // Підготовка оновлених даних задачі
      const updatedTask: Partial<Task> = {
        title: title.trim(),
        description: description.trim(),
        labels: labels,
      };
      
      // Додаємо дедлайн, якщо він вказаний
      if (deadline) {
        updatedTask.deadline = new Date(deadline).toISOString();
      } else if (deadline === '' && task.deadline) {
        // Якщо дедлайн був видалений, встановлюємо undefined
        updatedTask.deadline = undefined;
      }
      
      // Оновлюємо задачу через API
      await onUpdateTask(updatedTask);
      
      // Закриваємо модальне вікно після успішного оновлення
      handleClose();
    } catch (error: any) {
      console.error('Error updating task:', error);
      
      // Встановлюємо помилку від API
      setErrors({
        general: error.response?.data?.message || 'Помилка при оновленні задачі'
      });
    }
  };
  
  // Компонент футера модального вікна
  const modalFooter = (
    <>
      <Button 
        variant="ghost" 
        onClick={handleClose}
        disabled={isLoading}
      >
        Скасувати
      </Button>
      <Button 
        variant="primary" 
        onClick={handleSubmit}
        isLoading={isLoading}
        disabled={isLoading || !title.trim()}
      >
        Зберегти зміни
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Редагувати задачу"
      footer={modalFooter}
      size="md"
      closeOnEsc={!isLoading}
      closeOnOverlayClick={!isLoading}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {errors.general && (
          <div className={styles.errorMessage}>
            {errors.general}
          </div>
        )}
        
        <div className={styles.formGroup}>
          <Input
            label="Назва задачі"
            placeholder="Введіть назву задачі"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors({ ...errors, title: undefined });
              }
            }}
            error={errors.title}
            isRequired
            autoFocus
            disabled={isLoading}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Опис
          </label>
          <textarea
            className={styles.textarea}
            placeholder="Додайте детальний опис задачі..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            disabled={isLoading}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Дедлайн
          </label>
          <Input
            type="datetime-local"
            value={deadline}
            onChange={(e) => {
              setDeadline(e.target.value);
              if (errors.deadline) {
                setErrors({ ...errors, deadline: undefined });
              }
            }}
            error={errors.deadline}
            placeholder="Виберіть дату та час"
            disabled={isLoading}
          />
          <div className={styles.hint}>
            Залиште поле порожнім, якщо немає строку виконання
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Мітки
          </label>
          
          <div className={styles.labelsContainer}>
            {labels.map((label, index) => (
              <div key={index} className={styles.labelChip}>
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(label)}
                  aria-label="Видалити мітку"
                  disabled={isLoading}
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className={styles.addLabelInput}>
            <Input
              placeholder="Додати нову мітку"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  e.preventDefault();
                  handleAddLabel();
                }
              }}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddLabel}
              disabled={isLoading || !newLabel.trim()}
            >
              Додати
            </Button>
          </div>
        </div>
        
        <div className={styles.taskInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>ID задачі:</span>
            <span className={styles.infoValue}>{task.id}</span>
          </div>
          
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Створено:</span>
            <span className={styles.infoValue}>
              {new Date(task.createdAt).toLocaleDateString('uk-UA')}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditTaskModal;