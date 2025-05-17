// src/components/kanban/CreateTaskModal.tsx
import { useState } from 'react';
import Modal from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import Input from '../ui/Input/Input';
import styles from './CreateTaskModal.module.css';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, description: string, deadline?: string) => Promise<void>;
  columnTitle: string;
  isLoading?: boolean;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  columnTitle,
  isLoading = false
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [errors, setErrors] = useState<{ title?: string, deadline?: string, general?: string }>({});
  
  // Очищення форми при закритті
  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
      setDescription('');
      setDeadline('');
      setErrors({});
      onClose();
    }
  };
  
  // Перевірка та збереження задачі
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    const newErrors: { title?: string, deadline?: string } = {};
    
    // Валідація полів форми
    if (!title.trim()) {
      newErrors.title = 'Назва задачі обов\'язкова';
    }
    
    // Перевірка, чи валідний формат дедлайну
    if (deadline && isNaN(Date.parse(deadline))) {
      newErrors.deadline = 'Некоректний формат дати';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // Додаємо задачу через API
      await onAddTask(
        title.trim(), 
        description.trim(), 
        deadline ? deadline : undefined
      );
      
      // Очищуємо форму після успішного додавання
      handleClose();
    } catch (error: any) {
      console.error('Error creating task:', error);
      
      // Встановлюємо помилку від API
      setErrors({
        general: error.response?.data?.message || 'Помилка при створенні задачі'
      });
    }
  };
  
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
        disabled={!title.trim() || isLoading}
        isLoading={isLoading}
      >
        Створити задачу
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Нова задача в "${columnTitle}"`}
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
            placeholder="Наприклад: Підготувати презентацію"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors({...errors, title: undefined});
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
            placeholder="Детальний опис задачі..."
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
                setErrors({...errors, deadline: undefined});
              }
            }}
            placeholder="Виберіть дату та час"
            error={errors.deadline}
            disabled={isLoading}
          />
          <div className={styles.hint}>
            Залиште поле порожнім, якщо немає строку виконання
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;