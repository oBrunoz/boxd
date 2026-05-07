import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideUser, LucideMail, LucideLock, LucideEye, LucideEyeOff } from '@lucide/angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideUser, LucideMail, LucideLock, LucideEye, LucideEyeOff],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  name = signal('');
  email = signal('');
  password = signal('');
  showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    console.log('Register:', this.name(), this.email(), this.password());
  }
}
