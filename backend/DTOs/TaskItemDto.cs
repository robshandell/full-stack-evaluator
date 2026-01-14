namespace TaskManager.DTOs
{
    // DTO for API responses - what the frontend receives
    public class TaskItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsDone { get; set; }
        public int UserId { get; set; }
    }

    // DTO for creating tasks - what the frontend sends when creating
    public class CreateTaskItemDto
    {
        public string Title { get; set; } = string.Empty;
        public int UserId { get; set; } = 1; // Default to user 1 for now
    }

    // DTO for updating tasks - what the frontend sends when updating
    public class UpdateTaskItemDto
    {
        public string Title { get; set; } = string.Empty;
        public bool IsDone { get; set; }
    }
}

