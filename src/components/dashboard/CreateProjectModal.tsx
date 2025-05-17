// src/components/dashboard/CreateProjectModal.tsx
import { useState } from 'react';
import Modal from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import Input from '../ui/Input/Input';
import styles from './CreateProjectModal.module.css';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, description: string) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Очищення форми при закритті
  const handleClose = () => {
    setProjectName('');
    setProjectDescription('');
    setErrors({});
    onClose();
  };
  
  // Валідація форми перед створенням проекту
  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {};
    
    if (!projectName.trim()) {
      newErrors.name = 'Назва проекту обов\'язкова';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Обробка відправки форми
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Імітуємо затримку запиту
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Викликаємо функцію створення проекту
      onCreateProject(projectName.trim(), projectDescription.trim());
      
      // Закриваємо модальне вікно
      handleClose();
    } catch (error) {
      console.error('Error creating project:', error);
      // Тут можна обробити помилки
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Компонент футера модального вікна
  const modalFooter = (
    <>
      <Button variant="ghost" onClick={handleClose}>
        Скасувати
      </Button>
      <Button 
        variant="primary" 
        onClick={handleSubmit}
        isLoading={isSubmitting}
      >
        Створити проект
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Новий проект"
      footer={modalFooter}
      size="md"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <Input
            label="Назва проекту"
            placeholder="Наприклад: Розробка веб-сайту"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            error={errors.name}
            isRequired
            autoFocus
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Опис проекту
          </label>
          <textarea
            className={styles.textarea}
            placeholder="Додайте детальний опис проекту..."
            value={projectDescription}
            onChange={(e) => {
              setProjectDescription(e.target.value);
              if (errors.description) {
                setErrors({ ...errors, description: undefined });
              }
            }}
            rows={4}
          />
        </div>
        
        <div className={styles.templateSection}>
          <h3 className={styles.templateTitle}>Шаблони проектів</h3>
          
          <div className={styles.templateGrid}>
            <button
              type="button"
              className={styles.templateCard}
              onClick={() => {
                setProjectName('Розробка програмного продукту');
                setProjectDescription('Проект для відстеження розробки програмного продукту з використанням методології Agile.');
              }}
            >
              <div className={styles.templateIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </div>
              <div className={styles.templateInfo}>
                <h4 className={styles.templateName}>Agile / Scrum</h4>
                <p className={styles.templateDescription}>
                  Проект з колонками: Backlog, To-Do, In Progress, Testing, Done
                </p>
              </div>
            </button>
            
            <button
              type="button"
              className={styles.templateCard}
              onClick={() => {
                setProjectName('Маркетингова кампанія');
                setProjectDescription('Проект для планування та відстеження завдань маркетингової кампанії.');
              }}
            >
              <div className={styles.templateIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div className={styles.templateInfo}>
                <h4 className={styles.templateName}>Маркетинг</h4>
                <p className={styles.templateDescription}>
                  Проект з колонками: Ідеї, Заплановано, В роботі, Перевірка, Готово
                </p>
              </div>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;