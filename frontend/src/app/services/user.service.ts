import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RecordsResponse, User, UsersResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload);
  }

  getUsers() {
    return this.http.get<UsersResponse>(`${this.baseUrl}/users`);
  }

  getRecords(userId: string, delayMs = 1500) {
    return this.http.get<RecordsResponse>(`${this.baseUrl}/records/${encodeURIComponent(userId)}?delayMs=${delayMs}`);
  }

  addUser(payload: Partial<User> & { userId: string; name: string; password: string; role: User['role'] }) {
    return this.http.post<{ success: boolean; message: string; user: User }>(`${this.baseUrl}/users`, payload);
  }

  deleteUser(userId: string) {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/users/${encodeURIComponent(userId)}`);
  }
}
