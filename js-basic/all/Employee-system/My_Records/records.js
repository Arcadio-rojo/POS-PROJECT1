// records.js

// Fetch and display attendance records when the page loads
document.addEventListener("DOMContentLoaded", fetchAttendanceRecords);

function populateAttendanceTable(records) {
    const tbody = document.getElementById('attendanceBody');
    tbody.innerHTML = '';

    records.forEach(record => {
        // Determine status based on time_in
        let status = 'Unknown';
        if (record.time_in) {
            const timeIn = new Date(`${record.date} ${record.time_in}`);
            const cutoffTime = new Date(`${record.date} 8:00:00 AM`);
            status = timeIn <= cutoffTime ? 'Present' : 'Late';
        }

        const row = document.createElement('tr');
        row.classList.add(status.toLowerCase());
        row.innerHTML = `
            <td>${formatDate(record.date)}</td>
            <td>${record.time_in || 'N/A'}</td>
            <td>${record.time_out || 'N/A'}</td>
            <td>${status}</td>
        `;
        tbody.appendChild(row);
    });
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}



    // Fill empty rows if needed
    
    async function fetchAttendanceRecords() {
        const userEmail = sessionStorage.getItem('userEmail');
        if (!userEmail) {
            console.error('No user email found');
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:3000/attendance-records/${userEmail}`);
            if (!response.ok) {
                throw new Error('Error fetching attendance records');
            }
            const records = await response.json();
            populateAttendanceTable(records);
            updateDoughnutChart(records);
        } catch (error) {
            console.error('Error fetching attendance records:', error);
        }
    }
    

// Log time-in for employee
async function logTimeIn(email) {
    const timeIn = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' }); // Format time as "HH:mm AM/PM"
    try {
        const response = await fetch('http://localhost:3000/log-time-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, timeIn }), // Ensure this matches the server expectation
        });
        const result = await response.json();
        alert(result.message); // Show confirmation
        fetchAttendanceRecords(); // Refresh the attendance records
    } catch (error) {
        console.error('Error logging time-in:', error);
    }
}


// Log time-out for employee
function logTimeOut() {
    const userEmail = sessionStorage.getItem('userEmail');
    const timeOut = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true, 
        timeZone: 'Asia/Manila' 
    });

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
        fetchAttendanceRecords(); // Refresh the table before logout
        setTimeout(() => {
            sessionStorage.clear();
            window.location.href = '../Login-forgot/login.html';
        }, 500);
    });
}

// Function to get attendance data for the chart
function getAttendanceData(records) {
    const attendanceCounts = {
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
    };

    records.forEach(record => {
        // Determine status based on time_in
        if (record.time_in) {
            const timeIn = new Date(`${record.date} ${record.time_in}`);
            const cutoffTime = new Date(`${record.date} 8:00:00 AM`);
            if (timeIn <= cutoffTime) {
                attendanceCounts.presentCount++;
            } else {
                attendanceCounts.lateCount++;
            }
        } else {
            attendanceCounts.absentCount++;
        }
    });

    return attendanceCounts;
}
// Function to create/update the chart and performance display
function updateDoughnutChart(records) {
    const { presentCount, absentCount, lateCount } = getAttendanceData(records); // Pass records to getAttendanceData

    // Update performance display
    const total = presentCount + absentCount + lateCount;
    document.getElementById('presentCount').innerText = `PRESENT: ${presentCount} (${total > 0 ? ((presentCount / total) * 100).toFixed(2) : 0}%)`;
    document.getElementById('lateCount').innerText = `LATE: ${lateCount} (${total > 0 ? ((lateCount / total) * 100).toFixed(2) : 0}%)`;
    document.getElementById('absentCount').innerText = `ABSENT: ${absentCount} (${total > 0 ? ((absentCount / total) * 100).toFixed(2) : 0}%)`;

    // Chart.js instance
    const ctx2 = document.getElementById('doughnut').getContext('2d');
    const doughnut = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent', 'Late'], // Labels for attendance status
            datasets: [{
                label: 'Attendance',
                data: [presentCount, absentCount, lateCount], // Use the data from the table
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)', // Color for "Present"
                    'rgba(255, 99, 132, 0.2)', // Color for "Absent"
                    'rgba(255, 206, 86, 0.2)', // Color for "Late"
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)', // Border for "Present"
                    'rgba(255, 99, 132, 1)', // Border for "Absent"
                    'rgba(255, 206, 86, 1)', // Border for "Late"
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}


        
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



