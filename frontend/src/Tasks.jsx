import { useEffect, useState } from 'react';
import api from "./api/axios"

function Tasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Updated endpoint to match backend route change from /tasks to /api/tasks
    api.get('/api/tasks')
      .then(res => setTasks(res.data))
      .catch(err => console.error(err));
  }, []);

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
