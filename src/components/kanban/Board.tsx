'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import Column from './Column';
import CreateColumnModal from './CreateColumnModal';
import styles from './Board.module.css';
import { Button } from '../ui/Button/Button';
import { columns as columnsApi, tasks as tasksApi, projects as projectsApi } from '@/api/api';

// Типи для даних дошки
export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  deadline?: string;
  labels?: string[];
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: {
    [key: string]: Column;
  };
  columnOrder: string[];
  tasks: {
    [key: string]: Task;
  };
}

interface BoardProps {
  board: KanbanBoard;
  onBoardChange: (updatedBoard: KanbanBoard) => void;
}

const Board: React.FC<BoardProps> = ({ board, onBoardChange }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Обробляємо подію прокрутки для фіксації заголовка
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Обробка переміщення задач між колонками
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // Якщо немає призначення або перетягування на те ж місце
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Якщо переміщуємо колонку
    if (type === 'column') {
      const newColumnOrder = Array.from(board.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      const newBoard = {
        ...board,
        columnOrder: newColumnOrder,
      };

      // Оновлюємо стан UI перед запитом для миттєвого відображення змін
      onBoardChange(newBoard);

      try {
        // Зберігаємо оновлений порядок колонок на сервер
        await projectsApi.updateColumnOrder(board.id, newColumnOrder);
      } catch (error) {
        console.error('Error updating column order:', error);
        // В разі помилки можна повернути початковий стан
        // onBoardChange(board);
      }
      
      return;
    }

    // Отримуємо початкову і кінцеву колонки
    const startColumn = board.columns[source.droppableId];
    const finishColumn = board.columns[destination.droppableId];

    // Перевіряємо, чи існують колонки
    if (!startColumn || !finishColumn) {
      console.error('Missing column data:', { 
        startColumnId: source.droppableId, 
        finishColumnId: destination.droppableId 
      });
      return;
    }

    // Переміщення всередині однієї колонки
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds || []);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      const newBoard = {
        ...board,
        columns: {
          ...board.columns,
          [newColumn.id]: newColumn,
        },
      };

      // Оновлюємо стан UI перед запитом для миттєвого відображення змін
      onBoardChange(newBoard);

      try {
        // Зберігаємо оновлений порядок задач на сервер
        await columnsApi.updateTaskOrder(newColumn.id, newTaskIds);
      } catch (error) {
        console.error('Error updating task order:', error);
        // В разі помилки можна повернути початковий стан
        // onBoardChange(board);
      }
      
      return;
    }

    // Переміщення між колонками
    const startTaskIds = Array.from(startColumn.taskIds || []);
    startTaskIds.splice(source.index, 1);
    const newStartColumn = {
      ...startColumn,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finishColumn.taskIds || []);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinishColumn = {
      ...finishColumn,
      taskIds: finishTaskIds,
    };

    const newBoard = {
      ...board,
      columns: {
        ...board.columns,
        [newStartColumn.id]: newStartColumn,
        [newFinishColumn.id]: newFinishColumn,
      },
    };

    // Оновлюємо стан UI перед запитом для миттєвого відображення змін
    onBoardChange(newBoard);

    try {
      // Зберігаємо переміщення задачі між колонками на сервер
      await tasksApi.move(draggableId, destination.droppableId);
      
      // Оновлюємо порядок задач у колонках
      await columnsApi.updateTaskOrder(newStartColumn.id, startTaskIds);
      await columnsApi.updateTaskOrder(newFinishColumn.id, finishTaskIds);
    } catch (error) {
      console.error('Error moving task between columns:', error);
      // В разі помилки можна повернути початковий стан
      // onBoardChange(board);
    }
  };

  // Додавання нової колонки
  const handleAddColumn = async (title: string) => {
    setIsLoading(true);
    
    try {
      // Створюємо нову колонку на сервері
      const response = await columnsApi.create({
        title,
        projectId: board.id,
      });
      
      const newColumn = response.data;
      
      // Оновлюємо локальний стан з відповіддю від сервера
      const newBoard = {
        ...board,
        columns: {
          ...board.columns,
          [newColumn.id]: {
            id: newColumn.id,
            title: newColumn.title,
            taskIds: [],
          },
        },
        columnOrder: [...board.columnOrder, newColumn.id],
      };
      
      onBoardChange(newBoard);
    } catch (error) {
      console.error('Error adding column:', error);
    } finally {
      setIsLoading(false);
      setModalOpen(false);
    }
  };

  // Видалення колонки
  const handleDeleteColumn = async (columnId: string) => {
    // Оновлюємо локальний стан для миттєвої зміни UI
    const updatedColumns = { ...board.columns };
    delete updatedColumns[columnId];

    const newColumnOrder = board.columnOrder.filter(id => id !== columnId);

    const newBoard = {
      ...board,
      columns: updatedColumns,
      columnOrder: newColumnOrder,
    };

    onBoardChange(newBoard);

    try {
      // Видаляємо колонку на сервері
      await columnsApi.delete(columnId);
    } catch (error) {
      console.error('Error deleting column:', error);
      // В разі помилки можна повернути початковий стан
      // onBoardChange(board);
    }
  };

  // Додавання нової задачі в колонку
  const handleAddTask = async (columnId: string, taskTitle: string, taskDescription: string, deadline?: string) => {
    try {
      // Створюємо нову задачу на сервері
      const response = await tasksApi.create({
        title: taskTitle,
        description: taskDescription,
        columnId: columnId,
        projectId: board.id,
        deadline: deadline,
      });

      const newTask = response.data;

      // Отримуємо поточну колонку
      const column = board.columns[columnId];
      
      // Перевіряємо, чи існує колонка
      if (!column) {
        console.error('Column not found:', columnId);
        return;
      }
      
      // Оновлюємо локальний стан з відповіддю від сервера
      const newBoard = {
        ...board,
        tasks: {
          ...board.tasks,
          [newTask.id]: {
            id: newTask.id,
            title: newTask.title,
            description: newTask.description || '',
            createdAt: newTask.createdAt,
            deadline: newTask.deadline || undefined,
            labels: newTask.labels || [],
          },
        },
        columns: {
          ...board.columns,
          [columnId]: {
            ...column,
            taskIds: [...(column.taskIds || []), newTask.id],
          },
        },
      };

      onBoardChange(newBoard);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Оновлення існуючої задачі
  const handleUpdateTask = async (taskId: string, updatedTask: Partial<Task>) => {
    const task = board.tasks[taskId];
    
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }
    
    // Оновлюємо локальний стан для миттєвої зміни UI
    const newBoard = {
      ...board,
      tasks: {
        ...board.tasks,
        [taskId]: {
          ...task,
          ...updatedTask,
        },
      },
    };

    onBoardChange(newBoard);

    try {
      // Оновлюємо задачу на сервері
      await tasksApi.update(taskId, updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      // В разі помилки можна повернути початковий стан
      // onBoardChange(board);
    }
  };

  // Видалення задачі
  const handleDeleteTask = async (taskId: string, columnId: string) => {
    const column = board.columns[columnId];
    
    if (!column) {
      console.error('Column not found:', columnId);
      return;
    }
    
    // Оновлюємо локальний стан для миттєвої зміни UI
    const newTaskIds = (column.taskIds || []).filter(id => id !== taskId);

    const updatedTasks = { ...board.tasks };
    delete updatedTasks[taskId];

    const newBoard = {
      ...board,
      tasks: updatedTasks,
      columns: {
        ...board.columns,
        [columnId]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
    };

    onBoardChange(newBoard);

    try {
      // Видаляємо задачу на сервері
      await tasksApi.delete(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      // В разі помилки можна повернути початковий стан
      // onBoardChange(board);
    }
  };

  const headerClasses = [
    styles.boardHeader,
    isSticky ? styles.sticky : '',
  ].join(' ');

  return (
    <div className={styles.boardContainer}>
      <div className={headerClasses}>
        <h1 className={styles.boardTitle}>{board.title}</h1>
        <div className={styles.boardActions}>
          <Button 
            variant="primary" 
            onClick={() => setModalOpen(true)}
            leftIcon={
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M12 5v14M5 12h14" />
              </svg>
            }
            isLoading={isLoading}
          >
            Додати колонку
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div 
              className={styles.boardContent}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {/* FIX: Add null check for columnOrder and ensure each column exists */}
              {board.columnOrder && board.columnOrder.map((columnId, index) => {
                const column = board.columns[columnId];
                
                // Skip rendering if column doesn't exist
                if (!column) {
                  console.warn(`Column with ID ${columnId} not found`);
                  return null;
                }
                
                // Make sure taskIds exists and is an array
                const taskIds = column.taskIds || [];
                
                // Filter out any undefined tasks
                const tasks = taskIds
                  .map(taskId => board.tasks[taskId])
                  .filter(Boolean);

                return (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    index={index}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    onDeleteColumn={handleDeleteColumn}
                  />
                );
              })}
              {provided.placeholder}
              
              <div className={styles.addColumnPlaceholder}>
                <Button 
                  variant="ghost" 
                  onClick={() => setModalOpen(true)}
                  leftIcon={
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  }
                >
                  Додати колонку
                </Button>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <CreateColumnModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddColumn={handleAddColumn}
      />
    </div>
  );
};

export default Board;