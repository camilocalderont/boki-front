import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseButtonComponent } from '../../../../shared/components/atoms/base-button/base-button.component';

@Component({
  selector: 'app-social-login',
  standalone: true,
  imports: [CommonModule, BaseButtonComponent],
  templateUrl: './social-login.component.html',
  styleUrls: ['./social-login.component.scss']
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