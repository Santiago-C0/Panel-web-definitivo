import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.username || !this.password) {
      this.error.set('Completa todos los campos.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.username, this.password).subscribe({
      next: user => {
        this.loading.set(false);
        if (user.id_role !== 1) {
          this.error.set('Acceso denegado. Solo administradores pueden ingresar.');
        } else {
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: err => {
        this.loading.set(false);
        this.error.set(this.auth.extractErrorMessage(err));
      }
    });
  }
}
