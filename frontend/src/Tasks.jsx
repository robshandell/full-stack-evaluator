import { useEffect, useState } from 'react';
import api from "./api/axios"

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

  // Show loading message while fetching data
  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div>
      <h2>Tasks</h2>
      
      {/* Display error message if there's an error */}
      {error && (
        <div style={{ color: 'red', padding: '10px', marginBottom: '10px', border: '1px solid red' }}>
          Error: {error}
          <button onClick={() => setError(null)} style={{ marginLeft: '10px' }}>×</button>
        </div>
      )}

      {/* Form to create new tasks */}
      <form onSubmit={handleCreate} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter a new task..."
          style={{ padding: '8px', marginRight: '10px', width: '300px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Add Task</button>
      </form>

      <ul>
        {tasks.map(task => (
          <li key={task.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {editingTask === task.id ? (
              // Edit mode: show input field with Save/Cancel buttons
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ padding: '4px', flex: 1 }}
                  autoFocus
                />
                <button onClick={() => saveEdit(task.id, task.isDone)} style={{ padding: '4px 8px' }}>Save</button>
                <button onClick={cancelEditing} style={{ padding: '4px 8px' }}>Cancel</button>
              </>
            ) : (
              // Display mode: show task with checkbox and edit button
              <>
                <input
                  type="checkbox"
                  checked={task.isDone}
                  onChange={() => handleToggleComplete(task)}
                />
                <span style={{ textDecoration: task.isDone ? 'line-through' : 'none', flex: 1 }}>
                  {task.title}
                </span>
                <button onClick={() => startEditing(task)} style={{ padding: '4px 8px' }}>Edit</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tasks;
