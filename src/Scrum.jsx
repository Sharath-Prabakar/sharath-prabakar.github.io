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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
                {task.project && (
                    <span
                        className="project-badge"
                        style={{ backgroundColor: task.projectColorCode || '#1e3a5f', color: 'white' }}
                    >
                        {task.project}
                    </span>
                )}
                <div className="backlog-row-title"><strong>{task.title}</strong></div>
            </div>
            <div className="backlog-row-desc">{task.description}</div>
            <div className="backlog-row-assignee"><strong>Assignee:</strong> {task.assignee}</div>
        </div>
    );
}

const LoadingPopup = ({ message }) => (
    <div style={styles.overlay}>
        <div style={styles.popup}>
            <div className="spinner"></div>
            <p style={styles.loadingText}>{message}</p>
        </div>
    </div>
);

const Scrum = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState("Incoming Tasks...");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (!loading) return;

        const messages = [
            "Building your workspace...",
            "Syncing with the server...",
            "Prioritizing the backlog...",
            "Almost there..."
        ];

        let msgIndex = 0;
        setLoadingMessage(messages[0]);

        const interval = setInterval(() => {
            msgIndex = (msgIndex + 1) % messages.length;
            setLoadingMessage(messages[msgIndex]);
        }, 2500);

        return () => clearInterval(interval);
    }, [loading]);

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
        return (
            <div className="scrum-container">
                <LoadingPopup message={loadingMessage} />
            </div>
        );
    }

    if (error) {
        return <div className="scrum-container"><div className="empty-msg">Error: {error.message}</div></div>;
    }

    // Filter tasks into columns and sort by order
    const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
    const todoTasks = sortedTasks.filter(task => task.status === 'TODO');
    const inProgressTasks = sortedTasks.filter(task => task.status === 'IN_PROGRESS');
    const reviewTasks = sortedTasks.filter(task => task.status === 'REVIEW');
    const doneTasks = sortedTasks.filter(task => task.status === 'DONE');
    const backlogTasks = sortedTasks.filter(task => task.status === 'BACKLOG');

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const activeId = active.id.toString();
            const overId = over.id.toString();

            const oldIndex = backlogTasks.findIndex(t => t.id.toString() === activeId);
            const newIndex = backlogTasks.findIndex(t => t.id.toString() === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                const reorderedBacklog = arrayMove(backlogTasks, oldIndex, newIndex);
                const movedTaskIndex = reorderedBacklog.findIndex(t => t.id.toString() === activeId);

                let newOrder;
                if (movedTaskIndex === 0) {
                    // Moved to top: half of the current top task's order
                    const nextOrder = reorderedBacklog[1]?.order || 1.0;
                    newOrder = nextOrder / 2.0;
                } else if (movedTaskIndex === reorderedBacklog.length - 1) {
                    // Moved to bottom: order of current bottom task + 1
                    const prevOrder = reorderedBacklog[movedTaskIndex - 1]?.order || 0.0;
                    newOrder = prevOrder + 1.0;
                } else {
                    // Moved in between: average of neighbors
                    const prevOrder = reorderedBacklog[movedTaskIndex - 1].order;
                    const nextOrder = reorderedBacklog[movedTaskIndex + 1].order;
                    newOrder = (prevOrder + nextOrder) / 2.0;
                }

                // Optimistically update the state locally
                setTasks(prev => prev.map(t => t.id.toString() === activeId ? { ...t, order: newOrder } : t));

                // Persist to backend via PATCH
                try {
                    const response = await fetch(`${API_BASE_URL}/api/tasks/${activeId}/order`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ order: newOrder.toString() })
                    });
                    if (!response.ok) throw new Error('Failed to update task order');
                } catch (err) {
                    console.error('Error updating task order:', err);
                    // In a production app, we would re-fetch or rollback here
                }
            }
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
                                {task.project && (
                                    <span
                                        className="project-badge"
                                        style={{ backgroundColor: task.projectColorCode || '#1e3a5f', color: 'white' }}
                                    >
                                        {task.project}
                                    </span>
                                )}
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
                                {task.project && (
                                    <span
                                        className="project-badge"
                                        style={{ backgroundColor: task.projectColorCode || '#1e3a5f', color: 'white' }}
                                    >
                                        {task.project}
                                    </span>
                                )}
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
                                {task.project && (
                                    <span
                                        className="project-badge"
                                        style={{ backgroundColor: task.projectColorCode || '#1e3a5f', color: 'white' }}
                                    >
                                        {task.project}
                                    </span>
                                )}
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
                                {task.project && (
                                    <span
                                        className="project-badge"
                                        style={{ backgroundColor: task.projectColorCode || '#1e3a5f', color: 'white' }}
                                    >
                                        {task.project}
                                    </span>
                                )}
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

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    popup: {
        textAlign: 'center',
        padding: '40px',
        border: '1px solid #333',
        backgroundColor: '#0a0a0a',
    },
    loadingText: {
        color: '#d4af37', // Gold accent
        marginTop: '20px',
        fontSize: '0.8rem',
        letterSpacing: '2px',
        textTransform: 'uppercase',
    }
};

export default Scrum;
