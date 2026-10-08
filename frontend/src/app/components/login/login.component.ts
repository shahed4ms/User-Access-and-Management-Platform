import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { LoginRequest, UserRole } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  errorMessage = '';
  isAuthenticating = false;

  authForm: LoginRequest = {
    userId: 'admin',
    password: 'admin123',
    role: 'Admin',
  };

  demoAccounts = [
    { userId: 'admin', password: 'admin123', role: 'Admin' },
    { userId: 'user01', password: 'pass123', role: 'General User' as UserRole },
    { userId: 'user02', password: 'pass123', role: 'General User' as UserRole },
  ];

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
  ) {}

  login(): void {
    this.errorMessage = '';
    this.isAuthenticating = true;

    this.userService
      .login(this.authForm)
      .pipe(finalize(() => (this.isAuthenticating = false)))
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('mlp_user', JSON.stringify(response.user));
          this.router.navigateByUrl('/dashboard');
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Unable to login. Please verify your credentials.';
        },
      });
  }
}
