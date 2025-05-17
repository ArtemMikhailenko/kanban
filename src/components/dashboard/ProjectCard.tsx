// src/components/dashboard/ProjectCard.tsx
import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Project } from './ProjectsList';
import EditProjectModal from './EditProjectModal';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
  onDelete: () => void;
  onUpdate: (name: string, description: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onUpdate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Форматування часу останнього оновлення
  const formatUpdatedTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: uk
    });
  };
  
  // Обробка видалення проекту з підтвердженням
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isConfirmed = window.confirm(`Ви впевнені, що хочете видалити проект "${project.name}"?`);
    
    if (isConfirmed) {
      onDelete();
    }
    
    setIsMenuOpen(false);
  };
  
  // Відкриття модального вікна редагування
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditModalOpen(true);
    setIsMenuOpen(false);
  };
  
  // Оновлення проекту
  const handleUpdate = (name: string, description: string) => {
    onUpdate(name, description);
    setIsEditModalOpen(false);
  };
  
  // Переключення меню опцій
  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Закриття меню опцій при кліку поза межами
  const handleClickOutside = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <Link href={`/dashboard/${project.id}`} className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.projectTitle}>{project.name}</h3>
          
          <div className={styles.menuContainer}>
            <button 
              className={styles.menuButton}
              onClick={toggleMenu}
              aria-label="Опції проекту"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            
            {isMenuOpen && (
              <div className={styles.menuDropdown}>
                <button 
                  className={styles.menuItem}
                  onClick={handleEdit}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Редагувати
                </button>
                
                <button 
                  className={`${styles.menuItem} ${styles.menuItemDelete}`}
                  onClick={handleDelete}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  Видалити
                </button>
              </div>
            )}
          </div>
        </div>
        
        {project.description && (
          <p className={styles.description}>{project.description}</p>
        )}
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <span>{project.columnsCount} колонок</span>
          </div>
          
          <div className={styles.statItem}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <span>{project.tasksCount} задач</span>
          </div>
        </div>
        
        <div className={styles.footer}>
          <div className={styles.updatedAt}>
            Оновлено {formatUpdatedTime(project.updatedAt)}
          </div>
          
          <div className={styles.viewProject}>
            <span>Відкрити</span>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
      
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateProject={handleUpdate}
        project={project}
      />
    </>
  );
};

export default ProjectCard;