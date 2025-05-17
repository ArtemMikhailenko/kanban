
// src/components/kanban/CreateColumnModal.tsx
import { useState } from 'react';
import Modal from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import Input from '../ui/Input/Input';
import styles from './CreateColumnModal.module.css';

interface CreateColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddColumn: (title: string) => Promise<void>;
  isLoading?: boolean;
}

const CreateColumnModal: React.FC<CreateColumnModalProps> = ({
  isOpen,
  onClose,
  onAddColumn,
  isLoading = false
}) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  // Запропоновані типи колонок
  const columnSuggestions = [
    'Задачі',
    'В роботі',
    'Перевірка',
    'Готово',
    'To Do',
    'In Progress',
    'In Review',
    'Done',
    'Backlog',
    'Вхідні'
  ];
  
  // Очищення форми при закритті
  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
      setError(null);
      setGeneralError(null);
      onClose();
    }
  };
  
  // Перевірка та створення колонки
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (!title.trim()) {
      setError('Назва колонки обов\'язкова');
      return;
    }
    
    try {
      // Створюємо колонку через API
      await onAddColumn(title.trim());
      
      // Закриваємо модальне вікно після успішного створення
      handleClose();
    } catch (error: any) {
      console.error('Error creating column:', error);
      
      // Встановлюємо помилку від API
      setGeneralError(
        error.response?.data?.message || 'Помилка при створенні колонки'
      );
    }
  };
  
  // Вибір запропонованого заголовка
  const handleSuggestionClick = (suggestion: string) => {
    setTitle(suggestion);
    setError(null);
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
        Створити колонку
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Нова колонка"
      footer={modalFooter}
      size="sm"
      closeOnEsc={!isLoading}
      closeOnOverlayClick={!isLoading}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {generalError && (
          <div className={styles.errorMessage}>
            {generalError}
          </div>
        )}
        
        <div className={styles.formGroup}>
          <Input
            label="Назва колонки"
            placeholder="Наприклад: Задачі, В роботі, Готово..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) {
                setError(null);
              }
            }}
            error={error || undefined}
            isRequired
            autoFocus
            disabled={isLoading}
          />
        </div>
        
        <div className={styles.suggestionTitle}>
          Варіанти колонок:
        </div>
        
        <div className={styles.suggestionContainer}>
          {columnSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className={styles.suggestionBtn}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>
    </Modal>
  );
};

export default CreateColumnModal;