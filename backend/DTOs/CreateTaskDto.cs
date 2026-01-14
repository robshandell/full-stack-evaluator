namespace TaskManager.DTOs
{
    public class CreateTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public int UserId { get; set; }
    }
}

