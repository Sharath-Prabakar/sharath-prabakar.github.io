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
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import './scrum.css';
import EditTaskModal from '../../components/Modals/EditTaskModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "dummy-client-id.apps.googleusercontent.com";

const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(30, 58, 95, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function BacklogRow({ task, onOpen, onContextMenu, isOverlay }) {
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
        opacity: isDragging && !isOverlay ? 0.3 : 1,
        cursor: isOverlay ? 'grabbing' : 'grab',
        zIndex: isOverlay ? 1000 : 1,
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
            className={`backlog-row priority-${task.priority?.toLowerCase() || 'default'} ${isOverlay ? 'overlay' : ''}`}
            {...attributes}
            {...listeners}
            onClick={() => !isOverlay && onOpen(task)}
            onContextMenu={(e) => !isOverlay && onContextMenu(e, task)}
        >
            <div className="backlog-row-left">
                {task.project && (
                    <span className="project-badge" style={projectStyle}>       
                        {task.project}
                    </span>
                )}
                <div className="backlog-row-assignee"><strong>Assignee:</strong> {task.assignee}</div>
            </div>
            <div className="backlog-row-right">
                <div className="backlog-row-title"><strong>{task.title}</strong></div>
                <div className="backlog-row-desc">{task.description}</div>
            </div>
        </div>
    );
}

function BacklogSection({ tasks, onOpen, onContextMenu, closeContextMenu }) {
    const { setNodeRef, isOver } = useDroppable({ id: 'BACKLOG' });
    const style = {
        backgroundColor: isOver ? 'rgba(212, 175, 55, 0.05)' : undefined,
        borderColor: isOver ? '#d4af37' : undefined,
        border: isOver ? '2px dashed #d4af37' : undefined,
        borderRadius: '12px',
        margin: 0,
        maxWidth: '100%'
    };

    return (
        <div ref={setNodeRef} className="backlog-section" style={style} onClick={closeContextMenu}>
            <h2>Backlog</h2>
            {tasks.length === 0 ? (
                <p className="empty-msg">No tasks in backlog.</p>
            ) : (
                <div className="backlog-list">
                    <SortableContext
                        items={tasks.map(t => t.id.toString())}
                        strategy={verticalListSortingStrategy}
                    >
                        {tasks.map(task => (
                            <BacklogRow key={task.id} task={task} onOpen={onOpen} onContextMenu={onContextMenu} />
                        ))}
                    </SortableContext>
                </div>
            )}
        </div>
    );
}

function SortableProjectRow({ proj, index, isOverlay, canDrag }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: (proj.id || proj._id).toString(),
        disabled: !canDrag
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging && !isOverlay ? 0.3 : 1,
        cursor: canDrag ? (isOverlay ? 'grabbing' : 'grab') : 'default',
        zIndex: isOverlay ? 1000 : 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 5px',
        borderBottom: '1px solid #1a1a1a',
        backgroundColor: isOverlay ? 'rgba(10, 10, 10, 0.9)' : 'transparent',
    };

    const projectStyle = {
        backgroundColor: hexToRgba(proj.projectColorCode || '#4da3ff', 0.25),
        color: '#fff',
        border: `1px solid ${proj.projectColorCode || '#4da3ff'}`,
        boxShadow: `0 0 12px ${hexToRgba(proj.projectColorCode || '#4da3ff', 0.5)}`,
        textShadow: `0 0 5px ${proj.projectColorCode || '#4da3ff'}`,
        fontSize: '0.85rem',
        padding: '5px 10px',
        marginBottom: 0
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(canDrag ? attributes : {})}
            {...(canDrag ? listeners : {})}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="project-badge" style={projectStyle}>
                    {proj.projectName}
                </span>
            </div>
            <div style={{ fontSize: '1rem', color: '#d4af37', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                #{index + 1}
            </div>
        </div>
    );
}

function ProjectPrioritySection({ canDrag }) {
    const [projects, setProjects] = React.useState([]);
    const [activeId, setActiveId] = React.useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    React.useEffect(() => {
        fetch(`${API_BASE_URL}/api/projects`)
            .then(res => res.json())
            .then(data => {
                data.sort((a, b) => (a.rank || 0) - (b.rank || 0));
                setProjects(data);
            });
    }, []);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const activeId = active.id.toString();
            const overId = over.id.toString();

            const oldIndex = projects.findIndex(p => (p.id || p._id).toString() === activeId);
            const newIndex = projects.findIndex(p => (p.id || p._id).toString() === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                const reordered = arrayMove(projects, oldIndex, newIndex);
                
                let newRank;
                if (newIndex === 0) {
                    const nextRank = reordered[1]?.rank || 1.0;
                    newRank = nextRank / 2.0;
                } else if (newIndex === reordered.length - 1) {
                    const prevRank = reordered[newIndex - 1]?.rank || 0.0;
                    newRank = prevRank + 1.0;
                } else {
                    const prevRank = reordered[newIndex - 1].rank || 0.0;
                    const nextRank = reordered[newIndex + 1].rank || 1.0;
                    newRank = (prevRank + nextRank) / 2.0;
                }

                const updatedProjects = reordered.map(p => 
                    (p.id || p._id).toString() === activeId ? { ...p, rank: newRank } : p
                );
                setProjects(updatedProjects);

                try {
                    await fetch(`${API_BASE_URL}/api/projects/${activeId}/rank`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ rank: newRank })
                    });
                } catch (err) {
                    console.error("Failed to update project rank:", err);
                }
            }
        }
    };

    const activeProject = projects.find(p => (p.id || p._id).toString() === (activeId || '').toString());

    return (
        <div className="backlog-section" style={{ flex: 1, margin: 0, minWidth: '300px', maxWidth: '100%' }}>
            <h2>Project Priority</h2>
            {projects.length === 0 ? (
                <p className="empty-msg">No projects found.</p>
            ) : (
                <DndContext
                    sensors={canDrag ? sensors : []}
                    collisionDetection={closestCenter}
                    onDragStart={canDrag ? handleDragStart : undefined}
                    onDragEnd={canDrag ? handleDragEnd : undefined}
                >
                    <div className="backlog-list">
                        <SortableContext
                            items={projects.map(p => (p.id || p._id).toString())}
                            strategy={verticalListSortingStrategy}
                        >
                            {projects.map((proj, idx) => (
                                <SortableProjectRow 
                                    key={proj.id || proj._id} 
                                    proj={proj} 
                                    index={idx} 
                                    canDrag={canDrag}
                                />
                            ))}
                        </SortableContext>
                    </div>
                    {canDrag && (
                        <DragOverlay>
                            {activeProject ? (
                                <SortableProjectRow 
                                    proj={activeProject} 
                                    index={projects.findIndex(p => (p.id || p._id).toString() === activeProject.id)}
                                    isOverlay 
                                    canDrag={canDrag}
                                />
                            ) : null}
                        </DragOverlay>
                    )}
                </DndContext>
            )}
        </div>
    );
}

function SortableTaskCard({ task, onOpen, onContextMenu, isOverlay }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id.toString(),
        data: { task }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isOverlay ? 1000 : (isDragging ? 100 : 1),
        opacity: isDragging && !isOverlay ? 0.3 : 1,
        boxShadow: isOverlay ? '0 20px 40px rgba(0,0,0,0.8)' : undefined,       
        cursor: isOverlay ? 'grabbing' : 'grab',
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
            className={`task-card priority-${task.priority?.toLowerCase() || 'default'} ${isDragging && !isOverlay ? 'dragging' : ''} ${isOverlay ? 'overlay' : ''}`}
            onClick={() => !isOverlay && onOpen(task)}
            onContextMenu={(e) => {
                if (onContextMenu && !isOverlay) {
                    onContextMenu(e, task);
                }
            }}
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

function DroppableColumn({ id, title, tasks, onOpen, onContextMenu }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const style = {
        backgroundColor: isOver ? 'rgba(212, 175, 55, 0.05)' : undefined,       
        borderColor: isOver ? '#d4af37' : undefined,
    };
    return (
        <div ref={setNodeRef} className="column" style={style}>
            <h2>{title}</h2>
            <div className="tasks-list">
                <SortableContext
                    items={tasks.map(t => t.id.toString())}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.length === 0 ? (
                        <p className="empty-msg">No tasks {title.toLowerCase()}.</p>
                    ) : (
                        tasks.map(task => <SortableTaskCard key={task.id} task={task} onOpen={onOpen} onContextMenu={onContextMenu} />)
                    )}
                </SortableContext>
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

const TaskDetailModal = ({ task, onClose, onTaskUpdate }) => {
    if (!task) return null;
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reminderDate, setReminderDate] = useState(task.reminderDate ? task.reminderDate.substring(0, 16) : '');
    const [reminderLoading, setReminderLoading] = useState(false);

    const priorityColor = PRIORITY_COLORS[task.priority] || '#888';
    const projectStyle = {
        backgroundColor: hexToRgba(task.projectColorCode, 0.25),
        color: '#fff',
        border: `1px solid ${task.projectColorCode || '#4da3ff'}`,
        boxShadow: `0 0 12px ${hexToRgba(task.projectColorCode, 0.5)}`,
        textShadow: `0 0 5px ${task.projectColorCode || '#4da3ff'}`
    };

    const handleSetReminder = async () => {
        if (!reminderDate) return;
        setReminderLoading(true);
        try {
            const userFullName = localStorage.getItem('userFullName') || 'System';
            const res = await fetch(`${API_BASE_URL}/api/tasks/${task.id}?updatedBy=${encodeURIComponent(userFullName)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reminderDate })
            });
            if (res.ok) {
                const updatedTask = await res.json();
                onTaskUpdate(updatedTask);
            }
        } catch (err) {
            console.error("Failed to set reminder", err);
        } finally {
            setReminderLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const userFullName = localStorage.getItem('userFullName') || 'System';
            const res = await fetch(`${API_BASE_URL}/api/tasks/${task.id}/comments?updatedBy=${encodeURIComponent(userFullName)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: newComment })
            });
            if (res.ok) {
                const updatedTask = await res.json();
                onTaskUpdate(updatedTask);
                setNewComment('');
            }
        } catch (err) {
            console.error("Failed to add comment", err);
        } finally {
            setIsSubmitting(false);
        }
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
                                <span className="meta-value">{new Date(task.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                            </div>
                        )}
                        <div className="task-modal-meta-item">
                            <span className="meta-label">Assignee</span>        
                            <span className="meta-value">{task.assignee || '—'}</span>
                        </div>
                    </div>
                    <div className="task-modal-prompt" style={{ borderTop: '1px solid #1e1e1e', marginTop: '16px', paddingTop: '16px' }}>
                        <span className="meta-label">Reminder</span>
                        {task.reminderDate && (
                            <p style={{ color: '#4da3ff', margin: '8px 0', fontSize: '0.95rem' }}>
                                🔔 {new Date(task.reminderDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
                            <input
                                type="datetime-local"
                                value={reminderDate}
                                onChange={(e) => setReminderDate(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #333',
                                    backgroundColor: '#181818',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleSetReminder}
                                disabled={reminderLoading || !reminderDate}
                                style={{
                                    padding: '8px 18px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: reminderLoading || !reminderDate ? '#333' : 'linear-gradient(135deg, #4da3ff, #7b61ff)',
                                    color: '#fff',
                                    fontWeight: 600,
                                    cursor: reminderLoading || !reminderDate ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {reminderLoading ? 'Setting...' : 'Set Reminder'}
                            </button>
                        </div>
                    </div>
                    {task.prompt && (
                        <div className="task-modal-prompt">
                            <span className="meta-label">Prompt / Instructions</span>
                            <p>{task.prompt}</p>
                        </div>
                    )}
                    {task.aiSummary && (
                        <div className="task-modal-prompt" style={{ borderTop: '1px solid #1e1e1e', marginTop: '16px', paddingTop: '16px' }}>
                            <span className="meta-label">Agentic AI Task Summary - {task.project || 'Portfolio Website'}</span>
                            <div className="markdown-content" style={{ color: '#4da3ff', fontStyle: 'italic', marginTop: '8px' }}>
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{task.aiSummary.replace(/\\n/g, '\n')}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    <div className="task-modal-comments">
                        <span className="meta-label">Comments</span>
                        <div className="task-modal-comments-list">
                            {task.comments && task.comments.length > 0 ? (
                                task.comments.map((comment, idx) => {
                                    const colonIndex = comment.indexOf(':');
                                    if (colonIndex !== -1) {
                                        const name = comment.substring(0, colonIndex);
                                        const message = comment.substring(colonIndex + 1);
                                        return (
                                            <div key={idx} className="comment-item">
                                                <strong className="comment-author">{name}:</strong>
                                                <div className="comment-text markdown-content">
                                                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message}</ReactMarkdown>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={idx} className="comment-item">
                                            <div className="markdown-content">
                                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{comment}</ReactMarkdown>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="empty-msg" style={{ margin: '10px 0' }}>No comments yet.</p>
                            )}
                        </div>
                        <div className="add-comment-section">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                disabled={isSubmitting}
                            />
                            <button 
                                onClick={handleAddComment} 
                                disabled={isSubmitting || !newComment.trim()}
                            >
                                {isSubmitting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </div>

                    {task.logs && task.logs.length > 0 && (
                        <div className="task-modal-history">
                            <span className="meta-label">Activity History</span>
                            <div className="task-modal-history-list">
                                {task.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((log, idx) => (
                                    <div key={idx} className="task-modal-history-item">
                                        <span className="history-time">{new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>   
                                        <span className="history-text">
                                            <strong>{log.assignee}</strong> {log.description}
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

function AISummarySection({ tasks, onOpen }) {
    const aiSummaries = tasks.filter(t => t.aiSummary).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return (
        <div className="ai-summary-container">
            <h2 className="ai-summary-header">Agentic AI Task Summary</h2> 
            <div className="ai-summary-list">
                {aiSummaries.length === 0 ? (
                    <p className="empty-msg">No autonomous summaries available.</p>
                ) : (
                    aiSummaries.slice(0, 10).map(task => {
                        const projectStyle = {
                            backgroundColor: hexToRgba(task.projectColorCode, 0.25),
                            color: '#fff',
                            border: `1px solid ${task.projectColorCode || '#4da3ff'}`,
                            boxShadow: `0 0 12px ${hexToRgba(task.projectColorCode, 0.5)}`,
                            textShadow: `0 0 5px ${task.projectColorCode || '#4da3ff'}`,
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            marginBottom: '6px'
                        };
                        return (
                            <div key={task.id} className="ai-summary-card interactive" onClick={() => onOpen(task)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    {task.project && (
                                        <span className="project-badge" style={{ ...projectStyle, marginBottom: 0 }}>
                                            {task.project}
                                        </span>
                                    )}
                                    <div className="ai-summary-card-title" style={{ marginBottom: 0 }}>{task.title}</div>
                                </div>
                                <div className="ai-summary-card-text markdown-content">
                                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{task.aiSummary.replace(/\\n/g, '\n')}</ReactMarkdown>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

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
                            <div className="log-time-wrapper">
                                <span className="log-time">
                                    {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}     
                                </span>
                                <span className="log-date">
                                    {new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' })}
                                </span>
                            </div>
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
                                    <strong>{log.assignee}</strong> updated <strong>{log.taskTitle}</strong>
                                </span>
                            ) : log.actionType === 'BATCH_ASSIGN' ? (() => {
                                const match = log.description.match(/ to (.*?)( \(Project Level\))?$/);
                                const modelName = match ? match[1] : log.assignee;
                                return (
                                    <span className="log-text">
                                        <strong>{modelName}</strong> was assigned to <strong>{log.taskTitle}</strong>
                                    </span>
                                );
                            })() : log.actionType === 'LINK_PROJECT' ? (
                                <span className="log-text">
                                    <strong>{log.assignee}</strong> linked <strong>{log.taskTitle}</strong> to <strong>{log.description.replace('Task linked to project: ', '')}</strong>
                                </span>
                            ) : log.actionType === 'DELETE' ? (
                                <span className="log-text">
                                    <strong>{log.assignee}</strong> deleted task <strong>{log.taskTitle}</strong>
                                </span>
                            ) : log.actionType === 'COMMENT' ? (
                                <span className="log-text">
                                    <strong>{log.assignee}</strong> commented on <strong>{log.taskTitle}</strong>: {log.description.replace('New comment added: ', '')}
                                </span>
                            ) : log.actionType === 'AI_SUMMARY' ? (
                                <span className="log-text">
                                    <strong>{log.assignee}</strong> generated an <strong>AI Summary</strong> for <strong>{log.taskTitle}</strong>
                                </span>
                            ) : log.actionType === 'ARCHIVE' ? (
                                <span className="log-text">
                                    <strong>{log.assignee}</strong> archived <strong>{log.taskTitle}</strong>
                                </span>
                            ) : log.actionType === 'PERMANENT_DELETE' ? (
                                <span className="log-text">
                                    <strong>{log.assignee}</strong> permanently deleted <strong>{log.taskTitle}</strong> from archives
                                </span>
                            ) : null}
                        </div>
                    );
                })
            )}
        </div>
    </div>
);

const LoginPopup = ({ onLogin, onGuest }) => {
    const [loginError, setLoginError] = useState('');
    const [requestMessage, setRequestMessage] = useState('');
    const [requestMode, setRequestMode] = useState(false);

    const handleRequestAccess = async (credentialResponse) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/request-access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential })
            });
            const data = await res.json();
            if (res.ok) {
                setRequestMessage(data.message || 'Access request submitted!');
            } else {
                setRequestMessage(data.error || 'Request failed');
            }
        } catch {
            setRequestMessage('Network error. Please try again.');
        }
        setRequestMode(false);
    };

    const handleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/google`, {        
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential })  
            });
            if (res.ok) {
                const data = await res.json();
                onLogin(data);
            } else {
                const err = await res.json();
                setLoginError(err.error || 'Authentication failed');
            }
        } catch {
            setLoginError('Network error');
        }
    };

    return (
        <div className="auth-overlay">
            <div className="auth-popup">
                <div className="auth-header">
                    <h2 className="auth-title">🔒 Scrum Board</h2>
                    <p className="auth-subtitle">Authenticate to manage tasks</p>
                </div>
                <div className="auth-form">
                    {loginError && <div className="auth-error">{loginError}</div>}
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <GoogleLogin
                            onSuccess={handleSuccess}
                            onError={() => setLoginError('Login Failed')}       
                        />
                    </div>
                </div>
                <div className="auth-divider">
                    <span>or</span>
                </div>
                <button className="auth-guest-btn" onClick={onGuest}>
                    👤 View as Guest
                </button>
                <div className="auth-divider" style={{ margin: '12px 0 8px' }}>
                    <span>need access?</span>
                </div>
                {requestMessage ? (
                    <div className="auth-error" style={{ backgroundColor: 'rgba(0,150,100,0.1)', borderColor: '#00a060', color: '#4ade80', textAlign: 'center', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem' }}>
                        {requestMessage}
                    </div>
                ) : requestMode ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleRequestAccess}
                            onError={() => setRequestMessage('Login failed')}
                        />
                    </div>
                ) : (
                    <button className="auth-guest-btn" style={{ borderColor: '#6c5ce7', color: '#a29bfe', marginTop: '0' }} onClick={() => setRequestMode(true)}>
                        📨 Request Login Access
                    </button>
                )}
            </div>
        </div>
    );
};

const LoginPopupWrapper = ({ onLogin, onGuest }) => (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginPopup onLogin={onLogin} onGuest={onGuest} />
    </GoogleOAuthProvider>
);

export default function Scrum() {
    const [tasks, setTasks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Initializing...");    
    const [error, setError] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, task: null });
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editTaskId, setEditTaskId] = useState(null);
    const [allProjects, setAllProjects] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });
    const [userAccess, setUserAccess] = useState(() => {
        return localStorage.getItem('userAccess') || null;
    });
    const [isGuest, setIsGuest] = useState(false);
    const [archivedCount, setArchivedCount] = useState(0);
    const userFullName = localStorage.getItem('userFullName') || 'User';

    const fetchArchivedCount = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks/archived`);
            if (response.ok) {
                const data = await response.json();
                setArchivedCount(data.length);
            }
        } catch (err) {
            console.error("Failed to fetch archived tasks", err);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    const handleContextMenu = (e, task) => {
        e.preventDefault();
        if (isGuest) return;
        
        // Only show context menu for DONE, BACKLOG, or TODO tasks
        if (task.status !== 'DONE' && task.status !== 'BACKLOG' && task.status !== 'TODO') return;

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            task
        });
    };

    const closeContextMenu = () => {
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleDeleteTask = async () => {
        const taskId = contextMenu.task?.id;
        if (!taskId) return;

        try {
            const userFullName = localStorage.getItem('userFullName') || 'System';
            const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}?updatedBy=${encodeURIComponent(userFullName)}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setTasks(prev => prev.filter(t => t.id !== taskId));
                setContextMenu({ visible: false, x: 0, y: 0, task: null });     
                fetchArchivedCount();
            } else {
                console.error('Failed to delete task');
            }
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    const handleMoveToTodo = async () => {
        if (!contextMenu.task) return;
        const taskId = contextMenu.task.id;
        const userFullName = localStorage.getItem('userFullName') || 'System';
        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}?updatedBy=${encodeURIComponent(userFullName)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'TODO' })
            });
            if (response.ok) {
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'TODO' } : t));
            }
        } catch (err) {
            console.error("Failed to move task to TODO", err);
        }
        closeContextMenu();
    };

    const handleMoveToBacklog = async () => {
        if (!contextMenu.task) return;
        const taskId = contextMenu.task.id;
        const userFullName = localStorage.getItem('userFullName') || 'System';
        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}?updatedBy=${encodeURIComponent(userFullName)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'BACKLOG' })
            });
            if (response.ok) {
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'BACKLOG' } : t));
            }
        } catch (err) {
            console.error("Failed to move task to BACKLOG", err);
        }
        closeContextMenu();
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userAccess');
        localStorage.removeItem('userFullName');
        setIsAuthenticated(false);
        setUserAccess(null);
        setIsGuest(false);
        closeContextMenu();
    };

    const handleTaskUpdate = (updatedTask) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        setSelectedTask(updatedTask);
    };

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
        const fetchProjects = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/projects`);
                if (res.ok) setAllProjects(await res.json());
            } catch (err) { console.error("Failed to fetch projects", err); }
        };

        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/users`);
                if (res.ok) setAllUsers(await res.json());
            } catch (err) { console.error("Failed to fetch users", err); }
        };

        const fetchTasks = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/tasks`);      
                if (!response.ok) throw new Error('Failed to fetch tasks');     
                const data = await response.json();
                setTasks(data);
            } catch (err) { setError(err); } finally { setLoading(false); }     
        };

        const fetchLogs = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/logs`);       
                if (response.ok) setLogs(await response.json());
            } catch (err) { console.error("Failed to fetch logs", err); }       
        };

        fetchProjects();
        fetchUsers();
        fetchTasks();
        fetchLogs();
        fetchArchivedCount();
        const interval = setInterval(() => { fetchTasks(); fetchLogs(); fetchArchivedCount(); }, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!isAuthenticated && !isGuest) {
        return <LoginPopupWrapper
            onLogin={(data) => {
                setIsAuthenticated(true);
                setUserAccess(data.access);
                const userFullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'System';
                localStorage.setItem('userFullName', userFullName);
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userAccess', data.access);
            }}
            onGuest={() => setIsGuest(true)}
        />;
    }

    if (loading) return <div className="scrum-container"><LoadingPopup message={loadingMessage} /></div>;
    if (error) return <div className="scrum-container"><div className="empty-msg">Error: {error.message}</div></div>;

    const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
    const todoTasks = sortedTasks.filter(task => task.status === 'TODO');       
    const inProgressTasks = sortedTasks.filter(task => task.status === 'IN_PROGRESS');
    const reviewTasks = sortedTasks.filter(task => task.status === 'REVIEW');   
    const doneTasks = sortedTasks.filter(task => task.status === 'DONE');       
    const backlogTasks = sortedTasks.filter(task => task.status === 'BACKLOG'); 

    const canDrag = isAuthenticated && userAccess === 'Admin';

    const handleDragStart = (event) => {
        const { active } = event;
        const task = tasks.find(t => t.id.toString() === active.id.toString()); 
        setActiveTask(task);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (over && active.id !== over.id) {
            const activeId = active.id.toString();
            const overId = over.id.toString();

            const activeTaskObj = tasks.find(t => t.id.toString() === activeId);
            const overTaskObj = tasks.find(t => t.id.toString() === overId);    

            if (overTaskObj) {
                const sameColumnTasks = sortedTasks.filter(t => t.status === overTaskObj.status);
                const oldIndex = sameColumnTasks.findIndex(t => t.id.toString() === activeId);
                const newIndex = sameColumnTasks.findIndex(t => t.id.toString() === overId);

                const reordered = arrayMove(sameColumnTasks, oldIndex === -1 ? 0 : oldIndex, newIndex);
                const movedTaskIndex = reordered.findIndex(t => t.id.toString() === activeId);

                let newOrder;
                if (movedTaskIndex === 0) {
                    const nextOrder = reordered[1]?.order || 1.0;
                    newOrder = nextOrder / 2.0;
                } else if (movedTaskIndex === reordered.length - 1) {
                    const prevOrder = reordered[movedTaskIndex - 1]?.order || 0.0;
                    newOrder = prevOrder + 1.0;
                } else {
                    const prevOrder = reordered[movedTaskIndex - 1].order;      
                    const nextOrder = reordered[movedTaskIndex + 1].order;      
                    newOrder = (prevOrder + nextOrder) / 2.0;
                }

                setTasks(prev => prev.map(t => t.id.toString() === activeId ? { ...t, order: newOrder, status: overTaskObj.status } : t));

                try {
                    await fetch(`${API_BASE_URL}/api/tasks/${activeId}/order`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },        
                        body: JSON.stringify({ order: newOrder.toString() })    
                    });
                    if (activeTaskObj.status !== overTaskObj.status) {
                        const userFullName = localStorage.getItem('userFullName') || 'System';
                        await fetch(`${API_BASE_URL}/api/tasks/${activeId}?updatedBy=${encodeURIComponent(userFullName)}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },    
                            body: JSON.stringify({ status: overTaskObj.status })
                        });
                    }
                } catch (err) { console.error(err); }
            } else {
                const statusColumns = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BACKLOG'];
                if (statusColumns.includes(overId)) {
                    const activeTask = tasks.find(t => t.id.toString() === activeId);
                    if (activeTask && activeTask.status !== overId) {
                        setTasks(prev => prev.map(t => t.id.toString() === activeId ? { ...t, status: overId } : t));
                        try {
                            const userFullName = localStorage.getItem('userFullName') || 'System';
                            await fetch(`${API_BASE_URL}/api/tasks/${activeId}?updatedBy=${encodeURIComponent(userFullName)}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: overId })        
                            });
                        } catch (err) { console.error(err); }
                    }
                }
            }

            setTimeout(async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/logs`);        
                    if (res.ok) setLogs(await res.json());
                } catch {
                    // ignore
                }
            }, 500);
        }
    };

    return (
        <DndContext
            sensors={canDrag ? sensors : []}
            collisionDetection={closestCenter}
            onDragStart={canDrag ? handleDragStart : undefined}
            onDragEnd={canDrag ? handleDragEnd : undefined}
        >
            <div className="scrum-container">
                <TaskDetailModal 
                    task={selectedTask} 
                    onClose={() => setSelectedTask(null)} 
                    onTaskUpdate={handleTaskUpdate}
                />
                {contextMenu.visible && (
                    <div
                        className="custom-context-menu"
                        style={{ top: contextMenu.y, left: contextMenu.x }}     
                        onClick={(e) => e.stopPropagation()}
                    >
                        {contextMenu.task?.status === 'DONE' && (
                            <button onClick={handleDeleteTask} style={{ color: '#ff4d4d' }}>Archive</button>
                        )}
                        {contextMenu.task?.status === 'BACKLOG' && (
                            <>
                                <button onClick={handleMoveToTodo}>Move to TODO</button>
                                {userAccess === 'Admin' && (
                                    <button onClick={() => {
                                        setEditTaskId(contextMenu.task.id);
                                        setIsEditPopupOpen(true);
                                        closeContextMenu();
                                    }}>Edit Task</button>
                                )}
                            </>
                        )}
                        {contextMenu.task?.status === 'TODO' && (
                            <button onClick={handleMoveToBacklog}>Move to Backlog</button>
                        )}
                    </div>
                )}
                <div className="user-profile-bar" onClick={closeContextMenu}>
                    {!isGuest ? (
                        <>
                            <span className="user-greeting">👤 {userFullName} [{userAccess === 'Request' ? 'Guest' : 'Admin'}]</span>
                            <button className="logout-btn" onClick={handleLogout}>Log out</button>
                        </>
                    ) : (
                        <span className="user-greeting">👤 Guest [Guest]</span>
                    )}
                </div>
                <div className="task-counts" onClick={closeContextMenu}>        
                    <span className="count-badge total">Total: {tasks.length + archivedCount}</span>
                    <span className="count-badge status-todo">To Do: {todoTasks.length}</span>
                    <span className="count-badge status-in_progress">In Progress: {inProgressTasks.length}</span>
                    <span className="count-badge status-review">Review: {reviewTasks.length}</span>
                    <span className="count-badge status-done">Done: {doneTasks.length}</span>
                    <span className="count-badge status-backlog">Backlog: {backlogTasks.length}</span>
                    <span className="count-badge status-archived">Archived: {archivedCount}</span>
                </div>
                <div className="dashboard-top-section" onClick={closeContextMenu}>
                    <AISummarySection tasks={tasks} onOpen={setSelectedTask} /> 
                    <LogsSection logs={logs} tasks={tasks} onOpen={setSelectedTask} />
                </div>
                <div className="scrum-board" onClick={closeContextMenu}>        
                    <DroppableColumn id="TODO" title="To Do" tasks={todoTasks} onOpen={setSelectedTask} onContextMenu={handleContextMenu} />
                    <DroppableColumn id="IN_PROGRESS" title="In Progress" tasks={inProgressTasks} onOpen={setSelectedTask} onContextMenu={handleContextMenu} /> 
                    <DroppableColumn id="REVIEW" title="Review" tasks={reviewTasks} onOpen={setSelectedTask} onContextMenu={handleContextMenu} />
                    <DroppableColumn id="DONE" title="Done" tasks={doneTasks} onOpen={setSelectedTask} onContextMenu={handleContextMenu} />
                </div>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '1200px', margin: '40px auto 0' }}>
                    <div style={{ flex: 2, minWidth: '300px' }}>
                        <BacklogSection 
                            tasks={backlogTasks} 
                            onOpen={setSelectedTask} 
                            onContextMenu={handleContextMenu} 
                            closeContextMenu={closeContextMenu} 
                        />
                    </div>
                    <ProjectPrioritySection canDrag={canDrag} />
                </div>
                
                <EditTaskModal 
                    isOpen={isEditPopupOpen} 
                    onClose={() => { setIsEditPopupOpen(false); setEditTaskId(null); }} 
                    onSuccess={() => { window.location.reload(); }}
                    allTasks={tasks} 
                    allProjects={allProjects} 
                    allUsers={allUsers} 
                    initialTaskId={editTaskId} 
                />
            </div>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: {
                            opacity: '0.5',
                        },
                    },
                }),
            }}>
                {activeTask ? (
                    activeTask.status === 'BACKLOG' ? (
                        <BacklogRow task={activeTask} isOverlay />
                    ) : (
                        <SortableTaskCard task={activeTask} isOverlay />        
                    )
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

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


