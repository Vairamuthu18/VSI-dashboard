const API_BASE = 'php/api.php';

// ==========================================
// AUTH
// ==========================================

async function apiLogin(email, password) {
    try {
        const res = await fetch(`${API_BASE}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await res.json();
    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Connection failed' };
    }
}

async function apiLogout() {
    try {
        const res = await fetch(`${API_BASE}?action=logout`);
        return await res.json();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

async function apiGetSession() {
    try {
        const res = await fetch(`${API_BASE}?action=get_session`);
        return await res.json();
    } catch (error) {
        console.error('Session error:', error);
        return { authenticated: false };
    }
}

// ==========================================
// USER MANAGEMENT
// ==========================================

async function apiCreateUser(userData) {
    try {
        const res = await fetch(`${API_BASE}?action=create_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await res.json();
    } catch (error) {
        console.error('Create user error:', error);
        return { error: 'Connection failed' };
    }
}

async function apiListUsers() {
    try {
        const res = await fetch(`${API_BASE}?action=list_users`);
        return await res.json();
    } catch (error) {
        console.error('List users error:', error);
        return [];
    }
}

async function apiDeleteUser(id) {
    try {
        const res = await fetch(`${API_BASE}?action=delete_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        return await res.json();
    } catch (error) {
        console.error('Delete user error:', error);
        return { error: 'Connection failed' };
    }
}

async function apiUpdateUser(userData) {
    try {
        const res = await fetch(`${API_BASE}?action=update_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await res.json();
    } catch (error) {
        console.error('Update user error:', error);
        return { error: 'Connection failed' };
    }
}

// ==========================================
// DATA
// ==========================================

async function fetchData(type = '') {
    try {
        const response = await fetch(`${API_BASE}?action=get_data&type=${type}`);
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'login.html';
                return null;
            }
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function fetchAiQueries(clientId = '') {
    try {
        let url = `${API_BASE}?action=get_ai_queries`;
        if (clientId) url += `&client_id=${clientId}`;
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'login.html';
                return [];
            }
            throw new Error('Failed to fetch queries');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching AI queries:', error);
        return [];
    }
}
