import { useEffect, useState } from 'react';
import api from "./api/axios"
import './Tasks.css'

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/tasks');
      console.log('Tasks loaded:', response.data);
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Create a new task
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      alert('Task title cannot be empty');
      return;
    }

    const taskTitle = newTaskTitle.trim();
    setNewTaskTitle(''); // Clear input immediately for better UX

    try {
      const response = await api.post('/api/tasks', {
        title: taskTitle,
        userId: 0
      });
      await fetchTasks();
      console.log(response.data);
    } catch (err) {
      // Restore the input if creation failed
      setNewTaskTitle(taskTitle);
      
      console.error('Error creating task:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      // Only show error alert if it's actually a client/server error (4xx or 5xx)
      // Don't show error for network errors if we can't determine the actual status
      if (err.response) {
        const status = err.response.status;
        if (status >= 400 && status < 500) {
          // Client error (4xx)
          const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to create task';
          alert(errorMessage);
        } else if (status >= 500) {
          // Server error (5xx)
          alert('Server error. Please try again later.');
        }
      } else {
        // No response - could be network error or CORS issue
        // Try to refresh tasks anyway in case the request actually succeeded
        console.warn('No response received, but attempting to refresh tasks...');
        fetchTasks().catch(console.error);
      }
    }
  };

  // Update a task
  const handleUpdate = async (id, title, isDone) => {
    try {
      const response = await api.put(`/api/tasks/${id}`, {
        title: title,
        isDone: isDone
      });
      
      console.log('Task updated successfully:', response.data);
      await fetchTasks();
      setEditingTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to update task';
      alert(errorMessage);
    }
  };

  // Toggle task completion
  const handleToggleComplete = async (task) => {
    await handleUpdate(task.id, task.title, !task.isDone);
  };

  // Delete a task
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await api.delete(`/api/tasks/${id}`);
      await fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  // Start editing a task
  const startEditing = (task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTask(null);
    setEditTitle('');
  };

  // Save edited task
  const saveEdit = async (task) => {
    if (!editTitle.trim()) {
      alert('Task title cannot be empty');
      return;
    }
    await handleUpdate(task.id, editTitle.trim(), task.isDone);
  };

  return (
    <div className="tasks-container">
      <h2>Tasks</h2>
      
      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchTasks}>Retry</button>
        </div>
      )}

      {/* Create Task Form */}
      <form onSubmit={handleCreate} className="task-form">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter a new task..."
          className="task-input"
        />
        <button type="submit" className="btn btn-primary">Add Task</button>
      </form>

      {/* Loading State */}
      {loading && <p className="loading">Loading tasks...</p>}

      {/* Tasks List */}
      {!loading && tasks.length === 0 ? (
        <p className="empty-state">No tasks yet. Create one above!</p>
      ) : (
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className={`task-item ${task.isDone ? 'completed' : ''}`}>
              {/* Checkbox for completion */}
              <input
                type="checkbox"
                checked={task.isDone}
                onChange={() => handleToggleComplete(task)}
                className="task-checkbox"
              />

              {/* Task Content */}
              {editingTask === task.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="edit-input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(task);
                      if (e.key === 'Escape') cancelEditing();
                    }}
                  />
                  <button onClick={() => saveEdit(task)} className="btn btn-save">Save</button>
                  <button onClick={cancelEditing} className="btn btn-cancel">Cancel</button>
                </div>
              ) : (
                <>
                  <span 
                    className="task-title"
                    onClick={() => startEditing(task)}
                    title="Click to edit"
                  >
                    {task.title}
                  </span>
                  <div className="task-actions">
                    <button 
                      onClick={() => startEditing(task)}
                      className="btn btn-edit"
                      title="Edit task"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(task.id)}
                      className="btn btn-delete"
                      title="Delete task"
                    >
                      ❌
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Tasks;
