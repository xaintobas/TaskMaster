class TaskManager {
  constructor() {
    this.baseUrl = "/api/tasks";
    this.tasks = [];
    this.currentPage = 1;
    this.tasksPerPage = 10;
    this.setupEventListeners();
    this.loadTasks();
  }

  setupEventListeners() {
    const taskForm = document.getElementById("taskForm");
    const searchInput = document.getElementById("searchTasks");
    const priorityFilter = document.getElementById("priorityFilter");
    const dateFilter = document.getElementById("dateFilter");

    taskForm.addEventListener("submit", (e) => this.handleAddTask(e));
    searchInput.addEventListener("input", (e) => this.handleSearch(e));
    priorityFilter.addEventListener("change", () => this.applyFilters());
    dateFilter.addEventListener("change", () => this.applyFilters());

    document
      .getElementById("prevPage")
      .addEventListener("click", () => this.changePage(-1));
    document
      .getElementById("nextPage")
      .addEventListener("click", () => this.changePage(1));
  }

  async handleAddTask(e) {
    e.preventDefault();
    const taskData = {
      title: document.getElementById("taskTitle").value,
      description: document.getElementById("taskDescription").value,
      priority: document.getElementById("taskPriority").value.toLowerCase(),
      deadline: document.getElementById("taskDeadline").value,
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        UI.clearForm("taskForm");
        UI.showMessage("Task added successfully", "success");
        this.loadTasks();
      } else {
        const data = await response.json();
        UI.showMessage(data.message, "error");
      }
    } catch (error) {
      UI.showMessage("An error occurred while adding the task", "error");
      console.error("Error:", error);
    }
  }

  async loadTasks() {
    try {
      const response = await fetch(`${this.baseUrl}?page=${this.currentPage}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.tasks = data.tasks;
        this.renderTasks();
        this.updatePagination(data.totalPages);
      }
    } catch (error) {
      UI.showMessage("Error loading tasks", "error");
      console.error("Error:", error);
    }
  }

  async toggleStatus(taskId, currentStatus) {
    // Toggle status between 'pending' and 'complete'
    const newStatus = currentStatus === "pending" ? "complete" : "pending";

    try {
      const response = await fetch(`${this.baseUrl}/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        this.loadTasks(); // Reload tasks to reflect the updated status
        UI.showMessage("Task status updated successfully", "success");
      } else {
        const data = await response.json();
        UI.showMessage(data.message, "error");
      }
    } catch (error) {
      UI.showMessage("Error updating task status", "error");
      console.error("Error:", error);
    }
  }

  renderTasks() {
    const tbody = document.getElementById("tasksList");
    tbody.innerHTML = "";

    if (this.tasks.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="text-center">No tasks found</td></tr>';
      return;
    }

    this.tasks.forEach((task) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>#${task._id.slice(-4)}</td>
                <td>${task.title}</td>
                <td>${task.description}</td>
                <td>${UI.formatDate(task.deadline)}</td>
                <td><span class="priority-${task.priority}">${
        task.priority
      }</span></td>
                <td><span class="status-${task.status}"  
                      onclick="taskManager.toggleStatus('${task._id}', '${
        task.status
      }')">${task.status}</span></td>
                <td>
                    <button class="action-btn view-btn" onclick="taskManager.viewTask('${
                      task._id
                    }')">View</button>
                    <button class="action-btn delete-btn" onclick="taskManager.deleteTask('${
                      task._id
                    }')">Delete</button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  }

  async deleteTask(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`${this.baseUrl}/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        UI.showMessage("Task deleted successfully", "success");
        this.loadTasks();
      } else {
        const data = await response.json();
        UI.showMessage(data.message, "error");
      }
    } catch (error) {
      UI.showMessage("Error deleting task", "error");
      console.error("Error:", error);
    }
  }

  async viewTask(taskId) {
    try {
      const response = await fetch(`${this.baseUrl}/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const task = await response.json();
        UI.showMessage(
          `Task Details:\nTitle: ${task.title}\nDescription: ${
            task.description
          }\nPriority: ${task.priority}\nDeadline: ${UI.formatDate(
            task.deadline
          )}`,
          "info"
        );
      }
    } catch (error) {
      UI.showMessage("Error viewing task details", "error");
      console.error("Error:", error);
    }
  }

  handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    this.applyFilters(searchTerm);
  }

  applyFilters(searchTerm = "") {
    const priorityFilter = document.getElementById("priorityFilter").value;
    const dateFilter = document.getElementById("dateFilter").value;

    let filteredTasks = [...this.tasks];

    if (searchTerm) {
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm) ||
          task.description.toLowerCase().includes(searchTerm)
      );
    }

    if (priorityFilter) {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === priorityFilter.toLowerCase()
      );
    }

    if (dateFilter) {
      const today = new Date();

      switch (dateFilter) {
        case "today":
          filteredTasks = filteredTasks.filter(
            (task) =>
              new Date(task.deadline).toDateString() === today.toDateString()
          );
          break;
        case "week":
          const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          filteredTasks = filteredTasks.filter((task) => {
            const taskDate = new Date(task.deadline);
            return taskDate >= today && taskDate <= weekAhead;
          });
          break;
        case "month":
          const monthAhead = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            today.getDate()
          );
          filteredTasks = filteredTasks.filter((task) => {
            const taskDate = new Date(task.deadline);
            return taskDate >= today && taskDate <= monthAhead;
          });
          break;
      }
    }

    this.renderFilteredTasks(filteredTasks);
  }

  renderFilteredTasks(filteredTasks) {
    const tbody = document.getElementById("tasksList");
    tbody.innerHTML = "";

    if (filteredTasks.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="text-center">No tasks found</td></tr>';
      return;
    }

    filteredTasks.forEach((task) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>#${task._id.slice(-4)}</td>
                <td>${task.title}</td>
                <td>${task.description}</td>
                <td>${UI.formatDate(task.deadline)}</td>
                <td><span class="priority-${task.priority}">${
        task.priority
      }</span></td>
                <td><span class="status-${task.status}">${
        task.status
      }</span></td>
                <td>
                    <button class="action-btn view-btn" onclick="taskManager.viewTask('${
                      task._id
                    }')">View</button>
                    <button class="action-btn delete-btn" onclick="taskManager.deleteTask('${
                      task._id
                    }')">Delete</button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  }

  updatePagination(totalPages) {
    const pageNumbers = document.getElementById("pageNumbers");
    pageNumbers.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      button.classList.toggle("active", i === this.currentPage);
      button.addEventListener("click", () => {
        this.currentPage = i;
        this.loadTasks();
      });
      pageNumbers.appendChild(button);
    }

    document.getElementById("prevPage").disabled = this.currentPage === 1;
    document.getElementById("nextPage").disabled =
      this.currentPage === totalPages;
  }

  changePage(delta) {
    this.currentPage += delta;
    this.loadTasks();
  }
}

// Initialize Task Manager
const taskManager = new TaskManager();
window.taskManager = taskManager;

// class TaskManager {
//     constructor() {
//         this.baseUrl = '/api/tasks';
//         this.tasks = [];
//         this.currentPage = 1;
//         this.tasksPerPage = 10;
//         this.setupEventListeners();
//         this.loadTasks();
//     }

//     setupEventListeners() {
//         const taskForm = document.getElementById('taskForm');
//         const searchInput = document.getElementById('searchTasks');
//         const priorityFilter = document.getElementById('priorityFilter');
//         const dateFilter = document.getElementById('dateFilter');

//         taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
//         searchInput.addEventListener('input', (e) => this.handleSearch(e));
//         priorityFilter.addEventListener('change', () => this.applyFilters());
//         dateFilter.addEventListener('change', () => this.applyFilters());

//         document.getElementById('prevPage').addEventListener('click', () => this.changePage(-1));
//         document.getElementById('nextPage').addEventListener('click', () => this.changePage(1));
//     }

//     async handleAddTask(e) {
//         e.preventDefault();
//         const taskData = {
//             title: document.getElementById('taskTitle').value,
//             description: document.getElementById('taskDescription').value,
//             priority: document.getElementById('taskPriority').value.toLowerCase(),
//             deadline: document.getElementById('taskDeadline').value
//         };

//         try {
//             const response = await fetch(this.baseUrl, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 },
//                 body: JSON.stringify(taskData)
//             });

//             if (response.ok) {
//                 UI.clearForm('taskForm');
//                 UI.showMessage('Task added successfully', 'success');
//                 this.loadTasks();
//             } else {
//                 const data = await response.json();
//                 UI.showMessage(data.message, 'error');
//             }
//         } catch (error) {
//             UI.showMessage('An error occurred while adding the task', 'error');
//             console.error('Error:', error);
//         }
//     }

//     async loadTasks() {
//         try {
//             const response = await fetch(`${this.baseUrl}?page=${this.currentPage}`, {
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 }
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 this.tasks = data.tasks;
//                 this.renderTasks();
//                 this.updatePagination(data.totalPages);
//             }
//         } catch (error) {
//             UI.showMessage('Error loading tasks', 'error');
//             console.error('Error:', error);
//         }
//     }

//     renderTasks() {
//         const tbody = document.getElementById('tasksList');
//         tbody.innerHTML = '';

//         if (this.tasks.length === 0) {
//             tbody.innerHTML = '<tr><td colspan="7" class="text-center">No tasks found</td></tr>';
//             return;
//         }

//         this.tasks.forEach(task => {
//             const tr = document.createElement('tr');
//             tr.innerHTML = `
//                 <td>#${task._id.slice(-4)}</td>
//                 <td>${task.title}</td>
//                 <td>${task.description}</td>
//                 <td>${UI.formatDate(task.deadline)}</td>
//                 <td><span class="priority-${task.priority}">${task.priority}</span></td>
//                 <td><span class="status-${task.status}">${task.status}</span></td>
//                 <td>
//                     <button class="action-btn view-btn" onclick="taskManager.viewTask('${task._id}')">View</button>
//                     <button class="action-btn delete-btn" onclick="taskManager.deleteTask('${task._id}')">Delete</button>
//                 </td>
//             `;
//             tbody.appendChild(tr);
//         });
//     }

//     async deleteTask(taskId) {
//         if (!confirm('Are you sure you want to delete this task?')) return;

//         try {
//             const response = await fetch(`${this.baseUrl}/${taskId}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 }
//             });

//             if (response.ok) {
//                 UI.showMessage('Task deleted successfully', 'success');
//                 this.loadTasks();
//             } else {
//                 const data = await response.json();
//                 UI.showMessage(data.message, 'error');
//             }
//         } catch (error) {
//             UI.showMessage('Error deleting task', 'error');
//             console.error('Error:', error);
//         }
//     }

//     async viewTask(taskId) {
//         try {
//             const response = await fetch(`${this.baseUrl}/${taskId}`, {
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 }
//             });

//             if (response.ok) {
//                 const task = await response.json();
//                 UI.showMessage(`Task Details:\nTitle: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nDeadline: ${UI.formatDate(task.deadline)}`, 'info');
//             }
//         } catch (error) {
//             UI.showMessage('Error viewing task details', 'error');
//             console.error('Error:', error);
//         }
//     }

//     handleSearch(e) {
//         const searchTerm = e.target.value.toLowerCase();
//         this.applyFilters(searchTerm);
//     }

//     applyFilters(searchTerm = '') {
//         const priorityFilter = document.getElementById('priorityFilter').value;
//         const dateFilter = document.getElementById('dateFilter').value;

//         let filteredTasks = [...this.tasks];

//         if (searchTerm) {
//             filteredTasks = filteredTasks.filter(task =>
//                 task.title.toLowerCase().includes(searchTerm) ||
//                 task.description.toLowerCase().includes(searchTerm)
//             );
//         }

//         if (priorityFilter) {
//             filteredTasks = filteredTasks.filter(task =>
//                 task.priority === priorityFilter.toLowerCase()
//             );
//         }

//         if (dateFilter) {
//             const today = new Date();

//             switch(dateFilter) {
//                 case 'today':
//                     filteredTasks = filteredTasks.filter(task =>
//                         new Date(task.deadline).toDateString() === today.toDateString()
//                     );
//                     break;
//                 case 'week':
//                     const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
//                     filteredTasks = filteredTasks.filter(task => {
//                         const taskDate = new Date(task.deadline);
//                         return taskDate >= today && taskDate <= weekAhead;
//                     });
//                     break;
//                 case 'month':
//                     const monthAhead = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
//                     filteredTasks = filteredTasks.filter(task => {
//                         const taskDate = new Date(task.deadline);
//                         return taskDate >= today && taskDate <= monthAhead;
//                     });
//                     break;
//             }
//         }

//         this.renderFilteredTasks(filteredTasks);
//     }

//     renderFilteredTasks(filteredTasks) {
//         const tbody = document.getElementById('tasksList');
//         tbody.innerHTML = '';

//         if (filteredTasks.length === 0) {
//             tbody.innerHTML = '<tr><td colspan="7" class="text-center">No tasks found</td></tr>';
//             return;
//         }

//         filteredTasks.forEach(task => {
//             const tr = document.createElement('tr');
//             tr.innerHTML = `
//                 <td>#${task._id.slice(-4)}</td>
//                 <td>${task.title}</td>
//                 <td>${task.description}</td>
//                 <td>${UI.formatDate(task.deadline)}</td>
//                 <td><span class="priority-${task.priority}">${task.priority}</span></td>
//                 <td><span class="status-${task.status}">${task.status}</span></td>
//                 <td>
//                     <button class="action-btn view-btn" onclick="taskManager.viewTask('${task._id}')">View</button>
//                     <button class="action-btn delete-btn" onclick="taskManager.deleteTask('${task._id}')">Delete</button>
//                 </td>
//             `;
//             tbody.appendChild(tr);
//         });
//     }

//     updatePagination(totalPages) {
//         const pageNumbers = document.getElementById('pageNumbers');
//         pageNumbers.innerHTML = '';

//         for (let i = 1; i <= totalPages; i++) {
//             const button = document.createElement('button');
//             button.textContent = i;
//             button.classList.toggle('active', i === this.currentPage);
//             button.addEventListener('click', () => {
//                 this.currentPage = i;
//                 this.loadTasks();
//             });
//             pageNumbers.appendChild(button);
//         }

//         document.getElementById('prevPage').disabled = this.currentPage === 1;
//         document.getElementById('nextPage').disabled = this.currentPage === totalPages;
//     }

//     changePage(delta) {
//         this.currentPage += delta;
//         this.loadTasks();
//     }
// }

// // Initialize Task Manager
// const taskManager = new TaskManager();
// window.taskManager = taskManager;
