import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../models/auth-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private storeTokens(res: AuthResponse): void {
    if (this.isBrowser()) {
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
    }
  }

  // 🔐 Login
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.apiUrl + '/auth/login', {
        username: username,
        password: password
      })
      .pipe(tap((res: AuthResponse) => this.storeTokens(res)));
  }

  getAccessToken(): string | null {
    return this.isBrowser() ? localStorage.getItem('accessToken') : null;
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  // ✅ Decode JWT base64url safely
  private decodeJwtPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // padding
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

      const json = atob(padded);
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  getRole(): 'ADMIN' | 'USER' | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const payload = this.decodeJwtPayload(token);
    if (!payload) return null;

    // Formats courants: role | roles | authorities | scope
    const roleLike: any =
      payload.role ||
      payload.roles ||
      payload.authorities ||
      payload.scope ||
      payload.scopes ||
      payload.permissions;

    // 1) string: "ROLE_ADMIN" ou "ADMIN" ou "ROLE_ADMIN ROLE_USER"
    if (typeof roleLike === 'string') {
      if (roleLike.indexOf('ADMIN') !== -1) return 'ADMIN';
      if (roleLike.indexOf('USER') !== -1) return 'USER';
      return null;
    }

    // 2) array: ["ROLE_ADMIN", "ROLE_USER"]
    if (Array.isArray(roleLike)) {
      const joined = roleLike.join(' ');
      if (joined.indexOf('ADMIN') !== -1) return 'ADMIN';
      if (joined.indexOf('USER') !== -1) return 'USER';
      return null;
    }

    // 3) certains backends mettent: authorities: [{authority:"ROLE_ADMIN"}]
    if (roleLike && typeof roleLike === 'object' && Array.isArray(roleLike)) {
      // déjà couvert, mais on laisse
      return null;
    }

    if (payload.authorities && Array.isArray(payload.authorities) && payload.authorities.length > 0) {
      // ex: [{authority:'ROLE_ADMIN'}]
      const mapped = payload.authorities
        .map(function (a: any) {
          return a && a.authority ? a.authority : '';
        })
        .join(' ');
      if (mapped.indexOf('ADMIN') !== -1) return 'ADMIN';
      if (mapped.indexOf('USER') !== -1) return 'USER';
    }

    return null;
  }

  isAdmin(): boolean {
  const token = this.getAccessToken();
  if (!token) return false;

  const payload = this.decodeJwtPayload(token);
  if (!payload) return false;

  const roles = payload.roles || payload.role || payload.authorities;

  if (Array.isArray(roles)) {
    return roles.join(' ').indexOf('ADMIN') !== -1;
  }
  if (typeof roles === 'string') {
    return roles.indexOf('ADMIN') !== -1;
  }

  // cas Spring Security avec authorities: [{authority:"ROLE_ADMIN"}]
  if (payload.authorities && Array.isArray(payload.authorities)) {
    const joined = payload.authorities
      .map((a: any) => (a && a.authority ? a.authority : ''))
      .join(' ');
    return joined.indexOf('ADMIN') !== -1;
  }
  return false;
}

isTokenExpired(): boolean {
  const token = this.getAccessToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    const exp = payload.exp; // en secondes
    if (!exp) return true;

    const nowSec = Math.floor(Date.now() / 1000);
    return exp <= nowSec;
  } catch {
    return true;
  }
}


// Créer user 
register(username: string, password: string, email?: string): Observable<any> {
  return this.http.post(this.apiUrl + '/auth/register',
    { username, password, email, role: 'USER' },
    { responseType: 'text' } 
  );
}

// Créer admin
registerAdmin(username: string, password: string, email?: string): Observable<any> {
  return this.http.post<any>(this.apiUrl + '/auth/register-admin', {
     username: username,
     password: password,
    email: email
   });
  }
}
