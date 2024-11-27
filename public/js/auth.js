class Auth {
    constructor() {
        this.baseUrl = '/api';
        this.setupEventListeners();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const authTabs = document.querySelectorAll('.tab');
        const logoutBtn = document.getElementById('logoutBtn');

        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        logoutBtn.addEventListener('click', () => this.handleLogout());

        // Check authentication status on page load
        this.checkAuth();
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.user.fullName);
                this.showDashboard();
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('An error occurred during login');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fullName, email, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Account created successfully! Please login.');
                this.switchTab('login');
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('An error occurred during signup');
        }
    }

    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        this.showAuthForm();
    }

    switchTab(tab) {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const tabs = document.querySelectorAll('.tab');

        tabs.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        if (tab === 'login') {
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        } else {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        }
    }

    async checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            this.showAuthForm();
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.showDashboard();
            } else {
                this.showAuthForm();
            }
        } catch (error) {
            this.showAuthForm();
        }
    }

    showDashboard() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('userName').textContent = localStorage.getItem('userName');
    }

    showAuthForm() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }
}

new Auth();