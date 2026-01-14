import { useEffect, useState } from 'react';
import api from "./api/axios"
import './Tasks.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state
  const [newTaskTitle, setNewTaskTitle] = useState(''); // Track new task input
  const [editingTask, setEditingTask] = useState(null); // Track which task is being edited (task ID)
  const [editTitle, setEditTitle] = useState(''); // Track edited title

  // Fetch tasks function - extracted so it can be reused
  const fetchTasks = async () => {
    try {
      setLoading(true); // Set loading to true when starting fetch
      setError(null); // Clear any previous errors
      const response = await api.get('/api/tasks');
      setTasks(response.data);
    } catch (err) {
      // Display error message to user, not just console
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false); // Set loading to false when done (success or error)
    }
  };

  useEffect(() => {
    // Updated endpoint to match backend route change from /tasks to /api/tasks
    fetchTasks();
  }, []);

  // Handle creating a new task
  const handleCreate = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (!newTaskTitle.trim()) {
      setError('Task title cannot be empty');
      return;
    }

    try {
      setError(null);
      const response = await api.post('/api/tasks', {
        title: newTaskTitle.trim(),
        userId: 1 // Default user ID for now
      });
      // Add new task to the list
      setTasks([...tasks, response.data]);
      setNewTaskTitle(''); // Clear input field
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create task';
      setError(errorMessage);
      console.error('Error creating task:', err);
    }
  };

  // Handle updating a task
  const handleUpdate = async (taskId, updatedData) => {
    try {
      setError(null);
      const response = await api.put(`/api/tasks/${taskId}`, updatedData);
      // Update the task in the list
      setTasks(tasks.map(task => task.id === taskId ? response.data : task));
      setEditingTask(null); // Exit edit mode
      setEditTitle(''); // Clear edit input
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update task';
      setError(errorMessage);
      console.error('Error updating task:', err);
    }
  };

  // Toggle task completion status
  const handleToggleComplete = async (task) => {
    await handleUpdate(task.id, {
      title: task.title,
      isDone: !task.isDone
    });
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
  const saveEdit = async (taskId, currentIsDone) => {
    if (!editTitle.trim()) {
      setError('Task title cannot be empty');
      return;
    }
    await handleUpdate(taskId, {
      title: editTitle.trim(),
      isDone: currentIsDone
    });
  };

  // Handle deleting a task
  const handleDelete = async (taskId) => {
    // Confirm before deleting
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/api/tasks/${taskId}`);
      // Remove task from the list
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete task';
      setError(errorMessage);
      console.error('Error deleting task:', err);
    }
  };

  // Show loading message while fetching data
  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="tasks-container">
      <h2>My Tasks</h2>
      
      {/* Display error message if there's an error */}
      {error && (
        <div className="error-message" role="alert">
          {error}
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      {/* Form to create new tasks */}
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

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <p className="no-tasks">No tasks yet. Create one above!</p>
      ) : (
        <ul className="tasks-list">
          {tasks.map(task => (
            <li key={task.id} className={`task-item ${task.isDone ? 'completed' : ''}`}>
              {editingTask === task.id ? (
                // Edit mode: show input field with Save/Cancel buttons
                <div className="edit-form">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="task-input"
                    autoFocus
                  />
                  <button onClick={() => saveEdit(task.id, task.isDone)} className="btn btn-save">Save</button>
                  <button onClick={cancelEditing} className="btn btn-cancel">Cancel</button>
                </div>
              ) : (
                // Display mode: show task with checkbox, edit button, and delete button
                <>
                  <div className="task-content">
                    <input
                      type="checkbox"
                      checked={task.isDone}
                      onChange={() => handleToggleComplete(task)}
                      className="task-checkbox"
                    />
                    <span className="task-title">{task.title}</span>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => startEditing(task)} className="btn btn-edit">Edit</button>
                    <button onClick={() => handleDelete(task.id)} className="btn btn-delete">Delete</button>
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
