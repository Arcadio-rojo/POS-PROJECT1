const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');
const eyeIcon = togglePassword.querySelector('i');

// Toggle password visibility
togglePassword.addEventListener('click', function () {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    eyeIcon.classList.toggle('bx-show');
    eyeIcon.classList.toggle('bx-hide');
});

// Function to log time-in for an employee
function logTimeIn(email) {
    const timeIn = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' });
    const date = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    fetch('http://localhost:3000/log-time-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, timeIn, date }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message); // Show confirmation message
            } else {
                throw new Error('Failed to log time-in');
            }
        })
        .catch(error => {
            console.error('Error logging time-in:', error);
            
        });
}
document.querySelector('#loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const emailInput = document.querySelector('#email').value;
    const passwordInput = document.querySelector('#password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: emailInput, 
                password: passwordInput 
            })
        });

        const data = await response.json();

        if (data.success) {
            sessionStorage.setItem('userEmail', data.email);
            sessionStorage.setItem('userRole', data.role);

            // Redirect based on role
            window.location.href = data.role === 'admin' 
                ? '/Admin-system/Dashboard/dashboard.html'
                : '/all/Employee-system/Home/Home.html';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('System error. Please try again.');
    }
});

async function updateUserStatus(email, isActive) {
    await fetch('http://localhost:3000/api/user-status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            email: email, 
            isActive: isActive 
        })
    });
}

function logTimeIn(email) {
    const timeIn = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' });
    const date = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    return fetch('http://localhost:3000/log-time-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, timeIn, date }),
    });
}
// Handle cancel button
document.querySelector('#cancelBtn').addEventListener('click', function (event) {
    event.preventDefault();
    document.querySelector('#loginForm').reset();
});



