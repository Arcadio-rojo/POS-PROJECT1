const modal = document.getElementById('addUserModal');
const addUserBtn = document.getElementById('addUserBtn');
const closeBtn = document.querySelector('.close');
const addUserForm = document.getElementById('addUserForm');

const formData = {
    email: document.getElementById('email').value,
    lastName: document.getElementById('lastName').value,
    firstName: document.getElementById('firstName').value,
    middleName: document.getElementById('middleName').value,
    birthDate: document.getElementById('birthDate').value,
    password: generatePassword()
};
// Show modal
addUserBtn.onclick = () => modal.style.display = "block";

// Close modal
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => {
    if (e.target == modal) modal.style.display = "none";
}

// Generate random password
function generatePassword() {
    return Math.random().toString(36).slice(-6);
}

// Add user form submission
addUserForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        lastName: document.getElementById('lastName').value,
        firstName: document.getElementById('firstName').value,
        middleName: document.getElementById('middleName').value,
        birthDate: document.getElementById('birthDate').value,
        password: generatePassword(),
        role: 'employee'
    };

    try {
        const response = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Employee added successfully!');
            modal.style.display = "none";
            loadEmployees();
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// Add this function to validate Gmail addresses
function isValidGmail(email) {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
}

// Update the form submission handler
addUserForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    
    if (!isValidGmail(email)) {
        alert('Please enter a valid Gmail address');
        return;
    }
    
    const formData = {
        email: email,
        lastName: document.getElementById('lastName').value,
        firstName: document.getElementById('firstName').value,
        middleName: document.getElementById('middleName').value,
        birthDate: document.getElementById('birthDate').value,
        password: generatePassword()
    };

    try {
        const response = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Employee added successfully!');
            modal.style.display = "none";
            loadEmployees();
            addUserForm.reset();
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
// Add this function to update active count and simple list

// Function to update user's active status on login
async function updateActiveStatus(email, isActive) {
    try {
        const response = await fetch('http://localhost:3000/api/attendance/active-status', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                is_active: isActive
            })
        });

        if (response.ok) {
            updateActiveCount();
            loadEmployees();
        }
    } catch (error) {
        console.error('Error updating active status:', error);
    }
}

// Modified updateEmployeeDisplay function
function updateEmployeeDisplay(employees) {
    const activeEmployees = employees.filter(emp => emp.is_active === 1);
    document.getElementById('activeCount').textContent = activeEmployees.length;

    const simpleList = document.getElementById('simpleEmployeeList');
    simpleList.innerHTML = employees.map(emp => `
        <div class="simple-employee-row">
            <span class="employee-name">${emp.last_name}, ${emp.first_name} ${emp.middle_name || ''}</span>
            <span class="employee-status ${emp.is_active === 1 ? 'online' : 'offline'}">
                ${emp.is_active === 1 ? 'Online' : 'Offline'}
            </span>
        </div>
    `).join('');
}
// Add search functionality
document.getElementById('searchInput').addEventListener('keyup', function() {
    const searchTerm = this.value.toLowerCase();
    const rows = document.getElementById('employeeList').getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Calculate time difference function
function calculateTimeTaken(timeIn, timeOut) {
    if (!timeIn || !timeOut) return 'N/A';
    
    const [inTime, inPeriod] = timeIn.split(' ');
    const [outTime, outPeriod] = timeOut.split(' ');
    
    const inDate = new Date(`2000/01/01 ${inTime} ${inPeriod}`);
    const outDate = new Date(`2000/01/01 ${outTime} ${outPeriod}`);
    
    const diffInHours = (outDate - inDate) / (1000 * 60 * 60);
    return `${Math.round(diffInHours * 100) / 100} hours`;
}

// Update loadEmployees function
async function loadEmployees() {
    try {
        // Fetch users data
        const usersResponse = await fetch('http://localhost:3000/api/users');
        const users = await usersResponse.json();

        // Update active count and simple list
        updateEmployeeDisplay(users);

        // Fetch attendance records
        const attendanceResponse = await fetch('http://localhost:3000/attendance-records');
        const attendance = await attendanceResponse.json();

        // Update attendance table
        const employeeList = document.getElementById('employeeList');
        employeeList.innerHTML = attendance.map(record => {
            const user = users.find(u => u.email === record.employee_email);
            const timeTaken = calculateTimeTaken(record.time_in, record.time_out);
             // Determine status based on time_in
             let status = 'Unknown';
             if (record.time_in) {
                 const timeIn = new Date(`${record.date} ${record.time_in}`);
                 const cutoffTime = new Date(`${record.date} 8:00:00 AM`);
                 status = timeIn <= cutoffTime ? 'Present' : 'Late';
             }
            return `
                <tr>
                    <td>${user ? `${user.last_name}, ${user.first_name} ${user.middle_name || ''}` : 'N/A'}</td>
                    <td>${record.employee_email}</td>
                    <td>${record.date}</td>
                    <td>${record.time_in || 'N/A'}</td>
                    <td>${record.time_out || 'N/A'}</td>
                    <td class="status-${status.toLowerCase()}">${status}</td>
                    <td>${timeTaken}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}


// Update the active count display
async function updateActiveCount() {
    try {
        const response = await fetch('http://localhost:3000/attendance-records');
        const records = await response.json();
        const activeCount = records.filter(record => record.is_active === 1).length;
        document.getElementById('activeCount').textContent = activeCount;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Call this function when loading employees
document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
    updateActiveCount();
    // Update count every 30 seconds
    setInterval(updateActiveCount, 30000);
});


// Toggle user status
async function toggleStatus(userId, currentStatus) {
    try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_active: !currentStatus })
        });

        if (response.ok) {
            loadEmployees();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', loadEmployees);

