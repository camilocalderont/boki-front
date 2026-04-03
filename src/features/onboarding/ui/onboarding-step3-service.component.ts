import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { BkButtonComponent, BkIconComponent } from '@shared/ui';
import { BkConfirmDialogComponent } from '@widgets/confirm-dialog';
import type { SolerciaServiceType, OnboardingStep3Request } from '../model/onboarding.model';

interface IndustryTemplate {
  value: string;
  label: string;
  emoji: string;
  categories: { name: string; services: string[] }[];
}

const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    value: 'salud',
    label: 'Salud',
    emoji: '🏥',
    categories: [
      { name: 'Consulta General', services: ['Consulta Médica General', 'Control de Seguimiento'] },
      { name: 'Odontología', services: ['Limpieza Dental', 'Blanqueamiento', 'Ortodoncia Consulta'] },
      { name: 'Dermatología', services: ['Consulta Dermatológica', 'Tratamiento Facial Clínico'] },
      { name: 'Psicología', services: ['Sesión Individual', 'Terapia de Pareja'] },
    ],
  },
  {
    value: 'belleza',
    label: 'Belleza',
    emoji: '💇',
    categories: [
      { name: 'Corte y Peinado', services: ['Corte de Cabello', 'Peinado', 'Tinte'] },
      { name: 'Uñas', services: ['Manicure', 'Pedicure', 'Uñas Acrílicas'] },
      { name: 'Tratamientos', services: ['Tratamiento Facial', 'Limpieza Profunda', 'Masaje Relajante'] },
      { name: 'Barbería', services: ['Corte Clásico', 'Barba', 'Corte + Barba'] },
    ],
  },
  {
    value: 'fitness',
    label: 'Fitness',
    emoji: '🏋️',
    categories: [
      { name: 'Entrenamiento', services: ['Entrenamiento Personal', 'Entrenamiento Funcional'] },
      { name: 'Clases Grupales', services: ['Yoga', 'Pilates', 'CrossFit', 'Spinning'] },
      { name: 'Evaluación', services: ['Evaluación Física', 'Plan Nutricional'] },
    ],
  },
  {
    value: 'profesional',
    label: 'Servicios Profesionales',
    emoji: '⚖️',
    categories: [
      { name: 'Legal', services: ['Consulta Legal', 'Asesoría Contractual', 'Trámite Notarial'] },
      { name: 'Contable', services: ['Asesoría Contable', 'Declaración de Renta', 'Auditoría'] },
      { name: 'Consultoría', services: ['Consulta General', 'Asesoría Empresarial'] },
    ],
  },
  {
    value: 'educacion',
    label: 'Educación',
    emoji: '🎓',
    categories: [
      { name: 'Tutorías', services: ['Clase Particular', 'Refuerzo Escolar', 'Preparación Examen'] },
      { name: 'Idiomas', services: ['Clase de Inglés', 'Clase de Francés', 'Conversación'] },
      { name: 'Música y Arte', services: ['Clase de Guitarra', 'Clase de Piano', 'Clase de Pintura'] },
    ],
  },
  {
    value: 'restaurantes',
    label: 'Restaurantes',
    emoji: '🍽️',
    categories: [
      { name: 'Reservas', services: ['Mesa para 2', 'Mesa para 4', 'Mesa para 6+', 'Zona VIP'] },
      { name: 'Eventos', services: ['Evento Privado', 'Cena Empresarial'] },
    ],
  },
];

@Component({
  selector: 'bk-onboarding-step3',
  standalone: true,
  imports: [BkButtonComponent, BkIconComponent, BkConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-ob-step3">
      @if (error()) {
        <div class="bk-ob-step3__error" role="alert">
          <span>{{ error() }}</span>
        </div>
      }

      <button type="button" class="bk-ob-step3__back" (click)="back.emit()">← Volver al paso anterior</button>

      <p class="bk-ob-step3__subtitle">
        Seleccioná los módulos que querés activar en tu cuenta. Podés cambiarlos después.
      </p>

      <div class="bk-ob-step3__grid">
        @for (type of serviceTypes(); track type.Id) {
          <button
            type="button"
            class="bk-ob-step3__card"
            [class.bk-ob-step3__card--selected]="isSelected(type.Id)"
            (click)="toggleType(type.Id)"
            [attr.aria-pressed]="isSelected(type.Id)"
          >
            <bk-icon [name]="type.VcIcon" size="lg" class="bk-ob-step3__card-icon" />
            <span class="bk-ob-step3__card-name">{{ type.VcDisplayName }}</span>
            <span class="bk-ob-step3__card-desc">{{ type.VcDescription }}</span>

            @if (isSelected(type.Id)) {
              <span class="bk-ob-step3__card-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            }
          </button>
        }
      </div>

      @if (showIndustryPicker()) {
        <div class="bk-ob-step3__industry">
          <label class="bk-ob-step3__industry-label">¿A qué sector pertenece tu negocio?</label>
          <div class="bk-ob-step3__industry-options">
            @for (opt of industryTemplates; track opt.value) {
              <button
                type="button"
                class="bk-ob-step3__industry-chip"
                [class.bk-ob-step3__industry-chip--selected]="selectedIndustry() === opt.value"
                (click)="onIndustryChange(opt.value)"
              >
                {{ opt.emoji }} {{ opt.label }}
              </button>
            }
          </div>
        </div>

        @if (selectedTemplate()) {
          <div class="bk-ob-step3__preview">
            <label class="bk-ob-step3__preview-label">
              Seleccioná las categorías y servicios que querés incluir:
            </label>
            @for (cat of selectedTemplate()!.categories; track cat.name) {
              <div class="bk-ob-step3__preview-category">
                <button
                  type="button"
                  class="bk-ob-step3__cat-toggle"
                  [class.bk-ob-step3__cat-toggle--active]="isCategorySelected(cat.name)"
                  (click)="toggleCategory(cat.name)"
                >
                  @if (isCategorySelected(cat.name)) { ✓ } @else { ○ }
                  {{ cat.name }}
                </button>

                @if (isCategorySelected(cat.name)) {
                  <div class="bk-ob-step3__preview-services">
                    @for (svc of cat.services; track svc) {
                      <button
                        type="button"
                        class="bk-ob-step3__svc-tag"
                        [class.bk-ob-step3__svc-tag--active]="isServiceSelected(cat.name, svc)"
                        (click)="toggleService(cat.name, svc)"
                      >
                        @if (isServiceSelected(cat.name, svc)) { ✓ } @else { + }
                        {{ svc }}
                      </button>
                    }
                    @for (custom of getCustomServices(cat.name); track custom) {
                      <button
                        type="button"
                        class="bk-ob-step3__svc-tag bk-ob-step3__svc-tag--active bk-ob-step3__svc-tag--custom"
                        (click)="removeCustomService(cat.name, custom)"
                      >
                        ✕ {{ custom }}
                      </button>
                    }
                    <div class="bk-ob-step3__add-service">
                      <input
                        type="text"
                        class="bk-ob-step3__add-input"
                        placeholder="Agregar servicio..."
                        (keydown.enter)="addCustomService(cat.name, $event)"
                      />
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Categorías custom -->
            @for (catName of customCategories(); track catName) {
              <div class="bk-ob-step3__preview-category">
                <button
                  type="button"
                  class="bk-ob-step3__cat-toggle bk-ob-step3__cat-toggle--active bk-ob-step3__cat-toggle--custom"
                  (click)="removeCustomCategory(catName)"
                >
                  ✕ {{ catName }}
                </button>
                <div class="bk-ob-step3__preview-services">
                  @for (custom of getCustomServices(catName); track custom) {
                    <button
                      type="button"
                      class="bk-ob-step3__svc-tag bk-ob-step3__svc-tag--active bk-ob-step3__svc-tag--custom"
                      (click)="removeCustomService(catName, custom)"
                    >
                      ✕ {{ custom }}
                    </button>
                  }
                  <div class="bk-ob-step3__add-service">
                    <input
                      type="text"
                      class="bk-ob-step3__add-input"
                      placeholder="Agregar servicio..."
                      (keydown.enter)="addCustomService(catName, $event)"
                    />
                  </div>
                </div>
              </div>
            }

            <!-- Input para nueva categoría -->
            <div class="bk-ob-step3__add-category">
              <input
                type="text"
                class="bk-ob-step3__add-cat-input"
                placeholder="+ Agregar categoría..."
                (keydown.enter)="addCustomCategory($event)"
              />
            </div>
          </div>

          <!-- Resumen de confirmación -->
          @if (hasSelections()) {
            <div class="bk-ob-step3__summary">
              <label class="bk-ob-step3__summary-label">Resumen de tu configuración</label>

              <div class="bk-ob-step3__summary-section">
                <span class="bk-ob-step3__summary-key">Módulos:</span>
                <span class="bk-ob-step3__summary-val">
                  @for (type of getSelectedModuleNames(); track type) {
                    <span class="bk-ob-step3__summary-badge">{{ type }}</span>
                  }
                </span>
              </div>

              <div class="bk-ob-step3__summary-section">
                <span class="bk-ob-step3__summary-key">Sector:</span>
                <span class="bk-ob-step3__summary-val">{{ selectedTemplate()!.emoji }} {{ selectedTemplate()!.label }}</span>
              </div>

              @for (cat of getSelectedCategoriesWithServices(); track cat.category) {
                <div class="bk-ob-step3__summary-section">
                  <span class="bk-ob-step3__summary-key">{{ cat.category }}:</span>
                  <span class="bk-ob-step3__summary-val">
                    @for (svc of cat.services; track svc) {
                      <span class="bk-ob-step3__summary-svc">{{ svc }}</span>
                    }
                  </span>
                </div>
              }
            </div>
          }
        }
      }

      <bk-confirm-dialog
        [open]="showConfirmDialog()"
        title="¿Cambiar de sector?"
        message="Se limpiarán las categorías y servicios que seleccionaste. ¿Estás seguro?"
        confirmLabel="Sí, cambiar"
        cancelLabel="Cancelar"
        variant="warning"
        (confirm)="onConfirmSectorChange()"
        (cancel)="showConfirmDialog.set(false)"
      />

      <div class="bk-ob-step3__actions">
        <bk-button
          type="button"
          variant="primary"
          size="lg"
          [disabled]="selectedIds().size === 0"
          [loading]="loading()"
          (clicked)="onSubmit()"
        >
          Continuar
        </bk-button>
      </div>
    </div>
  `,
  styles: `
    .bk-ob-step3 {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-md, 1rem);
      width: 100%;
    }

    .bk-ob-step3__back {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: var(--bk-color-text-muted, #64748b);
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.8rem);
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .bk-ob-step3__back:hover {
      color: var(--bk-color-primary, #6366f1);
    }

    .bk-ob-step3__subtitle {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.875rem);
      color: var(--bk-color-text-secondary, #64748b);
      margin: 0;
      line-height: 1.5;
    }

    .bk-ob-step3__error {
      padding: var(--bk-space-sm, 0.5rem) var(--bk-space-md, 1rem);
      background-color: color-mix(in srgb, var(--bk-color-danger, #ef4444) 10%, transparent);
      border: 1px solid var(--bk-color-danger, #ef4444);
      border-radius: var(--bk-border-radius-md, 0.5rem);
      color: var(--bk-color-danger, #ef4444);
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.875rem);
    }

    .bk-ob-step3__grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--bk-space-md, 1rem);
    }

    @media (max-width: 480px) {
      .bk-ob-step3__grid { grid-template-columns: 1fr; }
    }

    .bk-ob-step3__card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--bk-space-xs, 0.25rem);
      padding: var(--bk-space-md, 1rem);
      background-color: var(--bk-bg-surface, #ffffff);
      border: 2px solid var(--bk-border-color-default, #e2e8f0);
      border-radius: var(--bk-border-radius-md, 0.75rem);
      cursor: pointer;
      text-align: left;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
      width: 100%;
    }

    .bk-ob-step3__card:hover {
      border-color: color-mix(in srgb, var(--bk-color-primary, #6366f1) 50%, transparent);
      box-shadow: 0 2px 8px color-mix(in srgb, var(--bk-color-primary, #6366f1) 12%, transparent);
    }

    .bk-ob-step3__card--selected {
      border-color: var(--bk-color-primary, #6366f1);
      background-color: color-mix(in srgb, var(--bk-color-primary, #6366f1) 6%, transparent);
      box-shadow: 0 2px 12px color-mix(in srgb, var(--bk-color-primary, #6366f1) 18%, transparent);
    }

    .bk-ob-step3__card-icon {
      color: var(--bk-color-primary, #60A5FA);
    }

    .bk-ob-step3__card-name {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-base, 0.875rem);
      font-weight: 600;
      color: var(--bk-color-text-primary, #1e293b);
    }

    .bk-ob-step3__card-desc {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-xs, 0.75rem);
      color: var(--bk-color-text-secondary, #64748b);
      line-height: 1.4;
    }

    .bk-ob-step3__card-check {
      position: absolute;
      top: 0.625rem;
      right: 0.625rem;
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      background-color: var(--bk-color-primary, #6366f1);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bk-ob-step3__card-check svg { width: 0.75rem; height: 0.75rem; }

    .bk-ob-step3__industry {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-xs, 0.5rem);
      padding: var(--bk-space-md, 1rem);
      background-color: color-mix(in srgb, var(--bk-color-primary, #6366f1) 4%, var(--bk-bg-surface, #ffffff));
      border: 1px solid color-mix(in srgb, var(--bk-color-primary, #6366f1) 25%, transparent);
      border-radius: var(--bk-border-radius-md, 0.75rem);
    }

    .bk-ob-step3__industry-label {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.75rem);
      font-weight: 600;
      color: var(--bk-color-text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bk-ob-step3__industry-options {
      display: flex;
      flex-wrap: wrap;
      gap: var(--bk-space-xs, 0.5rem);
    }

    .bk-ob-step3__industry-chip {
      padding: 0.375rem 1rem;
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.875rem);
      font-weight: 500;
      color: var(--bk-color-text-secondary, #64748b);
      background-color: var(--bk-bg-surface, #ffffff);
      border: 1.5px solid var(--bk-border-color-default, #e2e8f0);
      border-radius: 9999px;
      cursor: pointer;
      transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
    }

    .bk-ob-step3__industry-chip:hover {
      border-color: var(--bk-color-primary, #6366f1);
      color: var(--bk-color-primary, #6366f1);
    }

    .bk-ob-step3__industry-chip--selected {
      border-color: var(--bk-color-primary, #6366f1);
      background-color: var(--bk-color-primary, #6366f1);
      color: #ffffff;
    }

    /* Preview de categorías/servicios */
    .bk-ob-step3__preview {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-sm, 0.75rem);
      padding: var(--bk-space-md, 1rem);
      background-color: color-mix(in srgb, var(--bk-color-success, #10B981) 5%, var(--bk-bg-surface, #ffffff));
      border: 1px solid color-mix(in srgb, var(--bk-color-success, #10B981) 25%, transparent);
      border-radius: var(--bk-border-radius-md, 0.75rem);
    }

    .bk-ob-step3__preview-label {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.75rem);
      font-weight: 600;
      color: var(--bk-color-success, #10B981);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bk-ob-step3__preview-category {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bk-ob-step3__cat-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.85rem);
      font-weight: 600;
      color: var(--bk-color-text-muted, #64748b);
      cursor: pointer;
      padding: 4px 0;
      transition: color 0.15s ease;
    }

    .bk-ob-step3__cat-toggle:hover {
      color: var(--bk-color-text-primary, #f1f5f9);
    }

    .bk-ob-step3__cat-toggle--active {
      color: var(--bk-color-success, #10B981);
    }

    .bk-ob-step3__cat-toggle--custom {
      color: var(--bk-color-accent, #FBBF24);
    }

    .bk-ob-step3__preview-services {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding-left: 20px;
      align-items: center;
    }

    .bk-ob-step3__svc-tag {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-xs, 0.75rem);
      color: var(--bk-color-text-secondary, #94a3b8);
      background-color: color-mix(in srgb, var(--bk-color-text-secondary, #94a3b8) 10%, transparent);
      padding: 4px 12px;
      border-radius: 9999px;
      border: 1.5px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .bk-ob-step3__svc-tag:hover {
      border-color: var(--bk-color-primary, #60A5FA);
      color: var(--bk-color-primary, #60A5FA);
    }

    .bk-ob-step3__svc-tag--active {
      background-color: color-mix(in srgb, var(--bk-color-success, #10B981) 15%, transparent);
      border-color: var(--bk-color-success, #10B981);
      color: var(--bk-color-success, #10B981);
    }

    .bk-ob-step3__svc-tag--custom {
      background-color: color-mix(in srgb, var(--bk-color-accent, #FBBF24) 15%, transparent);
      border-color: var(--bk-color-accent, #FBBF24);
      color: var(--bk-color-accent, #FBBF24);
    }

    .bk-ob-step3__add-service {
      display: inline-flex;
    }

    .bk-ob-step3__add-input {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-xs, 0.75rem);
      color: var(--bk-color-text-primary, #f1f5f9);
      background: color-mix(in srgb, var(--bk-bg-surface, #1e293b) 80%, transparent);
      border: 1px dashed var(--bk-border-color-default, #334155);
      border-radius: 9999px;
      padding: 4px 12px;
      width: 140px;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .bk-ob-step3__add-input:focus {
      border-color: var(--bk-color-primary, #60A5FA);
    }

    .bk-ob-step3__add-input::placeholder {
      color: var(--bk-color-text-muted, #475569);
    }

    .bk-ob-step3__add-category {
      padding-top: 4px;
    }

    .bk-ob-step3__add-cat-input {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.8rem);
      font-weight: 600;
      color: var(--bk-color-text-primary, #f1f5f9);
      background: color-mix(in srgb, var(--bk-bg-surface, #1e293b) 80%, transparent);
      border: 1px dashed var(--bk-color-success, #10B981);
      border-radius: var(--bk-border-radius-md, 0.5rem);
      padding: 6px 14px;
      width: 200px;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .bk-ob-step3__add-cat-input:focus {
      border-color: var(--bk-color-primary, #60A5FA);
      border-style: solid;
    }

    .bk-ob-step3__add-cat-input::placeholder {
      color: var(--bk-color-success, #10B981);
      font-weight: 500;
    }

    /* Resumen */
    .bk-ob-step3__summary {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-sm, 0.5rem);
      padding: var(--bk-space-md, 1rem);
      background-color: color-mix(in srgb, var(--bk-color-primary, #60A5FA) 6%, var(--bk-bg-surface, #1e293b));
      border: 1px solid color-mix(in srgb, var(--bk-color-primary, #60A5FA) 30%, transparent);
      border-radius: var(--bk-border-radius-md, 0.75rem);
    }

    .bk-ob-step3__summary-label {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-sm, 0.75rem);
      font-weight: 700;
      color: var(--bk-color-primary, #60A5FA);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bk-ob-step3__summary-section {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .bk-ob-step3__summary-key {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-xs, 0.75rem);
      font-weight: 600;
      color: var(--bk-color-text-secondary, #94a3b8);
      min-width: 80px;
      flex-shrink: 0;
    }

    .bk-ob-step3__summary-val {
      font-family: var(--bk-font-family);
      font-size: var(--bk-font-size-xs, 0.75rem);
      color: var(--bk-color-text-primary, #f1f5f9);
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .bk-ob-step3__summary-badge {
      background-color: color-mix(in srgb, var(--bk-color-primary, #60A5FA) 15%, transparent);
      color: var(--bk-color-primary, #60A5FA);
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: var(--bk-font-size-xs, 0.7rem);
      font-weight: 600;
    }

    .bk-ob-step3__summary-svc {
      background-color: color-mix(in srgb, var(--bk-color-success, #10B981) 12%, transparent);
      color: var(--bk-color-success, #10B981);
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: var(--bk-font-size-xs, 0.7rem);
    }

    .bk-ob-step3__actions {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--bk-space-sm, 0.5rem);
    }

    :host ::ng-deep .bk-ob-step3__actions bk-button,
    :host ::ng-deep .bk-ob-step3__actions bk-button .bk-btn {
      width: 100%;
    }
  `,
})
export class OnboardingStep3Component {
  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly serviceTypes = input<SolerciaServiceType[]>([]);

  readonly submitted = output<OnboardingStep3Request>();
  readonly back = output<void>();

  readonly selectedIds = signal<Set<number>>(new Set());
  readonly selectedIndustry = signal<string | null>(null);
  readonly selectedCategories = signal<Set<string>>(new Set());
  readonly selectedServices = signal<Map<string, Set<string>>>(new Map());
  readonly customServices = signal<Map<string, string[]>>(new Map());
  readonly customCategories = signal<string[]>([]);
  readonly showConfirmDialog = signal(false);
  private pendingSectorChange: string | null = null;

  readonly industryTemplates = INDUSTRY_TEMPLATES;

  readonly showIndustryPicker = computed(() => {
    const types = this.serviceTypes();
    const agendamientoType = types.find(t => t.VcName === 'agendamiento_citas');
    return agendamientoType ? this.selectedIds().has(agendamientoType.Id) : false;
  });

  readonly selectedTemplate = computed(() => {
    const industry = this.selectedIndustry();
    if (!industry) return null;
    return INDUSTRY_TEMPLATES.find(t => t.value === industry) ?? null;
  });

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  toggleType(id: number): void {
    this.selectedIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    // Si se deselecciona agendamiento, limpiar industria y selecciones
    if (!this.showIndustryPicker()) {
      this.clearSelections();
      this.selectedIndustry.set(null);
    }
  }

  // ── Cambio de sector con confirmación ──

  onIndustryChange(newValue: string): void {
    if (this.selectedIndustry() === newValue) return;

    if (this.hasSelections()) {
      this.pendingSectorChange = newValue;
      this.showConfirmDialog.set(true);
      return;
    }

    this.clearSelections();
    this.selectedIndustry.set(newValue);
  }

  onConfirmSectorChange(): void {
    this.showConfirmDialog.set(false);
    if (this.pendingSectorChange) {
      this.clearSelections();
      this.selectedIndustry.set(this.pendingSectorChange);
      this.pendingSectorChange = null;
    }
  }

  private clearSelections(): void {
    this.selectedCategories.set(new Set());
    this.selectedServices.set(new Map());
    this.customServices.set(new Map());
    this.customCategories.set([]);
  }

  // ── Categorías toggle ──

  isCategorySelected(catName: string): boolean {
    return this.selectedCategories().has(catName);
  }

  toggleCategory(catName: string): void {
    this.selectedCategories.update(set => {
      const next = new Set(set);
      if (next.has(catName)) {
        next.delete(catName);
        // Al deseleccionar categoría, quitar sus servicios
        this.selectedServices.update(m => { const n = new Map(m); n.delete(catName); return n; });
        this.customServices.update(m => { const n = new Map(m); n.delete(catName); return n; });
      } else {
        next.add(catName);
        // Al seleccionar categoría, seleccionar todos sus servicios por defecto
        const template = this.selectedTemplate();
        const cat = template?.categories.find(c => c.name === catName);
        if (cat) {
          this.selectedServices.update(m => {
            const n = new Map(m);
            n.set(catName, new Set(cat.services));
            return n;
          });
        }
      }
      return next;
    });
  }

  // ── Servicios toggle ──

  isServiceSelected(catName: string, svcName: string): boolean {
    return this.selectedServices().get(catName)?.has(svcName) ?? false;
  }

  toggleService(catName: string, svcName: string): void {
    this.selectedServices.update(m => {
      const n = new Map(m);
      const set = new Set(n.get(catName) ?? []);
      if (set.has(svcName)) {
        set.delete(svcName);
      } else {
        set.add(svcName);
      }
      n.set(catName, set);
      return n;
    });
  }

  // ── Custom services ──

  getCustomServices(catName: string): string[] {
    return this.customServices().get(catName) ?? [];
  }

  addCustomService(catName: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (!value) return;
    this.customServices.update(m => {
      const n = new Map(m);
      const list = [...(n.get(catName) ?? [])];
      if (!list.includes(value)) list.push(value);
      n.set(catName, list);
      return n;
    });
    // También agregarlo a selectedServices
    this.selectedServices.update(m => {
      const n = new Map(m);
      const set = new Set(n.get(catName) ?? []);
      set.add(value);
      n.set(catName, set);
      return n;
    });
    input.value = '';
    event.preventDefault();
  }

  removeCustomService(catName: string, svcName: string): void {
    this.customServices.update(m => {
      const n = new Map(m);
      const list = (n.get(catName) ?? []).filter(s => s !== svcName);
      n.set(catName, list);
      return n;
    });
    this.selectedServices.update(m => {
      const n = new Map(m);
      const set = new Set(n.get(catName) ?? []);
      set.delete(svcName);
      n.set(catName, set);
      return n;
    });
  }

  // ── Categorías custom ──

  addCustomCategory(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (!value) return;

    const existing = this.customCategories();
    const templateCats = this.selectedTemplate()?.categories.map(c => c.name) ?? [];
    if (existing.includes(value) || templateCats.includes(value)) return;

    this.customCategories.update(list => [...list, value]);
    this.selectedCategories.update(set => { const n = new Set(set); n.add(value); return n; });
    input.value = '';
    event.preventDefault();
  }

  removeCustomCategory(catName: string): void {
    this.customCategories.update(list => list.filter(c => c !== catName));
    this.selectedCategories.update(set => { const n = new Set(set); n.delete(catName); return n; });
    this.selectedServices.update(m => { const n = new Map(m); n.delete(catName); return n; });
    this.customServices.update(m => { const n = new Map(m); n.delete(catName); return n; });
  }

  // ── Resumen ──

  hasSelections(): boolean {
    return this.selectedCategories().size > 0;
  }

  getSelectedModuleNames(): string[] {
    const types = this.serviceTypes();
    return Array.from(this.selectedIds()).map(id => {
      const t = types.find(x => x.Id === id);
      return t?.VcDisplayName ?? `ID ${id}`;
    });
  }

  getSelectedCategoriesWithServices(): { category: string; services: string[] }[] {
    const result: { category: string; services: string[] }[] = [];
    for (const cat of this.selectedCategories()) {
      const services = Array.from(this.selectedServices().get(cat) ?? []);
      if (services.length > 0) {
        result.push({ category: cat, services });
      }
    }
    return result;
  }

  onSubmit(): void {
    if (this.selectedIds().size === 0) return;

    this.submitted.emit({
      SolerciaServiceTypeIds: Array.from(this.selectedIds()),
      VcIndustryTemplate: this.selectedIndustry() ?? undefined,
    });
  }
}
