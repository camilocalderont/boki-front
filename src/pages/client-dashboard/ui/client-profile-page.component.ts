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
  BkButtonComponent,
  BkSpinnerComponent,
  BkFormFieldComponent,
  BkInputComponent,
} from '@shared/ui';
import { PublicBookingApiService } from '@entities/public-booking';
import type { ClientProfile } from '@entities/public-booking';

@Component({
  standalone: true,
  selector: 'bk-client-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    BkCardComponent,
    BkButtonComponent,
    BkSpinnerComponent,
    BkFormFieldComponent,
    BkInputComponent,
  ],
  styles: `
    :host { display: block; }

    .page-title {
      font-size: var(--bk-font-size-xl, 1.25rem);
      font-weight: 700;
      color: var(--bk-color-text-primary, #1e293b);
      margin: 0 0 var(--bk-space-lg, 1.5rem);
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: var(--bk-space-lg, 1.5rem);
      margin-bottom: var(--bk-space-lg, 1.5rem);
    }

    .avatar-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--bk-color-primary, #6366f1);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--bk-font-size-xl, 1.25rem);
      font-weight: 700;
      flex-shrink: 0;
    }

    .profile-name {
      font-size: var(--bk-font-size-lg, 1rem);
      font-weight: 700;
      color: var(--bk-color-text-primary, #1e293b);
    }

    .profile-email {
      font-size: var(--bk-font-size-sm, 0.75rem);
      color: var(--bk-color-text-muted, #94a3b8);
      margin-top: 2px;
    }

    .info-rows {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-sm, 0.75rem);
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: var(--bk-space-sm, 0.75rem) 0;
      border-bottom: 1px solid var(--bk-border-color-default, #e2e8f0);
      font-size: var(--bk-font-size-sm, 0.875rem);
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      color: var(--bk-color-text-muted, #94a3b8);
      font-weight: 500;
    }

    .info-value {
      color: var(--bk-color-text-primary, #1e293b);
      font-weight: 600;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--bk-space-md, 1rem);
    }

    .form-actions {
      display: flex;
      gap: var(--bk-space-sm, 0.75rem);
      margin-top: var(--bk-space-lg, 1.5rem);
    }

    .success-msg {
      font-size: var(--bk-font-size-sm, 0.75rem);
      color: var(--bk-color-success, #10b981);
      margin-top: var(--bk-space-sm, 0.75rem);
    }

    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
    }
  `,
  template: `
    <h1 class="page-title">Perfil</h1>

    @if (loading()) {
      <div class="flex items-center justify-center py-16">
        <bk-spinner size="lg" />
      </div>
    } @else if (profile(); as p) {
      <bk-card>
        <div class="profile-header">
          <div class="avatar-circle">{{ initials() }}</div>
          <div>
            <div class="profile-name">{{ p.VcFirstName }} {{ p.VcFirstLastName }}</div>
            @if (p.VcEmail) {
              <div class="profile-email">{{ p.VcEmail }}</div>
            }
          </div>
        </div>

        @if (!editMode()) {
          <div class="info-rows">
            <div class="info-row">
              <span class="info-label">Nombre</span>
              <span class="info-value">{{ p.VcFirstName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Apellido</span>
              <span class="info-value">{{ p.VcFirstLastName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">{{ p.VcEmail || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Teléfono</span>
              <span class="info-value">{{ p.VcPhone || '—' }}</span>
            </div>
          </div>

          <div class="form-actions">
            <bk-button variant="primary" size="sm" (clicked)="startEdit()">Editar perfil</bk-button>
          </div>
        } @else {
          <div class="form-grid">
            <bk-form-field label="Nombre">
              <bk-input
                [(ngModel)]="editFormValues.VcFirstName"
                placeholder="Nombre"
              />
            </bk-form-field>

            <bk-form-field label="Apellido">
              <bk-input
                [(ngModel)]="editFormValues.VcFirstLastName"
                placeholder="Apellido"
              />
            </bk-form-field>

            <bk-form-field label="Email">
              <bk-input
                [(ngModel)]="editFormValues.VcEmail"
                type="email"
                placeholder="correo@ejemplo.com"
              />
            </bk-form-field>

            <bk-form-field label="Teléfono">
              <bk-input
                [(ngModel)]="editFormValues.VcPhone"
                type="tel"
                placeholder="Teléfono"
              />
            </bk-form-field>
          </div>

          <div class="form-actions">
            <bk-button variant="primary" size="sm" [loading]="saving()" (clicked)="saveProfile()">Guardar</bk-button>
            <bk-button variant="ghost" size="sm" (clicked)="cancelEdit()">Cancelar</bk-button>
          </div>

          @if (saveSuccess()) {
            <p class="success-msg">Perfil actualizado correctamente.</p>
          }
        }
      </bk-card>
    }
  `,
})
export class ClientProfilePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PublicBookingApiService);

  readonly profile = signal<ClientProfile | null>(null);
  readonly loading = signal(true);
  readonly editMode = signal(false);
  readonly saving = signal(false);
  readonly saveSuccess = signal(false);

  // Plain mutable object for CVA ngModel bindings
  editFormValues = { VcFirstName: '', VcFirstLastName: '', VcEmail: '', VcPhone: '' };

  readonly initials = () => {
    const p = this.profile();
    if (!p) return '?';
    const first = p.VcFirstName?.charAt(0)?.toUpperCase() ?? '';
    const last = p.VcFirstLastName?.charAt(0)?.toUpperCase() ?? '';
    return `${first}${last}` || '?';
  };

  ngOnInit(): void {
    const token = this.route.parent?.snapshot.params['token'] as string;
    if (!token) {
      this.loading.set(false);
      return;
    }

    this.api.getClientProfile(token).subscribe({
      next: (res) => {
        this.profile.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  startEdit(): void {
    const p = this.profile();
    if (!p) return;
    this.editFormValues = {
      VcFirstName: p.VcFirstName ?? '',
      VcFirstLastName: p.VcFirstLastName ?? '',
      VcEmail: p.VcEmail ?? '',
      VcPhone: p.VcPhone ?? '',
    };
    this.editMode.set(true);
    this.saveSuccess.set(false);
  }

  cancelEdit(): void {
    this.editMode.set(false);
    this.saveSuccess.set(false);
  }

  saveProfile(): void {
    const token = this.route.parent?.snapshot.params['token'] as string;
    if (!token) return;

    this.saving.set(true);
    this.saveSuccess.set(false);

    this.api.updateClientProfile(token, this.editFormValues).subscribe({
      next: (res) => {
        this.profile.set(res.data);
        this.saving.set(false);
        this.editMode.set(false);
        this.saveSuccess.set(true);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}
