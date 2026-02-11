# Theme Toggle API Documentation

## Overview
The Theme Toggle feature allows HR, Admin, and Super Admin users to switch between light and dark modes. The preference is stored in the database and persists across sessions.

## Model Changes

### User Model
Added `theme` field to the User schema:

```javascript
theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
}
```

**Default Value:** `'light'`

---

## API Endpoints

### 1. Get Current User's Theme
**GET** `/api/users/me/theme`

Get the authenticated user's theme preference.

**Access:** Private (All authenticated users: HR, Admin, Super Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
    "success": true,
    "theme": "light"
}
```

---

### 2. Update Theme Preference
**PUT** `/api/users/me/theme`

Update the authenticated user's theme preference.

**Access:** Private (All authenticated users: HR, Admin, Super Admin)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "theme": "dark"
}
```

**Valid Values:**
- `"light"` - Light mode
- `"dark"` - Dark mode

**Response (200):**
```json
{
    "success": true,
    "message": "Theme updated successfully",
    "theme": "dark"
}
```

**Error Response (400):**
```json
{
    "success": false,
    "message": "Invalid theme. Must be \"light\" or \"dark\""
}
```

---

### 3. Get Current User Profile
**GET** `/api/users/me`

Get the authenticated user's complete profile including theme preference.

**Access:** Private (All authenticated users: HR, Admin, Super Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
    "success": true,
    "user": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "name": "John Doe",
        "email": "john@aarvion.com",
        "role": "admin",
        "theme": "dark",
        "createdAt": "2026-02-11T17:00:00.000Z"
    }
}
```

---

## Frontend Integration

### React Example with Context

#### 1. Create Theme Context

```javascript
// contexts/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);

    // Load theme on mount
    useEffect(() => {
        loadTheme();
    }, []);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.className = theme;
    }, [theme]);

    const loadTheme = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5000/api/users/me/theme', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setTheme(data.theme);
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/me/theme', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ theme: newTheme })
            });

            const data = await response.json();
            if (data.success) {
                setTheme(newTheme);
            }
        } catch (error) {
            console.error('Error updating theme:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, loading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
```

#### 2. Wrap App with Theme Provider

```javascript
// App.js
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <YourApp />
        </ThemeProvider>
    );
}
```

#### 3. Create Theme Toggle Component

```javascript
// components/ThemeToggle.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme, loading } = useTheme();

    if (loading) return null;

    return (
        <button 
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <>
                    🌙 Dark Mode
                </>
            ) : (
                <>
                    ☀️ Light Mode
                </>
            )}
        </button>
    );
};

export default ThemeToggle;
```

#### 4. Use in Your Components

```javascript
// components/Dashboard.js
import ThemeToggle from './ThemeToggle';

const Dashboard = () => {
    return (
        <div className="dashboard">
            <header>
                <h1>Dashboard</h1>
                <ThemeToggle />
            </header>
            {/* Rest of your dashboard */}
        </div>
    );
};
```

---

### Vanilla JavaScript Example

```javascript
// theme.js
class ThemeManager {
    constructor() {
        this.theme = 'light';
        this.init();
    }

    async init() {
        await this.loadTheme();
        this.applyTheme();
        this.setupToggleButton();
    }

    async loadTheme() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('http://localhost:5000/api/users/me/theme', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                this.theme = data.theme;
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        document.body.className = this.theme;
    }

    async toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/me/theme', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ theme: newTheme })
            });

            const data = await response.json();
            if (data.success) {
                this.theme = newTheme;
                this.applyTheme();
                this.updateToggleButton();
            }
        } catch (error) {
            console.error('Error updating theme:', error);
        }
    }

    setupToggleButton() {
        const button = document.getElementById('theme-toggle');
        if (button) {
            button.addEventListener('click', () => this.toggleTheme());
            this.updateToggleButton();
        }
    }

    updateToggleButton() {
        const button = document.getElementById('theme-toggle');
        if (button) {
            button.textContent = this.theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
        }
    }
}

// Initialize
const themeManager = new ThemeManager();
```

---

## CSS Implementation

### Using CSS Variables

```css
/* styles.css */

/* Light Theme (Default) */
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #e0e0e0;
    --accent-color: #007bff;
}

/* Dark Theme */
[data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    --border-color: #404040;
    --accent-color: #4a9eff;
}

/* Apply variables */
body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
}

.card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
}

.button-primary {
    background-color: var(--accent-color);
    color: white;
}

/* Theme Toggle Button */
.theme-toggle-btn {
    padding: 8px 16px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.theme-toggle-btn:hover {
    background-color: var(--accent-color);
    color: white;
}
```

### Using Class-Based Approach

```css
/* Light Theme */
body.light {
    background-color: #ffffff;
    color: #333333;
}

body.light .card {
    background-color: #f5f5f5;
    border-color: #e0e0e0;
}

/* Dark Theme */
body.dark {
    background-color: #1a1a1a;
    color: #ffffff;
}

body.dark .card {
    background-color: #2d2d2d;
    border-color: #404040;
}
```

---

## Testing

### Test with cURL

**1. Get current theme:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/users/me/theme
```

**2. Switch to dark mode:**
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"theme":"dark"}' \
     http://localhost:5000/api/users/me/theme
```

**3. Switch to light mode:**
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"theme":"light"}' \
     http://localhost:5000/api/users/me/theme
```

**4. Get user profile with theme:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/users/me
```

---

## User Roles

All authenticated users can use the theme toggle:

| Role | Can Toggle Theme |
|------|-----------------|
| Super Admin | ✅ Yes |
| Admin | ✅ Yes |
| HR | ✅ Yes |

---

## Best Practices

### 1. Load Theme on App Start
```javascript
useEffect(() => {
    loadUserTheme();
}, []);
```

### 2. Apply Theme Immediately
```javascript
// Apply theme before rendering to avoid flash
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
}
```

### 3. Sync with Backend
```javascript
// Update backend when theme changes
const updateTheme = async (newTheme) => {
    // Update UI immediately
    setTheme(newTheme);
    
    // Sync with backend
    await fetch('/api/users/me/theme', {
        method: 'PUT',
        body: JSON.stringify({ theme: newTheme })
    });
};
```

### 4. Handle Errors Gracefully
```javascript
try {
    await updateTheme('dark');
} catch (error) {
    // Revert to previous theme if update fails
    setTheme(previousTheme);
    showError('Failed to update theme');
}
```

---

## Migration for Existing Users

Existing users will automatically get the default theme (`'light'`) when they log in. The field is added with a default value, so no migration script is needed.

---

## Summary

✅ **Added to User Model:** `theme` field (light/dark)
✅ **3 New Endpoints:** Get theme, Update theme, Get profile
✅ **Default Value:** Light mode
✅ **Access:** All authenticated users
✅ **Persistence:** Stored in database
✅ **Frontend Ready:** Easy integration with React or vanilla JS

The theme preference is now ready to use! Users can toggle between light and dark modes, and their preference will be saved and persist across sessions. 🎨
