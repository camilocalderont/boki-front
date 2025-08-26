import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-social-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-login.component.html',
  styleUrl: './social-login.component.scss'
})
export class SocialLoginComponent {
  @Output() googleLogin = new EventEmitter<void>();
  @Output() microsoftLogin = new EventEmitter<void>();

  onGoogleLogin(): void {
    this.googleLogin.emit();
  }

  onMicrosoftLogin(): void {
    this.microsoftLogin.emit();
  }
}