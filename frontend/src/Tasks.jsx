import { useEffect, useState } from 'react';
import api from "./api/axios"

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    // Updated endpoint to match backend route change from /tasks to /api/tasks
    const fetchTasks = async () => {
      try {
        setLoading(true); // Set loading to true when starting fetch
        const response = await api.get('/api/tasks');
        setTasks(response.data);
      } catch (err) {
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
