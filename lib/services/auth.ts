// lib/auth.ts

import { swell } from '../commerce/swell/client';

interface SwellUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  session_token?: string;
  shipping?: {
    address1?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

interface LoginResult {
  success: boolean;
  user?: SwellUser;
  error?: string;
}

interface ExtendedAccount {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  success?: boolean;
  session_token?: string;
  sessionToken?: string;
  token?: string;
  session?: {
    token?: string;
    id?: string;
  };
  errors?: Array<{ message: string }>;
  error?: string;
  message?: string;
}

export class AuthManager {
  private tokenKey: string;
  private userKey: string;

  constructor() {
    this.tokenKey = 'swell_session_token';
    this.userKey = 'swell_user';
  }

  async initAuth(): Promise<SwellUser | null> {
    try {
      const token = this.getStoredToken();

      if (token) {
        try {
          const account = await swell.account.get();
          if (account && account.id) {
            const user = this.convertToSwellUser(account);
            this.setStoredUser(user);
            return user;
          } else {
            this.clearAuth();
          }
        } catch (error) {
          this.clearAuth();
        }
      }
    } catch (error) {
      this.clearAuth();
    }
    return null;
  }

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      if (!swell || !swell.account || !swell.account.login) {
        return { success: false, error: 'Account login not available' };
      }

      const result = (await swell.account.login(email, password)) as ExtendedAccount;

      if (result && (result.success || result.id || result.email)) {
        const sessionToken =
          result.session_token ||
          result.sessionToken ||
          result.token ||
          result.session?.token ||
          result.session?.id ||
          result.id;

        if (sessionToken) {
          this.setStoredToken(sessionToken);
        } else if (result.id) {
          this.setStoredToken(result.id);
        }

        const user = this.convertToSwellUser(result);
        this.setStoredUser(user);
        return { success: true, user };
      } else {
        const errorMsg =
          result?.errors?.[0]?.message ||
          result?.error ||
          result?.message ||
          'Invalid email or password';
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || 'Login failed';
      return { success: false, error: errorMsg };
    }
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<LoginResult> {
    try {
      if (!swell.account || !swell.account.create) {
        return { success: false, error: 'Account creation not available' };
      }

      const result = (await swell.account.create(userData)) as ExtendedAccount;

      if (result && !result.errors && (result.id || result.email)) {
        return await this.login(userData.email, userData.password);
      } else {
        const errorMsg = result?.errors?.[0]?.message || 'Registration failed';
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Registration failed' };
    }
  }

  async logout(): Promise<void> {
    try {
      if (swell.account?.logout) {
        await swell.account.logout();
      }
    } catch (error) {
      // Silent fail
    } finally {
      this.clearAuth();
    }
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken() && !!this.getStoredUser();
  }

  getCurrentUser(): SwellUser | null {
    return this.getStoredUser();
  }

  private convertToSwellUser(account: ExtendedAccount): SwellUser {
    return {
      id: account.id || '',
      email: account.email || '',
      first_name: account.first_name,
      last_name: account.last_name,
      session_token: account.session_token || account.sessionToken || account.token
    };
  }

  private setStoredToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private setStoredUser(user: SwellUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  private getStoredUser(): SwellUser | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }
}

export const authManager = new AuthManager();
export { swell };
