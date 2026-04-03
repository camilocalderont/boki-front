import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  BkCardComponent,
  BkSpinnerComponent,
  BkToggleComponent,
} from '@shared/ui';
import { PublicBookingApiService } from '@entities/public-booking';
import type { ClientProfile } from '@entities/public-booking';

@Component({
  standalone: true,
  selector: 'bk-client-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, BkCardComponent, BkSpinnerComponent, BkToggleComponent],
  styles: `
    :host { display: block; }

    .page-title {
      font-size: var(--bk-font-size-xl, 1.25rem);
      font-weight: 700;
      color: var(--bk-color-text-primary, #1e293b);
      margin: 0 0 var(--bk-space-lg, 1.5rem);
    }

    .section-title {
      font-size: var(--bk-font-size-base, 0.875rem);
      font-weight: 600;
      color: var(--bk-color-text-primary, #1e293b);
      margin: 0 0 var(--bk-space-lg, 1.5rem);
    }

    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: var(--bk-space-md, 1rem) 0;
      border-bottom: 1px solid var(--bk-border-color-default, #e2e8f0);
    }

    .toggle-row:last-child {
      border-bottom: none;
    }

    .toggle-info {
      flex: 1;
      margin-right: var(--bk-space-lg, 1.5rem);
    }

    .toggle-label {
      font-size: var(--bk-font-size-sm, 0.875rem);
      font-weight: 600;
      color: var(--bk-color-text-primary, #1e293b);
    }

    .toggle-description {
      font-size: var(--bk-font-size-sm, 0.75rem);
      color: var(--bk-color-text-muted, #94a3b8);
      margin-top: 4px;
      line-height: 1.4;
    }

    .save-feedback {
      font-size: var(--bk-font-size-sm, 0.75rem);
      color: var(--bk-color-success, #10b981);
      margin-top: var(--bk-space-md, 1rem);
    }
  `,
  template: `
    <h1 class="page-title">Ajustes</h1>

    @if (loading()) {
      <div class="flex items-center justify-center py-16">
        <bk-spinner size="lg" />
      </div>
    } @else if (profile()) {
      <bk-card>
        <h2 class="section-title">Mis notificaciones</h2>

        <div class="toggle-row">
          <div class="toggle-info">
            <div class="toggle-label">Notificaciones por WhatsApp</div>
            <div class="toggle-description">
              Recibí recordatorios y confirmaciones de tus citas por WhatsApp.
            </div>
          </div>
          <bk-toggle
            [(ngModel)]="whatsappModel"
            (ngModelChange)="onToggleWhatsapp($event)"
          />
        </div>

        <div class="toggle-row">
          <div class="toggle-info">
            <div class="toggle-label">Notificaciones por Email</div>
            <div class="toggle-description">
              Recibí confirmaciones y resúmenes de tus citas por correo electrónico.
            </div>
          </div>
          <bk-toggle
            [(ngModel)]="emailModel"
            (ngModelChange)="onToggleEmail($event)"
          />
        </div>

        @if (saveSuccess()) {
          <p class="save-feedback">Preferencias guardadas correctamente.</p>
        }
      </bk-card>
    }
  `,
})
export class ClientSettingsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PublicBookingApiService);

  readonly profile = signal<ClientProfile | null>(null);
  readonly loading = signal(true);
  readonly saveSuccess = signal(false);

  // Plain mutable properties for ngModel binding (CVA requires two-way binding)
  whatsappModel = true;
  emailModel = true;

  ngOnInit(): void {
    const token = this.route.parent?.snapshot.params['token'] as string;
    if (!token) {
      this.loading.set(false);
      return;
    }

    this.api.getClientProfile(token).subscribe({
      next: (res) => {
        this.profile.set(res.data);
        this.whatsappModel = res.data.BWhatsappNotifications ?? true;
        this.emailModel = res.data.BEmailNotifications ?? true;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onToggleWhatsapp(checked: boolean): void {
    this.whatsappModel = checked;
    this.saveSettings();
  }

  onToggleEmail(checked: boolean): void {
    this.emailModel = checked;
    this.saveSettings();
  }

  private saveSettings(): void {
    const token = this.route.parent?.snapshot.params['token'] as string;
    if (!token) return;

    this.saveSuccess.set(false);

    this.api.updateClientSettings(token, {
      BWhatsappNotifications: this.whatsappModel,
      BEmailNotifications: this.emailModel,
    }).subscribe({
      next: () => {
        this.saveSuccess.set(true);
      },
    });
  }
}
