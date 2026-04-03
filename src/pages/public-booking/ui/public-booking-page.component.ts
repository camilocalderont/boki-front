import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import {
  BkCardComponent,
  BkButtonComponent,
  BkSpinnerComponent,
  BkIconComponent,
  BkBadgeComponent,
  BkSearchInputComponent,
  BkFormFieldComponent,
} from '@shared/ui';
import { BookingSidebarComponent } from '@widgets/booking-sidebar';
import { PublicBookingApiService } from '@entities/public-booking';
import type {
  PublicService,
  PublicCategory,
  PublicProfessional,
  PublicCompany,
  PublicAppointment,
  CreatePublicAppointmentDto,
} from '@entities/public-booking';

interface WeekDay {
  date: Date;
  label: string;
  dayName: string;
  dateStr: string;
  isToday: boolean;
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
    BookingSidebarComponent,
    DecimalPipe,
  ],
  styles: [`
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
    .service-card {
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
      border: 2px solid transparent;
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
    .prof-card {
      cursor: pointer;
      border: 2px solid var(--bk-border-color-default);
      border-radius: var(--bk-border-radius-md);
      transition: border-color 0.15s;
      background-color: var(--bk-bg-surface);
    }
    .prof-card:hover {
      border-color: var(--bk-color-primary);
    }
    .prof-card.selected {
      border-color: var(--bk-color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--bk-color-primary) 15%, transparent);
    }
    .day-circle {
      width: 52px;
      height: 64px;
      border-radius: var(--bk-border-radius-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 2px solid var(--bk-border-color-default);
      transition: border-color 0.15s, background-color 0.15s;
      background-color: var(--bk-bg-surface);
      gap: 2px;
    }
    .day-circle:hover {
      border-color: var(--bk-color-primary);
    }
    .day-circle.selected {
      background-color: var(--bk-color-primary);
      border-color: var(--bk-color-primary);
      color: #fff;
    }
    .day-circle.today:not(.selected) {
      border-color: var(--bk-color-primary);
    }
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
  `],
  template: `
    @if (pageLoading()) {
      <div class="flex items-center justify-center min-h-[60vh]">
        <bk-spinner size="lg" />
      </div>
    } @else if (bookingResult(); as result) {

      <!-- SUCCESS STATE -->
      <div class="container mx-auto px-6 py-16 max-w-xl text-center">
        <div class="text-6xl mb-6">🎉</div>
        <h1 class="text-2xl font-bold mb-2" style="color: var(--bk-color-text-primary)">
          ¡Cita agendada!
        </h1>
        <p class="text-sm mb-8" style="color: var(--bk-color-text-secondary)">
          Revisa tu correo para confirmarla. Te enviamos los detalles a
          <strong>{{ clientEmail() }}</strong>.
        </p>

        <bk-card [padding]="true">
          <div class="space-y-3 text-left">
            <div class="flex justify-between">
              <span class="text-sm" style="color: var(--bk-color-text-muted)">Servicio</span>
              <span class="text-sm font-medium" style="color: var(--bk-color-text-primary)">{{ result.Service.VcName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm" style="color: var(--bk-color-text-muted)">Profesional</span>
              <span class="text-sm font-medium" style="color: var(--bk-color-text-primary)">
                {{ result.Professional.VcFirstName }} {{ result.Professional.VcFirstLastName }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm" style="color: var(--bk-color-text-muted)">Fecha</span>
              <span class="text-sm font-medium" style="color: var(--bk-color-text-primary)">{{ result.DtDate }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm" style="color: var(--bk-color-text-muted)">Hora</span>
              <span class="text-sm font-medium" style="color: var(--bk-color-text-primary)">{{ result.TStartTime }}</span>
            </div>
            <div class="flex justify-between pt-2" style="border-top: 1px solid var(--bk-border-color-default)">
              <span class="text-sm" style="color: var(--bk-color-text-muted)">Total</span>
              <span class="text-sm font-bold" style="color: var(--bk-color-primary)">
                {{ '$' + (result.Service.IMinimalPrice | number:'1.0-0') }}
              </span>
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

      <!-- STICKY STEP HEADER -->
      <div class="sticky z-30 flex items-center justify-between px-6 py-3 gap-4"
           style="top: var(--bk-size-header-height, 56px); background-color: var(--bk-bg-surface); border-bottom: 1px solid var(--bk-border-color-default)">

        <!-- Botón atrás -->
        <bk-button variant="ghost" size="sm" (clicked)="onBack()">
          <span class="flex items-center gap-1">
            <bk-icon name="chevron-right" size="sm" style="transform: rotate(180deg)" />
            Atrás
          </span>
        </bk-button>

        <!-- Breadcrumbs -->
        <div class="flex items-center gap-2 flex-1 justify-center overflow-x-auto">
          @for (step of steps; track step.id; let i = $index) {
            @if (i > 0) {
              <bk-icon name="chevron-right" size="sm" style="color: var(--bk-color-text-muted); flex-shrink: 0" />
            }
            <div class="flex items-center gap-2 flex-shrink-0">
              <span
                class="step-circle"
                [class.active]="currentStep() === step.id"
                [class.done]="currentStep() > step.id"
                [class.pending]="currentStep() < step.id">
                @if (currentStep() > step.id) {
                  ✓
                } @else {
                  {{ step.id }}
                }
              </span>
              <span class="text-sm hidden sm:inline"
                    [style.color]="currentStep() === step.id ? 'var(--bk-color-text-primary)' : 'var(--bk-color-text-muted)'"
                    [style.font-weight]="currentStep() === step.id ? '600' : '400'">
                {{ step.label }}
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

      <!-- MAIN LAYOUT -->
      <div class="container mx-auto px-6 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- STEP CONTENT (2/3) -->
          <div class="lg:col-span-2">

            <!-- ============ STEP 1: SERVICIOS ============ -->
            @if (currentStep() === 1) {
              <div>
                <h2 class="text-xl font-bold mb-6" style="color: var(--bk-color-text-primary)">
                  Selecciona un servicio
                </h2>

                <!-- Search + filtros -->
                <div class="mb-4 max-w-md">
                  <bk-search-input
                    placeholder="Buscar servicios..."
                    (searchChange)="searchTerm.set($event)" />
                </div>

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

                <!-- Grid de servicios -->
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  @for (svc of filteredServices(); track svc.Id) {
                    <div
                      class="service-card overflow-hidden"
                      [class.selected]="selectedService()?.Id === svc.Id"
                      (click)="selectService(svc)">

                      <!-- Imagen -->
                      <div class="h-24 flex items-center justify-center overflow-hidden relative"
                           style="background-color: var(--bk-bg-muted, #f3f4f6)">
                        @if (svc.TxPicture) {
                          <img [src]="svc.TxPicture" [alt]="svc.VcName" class="w-full h-full object-cover" />
                        } @else {
                          <span class="text-4xl opacity-30">💅</span>
                        }
                        @if (selectedService()?.Id === svc.Id) {
                          <div class="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                               style="background-color: var(--bk-color-primary)">
                            ✓
                          </div>
                        }
                      </div>

                      <div class="p-4">
                        <!-- Nombre + precio -->
                        <div class="flex justify-between items-start mb-1">
                          <h3 class="font-semibold text-sm leading-tight flex-1 mr-2"
                              style="color: var(--bk-color-text-primary)">{{ svc.VcName }}</h3>
                          <span class="text-sm font-bold shrink-0"
                                style="color: var(--bk-color-primary)">{{ '$' + (svc.IMinimalPrice | number:'1.0-0') }}</span>
                        </div>

                        <div class="mb-2">
                          <bk-badge variant="neutral" size="sm">{{ svc.CategoryName }}</bk-badge>
                        </div>

                        @if (svc.VcDescription) {
                          <p class="text-xs line-clamp-2 mb-3"
                             style="color: var(--bk-color-text-secondary)">{{ svc.VcDescription }}</p>
                        }

                        <div class="flex items-center gap-1 text-xs mt-2"
                             style="color: var(--bk-color-text-muted)">
                          <bk-icon name="calendar" size="sm" />
                          {{ svc.VcTime }}
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

                <!-- Selección de profesional (aparece cuando hay servicio seleccionado) -->
                @if (selectedService()) {
                  <div class="mt-8">
                    <h3 class="text-lg font-bold mb-4" style="color: var(--bk-color-text-primary)">
                      ¿Con quién quieres tu cita?
                    </h3>

                    @if (loadingProfessionals()) {
                      <div class="flex items-center gap-3 py-6">
                        <bk-spinner size="md" />
                        <span class="text-sm" style="color: var(--bk-color-text-muted)">Cargando profesionales...</span>
                      </div>
                    } @else {
                      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">

                        <!-- Cualquier profesional -->
                        <div
                          class="prof-card p-4 flex flex-col items-center text-center"
                          [class.selected]="useRandomProfessional()"
                          (click)="selectRandomProfessional()">
                          <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2"
                               style="background-color: var(--bk-bg-muted, #f3f4f6)">
                            🎲
                          </div>
                          <p class="text-xs font-semibold" style="color: var(--bk-color-text-primary)">
                            Cualquier profesional
                          </p>
                          <p class="text-xs mt-0.5" style="color: var(--bk-color-text-muted)">
                            El primero disponible
                          </p>
                        </div>

                        <!-- Profesionales individuales -->
                        @for (prof of professionals(); track prof.Id) {
                          <div
                            class="prof-card p-4 flex flex-col items-center text-center"
                            [class.selected]="selectedProfessional()?.Id === prof.Id"
                            (click)="selectProfessional(prof)">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2 overflow-hidden"
                                 style="background-color: var(--bk-color-primary)">
                              @if (prof.TxPhoto) {
                                <img [src]="prof.TxPhoto" [alt]="prof.VcFirstName" class="w-full h-full object-cover" />
                              } @else {
                                {{ prof.VcFirstName.charAt(0) }}{{ prof.VcFirstLastName.charAt(0) }}
                              }
                            </div>
                            <p class="text-xs font-semibold leading-tight" style="color: var(--bk-color-text-primary)">
                              {{ prof.VcFirstName }} {{ prof.VcFirstLastName }}
                            </p>
                            <p class="text-xs mt-0.5" style="color: var(--bk-color-text-muted)">
                              {{ prof.VcProfession }}
                            </p>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- ============ STEP 2: HORA ============ -->
            @if (currentStep() === 2) {
              <div>
                <h2 class="text-xl font-bold mb-6" style="color: var(--bk-color-text-primary)">
                  Selecciona fecha y hora
                </h2>

                <!-- Navegación de semana -->
                <div class="flex items-center justify-between mb-4">
                  <bk-button variant="ghost" size="sm" (clicked)="previousWeek()">
                    <bk-icon name="chevron-right" size="sm" style="transform: rotate(180deg)" />
                  </bk-button>

                  <div class="flex items-center gap-3">
                    <!-- Semana label -->
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
                            @for (d of ['Lu','Ma','Mi','Ju','Vi','Sá','Do']; track d) {
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
                <div class="flex gap-2 mb-8 overflow-x-auto pb-1">
                  @for (day of weekDays(); track day.dateStr) {
                    <div
                      class="day-circle"
                      [class.selected]="selectedDate() === day.dateStr"
                      [class.today]="day.isToday"
                      (click)="selectDate(day.dateStr)">
                      <span class="text-xs"
                            [style.color]="selectedDate() === day.dateStr ? '#fff' : 'var(--bk-color-text-muted)'">
                        {{ day.dayName }}
                      </span>
                      <span class="text-sm font-semibold"
                            [style.color]="selectedDate() === day.dateStr ? '#fff' : 'var(--bk-color-text-primary)'">
                        {{ day.label }}
                      </span>
                    </div>
                  }
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

            <!-- ============ STEP 3: CONFIRMAR ============ -->
            @if (currentStep() === 3) {
              <div>
                <h2 class="text-xl font-bold mb-6" style="color: var(--bk-color-text-primary)">
                  Revisar y confirmar
                </h2>

                <div class="max-w-md space-y-4">

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

                  <!-- Política de cancelación -->
                  <bk-card [padding]="true">
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
                </div>
              </div>
            }

          </div>

          <!-- SIDEBAR (1/3) -->
          <aside class="hidden lg:block">
            <bk-booking-sidebar
              [company]="company()"
              [selectedService]="selectedService()"
              [selectedProfessional]="selectedProfessional()"
              [selectedDate]="selectedDate()"
              [selectedTime]="selectedTime()"
              [canContinue]="canContinueSidebar()"
              [loading]="submitting()"
              [buttonLabel]="currentStep() === 3 ? 'Confirmar cita' : 'Continuar'"
              (continued)="onSidebarContinue()" />
          </aside>

        </div>

        <!-- MOBILE BOTTOM BAR -->
        <div class="fixed bottom-0 left-0 right-0 p-4 lg:hidden z-30"
             style="background-color: var(--bk-bg-surface); border-top: 1px solid var(--bk-border-color-default)">
          <bk-button
            variant="primary"
            size="md"
            [loading]="submitting()"
            [disabled]="!canContinueSidebar()"
            (clicked)="onSidebarContinue()"
            style="width: 100%; display: block">
            {{ currentStep() === 3 ? 'Confirmar cita' : 'Continuar' }}
          </bk-button>
        </div>

      </div>
    }
  `,
})
export class PublicBookingPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PublicBookingApiService);

  // Loading
  pageLoading = signal(true);

  // Route
  slug = signal('');

  // Company
  company = signal<PublicCompany | null>(null);

  // Step
  currentStep = signal<1 | 2 | 3>(1);

  // Step 1 — Servicios
  services = signal<PublicService[]>([]);
  categories = signal<PublicCategory[]>([]);
  selectedService = signal<PublicService | null>(null);
  searchTerm = signal('');
  selectedCategoryId = signal<number | null>(null);

  // Profesionales
  professionals = signal<PublicProfessional[]>([]);
  selectedProfessional = signal<PublicProfessional | null>(null);
  useRandomProfessional = signal(false);
  loadingProfessionals = signal(false);

  // Step 2 — Hora
  selectedDate = signal('');
  availableSlots = signal<string[]>([]);
  selectedTime = signal('');
  loadingSlots = signal(false);
  currentWeekStart = signal<Date>(this.getMondayOfCurrentWeek());
  showCalendarPopup = signal(false);
  calendarMonth = signal<Date>(new Date());

  // Step 3 — Confirmar
  clientName = signal('');
  clientEmail = signal('');
  clientPhone = signal('');
  bookingNotes = signal('');
  submitting = signal(false);
  emailError = signal('');

  // Resultado
  bookingResult = signal<PublicAppointment | null>(null);

  // Pasos del breadcrumb
  readonly steps = [
    { id: 1, label: 'Servicios' },
    { id: 2, label: 'Hora' },
    { id: 3, label: 'Confirmar' },
  ];

  // Computed
  filteredServices = computed(() => {
    let result = this.services();
    const search = this.searchTerm().toLowerCase().trim();
    const catId = this.selectedCategoryId();
    if (search) result = result.filter(s => s.VcName.toLowerCase().includes(search));
    if (catId !== null) result = result.filter(s => s.CategoryId === catId);
    return result;
  });

  weekDays = computed<WeekDay[]>(() => this.generateWeekDates(this.currentWeekStart()));

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

    // Monday-first: Monday=0 … Sunday=6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const cells: Array<{ day: number; date: Date; dateStr: string; isToday: boolean; isPast: boolean } | null> = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      cells.push({
        day,
        date,
        dateStr: this.toDateStr(date),
        isToday: date.getTime() === today.getTime(),
        isPast: date < today,
      });
    }
    return cells;
  });

  canContinueSidebar = computed(() => {
    const step = this.currentStep();
    if (step === 1) {
      return this.selectedService() !== null && (this.selectedProfessional() !== null || this.useRandomProfessional());
    }
    if (step === 2) {
      return !!this.selectedDate() && !!this.selectedTime();
    }
    if (step === 3) {
      return !!this.clientName().trim() && !!this.clientEmail().trim() && !!this.clientPhone().trim() && !this.emailError();
    }
    return false;
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.params['slug'] as string;
    this.slug.set(slug);

    const serviceIdParam = this.route.snapshot.queryParamMap.get('serviceId');
    const preSelectedServiceId = serviceIdParam ? Number(serviceIdParam) : null;

    forkJoin({
      company: this.api.getCompanyBySlug(slug),
      services: this.api.getServices(slug),
      categories: this.api.getCategories(slug),
    }).subscribe({
      next: ({ company, services, categories }) => {
        this.company.set(company.data);
        this.services.set(services.data);
        this.categories.set(categories.data);

        if (preSelectedServiceId) {
          const svc = services.data.find(s => s.Id === preSelectedServiceId);
          if (svc) this.selectService(svc);
        }

        this.pageLoading.set(false);
      },
      error: () => {
        this.pageLoading.set(false);
      },
    });
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  onBack(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => (s - 1) as 1 | 2 | 3);
    } else {
      this.onClose();
    }
  }

  onClose(): void {
    this.router.navigate(['/empresa', this.slug()]);
  }

  goToStep(step: 1 | 2 | 3): void {
    this.currentStep.set(step);
  }

  onSidebarContinue(): void {
    if (this.currentStep() === 3) {
      this.submitBooking();
    } else {
      this.currentStep.update(s => (s + 1) as 1 | 2 | 3);
    }
  }

  // ── Step 1 ───────────────────────────────────────────────────────────────────

  selectService(service: PublicService): void {
    this.selectedService.set(service);
    this.selectedProfessional.set(null);
    this.useRandomProfessional.set(false);
    this.loadingProfessionals.set(true);
    this.professionals.set([]);

    this.api.getProfessionalsByService(this.slug(), service.Id).subscribe({
      next: (res) => {
        this.professionals.set(res.data);
        this.loadingProfessionals.set(false);
      },
      error: () => {
        this.loadingProfessionals.set(false);
      },
    });
  }

  selectProfessional(prof: PublicProfessional): void {
    this.selectedProfessional.set(prof);
    this.useRandomProfessional.set(false);
  }

  selectRandomProfessional(): void {
    this.useRandomProfessional.set(true);
    this.selectedProfessional.set(null);
  }

  // ── Step 2 ───────────────────────────────────────────────────────────────────

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
    const dateStr = this.toDateStr(date);
    this.selectDate(dateStr);
    // Actualizar la semana para que el día seleccionado sea visible
    this.currentWeekStart.set(this.getMondayOf(date));
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
        dateStr: this.toDateStr(date),
        isToday: date.getTime() === today.getTime(),
      };
    });
  }

  // ── Step 3 ───────────────────────────────────────────────────────────────────

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

    const service = this.selectedService();
    const prof = this.selectedProfessional();
    if (!service) return;

    // Separar nombre en first/last para el DTO
    const nameParts = this.clientName().trim().split(' ');
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const dto: CreatePublicAppointmentDto = {
      ServiceId: service.Id,
      ProfessionalId: prof?.Id,
      DtDate: this.selectedDate(),
      TStartTime: this.selectedTime(),
      ClientFirstName: firstName,
      ClientLastName: lastName,
      ClientEmail: this.clientEmail(),
      ClientPhone: `+57${this.clientPhone()}`,
      VcBookingNotes: this.bookingNotes() || undefined,
    };

    this.submitting.set(true);
    this.api.createAppointment(this.slug(), dto).subscribe({
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

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private loadSlots(dateStr: string): void {
    this.loadingSlots.set(true);
    this.availableSlots.set([]);
    const prof = this.selectedProfessional();

    this.api.getAvailability(this.slug(), dateStr, prof?.Id).subscribe({
      next: (res) => {
        this.availableSlots.set(res.data);
        this.loadingSlots.set(false);
      },
      error: () => {
        this.loadingSlots.set(false);
      },
    });
  }

  private getMondayOfCurrentWeek(): Date {
    return this.getMondayOf(new Date());
  }

  private getMondayOf(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  }

  private toDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
