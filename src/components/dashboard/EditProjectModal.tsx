// src/components/dashboard/EditProjectModal.tsx
import { useState, useEffect } from 'react';
import Modal from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import Input from '../ui/Input/Input';
import { Project } from './ProjectsList';
import styles from './EditProjectModal.module.css';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (name: string, description: string) => void;
  project: Project;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  onUpdateProject,
  project,
}) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Встановлюємо початкові значення полів при відкритті модального вікна
  useEffect(() => {
    if (isOpen && project) {
      setProjectName(project.name);
      setProjectDescription(project.description || '');
    }
  }, [isOpen, project]);
  
  // Очищення помилок при закритті
  const handleClose = () => {
    setErrors({});
    onClose();
  };
  
  // Валідація форми перед оновленням проекту
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
      
      // Викликаємо функцію оновлення проекту
      onUpdateProject(projectName.trim(), projectDescription.trim());
      
      // Закриваємо модальне вікно
      handleClose();
    } catch (error) {
      console.error('Error updating project:', error);
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
        Зберегти зміни
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Редагувати проект"
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
        
        <div className={styles.projectInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>ID проекту:</span>
            <span className={styles.infoValue}>{project.id}</span>
          </div>
          
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Створено:</span>
            <span className={styles.infoValue}>
              {new Date(project.createdAt).toLocaleDateString('uk-UA')}
            </span>
          </div>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoGridItem}>
              <span className={styles.infoCount}>{project.columnsCount}</span>
              <span className={styles.infoLabel}>Колонок</span>
            </div>
            
            <div className={styles.infoGridItem}>
              <span className={styles.infoCount}>{project.tasksCount}</span>
              <span className={styles.infoLabel}>Задач</span>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditProjectModal;