document.addEventListener('DOMContentLoaded', function () {

  const loginForm = document.getElementById('loginForm');
  const loginStatus = document.getElementById('loginStatus');

 
  const navbarStatus = document.getElementById('navbarStatus');
  const navbarUserStatus = document.getElementById('navbarUserStatus');
  const navbarLoginBtn = document.getElementById('navbarLoginBtn');

  
  function setLoggedInUI(email) {

    if (loginForm) loginForm.style.display = 'none';
    if (loginStatus) loginStatus.textContent = 'Logged in as ' + email;

 
    if (navbarUserStatus) navbarUserStatus.style.display = 'block';
    if (navbarStatus) navbarStatus.textContent = 'Logged in as ' + email;
    if (navbarLoginBtn) {
      navbarLoginBtn.textContent = 'Logout';
      navbarLoginBtn.href = '#';
    }
  }

  
  function setLoggedOutUI() {
    // Page
    if (loginForm) loginForm.style.display = 'block';
    // if (loginStatus) loginStatus.textContent = '❌ Not logged in';

    // Navbar
    if (navbarUserStatus) navbarUserStatus.style.display = 'none';
    if (navbarStatus) navbarStatus.textContent = '';
    if (navbarLoginBtn) {
      navbarLoginBtn.textContent = 'Login';
      navbarLoginBtn.href = 'login.html';
    }
  }


  function checkLogin() {
    fetch('/api/check-login')
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) {
          setLoggedInUI(data.email);
        } else {
          setLoggedOutUI();
        }
      })
      .catch(err => {
        console.error('Check-login error:', err);
        setLoggedOutUI();
      });
  }

  checkLogin();

 
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!email || !password) {
        if (loginStatus) loginStatus.textContent = '⚠️ Please enter email and password';
        return;
      }

      if (loginStatus) loginStatus.textContent = '🔄 Logging in...';

      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(result => {
        if (result.status === 200 && result.data.ok) {
          setLoggedInUI(result.data.email);
          window.location.href = 'jobs.html';
        } else {
          if (loginStatus) loginStatus.textContent = '⚠️ Please enter email and password';
        }
      })
      .catch(err => {
        console.error('Login error:', err);
        if (loginStatus) loginStatus.textContent = '⚠️ Login request failed';
      });
    });
  }

 
  if (navbarLoginBtn) {
    navbarLoginBtn.addEventListener('click', function (e) {
      if (navbarLoginBtn.textContent === 'Logout') {
        e.preventDefault();
        fetch('/api/logout', { method: 'POST' })
          .then(res => res.json())
          .then(data => {
            setLoggedOutUI();
          })
          .catch(err => console.error('Logout error:', err));
      } else {
        // Optional: scroll to login form
        if (loginForm) loginForm.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});
