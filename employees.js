// Store all employees
let employees = [];

// DOM Elements
const employeeForm = document.getElementById('employeeForm');
const employeeTableBody = document.getElementById('employeeTableBody');
const employeeNameInput = document.getElementById('employeeName');
const employeeTokenInput = document.getElementById('employeeToken');
const employeeHourlyRateInput = document.getElementById('employeeHourlyRate');

// Load saved employees from localStorage
const savedEmployees = localStorage.getItem('employees');
if (savedEmployees) {
    employees = JSON.parse(savedEmployees);
    updateEmployeeTable();
}

// Event Listeners
employeeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = employeeNameInput.value.trim();
    const token = employeeTokenInput.value.trim();
    const hourlyRate = parseFloat(employeeHourlyRateInput.value) || 0;
    
    // Validate token uniqueness
    if (employees.some(emp => emp.token === token)) {
        alert('Token number already exists. Please use a unique token.');
        return;
    }
    
    employees.push({
        name,
        token,
        hourlyRate
    });
    
    localStorage.setItem('employees', JSON.stringify(employees));
    updateEmployeeTable();
    employeeForm.reset();
});

function updateEmployeeTable() {
    employeeTableBody.innerHTML = '';
    employees.forEach((employee, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.token}</td>
            <td>₹${employee.hourlyRate.toFixed(2)}</td>
            <td>
                <button class="edit-btn" onclick="editEmployee(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteEmployee(${index})">Delete</button>
            </td>
        `;
        employeeTableBody.appendChild(row);
    });
}

function editEmployee(index) {
    const employee = employees[index];
    employeeNameInput.value = employee.name;
    employeeTokenInput.value = employee.token;
    employeeHourlyRateInput.value = employee.hourlyRate;
    // Remove the old entry
    employees.splice(index, 1);
    localStorage.setItem('employees', JSON.stringify(employees));
    updateEmployeeTable();
}

function deleteEmployee(index) {
    if (confirm('Are you sure you want to delete this employee?')) {
        employees.splice(index, 1);
        localStorage.setItem('employees', JSON.stringify(employees));
        updateEmployeeTable();
    }
} 