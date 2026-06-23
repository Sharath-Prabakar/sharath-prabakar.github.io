import React, { useState, useEffect } from 'react';
import './admin.css';

import CreateTaskModal from '../../components/Modals/CreateTaskModal';
import CreateProjectModal from '../../components/Modals/CreateProjectModal';
import AddRecipeModal from '../../components/Modals/AddRecipeModal';
import EditProjectModal from '../../components/Modals/EditProjectModal';
import EditTaskModal from '../../components/Modals/EditTaskModal';
import DeleteTaskModal from '../../components/Modals/DeleteTaskModal';
import ArchivedTasksModal from '../../components/Modals/ArchivedTasksModal';
import UserAccessModal from '../../components/Modals/UserAccessModal';
import ProjectPriorityModal from '../../components/Modals/ProjectPriorityModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Admin = () => {
    // Shared Data States
    const [allProjects, setAllProjects] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // Modal Visibility States
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Create Task
    const [isProjectPopupOpen, setIsProjectPopupOpen] = useState(false);
    const [isRecipePopupOpen, setIsRecipePopupOpen] = useState(false);
    const [isEditProjectPopupOpen, setIsEditProjectPopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false); // Edit Task
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [isArchivedPopupOpen, setIsArchivedPopupOpen] = useState(false);
    const [isUserAccessPopupOpen, setIsUserAccessPopupOpen] = useState(false);
    const [isPriorityPopupOpen, setIsPriorityPopupOpen] = useState(false);

    // Fetchers
    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/projects`);
            if (res.ok) setAllProjects(await res.json());
        } catch (err) { console.error("Failed to fetch projects", err); }
    };

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/tasks`);
            if (res.ok) setAllTasks(await res.json());
        } catch (e) { console.error('Failed to fetch tasks', e); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users`);
            if (res.ok) setAllUsers(await res.json());
        } catch (err) { console.error("Failed to fetch users", err); }
    };

    useEffect(() => {
        fetchProjects();
        fetchTasks();
        fetchUsers();
    }, []);

    // Refresh triggers for Modals
    const handleSuccess = () => {
        fetchProjects();
        fetchTasks();
    };

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userAccess = localStorage.getItem('userAccess');
    const hasAdminAccess = isAuthenticated && userAccess === 'Admin';

    return (
        <div className="admin-container">
            {!hasAdminAccess && (
                <div className="restricted-overlay">
                    <div className="restricted-message">
                        <h2>🔒 Restricted Access</h2>
                        <p>{!isAuthenticated ? "Please log in to access the Admin Dashboard." : "You do not have administrative privileges to access this page."}</p>
                        <button onClick={() => window.location.href = '/#/playground'} className="create-task-btn">
                            Return to Playground
                        </button>
                    </div>
                </div>
            )}
            
            <div className={!hasAdminAccess ? "admin-content-restricted" : ""}>
                <h1 className="admin-title">Admin Dashboard</h1>
                <p className="admin-subtitle">Manage tasks and operations seamlessly</p>

                <div className="admin-groups">
                    <div className="admin-group">
                        <h3>Task Management</h3>
                        <div className="admin-actions">
                            <button className="create-task-btn" onClick={() => setIsPopupOpen(true)}>
                                <span>+ Create Task</span>
                            </button>
                            <button className="create-task-btn" onClick={() => setIsEditPopupOpen(true)}>
                                <span>✎ Edit Task</span>
                            </button>
                            <button className="create-task-btn" onClick={() => setIsDeletePopupOpen(true)}>
                                <span>🗑 Delete Task</span>
                            </button>
                            <button className="create-task-btn" onClick={() => setIsArchivedPopupOpen(true)} style={{ borderColor: '#6c5ce7', color: '#a29bfe' }}>
                                <span>📦 View Archived</span>
                            </button>
                        </div>
                    </div>

                    <div className="admin-group">
                        <h3>Project Management</h3>
                        <div className="admin-actions">
                            <button className="create-task-btn" onClick={() => setIsProjectPopupOpen(true)}>
                                <span>+ Create Project</span>
                            </button>
                            <button className="create-task-btn" onClick={() => setIsEditProjectPopupOpen(true)}>
                                <span>✎ Edit Project</span>
                            </button>
                            <button className="create-task-btn" onClick={() => setIsPriorityPopupOpen(true)} style={{ borderColor: '#e84393', color: '#fd79a8' }}>
                                <span>⭐ Set Project Priority</span>
                            </button>
                        </div>
                    </div>

                    <div className="admin-group">
                        <h3>Administrative Controls</h3>
                        <div className="admin-actions">
                            <button className="create-task-btn" onClick={() => setIsUserAccessPopupOpen(true)} style={{ borderColor: '#00cec9', color: '#81ecec' }}>
                                <span>👥 User Access</span>
                            </button>
                            <button className="create-task-btn" onClick={() => setIsRecipePopupOpen(true)}>
                                <span>+ Add Recipe</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <CreateTaskModal isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} onSuccess={handleSuccess} allProjects={allProjects} allUsers={allUsers} />
                <CreateProjectModal isOpen={isProjectPopupOpen} onClose={() => setIsProjectPopupOpen(false)} onSuccess={handleSuccess} allProjects={allProjects} />
                <AddRecipeModal isOpen={isRecipePopupOpen} onClose={() => setIsRecipePopupOpen(false)} />
                <EditProjectModal isOpen={isEditProjectPopupOpen} onClose={() => setIsEditProjectPopupOpen(false)} onSuccess={handleSuccess} allProjects={allProjects} />
                <EditTaskModal isOpen={isEditPopupOpen} onClose={() => setIsEditPopupOpen(false)} onSuccess={handleSuccess} allTasks={allTasks} allProjects={allProjects} allUsers={allUsers} />
                <DeleteTaskModal isOpen={isDeletePopupOpen} onClose={() => setIsDeletePopupOpen(false)} onSuccess={handleSuccess} allTasks={allTasks} />
                <ArchivedTasksModal isOpen={isArchivedPopupOpen} onClose={() => setIsArchivedPopupOpen(false)} />
                <UserAccessModal isOpen={isUserAccessPopupOpen} onClose={() => setIsUserAccessPopupOpen(false)} />
                <ProjectPriorityModal isOpen={isPriorityPopupOpen} onClose={() => setIsPriorityPopupOpen(false)} onSuccess={fetchProjects} />

            </div>
        </div>
    );
};

export default Admin;
