// src/components/dashboard/ProjectsList.tsx
import { useState } from 'react';
import Link from 'next/link';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import { Button } from '../ui/Button/Button';
import styles from './ProjectsList.module.css';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  columnsCount: number;
  tasksCount: number;
}

interface ProjectsListProps {
  projects: Project[];
  onCreateProject: (name: string, description: string) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProject: (projectId: string, name: string, description: string) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  onCreateProject,
  onDeleteProject,
  onUpdateProject,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'name' | 'updatedAt' | 'createdAt'>('updatedAt');
  
  // Фільтрація проектів за пошуковим терміном
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Сортування проектів за обраним параметром
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortOption === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortOption === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });
  
  // Функція для відкриття модального вікна створення проекту
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };
  
  // Функція для закриття модального вікна створення проекту
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };
  
  // Функція для створення нового проекту
  const handleCreateProject = (name: string, description: string) => {
    onCreateProject(name, description);
    handleCloseCreateModal();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мої проекти</h1>
        <Button 
          variant="primary" 
          onClick={handleOpenCreateModal}
          leftIcon={
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M12 5v14M5 12h14" />
            </svg>
          }
        >
          Новий проект
        </Button>
      </div>
      
      <div className={styles.toolbarContainer}>
        <div className={styles.searchContainer}>
          <div className={styles.searchIcon}>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Пошук проектів..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className={styles.clearSearchButton}
              onClick={() => setSearchTerm('')}
              aria-label="Очистити пошук"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        
        <div className={styles.sortContainer}>
          <label htmlFor="sortOption" className={styles.sortLabel}>Сортувати за:</label>
          <select
            id="sortOption"
            className={styles.sortSelect}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as 'name' | 'updatedAt' | 'createdAt')}
          >
            <option value="updatedAt">Останні оновлені</option>
            <option value="createdAt">Останні створені</option>
            <option value="name">За назвою</option>
          </select>
        </div>
      </div>
      
      {sortedProjects.length === 0 ? (
        <div className={styles.emptyState}>
          {searchTerm ? (
            <>
              <div className={styles.emptyIcon}>
                <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1" fill="none">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
              <h3>Проекти не знайдені</h3>
              <p>За запитом "{searchTerm}" нічого не знайдено. Спробуйте інші ключові слова.</p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Очистити пошук
              </Button>
            </>
          ) : (
            <>
              <div className={styles.emptyIcon}>
                <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1" fill="none">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M12 18v-6" />
                  <path d="M9 15h6" />
                </svg>
              </div>
              <h3>У вас ще немає проектів</h3>
              <p>Створіть свій перший проект, щоб почати роботу.</p>
              <Button variant="primary" onClick={handleOpenCreateModal}>
                Створити проект
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className={styles.projectsGrid}>
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={() => onDeleteProject(project.id)}
              onUpdate={(name, description) => onUpdateProject(project.id, name, description)}
            />
          ))}
        </div>
      )}
      
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};

export default ProjectsList;