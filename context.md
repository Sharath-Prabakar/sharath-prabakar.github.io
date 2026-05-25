# Portfolio Frontend Context

## Overview
This is the primary user interface for the Portfolio Website, built as a Single Page Application (SPA). It acts as both a personal portfolio showcase and an interactive Scrum board for managing AI-driven tasks.

## Tech Stack
- **Framework:** React
- **Build Tool:** Vite
- **Authentication:** Google OAuth2 (`@react-oauth/google`)
- **Drag & Drop:** `@dnd-kit/core` and `@dnd-kit/sortable` for Kanban board functionality.

## Key Features
- **Interactive Scrum Board (`Scrum.jsx`):** A fully-featured Kanban board where tasks can be dragged between states (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`, `BACKLOG`). It dynamically parses and renders detailed activity logs (e.g., triage linking and assignments by the AI Agent).
- **Admin Utilities (`Admin.jsx`):** Allows administrative users to oversee projects, batch create tasks, and force-sync states.
- **Dynamic Authentication:** Google Login popup dynamically switching between guest mode, standard user login, and requesting access.
- **Responsive UI:** CSS-driven layouts utilizing grid and flexbox, with rich micro-interactions and gradients.

## Core Structure
- `src/pages/Scrum/` - Contains the main Kanban board logic, task modals, and activity feed rendering.
- `src/pages/Admin/` - Administrative dashboards and controls.
- `src/assets/` - Static imagery and global stylesheets (e.g., `index.css`).

<!-- AUTO_UPDATE_START -->
## 🔄 Automated Monthly Update (Last Checked: 2026-05-25 08:59:29)

### 🌿 Git Branch
- `main`

### 📝 Recent Commits (Last 30 Days)
- `5eb0ffb User Access and Archived Count`
- `5e50852 Book Club Mini Project`
- `975256b Update Admin.jsx`
- `21b61d0 Logs section, AI Chat explorer and Admin Accessfixes`
- `d8b7d71 Update Scrum.jsx`
- `1d45711 Archive Logs & Deploy instructions update`
- `bcdb513 Monthly View & Authentication check`
- `6241078 Keep User Logged In & Comments functionality`
- `40ee14e Admin Login & Archived Tasks`
- `93acb99 Gmail login and comments features`

### ⚠️ Uncommitted Status
- **Working directory is dirty:**
  - `M src/pages/Scrum/Scrum.jsx`
  - `?? context.md`
<!-- AUTO_UPDATE_END -->
