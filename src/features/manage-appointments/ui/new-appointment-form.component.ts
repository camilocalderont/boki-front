import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  signal,
  computed,
  effect,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import {
  BkButtonComponent,
  BkInputComponent,
  BkSelectComponent,
  BkSpinnerComponent,
  BkIconComponent,
  BkSearchInputComponent,
} from '@shared/ui';
import type { BkSelectOption } from '@shared/ui';
import { AlertService } from '@shared/lib';
import { AppointmentApiService } from '@entities/appointment';
import type { AppointmentState, CreateAppointmentRequest } from '@entities/appointment';
import { ClientApiService } from '@entities/client';
import type { Client } from '@entities/client';
import { ServiceApiService } from '@entities/service';
import type { ServiceEntity, ServiceStage } from '@entities/service';
import { ProfessionalApiService } from '@entities/professional';
import type { Professional } from '@entities/professional';

// ────────────────────────────────────────────────────────────────────────────

interface FormState {
  clientId:      string;
  serviceId:     string;
  professionalId: string;
  date:          string;
  time:          string;
  stateId:       string;
  notes:         string;
}

// ────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'bk-new-appointment-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    BkButtonComponent,
    BkInputComponent,
    BkSelectComponent,
    BkSpinnerComponent,
    BkIconComponent,
    BkSearchInputComponent,
  ],
  template: `
    <div class="naf">

      <!-- ── Sección 1: Cliente ──────────────────────────────────────── -->
      <section class="naf__section">
        <div class="naf__section-header">
          <h3 class="naf__section-title">Cliente</h3>
          <span class="naf__badge-required">Obligatorio</span>
        </div>

        <div class="naf__client-search-row">
          <div class="naf__client-search-wrapper">
            <bk-search-input
              placeholder="Buscar por nombre o número de documento"
              (searchChange)="onClientSearch($event)"
            />

            @if (searchResults().length > 0) {
              <div class="naf__search-dropdown">
                @for (client of searchResults(); track client.Id) {
                  <div
                    class="naf__search-option"
                    (click)="selectClient(client)"
                  >
                    <span class="naf__search-option-name">
                      {{ client.VcFirstName }} {{ client.VcFirstLastName }}
                    </span>
                    <span class="naf__search-option-sub">
                      {{ client.VcIdentificationNumber }}
                    </span>
                  </div>
                }
              </div>
            }

            @if (searchLoading()) {
              <div class="naf__search-loading">
                <bk-spinner />
              </div>
            }
          </div>

          <bk-button
            variant="ghost"
            size="md"
            type="button"
            (clicked)="toggleNewClientForm()"
            class="naf__client-add-btn"
          >
            <bk-icon name="plus" size="sm" />
            Nuevo
          </bk-button>
        </div>

        @if (selectedClient()) {
          <div class="naf__client-chip">
            <bk-icon name="user" size="sm" class="naf__chip-icon" />
            <span class="naf__chip-name">
              {{ selectedClient()!.VcFirstName }} {{ selectedClient()!.VcFirstLastName }}
            </span>
            <span class="naf__chip-sub">
              {{ selectedClient()!.VcPhone || selectedClient()!.VcIdentificationNumber }}
            </span>
            <button
              type="button"
              class="naf__chip-remove"
              (click)="clearClient()"
              aria-label="Eliminar cliente seleccionado"
            >
              <bk-icon name="x-mark" size="sm" />
            </button>
          </div>
        }

        @if (showNewClientForm()) {
          <div class="naf__inline-form">
            <p class="naf__inline-form-title">Crear nuevo cliente</p>
            <div class="naf__row">
              <bk-input
                label="Primer nombre *"
                placeholder="Nombre"
                [error]="newClientErrors().VcFirstName"
                [ngModel]="newClientForm().VcFirstName"
                (ngModelChange)="patchNewClientField('VcFirstName', $event)"
              />
              <bk-input
                label="Primer apellido *"
                placeholder="Apellido"
                [error]="newClientErrors().VcFirstLastName"
                [ngModel]="newClientForm().VcFirstLastName"
                (ngModelChange)="patchNewClientField('VcFirstLastName', $event)"
              />
            </div>
            <div class="naf__row">
              <bk-input
                label="N.° de documento *"
                placeholder="Ej: 1234567890"
                [error]="newClientErrors().VcIdentificationNumber"
                [ngModel]="newClientForm().VcIdentificationNumber"
                (ngModelChange)="patchNewClientField('VcIdentificationNumber', $event)"
              />
              <bk-input
                label="Teléfono *"
                placeholder="Ej: 3001234567"
                type="tel"
                [error]="newClientErrors().VcPhone"
                [ngModel]="newClientForm().VcPhone"
                (ngModelChange)="patchNewClientField('VcPhone', $event)"
              />
            </div>
            <bk-input
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              type="email"
              [ngModel]="newClientForm().VcEmail"
              (ngModelChange)="patchNewClientField('VcEmail', $event)"
            />
            <div class="naf__inline-form-actions">
              <bk-button
                variant="ghost"
                size="sm"
                type="button"
                (clicked)="cancelNewClientForm()"
              >
                Cancelar
              </bk-button>
              <bk-button
                variant="primary"
                size="sm"
                type="button"
                [loading]="creatingClient()"
                (clicked)="submitNewClient()"
              >
                Crear cliente
              </bk-button>
            </div>
          </div>
        }

        @if (touched().client && !formState().clientId) {
          <p class="naf__field-error">Selecciona o crea un cliente para continuar.</p>
        }
      </section>

      <!-- ── Sección 2: Servicio ─────────────────────────────────────── -->
      <section class="naf__section">
        <div class="naf__section-header">
          <h3 class="naf__section-title">Servicio</h3>
          <span class="naf__badge-required">Obligatorio</span>
        </div>

        <bk-select
          label="Servicio"
          placeholder="Selecciona un servicio"
          [options]="serviceOptions()"
          [searchable]="true"
          [ngModel]="formState().serviceId"
          (ngModelChange)="onServiceChange($event)"
          [error]="touched().service && !formState().serviceId ? 'Selecciona un servicio.' : ''"
        />

        @if (stagesLoading()) {
          <div class="naf__stages-loading">
            <bk-spinner />
            <span>Cargando etapas...</span>
          </div>
        }

        @if (stages().length > 0) {
          <div class="naf__stages">
            <p class="naf__stages-title">Etapas del servicio</p>
            <div class="naf__timeline">
              @for (stage of stages(); track stage.ISequence) {
                <div class="naf__timeline-item">
                  <div class="naf__timeline-dot"></div>
                  <div class="naf__timeline-content">
                    <span class="naf__timeline-desc">
                      {{ stage.VcDescription || 'Etapa ' + stage.ISequence }}
                    </span>
                    <span class="naf__timeline-dur">{{ stage.IDurationMinutes }} min</span>
                  </div>
                </div>
              }
            </div>
            <div class="naf__total-duration">
              <bk-icon name="clock" size="sm" />
              <span>Duración total: <strong>{{ totalDurationLabel() }}</strong></span>
            </div>
          </div>
        }
      </section>

      <!-- ── Sección 3: Profesional ──────────────────────────────────── -->
      <section class="naf__section">
        <div class="naf__section-header">
          <h3 class="naf__section-title">Profesional</h3>
          <span class="naf__badge-required">Obligatorio</span>
        </div>

        <bk-select
          label="Profesional"
          placeholder="Selecciona un profesional"
          [options]="professionalOptions()"
          [searchable]="true"
          [disabled]="!formState().serviceId"
          [ngModel]="formState().professionalId"
          (ngModelChange)="onProfessionalChange($event)"
          [error]="touched().professional && !formState().professionalId ? 'Selecciona un profesional.' : ''"
        />
      </section>

      <!-- ── Sección 4: Fecha y Hora ─────────────────────────────────── -->
      <section class="naf__section">
        <div class="naf__section-header">
          <h3 class="naf__section-title">Fecha y Hora</h3>
          <span class="naf__badge-required">Obligatorio</span>
        </div>

        <div class="naf__row">
          <div class="naf__field">
            <label class="naf__label">Fecha *</label>
            <input
              type="date"
              class="naf__native-input"
              [class.naf__native-input--error]="touched().date && !formState().date"
              [value]="formState().date"
              (change)="onDateChange($event)"
            />
            @if (touched().date && !formState().date) {
              <p class="naf__field-error">Selecciona una fecha.</p>
            }
          </div>

          <div class="naf__field">
            <label class="naf__label">Hora de inicio *</label>
            <input
              type="time"
              step="1800"
              class="naf__native-input"
              [class.naf__native-input--error]="touched().time && !formState().time"
              [value]="formState().time"
              (change)="onTimeChange($event)"
            />
            @if (touched().time && !formState().time) {
              <p class="naf__field-error">Selecciona una hora.</p>
            }
          </div>
        </div>

        @if (formState().time && totalDurationMinutes() > 0) {
          <div class="naf__end-time-info">
            <bk-icon name="clock" size="sm" />
            <span>Hora de finalización estimada: <strong>{{ endTimeLabel() }}</strong></span>
          </div>
        }
      </section>

      <!-- ── Sección 5: Duración y Estado ───────────────────────────── -->
      <section class="naf__section">
        <div class="naf__section-header">
          <h3 class="naf__section-title">Duración y Estado</h3>
        </div>

        <div class="naf__row">
          <div class="naf__field">
            <label class="naf__label">Duración total</label>
            <div class="naf__readonly-value">
              @if (totalDurationMinutes() > 0) {
                {{ totalDurationLabel() }}
              } @else {
                <span class="naf__placeholder-text">Selecciona un servicio</span>
              }
            </div>
          </div>

          <bk-select
            label="Estado"
            placeholder="Selecciona un estado"
            [options]="stateOptions()"
            [searchable]="false"
            [ngModel]="formState().stateId"
            (ngModelChange)="onStateChange($event)"
          />
        </div>
      </section>

      <!-- ── Sección 6: Notas (colapsable) ──────────────────────────── -->
      <section class="naf__section naf__section--borderless">
        <button
          type="button"
          class="naf__collapsible-toggle"
          (click)="toggleAdvanced()"
        >
          <bk-icon
            [name]="showAdvanced() ? 'chevron-up' : 'chevron-down'"
            size="sm"
          />
          Opciones avanzadas
        </button>

        @if (showAdvanced()) {
          <div class="naf__collapsible-body">
            <div class="naf__field">
              <label class="naf__label">Notas de la cita</label>
              <textarea
                class="naf__textarea"
                placeholder="Agrega notas o instrucciones adicionales (opcional)"
                rows="3"
                [value]="formState().notes"
                (input)="onNotesChange($event)"
              ></textarea>
            </div>
          </div>
        }
      </section>

      <!-- ── Footer ─────────────────────────────────────────────────── -->
      <div class="naf__footer">
        <bk-button
          variant="ghost"
          size="md"
          type="button"
          (clicked)="onCancel()"
        >
          Cancelar
        </bk-button>
        <bk-button
          variant="primary"
          size="md"
          type="button"
          [loading]="submitting()"
          [disabled]="!isFormValid()"
          (clicked)="onSubmit()"
        >
          Crear Cita
        </bk-button>
      </div>
    </div>
  `,
  styles: [`
    /* ── Layout base ─────────────────────────────────────────────────── */
    .naf {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .naf__section {
      padding: 20px 0;
      border-bottom: 1px solid var(--bk-border-color-default, #e5e7eb);
    }

    .naf__section--borderless {
      border-bottom: none;
    }

    /* ── Encabezado de sección ───────────────────────────────────────── */
    .naf__section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
    }

    .naf__section-title {
      margin: 0;
      font-size: var(--bk-font-size-base, 14px);
      font-weight: 600;
      color: var(--bk-color-text-primary, #111827);
    }

    .naf__badge-required {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      background: color-mix(in srgb, var(--bk-color-primary, #6366f1) 12%, transparent);
      color: var(--bk-color-primary, #6366f1);
      letter-spacing: 0.02em;
    }

    /* ── Grid de dos columnas ────────────────────────────────────────── */
    .naf__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* ── Búsqueda de cliente ─────────────────────────────────────────── */
    .naf__client-search-row {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .naf__client-search-wrapper {
      flex: 1;
      position: relative;
    }

    .naf__client-add-btn {
      flex-shrink: 0;
    }

    .naf__search-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      z-index: 200;
      background: var(--bk-bg-surface, #fff);
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: var(--bk-border-radius-md, 8px);
      box-shadow: var(--bk-shadow-lg, 0 10px 25px rgba(0,0,0,0.12));
      max-height: 240px;
      overflow-y: auto;
    }

    .naf__search-option {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 10px 14px;
      cursor: pointer;
      transition: background 0.12s ease;
    }

    .naf__search-option:hover {
      background: var(--bk-color-bg-hover, rgba(0,0,0,0.04));
    }

    .naf__search-option-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--bk-color-text-primary, #111827);
    }

    .naf__search-option-sub {
      font-size: 12px;
      color: var(--bk-color-text-muted, #6b7280);
    }

    .naf__search-loading {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      padding: 12px;
      background: var(--bk-bg-surface, #fff);
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: var(--bk-border-radius-md, 8px);
    }

    /* ── Chip de cliente seleccionado ────────────────────────────────── */
    .naf__client-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
      padding: 6px 12px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--bk-color-primary, #6366f1) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--bk-color-primary, #6366f1) 25%, transparent);
    }

    .naf__chip-icon {
      color: var(--bk-color-primary, #6366f1);
      flex-shrink: 0;
    }

    .naf__chip-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--bk-color-text-primary, #111827);
    }

    .naf__chip-sub {
      font-size: 12px;
      color: var(--bk-color-text-muted, #6b7280);
    }

    .naf__chip-remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: var(--bk-color-text-muted, #6b7280);
      cursor: pointer;
      margin-left: 4px;
      transition: color 0.12s ease, background 0.12s ease;
    }

    .naf__chip-remove:hover {
      color: var(--bk-color-danger, #ef4444);
      background: color-mix(in srgb, var(--bk-color-danger, #ef4444) 10%, transparent);
    }

    /* ── Formulario inline de nuevo cliente ─────────────────────────── */
    .naf__inline-form {
      margin-top: 14px;
      padding: 16px;
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: var(--bk-border-radius-md, 8px);
      background: var(--bk-bg-muted, #f9fafb);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .naf__inline-form-title {
      margin: 0 0 4px;
      font-size: 13px;
      font-weight: 600;
      color: var(--bk-color-text-secondary, #374151);
    }

    .naf__inline-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 4px;
    }

    /* ── Etapas del servicio ─────────────────────────────────────────── */
    .naf__stages {
      margin-top: 12px;
      padding: 12px 14px;
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: var(--bk-border-radius-md, 8px);
      background: var(--bk-bg-muted, #f9fafb);
    }

    .naf__stages-title {
      margin: 0 0 10px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--bk-color-text-muted, #6b7280);
    }

    .naf__stages-loading {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
      font-size: 13px;
      color: var(--bk-color-text-muted, #6b7280);
    }

    .naf__timeline {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .naf__timeline-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .naf__timeline-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--bk-color-primary, #6366f1);
      flex-shrink: 0;
    }

    .naf__timeline-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      gap: 8px;
    }

    .naf__timeline-desc {
      font-size: 13px;
      color: var(--bk-color-text-primary, #111827);
    }

    .naf__timeline-dur {
      font-size: 12px;
      font-weight: 600;
      color: var(--bk-color-text-muted, #6b7280);
      white-space: nowrap;
    }

    .naf__total-duration {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--bk-border-color-default, #e5e7eb);
      font-size: 13px;
      color: var(--bk-color-text-secondary, #374151);
    }

    /* ── Campos nativos (date / time) ────────────────────────────────── */
    .naf__field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .naf__label {
      font-size: 12px;
      font-weight: 600;
      color: var(--bk-color-text-secondary, #475569);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .naf__native-input {
      width: 100%;
      height: var(--bk-size-input-height, 40px);
      padding: 0 12px;
      font-family: inherit;
      font-size: 14px;
      color: var(--bk-color-text-primary, #111827);
      background: var(--bk-bg-surface, #fff);
      border: 1px solid var(--bk-border-color-default, #cbd5e1);
      border-radius: var(--bk-border-radius-md, 8px);
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .naf__native-input:focus {
      border-color: var(--bk-color-primary, #6366f1);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--bk-color-primary, #6366f1) 20%, transparent);
    }

    .naf__native-input--error {
      border-color: var(--bk-color-danger, #ef4444);
    }

    /* ── Hora de finalización estimada ───────────────────────────────── */
    .naf__end-time-info {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
      font-size: 13px;
      color: var(--bk-color-text-secondary, #374151);
    }

    /* ── Valor de solo lectura (duración) ────────────────────────────── */
    .naf__readonly-value {
      display: flex;
      align-items: center;
      height: var(--bk-size-input-height, 40px);
      padding: 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--bk-color-text-primary, #111827);
      background: var(--bk-bg-muted, #f9fafb);
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      border-radius: var(--bk-border-radius-md, 8px);
    }

    .naf__placeholder-text {
      font-weight: 400;
      color: var(--bk-color-text-muted, #94a3b8);
    }

    /* ── Textarea ────────────────────────────────────────────────────── */
    .naf__textarea {
      width: 100%;
      padding: 10px 12px;
      font-family: inherit;
      font-size: 14px;
      color: var(--bk-color-text-primary, #111827);
      background: var(--bk-bg-surface, #fff);
      border: 1px solid var(--bk-border-color-default, #cbd5e1);
      border-radius: var(--bk-border-radius-md, 8px);
      outline: none;
      resize: vertical;
      box-sizing: border-box;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .naf__textarea:focus {
      border-color: var(--bk-color-primary, #6366f1);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--bk-color-primary, #6366f1) 20%, transparent);
    }

    /* ── Opciones avanzadas (colapsable) ─────────────────────────────── */
    .naf__collapsible-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      color: var(--bk-color-text-secondary, #374151);
      padding: 4px 0;
      transition: color 0.12s ease;
    }

    .naf__collapsible-toggle:hover {
      color: var(--bk-color-primary, #6366f1);
    }

    .naf__collapsible-body {
      margin-top: 14px;
    }

    /* ── Errores de campo ────────────────────────────────────────────── */
    .naf__field-error {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--bk-color-danger, #ef4444);
    }

    /* ── Footer con botones ──────────────────────────────────────────── */
    .naf__footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 20px;
    }
  `],
})
export class NewAppointmentFormComponent implements OnDestroy {
  // ── Servicios ──────────────────────────────────────────────────────────────

  private readonly appointmentApi  = inject(AppointmentApiService);
  private readonly clientApi       = inject(ClientApiService);
  private readonly serviceApi      = inject(ServiceApiService);
  private readonly professionalApi = inject(ProfessionalApiService);
  private readonly alertService    = inject(AlertService);

  // ── Inputs ─────────────────────────────────────────────────────────────────

  readonly companyId        = input.required<number>();
  readonly preselectedDate  = input<string | null>(null);
  readonly preselectedTime  = input<string | null>(null);

  // ── Outputs ────────────────────────────────────────────────────────────────

  readonly saved     = output<void>();
  readonly cancelled = output<void>();

  // ── Estado del formulario ──────────────────────────────────────────────────

  readonly formState = signal<FormState>({
    clientId:       '',
    serviceId:      '',
    professionalId: '',
    date:           '',
    time:           '',
    stateId:        '1',
    notes:          '',
  });

  /** Campos tocados (para mostrar errores solo después de intentar enviar) */
  readonly touched = signal({
    client:       false,
    service:      false,
    professional: false,
    date:         false,
    time:         false,
  });

  // ── Cliente ────────────────────────────────────────────────────────────────

  readonly selectedClient  = signal<Client | null>(null);
  readonly searchResults   = signal<Client[]>([]);
  readonly searchLoading   = signal(false);
  readonly showNewClientForm = signal(false);
  readonly creatingClient  = signal(false);

  readonly newClientForm = signal({
    VcFirstName:              '',
    VcFirstLastName:          '',
    VcIdentificationNumber:   '',
    VcPhone:                  '',
    VcEmail:                  '',
  });

  readonly newClientErrors = signal({
    VcFirstName:            '',
    VcFirstLastName:        '',
    VcIdentificationNumber: '',
    VcPhone:                '',
  });

  // ── Servicio / etapas ──────────────────────────────────────────────────────

  readonly services        = signal<ServiceEntity[]>([]);
  readonly stages          = signal<ServiceStage[]>([]);
  readonly stagesLoading   = signal(false);

  readonly serviceOptions = computed<BkSelectOption[]>(() =>
    this.services().map(s => ({ value: String(s.Id), label: s.VcName }))
  );

  readonly totalDurationMinutes = computed(() =>
    this.stages().reduce((sum, s) => sum + s.IDurationMinutes, 0)
  );

  readonly totalDurationLabel = computed(() => {
    const mins = this.totalDurationMinutes();
    if (mins === 0) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  });

  // ── Profesional ────────────────────────────────────────────────────────────

  readonly professionals       = signal<Professional[]>([]);
  readonly professionalOptions = computed<BkSelectOption[]>(() => {
    const list = this.professionals();
    if (list.length === 0) return [];
    return list.map(p => ({
      value: String(p.Id),
      label: `${p.VcFirstName} ${p.VcFirstLastName}`.trim(),
    }));
  });

  // ── Estado de la cita ──────────────────────────────────────────────────────

  readonly appointmentStates  = signal<AppointmentState[]>([]);
  readonly stateOptions = computed<BkSelectOption[]>(() =>
    this.appointmentStates().map(s => ({ value: String(s.Id), label: s.VcName }))
  );

  // ── Hora de finalización ───────────────────────────────────────────────────

  readonly endTimeLabel = computed(() => {
    const time = this.formState().time;
    const mins = this.totalDurationMinutes();
    if (!time || mins === 0) return '';
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + mins;
    const eh = Math.floor(total / 60) % 24;
    const em = total % 60;
    return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
  });

  // ── Validación global ──────────────────────────────────────────────────────

  readonly isFormValid = computed(() => {
    const s = this.formState();
    return !!(s.clientId && s.serviceId && s.professionalId && s.date && s.time);
  });

  // ── UI ─────────────────────────────────────────────────────────────────────

  readonly showAdvanced = signal(false);
  readonly submitting   = signal(false);

  // Señal derivada para el serviceId — evita re-ejecución en cambios no relacionados
  private readonly selectedServiceId = computed(() => this.formState().serviceId);

  // ── Búsqueda con debounce ──────────────────────────────────────────────────

  private readonly searchSubject$ = new Subject<string>();

  // ── Constructor / efectos ──────────────────────────────────────────────────

  constructor() {
    // Pre-rellenar fecha y hora desde el calendario
    effect(() => {
      const date = this.preselectedDate();
      const time = this.preselectedTime();
      this.formState.update(s => ({
        ...s,
        date: date ?? s.date,
        time: time ?? s.time,
      }));
    });

    // Cargar servicios al montar
    effect(() => {
      const cid = this.companyId();
      if (cid) {
        this.loadServices(cid);
        this.loadStates();
      }
    });

    // Reaccionar al cambio de servicio → cargar profesionales y etapas
    effect(() => {
      const serviceId = this.selectedServiceId();
      if (serviceId) {
        this.loadProfessionals(Number(serviceId));
        this.loadStages(Number(serviceId));
      } else {
        this.professionals.set([]);
        this.stages.set([]);
      }
    });

    // Búsqueda con debounce via RxJS
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim().length < 2) {
          this.searchResults.set([]);
          this.searchLoading.set(false);
          return of(null);
        }
        this.searchLoading.set(true);
        return this.clientApi.search(this.companyId(), query).pipe(
          catchError(() => {
            this.searchLoading.set(false);
            return of(null);
          })
        );
      })
    ).subscribe(res => {
      this.searchLoading.set(false);
      if (res) {
        this.searchResults.set((res.data ?? []).slice(0, 10));
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubject$.complete();
  }

  // ── Handlers: cliente ──────────────────────────────────────────────────────

  onClientSearch(query: string): void {
    this.searchSubject$.next(query);
    if (!query) {
      this.searchResults.set([]);
    }
  }

  selectClient(client: Client): void {
    this.selectedClient.set(client);
    this.formState.update(s => ({ ...s, clientId: String(client.Id) }));
    this.searchResults.set([]);
  }

  clearClient(): void {
    this.selectedClient.set(null);
    this.formState.update(s => ({ ...s, clientId: '' }));
  }

  toggleNewClientForm(): void {
    this.showNewClientForm.update(v => !v);
  }

  cancelNewClientForm(): void {
    this.showNewClientForm.set(false);
    this.resetNewClientForm();
  }

  patchNewClientField(field: 'VcFirstName' | 'VcFirstLastName' | 'VcIdentificationNumber' | 'VcPhone' | 'VcEmail', value: string): void {
    this.newClientForm.update(f => ({ ...f, [field]: value }));
    // Limpiar error del campo al escribir (VcEmail no tiene error trackeable)
    if (field !== 'VcEmail') {
      this.newClientErrors.update(e => ({ ...e, [field]: '' }));
    }
  }

  submitNewClient(): void {
    const f = this.newClientForm();
    const errors = {
      VcFirstName:            f.VcFirstName.trim().length < 2 ? 'Mínimo 2 caracteres' : '',
      VcFirstLastName:        f.VcFirstLastName.trim().length < 2 ? 'Mínimo 2 caracteres' : '',
      VcIdentificationNumber: f.VcIdentificationNumber.trim().length < 4 ? 'Mínimo 4 caracteres' : '',
      VcPhone:                f.VcPhone.trim().length < 7 ? 'Mínimo 7 caracteres' : '',
    };
    this.newClientErrors.set(errors);

    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) return;

    this.creatingClient.set(true);
    this.clientApi.create({
      CompanyId:              this.companyId(),
      VcFirstName:            f.VcFirstName.trim(),
      VcFirstLastName:        f.VcFirstLastName.trim(),
      VcIdentificationNumber: f.VcIdentificationNumber.trim(),
      VcPhone:                f.VcPhone.trim(),
      VcEmail:                f.VcEmail.trim() || undefined,
    }).subscribe({
      next: (res) => {
        this.creatingClient.set(false);
        const client = res.data;
        this.selectClient(client);
        this.showNewClientForm.set(false);
        this.resetNewClientForm();
        this.alertService.showSuccess('Cliente creado correctamente.');
      },
      error: (err) => {
        this.creatingClient.set(false);
        this.alertService.showError(err?.message ?? 'No se pudo crear el cliente.');
      },
    });
  }

  private resetNewClientForm(): void {
    this.newClientForm.set({
      VcFirstName:            '',
      VcFirstLastName:        '',
      VcIdentificationNumber: '',
      VcPhone:                '',
      VcEmail:                '',
    });
    this.newClientErrors.set({
      VcFirstName:            '',
      VcFirstLastName:        '',
      VcIdentificationNumber: '',
      VcPhone:                '',
    });
  }

  // ── Handlers: servicio / profesional / estado ──────────────────────────────

  onServiceChange(value: string): void {
    this.formState.update(s => ({ ...s, serviceId: value, professionalId: '' }));
  }

  onProfessionalChange(value: string): void {
    this.formState.update(s => ({ ...s, professionalId: value }));
  }

  onStateChange(value: string): void {
    this.formState.update(s => ({ ...s, stateId: value }));
  }

  // ── Handlers: fecha / hora ─────────────────────────────────────────────────

  onDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.formState.update(s => ({ ...s, date: value }));
  }

  onTimeChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.formState.update(s => ({ ...s, time: value }));
  }

  // ── Handlers: notas ────────────────────────────────────────────────────────

  onNotesChange(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.formState.update(s => ({ ...s, notes: value }));
  }

  // ── UI toggles ─────────────────────────────────────────────────────────────

  toggleAdvanced(): void {
    this.showAdvanced.update(v => !v);
  }

  // ── Submit / cancelar ──────────────────────────────────────────────────────

  onCancel(): void {
    this.cancelled.emit();
  }

  onSubmit(): void {
    // Marcar todos los campos como tocados
    this.touched.set({
      client:       true,
      service:      true,
      professional: true,
      date:         true,
      time:         true,
    });

    if (!this.isFormValid()) return;

    const s = this.formState();
    const request: CreateAppointmentRequest = {
      ClientId:       Number(s.clientId),
      ServiceId:      Number(s.serviceId),
      ProfessionalId: Number(s.professionalId),
      DtDate:         s.date,
      TStartTime:     s.time,
      CurrentStateId: Number(s.stateId || '1'),
    };

    this.submitting.set(true);
    this.appointmentApi.create(request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.alertService.showSuccess('Cita creada exitosamente.');
        this.saved.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        this.alertService.showError(err?.message ?? 'No se pudo crear la cita. Intenta de nuevo.');
      },
    });
  }

  // ── Carga de datos ─────────────────────────────────────────────────────────

  private loadServices(companyId: number): void {
    this.serviceApi.getByCompany(companyId).subscribe({
      next: (res) => this.services.set(res.data ?? []),
      error: () => this.alertService.showError('No se pudieron cargar los servicios.'),
    });
  }

  private loadStages(serviceId: number): void {
    this.stagesLoading.set(true);
    this.serviceApi.getServiceStages(serviceId).subscribe({
      next: (res) => {
        this.stages.set((res.data ?? []).sort((a, b) => a.ISequence - b.ISequence));
        this.stagesLoading.set(false);
      },
      error: () => {
        this.stages.set([]);
        this.stagesLoading.set(false);
      },
    });
  }

  private loadProfessionals(serviceId: number): void {
    this.professionalApi.getByService(serviceId).subscribe({
      next: (res) => {
        const list = res.data ?? [];
        this.professionals.set(list);
        // Auto-seleccionar el primero (sin preferencia)
        if (list.length > 0 && !this.formState().professionalId) {
          this.formState.update(s => ({ ...s, professionalId: String(list[0].Id) }));
        }
      },
      error: () => {
        // Fallback: cargar todos los profesionales de la empresa
        this.professionalApi.getByCompany(this.companyId()).subscribe({
          next: (res) => {
            const list = res.data ?? [];
            this.professionals.set(list);
            if (list.length > 0 && !this.formState().professionalId) {
              this.formState.update(s => ({ ...s, professionalId: String(list[0].Id) }));
            }
          },
          error: () => this.professionals.set([]),
        });
      },
    });
  }

  private loadStates(): void {
    this.appointmentApi.getAllStates().subscribe({
      next: (res) => {
        const states = res.data ?? [];
        this.appointmentStates.set(states);
        // Establecer estado por defecto "Programada" (ID 1) si existe
        const defaultState = states.find(s => s.Id === 1);
        if (defaultState) {
          this.formState.update(s => ({ ...s, stateId: String(defaultState.Id) }));
        } else if (states.length > 0) {
          this.formState.update(s => ({ ...s, stateId: String(states[0].Id) }));
        }
      },
      error: () => {
        // Dejar el valor por defecto '1'
      },
    });
  }
}
