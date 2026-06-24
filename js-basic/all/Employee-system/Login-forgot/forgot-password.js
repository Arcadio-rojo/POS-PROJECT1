// Send OTP when the user clicks the Send OTP button
document.querySelector('#sendOtpBtn').addEventListener('click', function () {
    const email = document.querySelector('#email').value;

    // Send OTP request to the server
    fetch('http://localhost:3000/send-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), // Send the email entered by the user
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'OTP sent successfully') {
                alert('OTP has been sent to your email!');
            } else {
                alert('Failed to send OTP. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error sending OTP:', error);
        });
});

// Handle the submit form for OTP verification
document.querySelector('#forgotPasswordForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.querySelector('#email').value;
    const otp = document.querySelector('#otp').value;

    // Verify OTP
    fetch('http://localhost:3000/verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputOtp: otp }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'OTP verified') {
                alert('OTP verified! You can now reset your password.');

                // Show Reset Password Modal
                document.querySelector('#resetPasswordModal').style.display = 'flex';
            } else {
                alert('Invalid OTP. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error verifying OTP:', error);
        });
});

// Handle the password reset form submission
document.querySelector('#resetPasswordForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.querySelector('#email').value;
    const newPassword = document.querySelector('#newPassword').value;
    const confirmPassword = document.querySelector('#confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Send password reset request to the server
    fetch('http://localhost:3000/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Password updated successfully') {
                alert('Password reset successfully!');
                document.querySelector('#resetPasswordModal').style.display = 'none';
            } else {
                alert('Failed to reset password. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error resetting password:', error);
        });
});
