import { useEffect, useState } from 'react';
import api from "./api/axios"

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state

  useEffect(() => {
    // Updated endpoint to match backend route change from /tasks to /api/tasks
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

    fetchTasks();
  }, []);

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

      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.title} {task.isDone ? '✅' : '❌'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tasks;
