import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { User, UserRecord, UserRole } from '../../models/user.model';
import { AppLoadService } from '../../services/app-load.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  appStatus = 'Bootstrapping...';
  currentUser: User | null = null;
  records: UserRecord[] = [];
  users: User[] = [];
  lastProcessedAt = '';
  isAdmin = false;
  isRecordsLoading = false;
  isUsersLoading = false;
  errorMessage = '';
  infoMessage = '';

  newUserForm = {
    userId: '',
    name: '',
    password: '',
    role: 'General User' as UserRole,
    email: '',
    department: '',
    accessLevel: 'Read',
  };

  constructor(
    private readonly userService: UserService,
    private readonly appLoadService: AppLoadService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const storedUser = sessionStorage.getItem('mlp_user');

    if (!storedUser) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.currentUser = JSON.parse(storedUser) as User;
    this.isAdmin = this.currentUser.role === 'Admin';

    this.appLoadService.load().subscribe({
      next: (response) => {
        this.appStatus = response.status;
      },
      error: () => {
        this.appStatus = 'Bootstrap check failed; backend may still be starting.';
      },
    });

    this.loadRecords(this.currentUser.userId, this.currentUser.role === 'Admin' ? 2200 : 1500);
    if (this.isAdmin) {
      this.loadUsers();
    }
  }

  loadRecords(userId: string, delayMs: number): void {
    this.isRecordsLoading = true;
    this.errorMessage = '';
    this.lastProcessedAt = '';

    this.userService
      .getRecords(userId, delayMs)
      .pipe(finalize(() => (this.isRecordsLoading = false)))
      .subscribe({
        next: (response) => {
          this.records = response.records;
          this.lastProcessedAt = new Date(response.processedAt).toLocaleTimeString();
          this.infoMessage = `Records loaded with ${response.delayMs} ms API delay.`;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Unable to fetch records.';
        },
      });
  }

  loadUsers(): void {
    this.isUsersLoading = true;

    this.userService
      .getUsers()
      .pipe(finalize(() => (this.isUsersLoading = false)))
      .subscribe({
        next: (response) => {
          this.users = response.users;
        },
        error: () => {
          this.errorMessage = 'Unable to fetch user list.';
        },
      });
  }

  addUser(): void {
    if (!this.isAdmin) {
      return;
    }

    this.isUsersLoading = true;
    this.userService
      .addUser({ ...this.newUserForm })
      .pipe(finalize(() => (this.isUsersLoading = false)))
      .subscribe({
        next: (response) => {
          this.infoMessage = response.message;
          this.newUserForm = {
            userId: '',
            name: '',
            password: '',
            role: 'General User',
            email: '',
            department: '',
            accessLevel: 'Read',
          };
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Unable to create new user.';
        },
      });
  }

  deleteUser(userId: string): void {
    if (!this.isAdmin) {
      return;
    }

    this.userService.deleteUser(userId).subscribe({
      next: (response) => {
        this.infoMessage = response.message;
        this.loadUsers();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to remove user.';
      },
    });
  }

  logout(): void {
    sessionStorage.removeItem('mlp_user');
    this.router.navigateByUrl('/login');
  }
}
