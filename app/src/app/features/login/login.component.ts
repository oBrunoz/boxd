import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideMail, LucideLock, LucideEye, LucideEyeOff } from '@lucide/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideMail, LucideLock, LucideEye, LucideEyeOff],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    // Auth não implementado no backend ainda
    console.log('Login:', this.email(), this.password());
  }
}
