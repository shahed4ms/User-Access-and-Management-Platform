import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface AppLoadResponse {
  success: boolean;
  status: string;
  users: number;
  loadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AppLoadService {
  private readonly http = inject(HttpClient);

  load() {
    return this.http.get<AppLoadResponse>(`${environment.apiBaseUrl}/app-load?delayMs=1200`);
  }
}
