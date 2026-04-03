import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './scrum.css';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function SortableBacklogRow({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        className={`backlog-row priority-${task.priority?.toLowerCase() || 'default'}`}
        {...attributes} 
        {...listeners}
    >
        <div className="backlog-row-title-container">
            {task.project && <span className="project-badge">{task.project}</span>}
            <div className="backlog-row-title"><strong>{task.title}</strong></div>
        </div>
        <div className="backlog-row-desc">{task.description}</div>
        <div className="backlog-row-assignee"><strong>Assignee:</strong> {task.assignee}</div>
    </div>
  );
}

const Scrum = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/tasks`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTasks(data);
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    if (loading) {
        return <div className="scrum-container"><div className="empty-msg">Loading tasks...</div></div>;
    }

    if (error) {
        return <div className="scrum-container"><div className="empty-msg">Error: {error.message}</div></div>;
    }

    // Filter tasks into columns
    const todoTasks = tasks.filter(task => task.status === 'TODO');
    const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS');
    const reviewTasks = tasks.filter(task => task.status === 'REVIEW');
    const doneTasks = tasks.filter(task => task.status === 'DONE');
    const backlogTasks = tasks.filter(task => task.status === 'BACKLOG');

    const handleDragEnd = (event) => {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            setTasks((items) => {
                const oldIndex = items.findIndex(t => t.id.toString() === active.id.toString());
                const newIndex = items.findIndex(t => t.id.toString() === over.id.toString());
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <div className="scrum-container">
            <h1 className="scrum-title">Scrum Board</h1>
            <div className="scrum-board">
                <div className="column">
                    <h2>To Do</h2>
                    {todoTasks.length === 0 ? (
                        <p className="empty-msg">No tasks to do.</p>
                    ) : (
                        todoTasks.map(task => (
                            <div key={task.id} className={`task-card priority-${task.priority?.toLowerCase() || 'default'}`}>
                                {task.project && <span className="project-badge">{task.project}</span>}
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <span className="assignee"><strong>Assignee:</strong> {task.assignee}</span>
                            </div>
                        ))
                    )}
                </div>
                <div className="column">
                    <h2>In-Progress</h2>
                    {inProgressTasks.length === 0 ? (
                        <p className="empty-msg">No tasks in progress.</p>
                    ) : (
                        inProgressTasks.map(task => (
                            <div key={task.id} className={`task-card priority-${task.priority?.toLowerCase() || 'default'}`}>
                                {task.project && <span className="project-badge">{task.project}</span>}
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <span className="assignee"><strong>Assignee:</strong> {task.assignee}</span>
                            </div>
                        ))
                    )}
                </div>
                <div className="column">
                    <h2>Review</h2>
                    {reviewTasks.length === 0 ? (
                        <p className="empty-msg">No tasks in review.</p>
                    ) : (
                        reviewTasks.map(task => (
                            <div key={task.id} className={`task-card priority-${task.priority?.toLowerCase() || 'default'}`}>
                                {task.project && <span className="project-badge">{task.project}</span>}
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <span className="assignee"><strong>Assignee:</strong> {task.assignee}</span>
                            </div>
                        ))
                    )}
                </div>
                <div className="column">
                    <h2>Done</h2>
                    {doneTasks.length === 0 ? (
                        <p className="empty-msg">No tasks done.</p>
                    ) : (
                        doneTasks.map(task => (
                            <div key={task.id} className={`task-card priority-${task.priority?.toLowerCase() || 'default'}`}>
                                {task.project && <span className="project-badge">{task.project}</span>}
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <span className="assignee"><strong>Assignee:</strong> {task.assignee}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="backlog-section">
                <h2>Backlog</h2>
                {backlogTasks.length === 0 ? (
                    <p className="empty-msg">No tasks in backlog.</p>
                ) : (
                    <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="backlog-list">
                            <SortableContext 
                                items={backlogTasks.map(t => t.id.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                {backlogTasks.map(task => (
                                    <SortableBacklogRow key={task.id} task={task} />
                                ))}
                            </SortableContext>
                        </div>
                    </DndContext>
                )}
            </div>
        </div>
    );
};

export default Scrum;
