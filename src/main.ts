import './style.css';

// Getting references to HTML elements
const taskList = document.getElementById('task-list') as HTMLUListElement;
const newTaskForm = document.getElementById('new-task-form') as HTMLFormElement;
const newTaskInput = document.getElementById(
     'new-task-input'
) as HTMLInputElement;
const themeToggle = document.getElementById(
     'theme-toggle'
) as HTMLButtonElement;
const themeIcon = document.getElementById('theme-icon') as HTMLElement;
let isDarkTheme = false;

// Task interface definition
interface Task {
     id: number;
     content: string;
     completed: boolean;
}

// Load tasks from Local Storage or initialize with an empty array
let tasks: Task[] = loadTasksFromLocalStorage();

// Function to save tasks to Local Storage
function saveTasksToLocalStorage() {
     localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from Local Storage
function loadTasksFromLocalStorage(): Task[] {
     const tasksJSON = localStorage.getItem('tasks');
     return tasksJSON ? JSON.parse(tasksJSON) : [];
}

// Function to toggle between light and dark themes
function toggleTheme() {
     document.body.classList.toggle('dark-theme');
     isDarkTheme = !isDarkTheme;

     if (isDarkTheme) {
          themeIcon.textContent = 'nightlight_round';
          document.documentElement.style.setProperty(
               '--toggle-bg-color',
               '#ffc107'
          );
          document.documentElement.style.setProperty(
               '--toggle-bg-hover-color',
               '#e0a800'
          );
          themeToggle.innerHTML = `<span class="material-icons" id="theme-icon">nightlight_round</span> Light Theme`;
     } else {
          themeIcon.textContent = 'wb_sunny';
          document.documentElement.style.setProperty(
               '--toggle-bg-color',
               '#28a745'
          );
          document.documentElement.style.setProperty(
               '--toggle-bg-hover-color',
               '#218838'
          );
          themeToggle.innerHTML = `<span class="material-icons" id="theme-icon">wb_sunny</span> Dark Theme`;
     }
}

// Function to add a new task
function addTask(content: string) {
     const task: Task = {
          id: Date.now(), // Unique ID based on timestamp
          content,
          completed: false,
     };
     tasks.push(task);
     saveTasksToLocalStorage(); // Save the updated tasks to Local Storage
     renderTasks();
}

// Function to delete a task by ID
function deleteTask(id: number) {
     tasks = tasks.filter((task) => task.id !== id);
     saveTasksToLocalStorage(); // Save the updated tasks to Local Storage
     renderTasks();
}

// Function to edit a task's content by ID
function editTask(id: number) {
     const task = tasks.find((task) => task.id === id);
     if (task) {
          const newContent = prompt('Edit your task:', task.content);
          if (newContent !== null && newContent.trim() !== '') {
               task.content = newContent.trim();
               saveTasksToLocalStorage(); // Save the updated tasks to Local Storage
               renderTasks();
          }
     }
}

// Function to toggle the completion status of a task by ID
function toggleTaskCompletion(id: number) {
     const task = tasks.find((task) => task.id === id);
     if (task) {
          task.completed = !task.completed;
          saveTasksToLocalStorage(); // Save the updated tasks to Local Storage
          renderTasks();
     }
}

// Function to render the list of tasks
function renderTasks() {
     taskList.innerHTML = `
        <li>
            <span><b>Status</b></span>
            <span><b>Title</b></span>
            <span><b>Options</b></span>
        </li>
    `;

     tasks.forEach((task) => {
          const taskItem = document.createElement('li');
          taskItem.className = task.completed ? 'completed' : '';
          taskItem.draggable = true;
          taskItem.dataset.id = task.id.toString();

          // Add dragstart and dragend events
          taskItem.addEventListener('dragstart', (e) => {
               (e.target as HTMLElement).classList.add('dragging');
          });

          taskItem.addEventListener('dragend', (e) => {
               (e.target as HTMLElement).classList.remove('dragging');
          });

          const taskContentWrapper = document.createElement('div');
          taskContentWrapper.className = 'task-content';

          const completeButton = document.createElement('button');
          completeButton.className = `complete-btn ${
               task.completed ? 'completed' : 'incomplete'
          }`;
          completeButton.textContent = task.completed
               ? 'Incomplete'
               : 'Complete';
          completeButton.onclick = (e) => {
               e.stopPropagation();
               toggleTaskCompletion(task.id);
          };

          const taskContent = document.createElement('span');
          taskContent.textContent = task.content;

          taskContentWrapper.appendChild(completeButton);
          taskContentWrapper.appendChild(taskContent);

          const taskOptionsWrapper = document.createElement('div');
          taskOptionsWrapper.className = 'task-options';

          const editButton = document.createElement('button');
          editButton.className = 'edit-btn';
          editButton.textContent = 'Edit';
          editButton.onclick = (e) => {
               e.stopPropagation();
               editTask(task.id);
          };

          const deleteButton = document.createElement('button');
          deleteButton.className = 'delete-btn';
          deleteButton.textContent = 'Delete';
          deleteButton.onclick = (e) => {
               e.stopPropagation();
               deleteTask(task.id);
          };

          taskOptionsWrapper.appendChild(editButton);
          taskOptionsWrapper.appendChild(deleteButton);

          taskItem.appendChild(taskContentWrapper);
          taskItem.appendChild(taskOptionsWrapper);

          taskList.appendChild(taskItem);
     });
}

// Function to handle drag and drop reordering
taskList.addEventListener('dragover', (e) => {
     e.preventDefault();
     const draggingItem = document.querySelector('.dragging') as HTMLElement;
     const afterElement = getDragAfterElement(taskList, e.clientY);
     if (afterElement == null) {
          taskList.appendChild(draggingItem);
     } else {
          taskList.insertBefore(draggingItem, afterElement);
     }
});

taskList.addEventListener('drop', (e) => {
     e.preventDefault();
     const draggingItem = document.querySelector('.dragging') as HTMLElement;
     const afterElement = getDragAfterElement(taskList, e.clientY);
     if (afterElement == null) {
          taskList.appendChild(draggingItem);
     } else {
          taskList.insertBefore(draggingItem, afterElement);
     }

     updateTaskOrder();
     saveTasksToLocalStorage(); // Save the updated tasks to Local Storage
});

// Function to get the element after which the dragged item should be placed

//--------------------------------------------------------------------------------------------

interface ClosestElement {
     element: HTMLElement | null;
     offset: number;
   }
   
   function getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
     const draggableElements = [
       ...container.querySelectorAll('li:not(.dragging)'),
     ];
   
     const closest: ClosestElement = draggableElements.reduce(
       (closest, child) => {
         const box = child.getBoundingClientRect();
         const offset = y - box.top; // calculate offset from top edge
         if (!closest || Math.abs(offset) < Math.abs(closest.offset)) {
           return { element: child as HTMLElement, offset }; // create a new object with element and offset properties
         } else {
           return closest;
         }
       },
       { element: null, offset: Infinity } as ClosestElement // initialize accumulator with a valid object
     );
   
     return closest.element; // return the element property of the accumulator object
   }
 

/*
function getDragAfterElement(container: HTMLElement, y: number) {
     const draggableElements = [
          ...container.querySelectorAll('li:not(.dragging)'),
     ];

     return draggableElements.reduce(
          (closest: HTMLElement | null, child: HTMLElement) => {
               const box = child.getBoundingClientRect();
               const offset = y - box.top - box.height / 2;
               if (offset < 0 && offset > closest!.offsetTop) { //  closest.offset -------------------------------
                    return child;
               } else {
                    return closest;
               }
          },
          { offset: Number.NEGATIVE_INFINITY } as
               | HTMLElement
               | { offset: number }
     );
}

*/

// Function to update task order after reordering
function updateTaskOrder() {
     const taskElements = [
          ...taskList.querySelectorAll('li:not(:first-child)'),
     ];
     tasks = taskElements.map((taskElement) => {
          const id = Number(taskElement.id); //  const id = Number(taskElement.dataset.id) -------------------------
          const task = tasks.find((task) => task.id === id)!;
          return task;
     });
     saveTasksToLocalStorage(); // Save the updated tasks to Local Storage
}

// Event listener for form submission to add a new task
newTaskForm.addEventListener('submit', (e) => {
     e.preventDefault();
     const content = newTaskInput.value.trim();
     if (content) {
          addTask(content);
          newTaskInput.value = '';
     }
});

// Event listener for toggling the theme
themeToggle.addEventListener('click', toggleTheme);

// Initial render of tasks
renderTasks();

