document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(function(res) {
        return res.json();
    })
    .then(function(result) {
        alert("Succesfully Registered");
        e.target.reset(); 
    })
    .catch(function(err) {
        console.error(err);
        alert('Error registering user');
    });
});

const password = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const toggleConfirm = document.getElementById('toggleConfirmPassword');

togglePassword.addEventListener('click', function() {
    const type = password.type === 'password' ? 'text' : 'password';
    password.type = type;
    confirmPassword.type = type;

    
    this.classList.toggle('bi-eye');
    this.classList.toggle('bi-eye-slash');
});

