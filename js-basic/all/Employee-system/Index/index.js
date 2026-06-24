

        
// Function to log out employee
function logOutEmployee() {
    const timeOut = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Format as HH:mm
    const email = getUserEmail(); // Ensure this function retrieves the logged-in user's email

    fetch('http://localhost:3000/log-time-out', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, timeOut }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message); // Check for success message
        window.location.href = "../Login-forgot/login.html"; // Redirect after logging out
    })
    .catch(error => {
        console.error('Error logging out:', error);
    });
}

// Fetch and display attendance records again if necessary
async function fetchAttendanceRecords() {
    try {
        const response = await fetch('http://localhost:3000/attendance-records');
        if (!response.ok) {
            throw new Error('Error fetching attendance records');
        }
        const records = await response.json();
        populateAttendanceTable(records); // Pass records to populate function
        updateDoughnutChart(records); // Pass records to update chart function
    } catch (error) {
        console.error('Error fetching attendance records:', error);
    }
}

// Add at the top with your other functions
function updateActiveCount() {
    fetch('http://localhost:3000/active-users')
        .then(response => response.json())
        .then(data => {
            document.querySelector('.NumberActive').textContent = `Active: ${data.count}`;
        });
}

// Call it in your loadEmployees function
async function loadEmployees() {
    updateActiveCount(); // Add this line at the start
    // ... rest of your existing loadEmployees code
}


function logTimeOut() {
    const userEmail = sessionStorage.getItem('userEmail');
    const timeOut = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' });

    fetch('http://localhost:3000/log-time-out', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            email: userEmail, 
            timeOut: timeOut 
        })
    })
    .then(response => response.json())
    .then(() => {
        sessionStorage.clear();
        window.location.href = '../Login-forgot/login.html';
    });
}


