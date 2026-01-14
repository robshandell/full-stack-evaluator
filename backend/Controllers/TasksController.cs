using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.DTOs;
using TaskManager.Models;
using TaskManager.Data;

namespace TaskManager.API
{
    // Changed route from 'tasks' to 'api/tasks' for better REST API conventions
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
                // Convert domain models to DTOs before returning
                // This prevents exposing internal model structure
                var tasks = await _context.Tasks
                    .Select(t => new TaskItemDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        IsDone = t.IsDone,
                        UserId = t.UserId
                    })
                    .ToListAsync();
                
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                // Return 500 with error message if something goes wrong
                // In production, you might want to log this and not expose the exception message
                return StatusCode(500, new { error = "An error occurred while fetching tasks", message = ex.Message });
            }
        }

        // Added GET by ID endpoint - useful for retrieving a single task
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

                // Return as DTO
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
        public async Task<IActionResult> Create([FromBody] CreateTaskItemDto createDto)
        {
            try
            {
                // Validate input - title cannot be empty
                if (string.IsNullOrWhiteSpace(createDto.Title))
                {
                    return BadRequest(new { error = "Title is required" });
                }

                // For now, use userId from DTO (defaults to 1)
                // TODO: In production, this would validate user exists and handle authentication
                var task = new TaskItem
                {
                    Title = createDto.Title.Trim(), // Trim whitespace
                    IsDone = false, // New tasks start as not done
                    UserId = createDto.UserId
                };

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                // Return the created task as DTO
                var taskDto = new TaskItemDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    IsDone = task.IsDone,
                    UserId = task.UserId
                };

                return CreatedAtAction(nameof(GetById), new { id = task.Id }, taskDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while creating the task", message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskItemDto updateDto)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(updateDto.Title))
                {
                    return BadRequest(new { error = "Title is required" });
                }

                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    return NotFound(new { error = $"Task with id {id} not found" });
                }

                // Update task properties
                task.Title = updateDto.Title.Trim();
                task.IsDone = updateDto.IsDone;
                await _context.SaveChangesAsync();

                // Return updated task as DTO
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
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    return NotFound(new { error = $"Task with id {id} not found" });
                }

                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while deleting the task", message = ex.Message });
            }
        }
    }
}
