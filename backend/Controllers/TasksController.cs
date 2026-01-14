using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;

using TaskManager.Models;
using TaskManager.Data;
using TaskManager.DTOs;
namespace TaskManager.API
{
    [Route("api/tasks")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var tasks = await _context.Tasks.ToListAsync();
                // Convert to DTOs to avoid serialization issues
                var taskDtos = tasks.Select(t => new TaskItemDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    IsDone = t.IsDone,
                    UserId = t.UserId
                }).ToList();
                
                return Ok(taskDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while fetching tasks", message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    return NotFound(new { error = $"Task with id {id} not found" });
                }
                
                // Convert to DTO to avoid serialization issues
                var taskDto = new TaskItemDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    IsDone = task.IsDone,
                    UserId = task.UserId
                };
                
                return Ok(taskDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while fetching the task", message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTaskDto createDto)
        {
            try
            {
                if (createDto == null || string.IsNullOrWhiteSpace(createDto.Title))
                {
                    return BadRequest(new { error = "Title is required" });
                }

                // Get or create a default user if none exists
                var user = await _context.Users.FirstOrDefaultAsync();
                if (user == null)
                {
                    // Create a default user
                    user = new User
                    {
                        Email = "default@example.com",
                        PasswordHash = "default"
                    };
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }

                // Create the task
                var task = new TaskItem
                {
                    Title = createDto.Title.Trim(),
                    IsDone = false,
                    UserId = user.Id
                };

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();
                
                // Return 201 Created with a DTO to avoid serialization issues with navigation properties
                var taskDto = new TaskItemDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    IsDone = task.IsDone,
                    UserId = task.UserId
                };
                
                return StatusCode(201, taskDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while creating the task", message = ex.Message });
            }
        }

        [HttpPut("{id}")] 
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskDto updateDto)
        {
            try
            {
                if (updateDto == null || string.IsNullOrWhiteSpace(updateDto.Title))
                {
                    return BadRequest(new { error = "Title is required" });
                }

                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    return NotFound(new { error = $"Task with id {id} not found" });
                }

                task.Title = updateDto.Title.Trim();
                task.IsDone = updateDto.IsDone;
                await _context.SaveChangesAsync();

                // Return DTO to avoid serialization issues
                var taskDto = new TaskItemDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    IsDone = task.IsDone,
                    UserId = task.UserId
                };

                return Ok(taskDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while updating the task", message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
