'use client';

import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import Task from './Task';
import CreateTaskModal from './CreateTaskModal';
import { Task as TaskType, Column as ColumnType } from './Board';
import styles from './Column.module.css';
import { columns as columnsApi } from '@/api/api';

interface ColumnProps {
  column: ColumnType;
  tasks: TaskType[];
  index: number;
  onAddTask: (columnId: string, title: string, description: string, deadline?: string) => Promise<void>;
  onUpdateTask: (taskId: string, updatedTask: Partial<TaskType>) => Promise<void>;
  onDeleteTask: (taskId: string, columnId: string) => Promise<void>;
  onDeleteColumn: (columnId: string) => Promise<void>;
}

const Column: React.FC<ColumnProps> = ({ 
  column, 
  tasks, 
  index, 
  onAddTask, 
  onUpdateTask, 
  onDeleteTask,
  onDeleteColumn
}) => {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isDeletingColumn, setIsDeletingColumn] = useState(false);
  // Remove the problematic columns state that has an undefined initialColumns
  // const [columns, setColumns] = useState<ColumnType[]>(initialColumns);

  // Додавання нової задачі
  const handleAddTask = async (title: string, description: string, deadline?: string) => {
    setIsAddingTask(true);
    try {
      await onAddTask(column.id, title, description, deadline);
      setIsAddTaskModalOpen(false);
    } catch (error) {
      console.error('Error adding task:', error);
      // Обробка помилки при додаванні задачі
    } finally {
      setIsAddingTask(false);
    }
  };
  
  // Removed handleCreateColumn as it's not correctly implemented
  // This functionality should be handled by the parent component
  
  // Видалення колонки з підтвердженням
  const handleDeleteColumn = async () => {
    if (tasks.length > 0) {
      const confirm = window.confirm(
        `Колонка "${column.title}" містить ${tasks.length} задач. Ви впевнені, що хочете видалити колонку та всі її задачі?`
      );
      
      if (confirm) {
        setIsDeletingColumn(true);
        try {
          await onDeleteColumn(column.id);
        } catch (error) {
          console.error('Error deleting column:', error);
          // Обробка помилки при видаленні колонки
        } finally {
          setIsDeletingColumn(false);
        }
      }
    } else {
      setIsDeletingColumn(true);
      try {
        await onDeleteColumn(column.id);
      } catch (error) {
        console.error('Error deleting column:', error);
        // Обробка помилки при видаленні колонки
      } finally {
        setIsDeletingColumn(false);
      }
    }
    
    setIsOptionsOpen(false);
  };
  
  // Оновлення назви колонки
  const handleUpdateColumnTitle = async (newTitle: string) => {
    try {
      // Викликаємо API для оновлення назви колонки
      await columnsApi.update(column.id, { title: newTitle });
      
      // Тут можна оновити локальний стан, якщо потрібно
      // onUpdateColumn(column.id, { title: newTitle });
    } catch (error) {
      console.error('Error updating column title:', error);
    }
  };
  
  // Визначення кольору колонки на основі заголовка
  const getColumnColorClass = () => {
    const title = column.title.toLowerCase();
    
    if (title.includes('todo') || title.includes('to do') || title.includes('задачі')) {
      return styles.columnTodo;
    } else if (title.includes('progress') || title.includes('doing') || title.includes('в роботі')) {
      return styles.columnProgress;
    } else if (title.includes('review') || title.includes('testing') || title.includes('перевірка')) {
      return styles.columnReview;
    } else if (title.includes('done') || title.includes('complete') || title.includes('готово')) {
      return styles.columnDone;
    } else {
      return styles.columnDefault;
    }
  };

  return (
    <Draggable draggableId={column.id} index={index} isDragDisabled={isDeletingColumn}>
      {(provided) => (
        <div 
          className={`${styles.column} ${getColumnColorClass()} ${isDeletingColumn ? styles.deleting : ''}`}
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <div 
            className={styles.columnHeader}
            {...provided.dragHandleProps}
          >
            <div className={styles.columnTitle}>
              <h3>{column.title}</h3>
              <div className={styles.taskCount}>{tasks.length}</div>
            </div>
            
            <div className={styles.columnActions}>
              <button 
                className={styles.columnActionButton}
                onClick={() => setIsAddTaskModalOpen(true)}
                aria-label="Додати задачу"
                disabled={isDeletingColumn}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              
              <div className={styles.columnOptionsContainer}>
                <button 
                  className={styles.columnActionButton}
                  onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                  aria-label="Опції колонки"
                  disabled={isDeletingColumn}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
                
                {isOptionsOpen && (
                  <div className={styles.columnOptions}>
                    <button 
                      className={styles.columnOption}
                      onClick={handleDeleteColumn}
                      disabled={isDeletingColumn}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                      {isDeletingColumn ? 'Видалення...' : 'Видалити колонку'}
                    </button>
                    {/* Можна додати інші опції, наприклад редагування назви */}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Droppable droppableId={column.id} type="task" isDropDisabled={isDeletingColumn}>
            {(provided, snapshot) => (
              <div 
                className={`${styles.taskList} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {tasks.map((task, index) => (
                  <Task 
                    key={task.id}
                    task={task}
                    index={index}
                    columnId={column.id}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    isColumnDeleting={isDeletingColumn}
                  />
                ))}
                {provided.placeholder}
                
                <button 
                  className={styles.addTaskButton}
                  onClick={() => setIsAddTaskModalOpen(true)}
                  disabled={isDeletingColumn}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Додати задачу
                </button>
              </div>
            )}
          </Droppable>
          
          <CreateTaskModal
            isOpen={isAddTaskModalOpen}
            onClose={() => setIsAddTaskModalOpen(false)}
            onAddTask={handleAddTask}
            columnTitle={column.title}
            isLoading={isAddingTask}
          />
        </div>
      )}
    </Draggable>
  );
};

export default Column;