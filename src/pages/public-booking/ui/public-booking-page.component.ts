import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  BkCardComponent,
  BkButtonComponent,
  BkSpinnerComponent,
  BkIconComponent,
  BkBadgeComponent,
  BkSearchInputComponent,
  BkFormFieldComponent,
  BkDayPickerComponent,
} from '@shared/ui';
import type { DayPickerItem } from '@shared/ui';
import { BookingSidebarComponent } from '@widgets/booking-sidebar';
import { createDebounced } from '@shared/lib';
import { PublicBookingApiService } from '@entities/public-booking';
import type {
  PublicService,
  PublicCategory,
  PublicProfessional,
  PublicCompany,
  CompanyConfig,
  MultiAppointmentResult,
  CreateMultiAppointmentDto,
} from '@entities/public-booking';
import type { ServiceAssignment } from '@widgets/booking-sidebar';

interface WeekDay {
  date: Date;
  label: string;
  dayName: string;
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
}

interface StepDef {
  num: number;
  label: string;
}

const priceFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: true,
});

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

@Component({
  standalone: true,
  selector: 'bk-public-booking-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BkCardComponent,
    BkButtonComponent,
    BkSpinnerComponent,
    BkIconComponent,
    BkBadgeComponent,
    BkSearchInputComponent,
    BkFormFieldComponent,
    BkDayPickerComponent,
    BookingSidebarComponent,
  ],
  styles: [`
    .confirm-form {
      max-width: 32rem;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-lg, 1.5rem);
    }

    .step-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .step-circle.active {
      background-color: var(--bk-color-primary);
      color: #fff;
    }
    .step-circle.done {
      background-color: var(--bk-color-primary);
      color: #fff;
      opacity: 0.7;
    }
    .step-circle.pending {
      background-color: var(--bk-bg-muted, #f3f4f6);
      color: var(--bk-color-text-muted);
    }

    /* ── Step 1: Service cards ── */
    .service-card {
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
      border: 2px solid var(--bk-border-color-default);
      border-radius: var(--bk-border-radius-md);
      background-color: var(--bk-bg-surface);
    }
    .service-card:hover {
      border-color: var(--bk-color-primary);
    }
    .service-card.selected {
      border-color: var(--bk-color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--bk-color-primary) 15%, transparent);
    }
    .select-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid var(--bk-border-color-default);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
      transition: background-color 0.15s, border-color 0.15s, color 0.15s;
      color: var(--bk-color-text-muted);
    }
    .select-circle.checked {
      background-color: var(--bk-color-primary);
      border-color: var(--bk-color-primary);
      color: #fff;
    }

    /* ── Step 2: Professional mode cards ── */
    .mode-card {
      cursor: pointer;
      border: 2px solid var(--bk-border-color-default);
      border-radius: var(--bk-border-radius-md);
      background-color: var(--bk-bg-surface);
      transition: border-color 0.15s, box-shadow 0.15s;
      padding: 20px;
    }
    .mode-card:hover {
      border-color: var(--bk-color-primary);
    }
    .mode-card.selected {
      border-color: var(--bk-color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--bk-color-primary) 15%, transparent);
    }
    .prof-assign-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border: 1px solid var(--bk-border-color-default);
      border-radius: var(--bk-border-radius-md);
      background-color: var(--bk-bg-surface);
      margin-bottom: 8px;
    }
    .prof-picker-btn {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border: 1px solid var(--bk-border-color-default);
      border-radius: var(--bk-border-radius-md);
      background-color: var(--bk-bg-surface);
      transition: border-color 0.15s;
      font-size: 13px;
      color: var(--bk-color-text-primary);
    }
    .prof-picker-btn:hover {
      border-color: var(--bk-color-primary);
    }

    /* ── Professional modal ── */
    .prof-modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .prof-modal-content {
      background-color: var(--bk-bg-surface);
      border-radius: var(--bk-border-radius-lg);
      box-shadow: var(--bk-shadow-lg);
      width: 100%;
      max-width: 440px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .prof-modal-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      cursor: pointer;
      transition: background-color 0.12s;
    }
    .prof-modal-item:hover {
      background-color: color-mix(in srgb, var(--bk-color-primary) 6%, transparent);
    }
    .prof-modal-item.selected {
      background-color: color-mix(in srgb, var(--bk-color-primary) 10%, transparent);
    }
    .prof-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      background-color: var(--bk-color-primary);
      flex-shrink: 0;
      overflow: hidden;
    }

    /* ── Step 3: Calendar / time ── */
    .time-slot {
      cursor: pointer;
      border: 1px solid var(--bk-border-color-default);
      border-radius: var(--bk-border-radius-md);
      padding: 14px 20px;
      background-color: var(--bk-bg-surface);
      transition: border-color 0.15s, background-color 0.15s;
      color: var(--bk-color-text-primary);
      font-size: var(--bk-font-size-base);
      font-weight: 500;
    }
    .time-slot:hover {
      border-color: var(--bk-color-primary);
      background-color: color-mix(in srgb, var(--bk-color-primary) 5%, transparent);
    }
    .time-slot.selected {
      border-color: var(--bk-color-primary);
      background-color: var(--bk-color-primary);
      color: #fff;
    }
    .calendar-popup {
      position: absolute;
      z-index: 50;
      top: calc(100% + 8px);
      left: 0;
      background-color: var(--bk-bg-surface);
      border: 1px solid var(--bk-border-color-default);
      border-radius: var(--bk-border-radius-lg);
      box-shadow: var(--bk-shadow-lg);
      padding: 16px;
      min-width: 280px;
    }
    .cal-day {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 13px;
      transition: background-color 0.12s;
      color: var(--bk-color-text-primary);
    }
    .cal-day:hover {
      background-color: color-mix(in srgb, var(--bk-color-primary) 12%, transparent);
    }
    .cal-day.selected {
      background-color: var(--bk-color-primary);
      color: #fff;
      font-weight: 600;
    }
    .cal-day.today:not(.selected) {
      border: 2px solid var(--bk-color-primary);
      font-weight: 600;
    }
    .cal-day.disabled {
      opacity: 0.3;
      cursor: not-allowed;
      pointer-events: none;
    }
    .category-pill {
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      border: 1px solid var(--bk-border-color-default);
      transition: background-color 0.12s, color 0.12s, border-color 0.12s;
      background-color: var(--bk-bg-surface);
      color: var(--bk-color-text-primary);
    }
    .category-pill.active {
      background-color: var(--bk-color-primary);
      border-color: var(--bk-color-primary);
      color: #fff;
    }

    /* ── Success ── */
    .success-appointment {
      padding: 12px 0;
      border-bottom: 1px solid var(--bk-border-color-default);
    }
    .success-appointment:last-child {
      border-bottom: none;
    }
  `],
  template: `
    @if (pageLoading()) {
      <div class="flex items-center justify-center min-h-[60vh]">
        <bk-spinner size="lg" />
      </div>
    } @else if (bookingResult(); as result) {

      <!-- ════════ SUCCESS STATE ════════ -->
      <div class="container mx-auto px-6 py-16 max-w-xl text-center">
        <div class="text-6xl mb-6">🎉</div>
        <h1 class="text-2xl font-bold mb-2" style="color: var(--bk-color-text-primary)">
          {{ result.appointments.length > 1 ? '¡Citas agendadas!' : '¡Cita agendada!' }}
        </h1>
        <p class="text-sm mb-8" style="color: var(--bk-color-text-secondary)">
          Revisa tu correo para confirmarlas. Te enviamos los detalles a
          <strong>{{ clientEmail() }}</strong>.
        </p>

        <bk-card [padding]="true">
          <div class="text-left">
            @for (appt of result.appointments; track appt.Id) {
              <div class="success-appointment space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm" style="color: var(--bk-color-text-muted)">Servicio</span>
                  <span class="text-sm font-medium" style="color: var(--bk-color-text-primary)">{{ appt.Service.VcName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm" style="color: var(--bk-color-text-muted)">Profesional</span>
                  <span class="text-sm font-medium" style="color: var(--bk-color-text-primary)">
                    {{ appt.Professional.VcFirstName }} {{ appt.Professional.VcFirstLastName }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm" style="color: var(--bk-color-text-muted)">Hora</span>
                  <span class="text-sm font-medium" style="color: var(--bk-color-text-primary)">
                    {{ appt.TStartTime }} – {{ appt.TEndTime }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm" style="color: var(--bk-color-text-muted)">Precio</span>
                  <span class="text-sm font-bold" style="color: var(--bk-color-primary)">
                    {{ formatPrice(appt.Service.IMinimalPrice) }}
                  </span>
                </div>
              </div>
            }

            <div class="pt-3 mt-1" style="border-top: 1px solid var(--bk-border-color-default)">
              <div class="flex justify-between items-center">
                <span class="text-sm font-semibold" style="color: var(--bk-color-text-primary)">Total</span>
                <span class="text-lg font-bold" style="color: var(--bk-color-primary)">
                  {{ formatPrice(totalPrice()) }}
                </span>
              </div>
            </div>
          </div>
        </bk-card>

        <div class="mt-6">
          <bk-button variant="primary" size="md" (clicked)="onClose()">
            Volver al inicio
          </bk-button>
        </div>
      </div>

    } @else {

      <!-- ════════ STICKY STEP HEADER ════════ -->
      <div class="sticky z-30 flex items-center justify-between px-6 py-3 gap-4"
           style="top: var(--bk-size-header-height, 56px); background-color: var(--bk-bg-surface); border-bottom: 1px solid var(--bk-border-color-default)">

        <!-- Botón atrás -->
        <bk-button variant="ghost" size="sm" (clicked)="onBack()">
          <span class="flex items-center gap-1">
            <bk-icon name="chevron-right" size="sm" style="transform: rotate(180deg)" />
            Atrás
          </span>
        </bk-button>

        <!-- Stepper -->
        <div class="flex items-center gap-2 flex-1 justify-center overflow-x-auto">
          @for (s of steps(); track s.num; let i = $index) {
            @if (i > 0) {
              <span class="text-sm flex-shrink-0" style="color: var(--bk-color-text-muted)">›</span>
            }
            <div class="flex items-center gap-2 flex-shrink-0">
              <span
                class="step-circle"
                [class.active]="currentStep() === s.num"
                [class.done]="currentStep() > s.num"
                [class.pending]="currentStep() < s.num">
                @if (currentStep() > s.num) {
                  ✓
                } @else {
                  {{ s.num }}
                }
              </span>
              <span class="text-sm hidden sm:inline"
                    [style.color]="currentStep() === s.num ? 'var(--bk-color-text-primary)' : 'var(--bk-color-text-muted)'"
                    [style.font-weight]="currentStep() === s.num ? '600' : '400'">
                {{ s.label }}
              </span>
            </div>
          }
        </div>

        <!-- Cerrar -->
        <button type="button"
                (click)="onClose()"
                class="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                style="background-color: var(--bk-bg-muted, #f3f4f6); color: var(--bk-color-text-muted)"
                aria-label="Cerrar">
          ✕
        </button>
      </div>

      <!-- ════════ MAIN LAYOUT ════════ -->
      <div class="container mx-auto px-6 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- STEP CONTENT (2/3) -->
          <div class="lg:col-span-2">

            <!-- ═══════════ STEP 1: SERVICIOS (multi-select) ═══════════ -->
            @if (currentStep() === 1) {
              <div>
                <h2 class="text-xl font-bold mb-1" style="color: var(--bk-color-text-primary)">
                  Selecciona tus servicios
                </h2>
                <p class="text-sm mb-6" style="color: var(--bk-color-text-secondary)">
                  Puedes elegir uno o varios servicios.
                </p>

                <!-- Búsqueda -->
                <div class="mb-4 max-w-md">
                  <bk-search-input
                    placeholder="Buscar servicios..."
                    (searchChange)="searchTerm.set($event)" />
                </div>

                <!-- Filtros por categoría -->
                <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
                  <button
                    type="button"
                    class="category-pill"
                    [class.active]="selectedCategoryId() === null"
                    (click)="selectedCategoryId.set(null)">
                    Todos ({{ services().length }})
                  </button>
                  @for (cat of categories(); track cat.Id) {
                    <button
                      type="button"
                      class="category-pill"
                      [class.active]="selectedCategoryId() === cat.Id"
                      (click)="selectedCategoryId.set(cat.Id)">
                      {{ cat.VcName }} ({{ cat.ServiceCount }})
                    </button>
                  }
                </div>

                <!-- Lista de servicios -->
                <div class="space-y-3">
                  @for (svc of filteredServices(); track svc.Id) {
                    <div
                      class="service-card p-4 flex items-center gap-4"
                      [class.selected]="isServiceSelected(svc.Id)"
                      (click)="toggleService(svc)">

                      <!-- Info -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2 mb-1">
                          <h3 class="font-semibold text-sm leading-tight"
                              style="color: var(--bk-color-text-primary)">{{ svc.VcName }}</h3>
                        </div>
                        @if (svc.VcDescription) {
                          <p class="text-xs line-clamp-2 mb-2"
                             style="color: var(--bk-color-text-secondary)">{{ svc.VcDescription }}</p>
                        }
                        <div class="flex items-center gap-3">
                          <span class="flex items-center gap-1 text-xs"
                                style="color: var(--bk-color-text-muted)">
                            <bk-icon name="calendar" size="sm" />
                            {{ svc.VcTime }}
                          </span>
                          <bk-badge variant="neutral" size="sm">{{ svc.CategoryName }}</bk-badge>
                        </div>
                      </div>

                      <!-- Precio + checkmark -->
                      <div class="flex items-center gap-3 flex-shrink-0">
                        <span class="text-sm font-bold" style="color: var(--bk-color-primary)">
                          {{ formatPrice(svc.IMinimalPrice) }}
                        </span>
                        <div class="select-circle" [class.checked]="isServiceSelected(svc.Id)">
                          @if (isServiceSelected(svc.Id)) {
                            ✓
                          } @else {
                            +
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>

                @if (filteredServices().length === 0) {
                  <div class="flex flex-col items-center py-16">
                    <bk-icon name="search" size="lg" />
                    <p class="text-sm mt-3" style="color: var(--bk-color-text-muted)">
                      No se encontraron servicios.
                    </p>
                  </div>
                }
              </div>
            }

            <!-- ═══════════ STEP 2: PROFESIONAL (per-service) ═══════════ -->
            @if (isStepProfessional()) {
              <div>
                <h2 class="text-xl font-bold mb-1" style="color: var(--bk-color-text-primary)">
                  ¿Tienes preferencia de profesional?
                </h2>
                <p class="text-sm mb-6" style="color: var(--bk-color-text-secondary)">
                  Puedes dejar que asignemos al primero disponible o elegir uno por servicio.
                </p>

                @if (loadingProfessionals()) {
                  <div class="flex items-center gap-3 py-8">
                    <bk-spinner size="md" />
                    <span class="text-sm" style="color: var(--bk-color-text-muted)">Cargando profesionales...</span>
                  </div>
                } @else {
                  <!-- Modo cards -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div class="mode-card flex flex-col items-center text-center"
                         [class.selected]="professionalMode() === 'no-preference'"
                         (click)="setProfessionalMode('no-preference')">
                      <span class="text-3xl mb-3">🎲</span>
                      <p class="text-sm font-semibold" style="color: var(--bk-color-text-primary)">Sin preferencia</p>
                      <p class="text-xs mt-1" style="color: var(--bk-color-text-muted)">Máxima disponibilidad</p>
                    </div>

                    <div class="mode-card flex flex-col items-center text-center"
                         [class.selected]="professionalMode() === 'per-service'"
                         (click)="setProfessionalMode('per-service')">
                      <span class="text-3xl mb-3">👥</span>
                      <p class="text-sm font-semibold" style="color: var(--bk-color-text-primary)">Elegir por servicio</p>
                      <p class="text-xs mt-1" style="color: var(--bk-color-text-muted)">Selecciona quién te atiende</p>
                    </div>
                  </div>

                  <!-- Per-service assignments -->
                  @if (professionalMode() === 'per-service') {
                    <h3 class="text-base font-semibold mb-4" style="color: var(--bk-color-text-primary)">
                      Asignar profesional por servicio
                    </h3>
                    @for (svc of selectedServices(); track svc.Id) {
                      <div class="prof-assign-row">
                        <div class="flex-1 min-w-0 mr-3">
                          <p class="text-sm font-medium truncate" style="color: var(--bk-color-text-primary)">{{ svc.VcName }}</p>
                          <p class="text-xs" style="color: var(--bk-color-text-muted)">{{ svc.VcTime }}</p>
                        </div>
                        <button
                          type="button"
                          class="prof-picker-btn"
                          (click)="openProfessionalModal(svc.Id)">
                          @if (getAssignedProfessional(svc.Id); as prof) {
                            <div class="prof-avatar" style="width: 24px; height: 24px; font-size: 10px;">
                              @if (prof.TxPhoto) {
                                <img [src]="prof.TxPhoto" [alt]="prof.VcFirstName" class="w-full h-full object-cover" />
                              } @else {
                                {{ prof.VcFirstName.charAt(0) }}{{ prof.VcFirstLastName.charAt(0) }}
                              }
                            </div>
                            <span>{{ prof.VcFirstName }} {{ prof.VcFirstLastName }}</span>
                          } @else {
                            <span>Sin preferencia</span>
                          }
                          <bk-icon name="chevron-right" size="sm" style="transform: rotate(90deg); opacity: 0.5" />
                        </button>
                      </div>
                    }
                  }
                }
              </div>
            }

            <!-- ═══════════ STEP 3 (or 2): FECHA Y HORA ═══════════ -->
            @if (isStepTime()) {
              <div>
                <h2 class="text-xl font-bold mb-6" style="color: var(--bk-color-text-primary)">
                  Selecciona fecha y hora
                </h2>

                <!-- Ir a próxima fecha disponible -->
                <div class="mb-4">
                  <bk-button variant="ghost" size="sm" [loading]="loadingNextDate()" (clicked)="goToNextAvailableDateDebounced()">
                    <span class="flex items-center gap-1">
                      <bk-icon name="calendar" size="sm" />
                      Ir a la próxima fecha disponible
                    </span>
                  </bk-button>
                </div>

                <!-- Navegación de semana -->
                <div class="flex items-center justify-between mb-4">
                  <bk-button variant="ghost" size="sm" (clicked)="previousWeek()">
                    <bk-icon name="chevron-right" size="sm" style="transform: rotate(180deg)" />
                  </bk-button>

                  <div class="flex items-center gap-3">
                    <span class="text-sm font-medium" style="color: var(--bk-color-text-secondary)">
                      {{ weekRangeLabel() }}
                    </span>
                    <!-- Botón calendario -->
                    <div class="relative">
                      <bk-button variant="ghost" size="sm" (clicked)="toggleCalendarPopup()">
                        <span class="flex items-center gap-1">
                          <bk-icon name="calendar" size="sm" />
                          <span class="text-xs">Calendario</span>
                        </span>
                      </bk-button>

                      @if (showCalendarPopup()) {
                        <!-- Overlay para cerrar -->
                        <div
                          class="fixed inset-0 z-40"
                          (click)="showCalendarPopup.set(false)">
                        </div>
                        <!-- Popup del calendario -->
                        <div class="calendar-popup" style="z-index: 50">
                          <!-- Cabecera del mes -->
                          <div class="flex items-center justify-between mb-3">
                            <button type="button"
                                    (click)="previousCalMonth(); $event.stopPropagation()"
                                    class="w-8 h-8 rounded flex items-center justify-center transition-colors"
                                    style="background-color: var(--bk-bg-muted)">
                              ‹
                            </button>
                            <span class="text-sm font-semibold" style="color: var(--bk-color-text-primary)">
                              {{ calMonthLabel() }}
                            </span>
                            <button type="button"
                                    (click)="nextCalMonth(); $event.stopPropagation()"
                                    class="w-8 h-8 rounded flex items-center justify-center transition-colors"
                                    style="background-color: var(--bk-bg-muted)">
                              ›
                            </button>
                          </div>

                          <!-- Días de la semana -->
                          <div class="grid grid-cols-7 mb-1">
                            @for (d of calDayHeaders; track d) {
                              <div class="text-center text-xs font-medium pb-1"
                                   style="color: var(--bk-color-text-muted)">{{ d }}</div>
                            }
                          </div>

                          <!-- Días del mes -->
                          <div class="grid grid-cols-7">
                            @for (cell of calendarCells(); track $index) {
                              @if (cell) {
                                <div
                                  class="cal-day"
                                  [class.selected]="selectedDate() === cell.dateStr"
                                  [class.today]="cell.isToday"
                                  [class.disabled]="cell.isPast"
                                  (click)="selectDateFromCalendar(cell.date); $event.stopPropagation()">
                                  {{ cell.day }}
                                </div>
                              } @else {
                                <div></div>
                              }
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <bk-button variant="ghost" size="sm" (clicked)="nextWeek()">
                    <bk-icon name="chevron-right" size="sm" />
                  </bk-button>
                </div>

                <!-- Círculos de días -->
                <div class="mb-8">
                  <bk-day-picker
                    [days]="dayPickerItems()"
                    [selectedDate]="selectedDate()"
                    (dateSelected)="selectDate($event)"
                  />
                </div>

                <!-- Slots de tiempo -->
                @if (!selectedDate()) {
                  <div class="py-12 text-center">
                    <bk-icon name="calendar" size="lg" />
                    <p class="text-sm mt-3" style="color: var(--bk-color-text-muted)">
                      Selecciona un día para ver los horarios disponibles.
                    </p>
                  </div>
                } @else if (loadingSlots()) {
                  <div class="flex items-center gap-3 py-8">
                    <bk-spinner size="md" />
                    <span class="text-sm" style="color: var(--bk-color-text-muted)">Cargando horarios...</span>
                  </div>
                } @else if (availableSlots().length === 0) {
                  <div class="py-12 text-center">
                    <bk-icon name="calendar" size="lg" />
                    <p class="text-sm mt-3" style="color: var(--bk-color-text-muted)">
                      No hay horarios disponibles para este día.
                    </p>
                    <div class="mt-3">
                      <bk-button variant="ghost" size="sm" [loading]="loadingNextDate()" (clicked)="goToNextAvailableDateDebounced()">
                        Buscar próxima fecha disponible
                      </bk-button>
                    </div>
                  </div>
                } @else {
                  <div class="space-y-2 max-w-sm">
                    @for (slot of availableSlots(); track slot) {
                      <div
                        class="time-slot"
                        [class.selected]="selectedTime() === slot"
                        (click)="selectTime(slot)">
                        {{ slot }}
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- ═══════════ STEP 4 (or 3): CONFIRMAR ═══════════ -->
            @if (isStepConfirm()) {
              <div>
                <h2 class="text-xl font-bold mb-6" style="color: var(--bk-color-text-primary)">
                  Revisar y confirmar
                </h2>

                <div class="confirm-form">

                  <!-- Nombre completo -->
                  <bk-form-field label="Nombre completo *">
                    <input
                      type="text"
                      placeholder="Tu nombre completo"
                      [value]="clientName()"
                      (input)="clientName.set($any($event.target).value)"
                      class="w-full px-3 py-2 rounded text-sm outline-none"
                      style="border: 1px solid var(--bk-border-color-default); background-color: var(--bk-bg-surface); color: var(--bk-color-text-primary); border-radius: var(--bk-border-radius-md)" />
                  </bk-form-field>

                  <!-- Correo -->
                  <bk-form-field label="Correo electrónico *" [error]="emailError()">
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      [value]="clientEmail()"
                      (input)="clientEmail.set($any($event.target).value)"
                      (blur)="validateEmail(clientEmail())"
                      class="w-full px-3 py-2 rounded text-sm outline-none"
                      [style.border]="emailError() ? '1px solid var(--bk-color-danger, #ef4444)' : '1px solid var(--bk-border-color-default)'"
                      style="background-color: var(--bk-bg-surface); color: var(--bk-color-text-primary); border-radius: var(--bk-border-radius-md)" />
                  </bk-form-field>

                  <!-- Teléfono -->
                  <bk-form-field label="Teléfono celular *">
                    <div class="flex">
                      <span class="flex items-center px-3 text-sm rounded-l"
                            style="background-color: var(--bk-bg-muted, #f3f4f6); border: 1px solid var(--bk-border-color-default); border-right: none; color: var(--bk-color-text-muted)">
                        +57
                      </span>
                      <input
                        type="tel"
                        placeholder="3001234567"
                        [value]="clientPhone()"
                        (input)="clientPhone.set($any($event.target).value)"
                        class="flex-1 px-3 py-2 text-sm outline-none rounded-r"
                        style="border: 1px solid var(--bk-border-color-default); background-color: var(--bk-bg-surface); color: var(--bk-color-text-primary); border-radius: 0 var(--bk-border-radius-md) var(--bk-border-radius-md) 0" />
                    </div>
                  </bk-form-field>

                  <!-- Notas -->
                  <bk-form-field label="¿Algo que quieras que sepamos?" hint="Opcional">
                    <textarea
                      placeholder="Alergias, preferencias, indicaciones especiales..."
                      [value]="bookingNotes()"
                      (input)="bookingNotes.set($any($event.target).value)"
                      rows="3"
                      class="w-full px-3 py-2 text-sm outline-none resize-none"
                      style="border: 1px solid var(--bk-border-color-default); background-color: var(--bk-bg-surface); color: var(--bk-color-text-primary); border-radius: var(--bk-border-radius-md)">
                    </textarea>
                  </bk-form-field>

                  <!-- Texto legal -->
                  <p class="text-xs leading-relaxed" style="color: var(--bk-color-text-muted)">
                    Al continuar, autorizas que te recordemos tus citas y servicios.
                    Podrás modificar estas preferencias en tu perfil.
                  </p>
                </div>
              </div>
            }

          </div>

          <!-- SIDEBAR (1/3) -->
          <aside class="hidden lg:block">
            <bk-booking-sidebar
              [company]="company()"
              [selectedServices]="selectedServices()"
              [serviceAssignments]="serviceAssignments()"
              [professionalMode]="professionalMode()"
              [selectedDate]="selectedDate()"
              [selectedTime]="selectedTime()"
              [totalDurationLabel]="totalDurationLabel()"
              [canContinue]="canContinue()"
              [loading]="submitting()"
              [buttonLabel]="sidebarButtonLabel()"
              (continued)="onSidebarContinue()" />

            @if (isStepConfirm()) {
              <bk-card [padding]="true" class="mt-4">
                <h4 class="text-sm font-semibold mb-2 flex items-center gap-2"
                    style="color: var(--bk-color-text-primary)">
                  <bk-icon name="calendar" size="sm" />
                  Política de cancelación
                </h4>
                <p class="text-xs leading-relaxed" style="color: var(--bk-color-text-secondary)">
                  Puedes cancelar o modificar tu cita con al menos 24 horas de anticipación
                  sin ningún cargo. Cancelaciones tardías pueden estar sujetas a una tarifa.
                </p>
              </bk-card>
            }
          </aside>

        </div>

        <!-- MOBILE BOTTOM BAR -->
        <div class="fixed bottom-0 left-0 right-0 p-4 lg:hidden z-30"
             style="background-color: var(--bk-bg-surface); border-top: 1px solid var(--bk-border-color-default)">
          <bk-button
            variant="primary"
            size="md"
            [loading]="submitting()"
            [disabled]="!canContinue()"
            (clicked)="onSidebarContinue()"
            style="width: 100%; display: block">
            {{ sidebarButtonLabel() }}
          </bk-button>
        </div>

      </div>

      <!-- ═══════════ PROFESSIONAL SELECTION MODAL ═══════════ -->
      @if (professionalModalServiceId() !== null) {
        <div class="prof-modal-backdrop" (click)="closeProfessionalModal()">
          <div class="prof-modal-content" (click)="$event.stopPropagation()">
            <div class="p-5 pb-3" style="border-bottom: 1px solid var(--bk-border-color-default)">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold" style="color: var(--bk-color-text-primary)">
                  Elegir profesional
                </h3>
                <button type="button"
                        (click)="closeProfessionalModal()"
                        class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        style="background-color: var(--bk-bg-muted, #f3f4f6); color: var(--bk-color-text-muted)">
                  ✕
                </button>
              </div>
              <p class="text-xs mt-1" style="color: var(--bk-color-text-muted)">
                {{ getModalServiceName() }}
              </p>
            </div>

            <!-- Sin preferencia -->
            <div
              class="prof-modal-item"
              [class.selected]="!getAssignedProfessional(professionalModalServiceId()!)"
              (click)="assignProfessional(professionalModalServiceId()!, null)">
              <div class="prof-avatar" style="background-color: var(--bk-bg-muted, #f3f4f6)">
                <span style="font-size: 18px">🎲</span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium" style="color: var(--bk-color-text-primary)">Sin preferencia</p>
                <p class="text-xs" style="color: var(--bk-color-text-muted)">El primero disponible</p>
              </div>
              @if (!getAssignedProfessional(professionalModalServiceId()!)) {
                <div class="select-circle checked" style="width: 24px; height: 24px; font-size: 12px;">✓</div>
              }
            </div>

            <!-- Profesionales -->
            @for (prof of getModalProfessionals(); track prof.Id) {
              <div
                class="prof-modal-item"
                [class.selected]="getAssignedProfessional(professionalModalServiceId()!)?.Id === prof.Id"
                (click)="assignProfessional(professionalModalServiceId()!, prof)">
                <div class="prof-avatar">
                  @if (prof.TxPhoto) {
                    <img [src]="prof.TxPhoto" [alt]="prof.VcFirstName" class="w-full h-full object-cover" />
                  } @else {
                    {{ prof.VcFirstName.charAt(0) }}{{ prof.VcFirstLastName.charAt(0) }}
                  }
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium" style="color: var(--bk-color-text-primary)">
                    {{ prof.VcFirstName }} {{ prof.VcFirstLastName }}
                  </p>
                  <p class="text-xs" style="color: var(--bk-color-text-muted)">
                    {{ prof.VcProfession }}
                  </p>
                </div>
                @if (getAssignedProfessional(professionalModalServiceId()!)?.Id === prof.Id) {
                  <div class="select-circle checked" style="width: 24px; height: 24px; font-size: 12px;">✓</div>
                }
              </div>
            }
          </div>
        </div>
      }
    }
  `,
})
export class PublicBookingPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PublicBookingApiService);

  readonly goToNextAvailableDateDebounced = createDebounced(
    () => this.goToNextAvailableDate(),
    600,
  );

  // ── Shared state signals ─────────────────────────────────────────────────────
  slug = signal('');
  currentStep = signal<1 | 2 | 3 | 4>(1);
  pageLoading = signal(true);
  submitting = signal(false);

  // Data from API
  company = signal<PublicCompany | null>(null);
  services = signal<PublicService[]>([]);
  categories = signal<PublicCategory[]>([]);
  companyConfig = signal<CompanyConfig | null>(null);

  // Step 1 — Services (multi-select)
  selectedServices = signal<PublicService[]>([]);
  searchTerm = signal('');
  selectedCategoryId = signal<number | null>(null);

  // Step 2 — Professionals
  professionalMode = signal<'no-preference' | 'per-service'>('no-preference');
  serviceAssignments = signal<Map<number, ServiceAssignment>>(new Map());
  loadingProfessionals = signal(false);
  professionalModalServiceId = signal<number | null>(null);

  // Step 3 — Time
  currentWeekStart = signal<Date>(getMondayOf(new Date()));
  selectedDate = signal('');
  selectedTime = signal('');
  availableSlots = signal<string[]>([]);
  loadingSlots = signal(false);
  loadingNextDate = signal(false);
  showCalendarPopup = signal(false);
  calendarMonth = signal<Date>(new Date());

  // Step 4 — Confirm
  clientName = signal('');
  clientEmail = signal('');
  clientPhone = signal('');
  bookingNotes = signal('');
  emailError = signal('');

  // Result
  bookingResult = signal<MultiAppointmentResult | null>(null);

  // ── Constants ────────────────────────────────────────────────────────────────
  readonly calDayHeaders = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  // ── Computed signals ─────────────────────────────────────────────────────────

  filteredServices = computed(() => {
    let result = this.services();
    const search = this.searchTerm().toLowerCase().trim();
    const catId = this.selectedCategoryId();
    if (search) result = result.filter(s => s.VcName.toLowerCase().includes(search));
    if (catId !== null) result = result.filter(s => s.CategoryId === catId);
    return result;
  });

  totalPrice = computed(() =>
    this.selectedServices().reduce((sum, s) => sum + s.IMinimalPrice, 0),
  );

  hasMultipleProfessionals = computed(() =>
    (this.companyConfig()?.professionalCount ?? 0) > 1,
  );

  /** Dynamic step definitions based on whether professionals step is shown */
  steps = computed<StepDef[]>(() => {
    if (this.hasMultipleProfessionals()) {
      return [
        { num: 1, label: 'Servicios' },
        { num: 2, label: 'Profesional' },
        { num: 3, label: 'Hora' },
        { num: 4, label: 'Confirmar' },
      ];
    }
    return [
      { num: 1, label: 'Servicios' },
      { num: 2, label: 'Hora' },
      { num: 3, label: 'Confirmar' },
    ];
  });

  /** The last step number */
  lastStep = computed(() => this.steps().length);

  canContinue = computed(() => {
    const step = this.currentStep();
    if (step === 1) {
      return this.selectedServices().length > 0;
    }
    if (this.isStepProfessionalForStep(step)) {
      return true; // default is no-preference, always valid
    }
    if (this.isStepTimeForStep(step)) {
      return !!this.selectedDate() && !!this.selectedTime();
    }
    if (this.isStepConfirmForStep(step)) {
      return (
        !!this.clientName().trim() &&
        !!this.clientEmail().trim() &&
        !!this.clientPhone().trim() &&
        !this.emailError()
      );
    }
    return false;
  });

  availabilityItems = computed(() => {
    return this.selectedServices().map(s => {
      const assignment = this.serviceAssignments().get(s.Id);
      return {
        ServiceId: s.Id,
        ProfessionalId:
          this.professionalMode() === 'per-service'
            ? (assignment?.professional?.Id ?? null)
            : null,
      };
    });
  });

  sidebarButtonLabel = computed(() => {
    if (this.currentStep() === this.lastStep()) {
      return 'Confirmar cita';
    }
    return 'Continuar';
  });

  totalDurationLabel = computed(() => {
    const svcs = this.selectedServices();
    if (!svcs.length) return '';
    let totalMinutes = 0;
    for (const svc of svcs) {
      totalMinutes += this.parseDurationMinutes(svc.VcTime);
    }
    if (totalMinutes <= 0) return '';
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  });

  weekDays = computed<WeekDay[]>(() => this.generateWeekDates(this.currentWeekStart()));

  dayPickerItems = computed<DayPickerItem[]>(() =>
    this.weekDays().map(d => ({
      dateStr: d.dateStr,
      dayName: d.dayName,
      dayNumber: d.date.getDate(),
      isToday: d.isToday,
      isPast: d.isPast,
    }))
  );

  weekRangeLabel = computed(() => {
    const days = this.weekDays();
    if (!days.length) return '';
    const first = days[0].date;
    const last = days[6].date;
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const sameMonth = first.getMonth() === last.getMonth();
    if (sameMonth) {
      return `${first.getDate()} – ${last.getDate()} ${monthNames[last.getMonth()]} ${last.getFullYear()}`;
    }
    return `${first.getDate()} ${monthNames[first.getMonth()]} – ${last.getDate()} ${monthNames[last.getMonth()]} ${last.getFullYear()}`;
  });

  calMonthLabel = computed(() => {
    const d = this.calendarMonth();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  });

  calendarCells = computed(() => {
    const d = this.calendarMonth();
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const cells: Array<{ day: number; date: Date; dateStr: string; isToday: boolean; isPast: boolean } | null> = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      cells.push({
        day,
        date,
        dateStr: toDateStr(date),
        isToday: date.getTime() === today.getTime(),
        isPast: date < today,
      });
    }
    return cells;
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const slug = this.route.snapshot.params['slug'] as string;
    this.slug.set(slug);

    const serviceIdParam = this.route.snapshot.queryParamMap.get('serviceId');
    const preSelectedServiceId = serviceIdParam ? Number(serviceIdParam) : null;

    forkJoin({
      company: this.api.getCompanyBySlug(slug),
      services: this.api.getServices(slug),
      categories: this.api.getCategories(slug),
      config: this.api.getCompanyConfig(slug),
    }).subscribe({
      next: ({ company, services, categories, config }) => {
        this.company.set(company.data);
        this.services.set(services.data);
        this.categories.set(categories.data);
        this.companyConfig.set(config.data);

        if (preSelectedServiceId) {
          const svc = services.data.find(s => s.Id === preSelectedServiceId);
          if (svc) this.selectedServices.set([svc]);
        }

        this.pageLoading.set(false);
      },
      error: () => {
        this.pageLoading.set(false);
      },
    });
  }

  // ── Step identification helpers ──────────────────────────────────────────────

  /** Whether the current step is the Professional selection step */
  isStepProfessional(): boolean {
    return this.hasMultipleProfessionals() && this.currentStep() === 2;
  }

  /** Whether the current step is the Time selection step */
  isStepTime(): boolean {
    return this.isStepTimeForStep(this.currentStep());
  }

  /** Whether the current step is the Confirm step */
  isStepConfirm(): boolean {
    return this.isStepConfirmForStep(this.currentStep());
  }

  private isStepProfessionalForStep(step: number): boolean {
    return this.hasMultipleProfessionals() && step === 2;
  }

  private isStepTimeForStep(step: number): boolean {
    return this.hasMultipleProfessionals() ? step === 3 : step === 2;
  }

  private isStepConfirmForStep(step: number): boolean {
    return this.hasMultipleProfessionals() ? step === 4 : step === 3;
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  onBack(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => (s - 1) as 1 | 2 | 3 | 4);
    } else {
      this.onClose();
    }
  }

  onClose(): void {
    this.router.navigate(['/empresa', this.slug()]);
  }

  onSidebarContinue(): void {
    const step = this.currentStep();
    if (step === this.lastStep()) {
      this.submitBooking();
    } else {
      const nextStep = (step + 1) as 1 | 2 | 3 | 4;
      this.currentStep.set(nextStep);
      this.onStepEnter(nextStep);
    }
  }

  private onStepEnter(step: number): void {
    // When entering the professionals step, load professionals for all selected services
    if (this.isStepProfessionalForStep(step)) {
      this.loadProfessionalsForSelectedServices();
    }
    // When entering the time step, auto-select today and load slots
    if (this.isStepTimeForStep(step)) {
      this.selectedTime.set('');
      this.availableSlots.set([]);
      const todayStr = toDateStr(new Date());
      this.currentWeekStart.set(getMondayOf(new Date()));
      this.selectDate(todayStr);
    }
  }

  // ── Step 1: Services (multi-select) ──────────────────────────────────────────

  isServiceSelected(serviceId: number): boolean {
    return this.selectedServices().some(s => s.Id === serviceId);
  }

  toggleService(service: PublicService): void {
    const current = this.selectedServices();
    const idx = current.findIndex(s => s.Id === service.Id);
    if (idx >= 0) {
      // Remove
      this.selectedServices.set(current.filter(s => s.Id !== service.Id));
      // Clean up assignment
      const assignments = new Map(this.serviceAssignments());
      assignments.delete(service.Id);
      this.serviceAssignments.set(assignments);
    } else {
      // Add
      this.selectedServices.set([...current, service]);
    }
  }

  // ── Step 2: Professionals ────────────────────────────────────────────────────

  setProfessionalMode(mode: 'no-preference' | 'per-service'): void {
    this.professionalMode.set(mode);
  }

  openProfessionalModal(serviceId: number): void {
    this.professionalModalServiceId.set(serviceId);
  }

  closeProfessionalModal(): void {
    this.professionalModalServiceId.set(null);
  }

  getAssignedProfessional(serviceId: number): PublicProfessional | null {
    return this.serviceAssignments().get(serviceId)?.professional ?? null;
  }

  getModalServiceName(): string {
    const id = this.professionalModalServiceId();
    if (id === null) return '';
    return this.selectedServices().find(s => s.Id === id)?.VcName ?? '';
  }

  getModalProfessionals(): PublicProfessional[] {
    const id = this.professionalModalServiceId();
    if (id === null) return [];
    return this.serviceAssignments().get(id)?.options ?? [];
  }

  assignProfessional(serviceId: number, professional: PublicProfessional | null): void {
    const assignments = new Map(this.serviceAssignments());
    const current = assignments.get(serviceId);
    if (current) {
      assignments.set(serviceId, { ...current, professional });
    }

    // Smart pre-selection: if this professional serves other selected services, auto-assign
    if (professional) {
      for (const svc of this.selectedServices()) {
        if (svc.Id === serviceId) continue;
        const a = assignments.get(svc.Id);
        if (a && !a.professional) {
          // Check if this professional is in the options for that service
          if (a.options.some(p => p.Id === professional.Id)) {
            assignments.set(svc.Id, { ...a, professional });
          }
        }
      }
    }

    this.serviceAssignments.set(assignments);
    this.closeProfessionalModal();
  }

  private loadProfessionalsForSelectedServices(): void {
    const svcs = this.selectedServices();
    if (!svcs.length) return;

    this.loadingProfessionals.set(true);
    const slug = this.slug();

    const requests = svcs.map(svc => this.api.getProfessionalsByService(slug, svc.Id));

    forkJoin(requests).subscribe({
      next: (results) => {
        const assignments = new Map<number, ServiceAssignment>();
        results.forEach((res, idx) => {
          const svc = svcs[idx];
          const existing = this.serviceAssignments().get(svc.Id);
          assignments.set(svc.Id, {
            professional: existing?.professional ?? null,
            options: res.data,
          });
        });
        this.serviceAssignments.set(assignments);
        this.loadingProfessionals.set(false);
      },
      error: () => {
        this.loadingProfessionals.set(false);
      },
    });
  }

  // ── Step 3: Time ─────────────────────────────────────────────────────────────

  selectDate(dateStr: string): void {
    this.selectedDate.set(dateStr);
    this.selectedTime.set('');
    this.loadSlots(dateStr);
  }

  selectTime(time: string): void {
    this.selectedTime.set(time);
  }

  previousWeek(): void {
    const d = new Date(this.currentWeekStart());
    d.setDate(d.getDate() - 7);
    this.currentWeekStart.set(d);
  }

  nextWeek(): void {
    const d = new Date(this.currentWeekStart());
    d.setDate(d.getDate() + 7);
    this.currentWeekStart.set(d);
  }

  toggleCalendarPopup(): void {
    this.showCalendarPopup.update(v => !v);
  }

  selectDateFromCalendar(date: Date): void {
    const dateStr = toDateStr(date);
    this.selectDate(dateStr);
    this.currentWeekStart.set(getMondayOf(date));
    this.showCalendarPopup.set(false);
  }

  previousCalMonth(): void {
    const d = new Date(this.calendarMonth());
    d.setMonth(d.getMonth() - 1);
    this.calendarMonth.set(d);
  }

  nextCalMonth(): void {
    const d = new Date(this.calendarMonth());
    d.setMonth(d.getMonth() + 1);
    this.calendarMonth.set(d);
  }

  goToNextAvailableDate(): void {
    this.loadingNextDate.set(true);
    this.api.getNextAvailableDate(this.slug(), this.availabilityItems()).subscribe({
      next: (res) => {
        this.loadingNextDate.set(false);
        if (res.data.date) {
          // Backend sends "YYYY-MM-DD HH:mm:ss" — extract YYYY-MM-DD
          const dateStr = res.data.date.substring(0, 10);
          const [y, m, d] = dateStr.split('-').map(Number);
          const dateObj = new Date(y, m - 1, d);
          this.currentWeekStart.set(getMondayOf(dateObj));
          this.selectDate(dateStr);
        }
      },
      error: () => {
        this.loadingNextDate.set(false);
      },
    });
  }

  private loadSlots(dateStr: string): void {
    this.loadingSlots.set(true);
    this.availableSlots.set([]);

    this.api
      .getMultiAvailability(this.slug(), {
        Date: dateStr,
        Items: this.availabilityItems(),
      })
      .subscribe({
        next: (res) => {
          let slots = res.data;

          // Filter out past time slots if the selected date is today
          const todayStr = toDateStr(new Date());
          if (dateStr === todayStr) {
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            slots = slots.filter(slot => {
              const [h, m] = slot.split(':').map(Number);
              return h * 60 + m > nowMinutes;
            });
          }

          this.availableSlots.set(slots);
          this.loadingSlots.set(false);
        },
        error: () => {
          this.loadingSlots.set(false);
        },
      });
  }

  generateWeekDates(weekStart: Date): WeekDay[] {
    const dayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return {
        date,
        label: date.getDate().toString(),
        dayName: dayNames[i],
        dateStr: toDateStr(date),
        isToday: date.getTime() === today.getTime(),
        isPast: date < today,
      };
    });
  }

  // ── Step 4: Confirm ──────────────────────────────────────────────────────────

  validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      this.emailError.set('El correo es obligatorio');
      return false;
    }
    if (!regex.test(email)) {
      this.emailError.set('El formato del correo no es válido');
      return false;
    }
    this.emailError.set('');
    return true;
  }

  submitBooking(): void {
    if (!this.validateEmail(this.clientEmail())) return;
    if (!this.selectedServices().length) return;

    const dto: CreateMultiAppointmentDto = {
      Date: this.selectedDate(),
      StartTime: this.selectedTime(),
      Items: this.availabilityItems(),
      ClientName: this.clientName().trim(),
      ClientEmail: this.clientEmail().trim(),
      ClientPhone: `+57${this.clientPhone().trim()}`,
      BookingNotes: this.bookingNotes().trim() || undefined,
    };

    this.submitting.set(true);
    this.api.createMultiAppointment(this.slug(), dto).subscribe({
      next: (res) => {
        this.bookingResult.set(res.data);
        this.submitting.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }

  // ── Formatting helpers ───────────────────────────────────────────────────────

  formatPrice(value: number): string {
    return priceFormatter.format(value) + ' COP';
  }

  private parseDurationMinutes(vcTime: string): number {
    // Parses "1h", "30min", "1h 30min", etc.
    let total = 0;
    const hMatch = vcTime.match(/(\d+)\s*h/i);
    const mMatch = vcTime.match(/(\d+)\s*min/i);
    if (hMatch) total += parseInt(hMatch[1], 10) * 60;
    if (mMatch) total += parseInt(mMatch[1], 10);
    return total;
  }
}
