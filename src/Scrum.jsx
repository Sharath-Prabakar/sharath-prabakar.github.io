import React, { useEffect, useState } from 'react';
import './scrum.css';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const Scrum = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                            <div key={task.id} className="task-card">
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
                            <div key={task.id} className="task-card">
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
                            <div key={task.id} className="task-card">
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
                            <div key={task.id} className="task-card">
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <span className="assignee"><strong>Assignee:</strong> {task.assignee}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Scrum;
