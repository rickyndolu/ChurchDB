export interface AuthUser {
  id: string;
  username: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthManager {
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('auth_user');
      
      if (token && user) {
        this.state = {
          token,
          user: JSON.parse(user),
          isAuthenticated: true
        };
      }
    } catch (error) {
      console.error('Failed to load auth from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      if (this.state.token && this.state.user) {
        localStorage.setItem('auth_token', this.state.token);
        localStorage.setItem('auth_user', JSON.stringify(this.state.user));
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    } catch (error) {
      console.error('Failed to save auth to storage:', error);
    }
  }

  async login(username: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const { user, token } = await response.json();
    
    this.state = {
      user,
      token,
      isAuthenticated: true
    };
    
    this.saveToStorage();
    return this.state;
  }

  logout() {
    this.state = {
      user: null,
      token: null,
      isAuthenticated: false
    };
    this.saveToStorage();
  }

  getAuthState() {
    return this.state;
  }

  getAuthHeader() {
    return this.state.token ? `Bearer ${this.state.token}` : '';
  }
}

export const authManager = new AuthManager();
