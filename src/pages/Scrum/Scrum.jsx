import React, { useEffect, useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    useDroppable,
    useDraggable
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

const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(30, 58, 95, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function BacklogRow({ task, onOpen, onContextMenu }) {
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

    const projectStyle = {
        backgroundColor: hexToRgba(task.projectColorCode, 0.25),
        color: '#fff',
        border: `1px solid ${task.projectColorCode || '#4da3ff'}`,
        boxShadow: `0 0 12px ${hexToRgba(task.projectColorCode, 0.5)}`,
        textShadow: `0 0 5px ${task.projectColorCode || '#4da3ff'}`
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`backlog-row priority-${task.priority?.toLowerCase() || 'default'}`}
            {...attributes}
            {...listeners}
            onClick={(e) => {
                onOpen(task);
            }}
            onContextMenu={(e) => onContextMenu(e, task)}
        >
            <div className="backlog-row-title-container">
                {task.project && (
                    <span className="project-badge" style={projectStyle}>
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

function DraggableTaskCard({ task, onOpen }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id.toString(),
        data: { task }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
        boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.5)' : undefined,
    };

    const projectStyle = {
        backgroundColor: hexToRgba(task.projectColorCode, 0.25),
        color: '#fff',
        border: `1px solid ${task.projectColorCode || '#4da3ff'}`,
        boxShadow: `0 0 12px ${hexToRgba(task.projectColorCode, 0.5)}`,
        textShadow: `0 0 5px ${task.projectColorCode || '#4da3ff'}`
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`task-card priority-${task.priority?.toLowerCase() || 'default'}`}
            onClick={() => onOpen(task)}
        >
            {task.project && (
                <span className="project-badge" style={projectStyle}>
                    {task.project}
                </span>
            )}
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <span className="assignee"><strong>Assignee:</strong> {task.assignee}</span>
        </div>
    );
}

function DroppableColumn({ id, title, tasks, onOpen }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const style = {
        backgroundColor: isOver ? '#151515' : undefined,
        borderColor: isOver ? '#d4af37' : undefined,
    };
    return (
        <div ref={setNodeRef} className="column" style={style}>
            <h2>{title}</h2>
            <div className="tasks-list">
                {tasks.length === 0 ? (
                    <p className="empty-msg">No tasks {title.toLowerCase()}.</p>
                ) : (
                    tasks.map(task => <DraggableTaskCard key={task.id} task={task} onOpen={onOpen} />)
                )}
            </div>
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

const PRIORITY_COLORS = { HIGH: '#ff4d4f', MEDIUM: '#faad14', LOW: '#52c41a' };
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', DONE: 'Done', BACKLOG: 'Backlog' };

const TaskDetailModal = ({ task, onClose }) => {
    if (!task) return null;
    const priorityColor = PRIORITY_COLORS[task.priority] || '#888';
    const projectStyle = {
        backgroundColor: hexToRgba(task.projectColorCode, 0.25),
        color: '#fff',
        border: `1px solid ${task.projectColorCode || '#4da3ff'}`,
        boxShadow: `0 0 12px ${hexToRgba(task.projectColorCode, 0.5)}`,
        textShadow: `0 0 5px ${task.projectColorCode || '#4da3ff'}`
    };
    return (
        <div className="task-modal-overlay" onClick={onClose}>
            <div className="task-modal" onClick={e => e.stopPropagation()}>
                <button className="task-modal-close" onClick={onClose}>✕</button>
                <div className="task-modal-header">
                    {task.project && <span className="project-badge" style={projectStyle}>{task.project}</span>}
                    <h2 className="task-modal-title">{task.title}</h2>
                </div>
                <div className="task-modal-body">
                    <p className="task-modal-desc">{task.description || 'No description provided.'}</p>
                    <div className="task-modal-meta">
                        <div className="task-modal-meta-item">
                            <span className="meta-label">Status</span>
                            <span className={`log-status status-${task.status?.toLowerCase()}`}>
                                {STATUS_LABELS[task.status] || task.status}
                            </span>
                        </div>
                        <div className="task-modal-meta-item">
                            <span className="meta-label">Priority</span>
                            <span className="meta-value" style={{ color: priorityColor, fontWeight: 'bold' }}>{task.priority}</span>
                        </div>
                        {task.createdAt && (
                            <div className="task-modal-meta-item">
                                <span className="meta-label">Created</span>
                                <span className="meta-value">{new Date(task.createdAt).toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        <div className="task-modal-meta-item">
                            <span className="meta-label">Assignee</span>
                            <span className="meta-value">{task.assignee || '—'}</span>
                        </div>
                        {task.updatedAt && (
                            <div className="task-modal-meta-item">
                                <span className="meta-label">Last Updated</span>
                                <span className="meta-value">{new Date(task.updatedAt).toLocaleString('en-IN')}</span>
                            </div>
                        )}
                    </div>
                    {task.prompt && (
                        <div className="task-modal-prompt" style={{ borderTop: '1px solid #1e1e1e', marginTop: '16px', paddingTop: '16px' }}>
                            <span className="meta-label">Prompt given:</span>
                            <p>{task.prompt}</p>
                        </div>
                    )}
                    {task.aiSummary && (
                        <div className="task-modal-prompt" style={{ borderTop: '1px solid #1e1e1e', marginTop: '16px', paddingTop: '16px' }}>
                            <span className="meta-label">AI Summary</span>
                            <p style={{ color: '#4da3ff', fontStyle: 'italic' }}>{task.aiSummary}</p>
                        </div>
                    )}
                    {task.logs && task.logs.length > 0 && (
                        <div className="task-modal-history">
                            <span className="meta-label">Activity History</span>
                            <div className="task-modal-history-list">
                                {task.logs.map((log, idx) => (
                                    <div key={log.id || idx} className="task-modal-history-item">
                                        <span className="history-time">
                                            {new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="history-text">
                                            <strong>{log.assignee}</strong> {log.actionType === 'STATUS_UPDATE' ? `moved to ${log.status?.replace('_', ' ')}` : log.actionType === 'AI_SUMMARY' ? 'added AI summary' : 'edited details'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const LogsSection = ({ logs, tasks, onOpen }) => (
    <div className="logs-container">
        <h3>Recent Activity</h3>
        <div className="logs-list">
            {logs.length === 0 ? (
                <p className="empty-msg">No recent activity.</p>
            ) : (
                logs.slice(0, 10).map(log => {
                    const task = tasks.find(t => t.id === log.taskId);
                    return (
                        <div 
                            key={log.id} 
                            className="log-item interactive" 
                            onClick={() => task && onOpen(task)}
                            title={task ? "Click to view task details" : ""}
                        >
                            <span className="log-time">
                                {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {log.actionType === 'STATUS_UPDATE' ? (
                                <span className="log-text">
                                    <strong>{log.assignee}</strong> moved <strong>{log.taskTitle}</strong> from <span className={`log-status status-${(log.fromStatus || 'BACKLOG').toLowerCase()}`}>{log.fromStatus ? log.fromStatus.replace('_', ' ') : 'Backlog'}</span> to <span className={`log-status status-${log.status?.toLowerCase()}`}>{log.status?.replace('_', ' ')}</span>
                                </span>
                            ) : log.actionType === 'CREATE' ? (
                                <span className="log-text">
                                    <strong>{log.assignee}</strong> created task <strong>{log.taskTitle}</strong>
                                </span>
                            ) : log.actionType === 'EDIT' ? (
                                <span className="log-text">
                                    <strong>{log.assignee}</strong> updated <strong>{log.taskTitle}</strong>: {log.description}
                                </span>
                            ) : log.actionType === 'DELETE' ? (
                                <span className="log-text">
                                    <strong>{log.assignee}</strong> deleted task <strong>{log.taskTitle}</strong>
                                </span>
                            ) : (
                                <span className="log-text">
                                    <strong>{log.assignee}</strong> moved <strong>{log.taskTitle}</strong> to <span className={`log-status status-${log.status?.toLowerCase()}`}>{log.status?.replace('_', ' ')}</span>
                                </span>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    </div>
);

const AISummarySection = ({ tasks, onOpen }) => {
    const summaryTasks = tasks
        .filter(t => (t.status === 'REVIEW' || t.status === 'DONE') && t.aiSummary)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);

    return (
        <div className="ai-summary-container">
            <h3 className="ai-summary-header">Recent AI Summaries</h3>
            {summaryTasks.length === 0 ? (
                <p className="empty-msg">No recent AI summaries available.</p>
            ) : (
                <div className="ai-summary-list">
                    {summaryTasks.map(task => (
                        <div 
                            key={task.id} 
                            className="ai-summary-card interactive" 
                            onClick={() => onOpen(task)}
                            title="Click to view task details"
                        >
                            <div className="ai-summary-card-title">{task.title}</div>
                            <div className="ai-summary-card-text">{task.aiSummary}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Scrum = () => {
    const [tasks, setTasks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState("Incoming Tasks...");
    const [selectedTask, setSelectedTask] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);

    const handleContextMenu = (e, task) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, task });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleSendToTodo = async () => {
        if (!contextMenu || !contextMenu.task) return;
        const task = contextMenu.task;
        handleCloseContextMenu();
        
        // Optimistically update
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'TODO' } : t));
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks/${task.id}?updatedBy=Sharath`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'TODO' })
            });
            if (!response.ok) throw new Error('Failed to update task status');
            
            setTimeout(async () => {
                try {
                    const logsRes = await fetch(`${API_BASE_URL}/api/logs`);
                    if (logsRes.ok) setLogs(await logsRes.json());
                } catch (e) {}
            }, 500);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        window.addEventListener('click', handleCloseContextMenu);
        return () => window.removeEventListener('click', handleCloseContextMenu);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            // Press and hold for 250ms to start dragging
            // This allows normal scrolling on mobile
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
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

        const fetchLogs = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/logs`);
                if (response.ok) {
                    const data = await response.json();
                    setLogs(data);
                }
            } catch (e) {
                console.error("Failed to fetch logs", e);
            }
        };

        fetchTasks();
        fetchLogs();
        // Refresh logs and board every 30 seconds
        const interval = setInterval(() => {
            fetchTasks();
            fetchLogs();
        }, 30000);
        return () => clearInterval(interval);
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
            } else {
                // Must be a drop onto a status column (from Kanban board OR from Backlog)
                const activeTask = tasks.find(t => t.id.toString() === activeId);
                const statusColumns = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

                if (activeTask && statusColumns.includes(overId)) {
                    if (activeTask.status !== overId) {
                        // Optimistically update status
                        setTasks(prev => prev.map(t => t.id.toString() === activeId ? { ...t, status: overId } : t));

                        // Persist to backend
                        try {
                            const response = await fetch(`${API_BASE_URL}/api/tasks/${activeId}?updatedBy=Sharath`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: overId })
                            });
                            if (!response.ok) throw new Error('Failed to update task status');
                        } catch (err) {
                            console.error('Error updating task status:', err);
                        }

                        // Immediately fetch logs after update
                        setTimeout(async () => {
                            try {
                                const response = await fetch(`${API_BASE_URL}/api/logs`);
                                if (response.ok) setLogs(await response.json());
                            } catch (e) { console.error(e); }
                        }, 500);
                    }
                }
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="scrum-container">
                <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
                <div className="task-counts">
                    <span className="count-badge total">Total: {tasks.length}</span>
                    <span className="count-badge status-todo">To Do: {todoTasks.length}</span>
                    <span className="count-badge status-in_progress">In Progress: {inProgressTasks.length}</span>
                    <span className="count-badge status-review">Review: {reviewTasks.length}</span>
                    <span className="count-badge status-done">Done: {doneTasks.length}</span>
                    <span className="count-badge status-backlog">Backlog: {backlogTasks.length}</span>
                </div>
                <div className="dashboard-top-section">
                    <AISummarySection tasks={tasks} onOpen={setSelectedTask} />
                    <LogsSection logs={logs} tasks={tasks} onOpen={setSelectedTask} />
                </div>
                <div className="scrum-board">
                    <DroppableColumn id="TODO" title="To Do" tasks={todoTasks} onOpen={setSelectedTask} />
                    <DroppableColumn id="IN_PROGRESS" title="In Progress" tasks={inProgressTasks} onOpen={setSelectedTask} />
                    <DroppableColumn id="REVIEW" title="Review" tasks={reviewTasks} onOpen={setSelectedTask} />
                    <DroppableColumn id="DONE" title="Done" tasks={doneTasks} onOpen={setSelectedTask} />
                </div>
                <div className="backlog-section">
                    <h2>Backlog</h2>
                    {backlogTasks.length === 0 ? (
                        <p className="empty-msg">No tasks in backlog.</p>
                    ) : (
                        <div className="backlog-list">
                            <SortableContext
                                items={backlogTasks.map(t => t.id.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                {backlogTasks.map(task => (
                                    <BacklogRow key={task.id} task={task} onOpen={setSelectedTask} onContextMenu={handleContextMenu} />
                                ))}
                            </SortableContext>
                        </div>
                    )}
                </div>
                {contextMenu && (
                    <div 
                        className="custom-context-menu" 
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <button onClick={handleSendToTodo}>Send to To Do</button>
                    </div>
                )}
            </div>
        </DndContext>
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
