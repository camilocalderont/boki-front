import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  signal,
  computed,
  effect,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  BkModalComponent,
  BkButtonComponent,
  BkCardComponent,
  BkFormFieldComponent,
  BkSpinnerComponent,
  BkIconComponent,
  BkBadgeComponent,
  BkDayPickerComponent,
} from '@shared/ui';
import type { DayPickerItem } from '@shared/ui';
import { PublicBookingApiService } from '@entities/public-booking';
import type {
  PublicService,
  PublicProfessional,
  CreatePublicAppointmentDto,
  PublicAppointment,
} from '@entities/public-booking';

@Component({
  selector: 'bk-booking-wizard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BkModalComponent,
    BkButtonComponent,
    BkCardComponent,
    BkFormFieldComponent,
    BkSpinnerComponent,
    BkIconComponent,
    BkBadgeComponent,
    BkDayPickerComponent,
    DecimalPipe,
  ],
  template: `
    <bk-modal [open]="isOpen()" title="" size="xl" [closeable]="true" (closed)="onClose()">

      <!-- Stepper header (sticky dentro del body del modal) -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b"
           style="border-color: var(--bk-border-color-default)">

        <!-- Botón Atrás -->
        <bk-button variant="ghost" size="sm" (clicked)="onBack()">
          ← Atrás
        </bk-button>

        <!-- Indicador de pasos -->
        <div class="flex items-center gap-2">
          @for (step of steps; track step.number) {
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                   [style.background-color]="currentStep() >= step.number ? 'var(--bk-color-primary)' : 'var(--bk-bg-page)'"
                   [style.color]="currentStep() >= step.number ? 'white' : 'var(--bk-color-text-muted)'">
                {{ step.number }}
              </div>
              <span class="text-xs font-medium hidden sm:inline transition-colors"
                    [style.color]="currentStep() >= step.number ? 'var(--bk-color-primary)' : 'var(--bk-color-text-muted)'">
                {{ step.label }}
              </span>
              @if (step.number < 3) {
                <div class="w-8 h-0.5 transition-colors"
                     [style.background-color]="currentStep() > step.number ? 'var(--bk-color-primary)' : 'var(--bk-border-color-default)'"></div>
              }
            </div>
          }
        </div>

        <!-- Spacer para alinear el stepper al centro -->
        <div class="w-16"></div>
      </div>

      <!-- Área de contenido en grilla -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Contenido principal (2/3) -->
        <div class="lg:col-span-2">

          <!-- PASO 1: Selección de profesional -->
          @if (currentStep() === 1) {
            <h2 class="text-lg font-bold mb-4" style="color: var(--bk-color-text-primary)">
              Seleccionar profesional
            </h2>

            @if (loadingProfessionals()) {
              <div class="flex justify-center py-8">
                <bk-spinner size="lg" />
              </div>
            } @else {
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">

                <!-- Opción "Cualquier profesional" -->
                <bk-card [hoverable]="true" [padding]="false" (click)="selectRandomProfessional()"
                         class="cursor-pointer"
                         [style.border-color]="useRandomProfessional() ? 'var(--bk-color-primary)' : 'transparent'"
                         [style.outline]="useRandomProfessional() ? '2px solid var(--bk-color-primary)' : 'none'"
                         style="border-radius: var(--bk-border-radius-lg, 12px)">
                  <div class="p-4 text-center">
                    <div class="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 text-xl"
                         style="background-color: var(--bk-bg-page)">
                      🔀
                    </div>
                    <p class="text-sm font-semibold" style="color: var(--bk-color-text-primary)">Cualquier profesional</p>
                    <p class="text-xs" style="color: var(--bk-color-text-muted)">Máxima disponibilidad</p>
                  </div>
                </bk-card>

                <!-- Profesionales individuales -->
                @for (prof of professionals(); track prof.Id) {
                  <bk-card [hoverable]="true" [padding]="false" (click)="selectProfessional(prof)"
                           class="cursor-pointer"
                           [style.border-color]="selectedProfessional()?.Id === prof.Id ? 'var(--bk-color-primary)' : 'transparent'"
                           [style.outline]="selectedProfessional()?.Id === prof.Id ? '2px solid var(--bk-color-primary)' : 'none'"
                           style="border-radius: var(--bk-border-radius-lg, 12px)">
                    <div class="p-4 text-center">
                      <div class="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold mb-2 overflow-hidden"
                           style="background-color: var(--bk-color-primary)">
                        @if (prof.TxPhoto) {
                          <img [src]="prof.TxPhoto" [alt]="prof.VcFirstName" class="w-full h-full object-cover" />
                        } @else {
                          {{ prof.VcFirstName.charAt(0) }}{{ prof.VcFirstLastName.charAt(0) }}
                        }
                      </div>
                      <p class="text-sm font-semibold" style="color: var(--bk-color-text-primary)">
                        {{ prof.VcFirstName }} {{ prof.VcFirstLastName }}
                      </p>
                      <p class="text-xs" style="color: var(--bk-color-text-muted)">{{ prof.VcProfession }}</p>
                    </div>
                  </bk-card>
                }
              </div>
            }

            <div class="mt-6 flex justify-end">
              <bk-button variant="primary" [disabled]="!canProceedToStep2()" (clicked)="goToStep(2)">
                Continuar
              </bk-button>
            </div>
          }

          <!-- PASO 2: Selección de fecha y hora -->
          @if (currentStep() === 2) {
            <h2 class="text-lg font-bold mb-4" style="color: var(--bk-color-text-primary)">
              Seleccionar fecha
            </h2>

            <!-- Calendario semanal -->
            <bk-card [padding]="false" class="mb-6">
              <div class="p-4">
                <div class="flex items-center justify-between mb-4">
                  <bk-button variant="ghost" size="sm" (clicked)="previousWeek()">◀</bk-button>
                  <span class="font-semibold text-sm" style="color: var(--bk-color-text-primary)">
                    {{ monthYearLabel() }}
                  </span>
                  <bk-button variant="ghost" size="sm" (clicked)="nextWeek()">▶</bk-button>
                </div>

                <bk-day-picker
                  [days]="dayPickerItems()"
                  [selectedDate]="selectedDate()"
                  (dateSelected)="selectDate($event)"
                />
              </div>
            </bk-card>

            <!-- Franjas horarias -->
            @if (selectedDate()) {
              <!-- Tabs de periodo del día -->
              <div class="flex gap-2 mb-4">
                @for (period of timePeriods; track period.id) {
                  <button (click)="timeOfDay.set(period.id)"
                          class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                          [style.background-color]="timeOfDay() === period.id ? 'var(--bk-color-primary)' : 'var(--bk-bg-page)'"
                          [style.color]="timeOfDay() === period.id ? 'white' : 'var(--bk-color-text-primary)'"
                          [style.border]="'none'"
                          style="cursor: pointer">
                    {{ period.icon }} {{ period.label }}
                  </button>
                }
              </div>

              @if (loadingSlots()) {
                <div class="flex justify-center py-8">
                  <bk-spinner size="lg" />
                </div>
              } @else if (filteredSlots().length === 0) {
                <p class="text-center py-8 text-sm" style="color: var(--bk-color-text-muted)">
                  No hay horarios disponibles en este período.
                </p>
              } @else {
                <div class="grid grid-cols-4 md:grid-cols-6 gap-2">
                  @for (slot of filteredSlots(); track slot) {
                    <button (click)="selectedTime.set(slot)"
                            class="py-2 rounded-lg text-sm font-medium border transition-colors"
                            [style.background-color]="selectedTime() === slot ? 'var(--bk-color-primary)' : 'var(--bk-bg-surface)'"
                            [style.border-color]="selectedTime() === slot ? 'var(--bk-color-primary)' : 'var(--bk-border-color-default)'"
                            [style.color]="selectedTime() === slot ? 'white' : 'var(--bk-color-text-primary)'"
                            style="cursor: pointer">
                      {{ slot }}
                    </button>
                  }
                </div>
              }
            }

            <div class="mt-6 flex justify-end">
              <bk-button variant="primary" [disabled]="!canProceedToStep3()" (clicked)="goToStep(3)">
                Continuar
              </bk-button>
            </div>
          }

          <!-- PASO 3: Datos del cliente + Confirmar -->
          @if (currentStep() === 3 && !showConfirmation()) {
            <h2 class="text-lg font-bold mb-4" style="color: var(--bk-color-text-primary)">
              Tus datos
            </h2>

            <div class="space-y-4 max-w-md">
              <!-- Nombre completo -->
              <bk-form-field label="Nombre completo *">
                <div class="flex gap-2">
                  <input type="text"
                         placeholder="Nombre"
                         class="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                         style="background-color: var(--bk-bg-surface); border-color: var(--bk-border-color-default); color: var(--bk-color-text-primary)"
                         [value]="clientFirstName()"
                         (input)="clientFirstName.set($any($event.target).value)" />
                  <input type="text"
                         placeholder="Apellido"
                         class="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                         style="background-color: var(--bk-bg-surface); border-color: var(--bk-border-color-default); color: var(--bk-color-text-primary)"
                         [value]="clientLastName()"
                         (input)="clientLastName.set($any($event.target).value)" />
                </div>
              </bk-form-field>

              <!-- Correo electrónico -->
              <bk-form-field label="Correo electrónico *">
                <input type="email"
                       placeholder="correo@ejemplo.com"
                       class="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                       style="background-color: var(--bk-bg-surface); border-color: var(--bk-border-color-default); color: var(--bk-color-text-primary)"
                       [value]="clientEmail()"
                       (input)="clientEmail.set($any($event.target).value)" />
              </bk-form-field>

              <!-- Teléfono celular -->
              <bk-form-field label="Teléfono celular *">
                <div class="flex gap-2">
                  <span class="flex items-center px-3 py-2 rounded-lg border text-sm"
                        style="background-color: var(--bk-bg-page); border-color: var(--bk-border-color-default); color: var(--bk-color-text-secondary)">
                    🇨🇴 +57
                  </span>
                  <input type="tel"
                         placeholder="3001234567"
                         class="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                         style="background-color: var(--bk-bg-surface); border-color: var(--bk-border-color-default); color: var(--bk-color-text-primary)"
                         [value]="clientPhone()"
                         (input)="clientPhone.set($any($event.target).value)" />
                </div>
              </bk-form-field>

              <!-- Nota de reserva -->
              <bk-form-field label="Nota de reserva (opcional)">
                <textarea rows="2"
                          placeholder="Alguna indicación especial..."
                          class="w-full px-3 py-2 rounded-lg border text-sm resize-none outline-none"
                          style="background-color: var(--bk-bg-surface); border-color: var(--bk-border-color-default); color: var(--bk-color-text-primary)"
                          [value]="bookingNotes()"
                          (input)="bookingNotes.set($any($event.target).value)"></textarea>
              </bk-form-field>
            </div>

            <div class="mt-6 flex justify-end">
              <bk-button variant="primary"
                         [loading]="submitting()"
                         [disabled]="!canSubmit()"
                         (clicked)="submitBooking()">
                Confirmar
              </bk-button>
            </div>
          }

          <!-- VISTA DE CONFIRMACIÓN (tras reserva exitosa) -->
          @if (showConfirmation() && bookingResult(); as result) {
            <div class="text-center py-6">
              <span class="text-5xl">✅</span>
              <h2 class="text-2xl font-bold mt-4 mb-2" style="color: var(--bk-color-text-primary)">
                ¡RESERVADO!
              </h2>

              <bk-card [padding]="false" class="mt-6 max-w-md mx-auto">
                <div class="p-4 text-left">
                  <p class="text-sm" style="color: var(--bk-color-text-muted)">A nombre de</p>
                  <p class="font-semibold" style="color: var(--bk-color-text-primary)">
                    {{ result.Client.VcFirstName }} {{ result.Client.VcFirstLastName }}
                  </p>

                  <div class="flex gap-6 mt-3">
                    <div>
                      <p class="text-xs" style="color: var(--bk-color-text-muted)">Desde</p>
                      <p class="text-lg font-bold" style="color: var(--bk-color-text-primary)">
                        {{ result.TStartTime?.substring(0, 5) }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs" style="color: var(--bk-color-text-muted)">Hasta</p>
                      <p class="text-lg font-bold" style="color: var(--bk-color-text-primary)">
                        {{ result.TEndTime?.substring(0, 5) }}
                      </p>
                    </div>
                  </div>

                  <div class="mt-4 pt-4 border-t" style="border-color: var(--bk-border-color-default)">
                    <p class="font-semibold text-sm" style="color: var(--bk-color-text-primary)">
                      {{ result.Service.VcName }}
                    </p>
                    <p class="text-xs" style="color: var(--bk-color-text-muted)">
                      Colaborador: {{ result.Professional.VcFirstName }} {{ result.Professional.VcFirstLastName }}
                    </p>
                    <p class="text-xs" style="color: var(--bk-color-text-muted)">
                      {{ result.Service.VcTime }} · {{ '$' + (result.Service.IMinimalPrice | number:'1.0-0') }}
                    </p>
                  </div>
                </div>
              </bk-card>

              <div class="flex flex-col gap-2 mt-6 max-w-md mx-auto">
                <bk-button variant="ghost" (clicked)="addToCalendar()">
                  📅 Añadir al calendario
                </bk-button>
                <bk-button variant="primary" (clicked)="onClose()">
                  Ir al inicio
                </bk-button>
              </div>
            </div>
          }
        </div>

        <!-- SIDEBAR: Resumen -->
        <aside class="hidden lg:block">
          <bk-card>
            <h3 class="font-bold text-sm mb-4" style="color: var(--bk-color-text-primary)">Resumen</h3>

            @if (selectedDate()) {
              <p class="text-xs mb-4" style="color: var(--bk-color-text-muted)">{{ formatDate(selectedDate()) }}</p>
            }

            <bk-card [padding]="false" class="mb-3">
              <div class="p-3">
                <p class="font-semibold text-sm" style="color: var(--bk-color-text-primary)">
                  {{ selectedService().VcName }}
                </p>
                @if (selectedProfessional(); as prof) {
                  <p class="text-xs mt-1" style="color: var(--bk-color-text-muted)">
                    Colaborador: {{ prof.VcFirstName }} {{ prof.VcFirstLastName }}
                  </p>
                } @else if (useRandomProfessional()) {
                  <p class="text-xs mt-1" style="color: var(--bk-color-text-muted)">
                    Colaborador: Cualquier profesional
                  </p>
                }
                <div class="flex justify-between mt-2">
                  <span class="text-xs" style="color: var(--bk-color-text-muted)">{{ selectedService().VcTime }}</span>
                  @if (selectedTime()) {
                    <span class="text-xs" style="color: var(--bk-color-text-muted)">{{ selectedTime() }}</span>
                  }
                </div>
                <p class="text-right font-bold text-sm mt-1" style="color: var(--bk-color-primary)">
                  {{ '$' + (selectedService().IMinimalPrice | number:'1.0-0') }}
                </p>
              </div>
            </bk-card>

            <div class="flex justify-between pt-3 border-t" style="border-color: var(--bk-border-color-default)">
              <span class="text-sm font-medium" style="color: var(--bk-color-text-primary)">Total</span>
              <span class="text-sm font-bold" style="color: var(--bk-color-text-primary)">
                {{ '$' + (selectedService().IMinimalPrice | number:'1.0-0') }}
              </span>
            </div>
          </bk-card>
        </aside>
      </div>
    </bk-modal>
  `,
})
export class BookingWizardComponent {
  // --- Inputs ---
  slug = input.required<string>();
  selectedService = input.required<PublicService>();
  isOpen = input<boolean>(false);

  // --- Outputs ---
  closed = output<void>();
  booked = output<PublicAppointment>();

  // --- Dependencias ---
  private readonly api = inject(PublicBookingApiService);

  // --- Estado interno ---
  currentStep = signal<1 | 2 | 3>(1);
  professionals = signal<PublicProfessional[]>([]);
  selectedProfessional = signal<PublicProfessional | null>(null);
  useRandomProfessional = signal(false);
  selectedDate = signal<string>('');
  availableSlots = signal<string[]>([]);
  selectedTime = signal<string>('');
  loadingSlots = signal(false);
  loadingProfessionals = signal(false);
  submitting = signal(false);

  // --- Formulario cliente ---
  clientFirstName = signal('');
  clientLastName = signal('');
  clientEmail = signal('');
  clientPhone = signal('');
  bookingNotes = signal('');

  // --- Post-reserva ---
  bookingResult = signal<PublicAppointment | null>(null);
  showConfirmation = signal(false);

  // --- Calendario ---
  currentWeekStart = signal<Date>(new Date());
  timeOfDay = signal<'morning' | 'afternoon' | 'night'>('morning');

  // --- Computed ---
  weekDates = computed(() => this.generateWeekDates(this.currentWeekStart()));

  monthYearLabel = computed(() => {
    const start = this.currentWeekStart();
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return `${months[start.getMonth()]} ${start.getFullYear()}`;
  });

  dayPickerItems = computed<DayPickerItem[]>(() =>
    this.weekDates().map(d => ({
      dateStr: d.dateStr,
      dayName: d.dayName,
      dayNumber: d.dayNumber,
      isPast: d.isPast,
    }))
  );

  filteredSlots = computed(() => {
    const slots = this.availableSlots();
    const period = this.timeOfDay();
    return slots.filter(slot => {
      const hour = parseInt(slot.split(':')[0], 10);
      if (period === 'morning') return hour >= 6 && hour < 12;
      if (period === 'afternoon') return hour >= 12 && hour < 18;
      return hour >= 18;
    });
  });

  canProceedToStep2 = computed(() => !!this.selectedProfessional() || this.useRandomProfessional());
  canProceedToStep3 = computed(() => !!this.selectedDate() && !!this.selectedTime());
  canSubmit = computed(() =>
    this.clientFirstName().trim() !== '' &&
    this.clientLastName().trim() !== '' &&
    this.clientEmail().trim() !== '' &&
    this.clientPhone().trim() !== ''
  );

  // --- Constantes ---
  readonly steps = [
    { number: 1, label: 'Servicios' },
    { number: 2, label: 'Detalles' },
    { number: 3, label: 'Confirmar' },
  ];

  readonly timePeriods: { id: 'morning' | 'afternoon' | 'night'; label: string; icon: string }[] = [
    { id: 'morning', label: 'Mañana', icon: '🌅' },
    { id: 'afternoon', label: 'Tarde', icon: '☀️' },
    { id: 'night', label: 'Noche', icon: '🌙' },
  ];

  constructor() {
    // Inicializar al lunes de la semana actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    this.currentWeekStart.set(today);

    // Cargar profesionales cuando se abre el wizard con un servicio
    effect(() => {
      const service = this.selectedService();
      const slug = this.slug();
      if (service && slug && this.isOpen()) {
        this.loadProfessionals(slug, service.Id);
      }
    });

    // Cargar disponibilidad cuando cambia la fecha
    effect(() => {
      const date = this.selectedDate();
      const slug = this.slug();
      if (date && slug) {
        this.loadAvailability(slug, date);
      }
    });
  }

  // --- Métodos privados ---
  private loadProfessionals(slug: string, serviceId: number): void {
    this.loadingProfessionals.set(true);
    this.api.getProfessionalsByService(slug, serviceId).subscribe({
      next: (res) => {
        this.professionals.set(res.data);
        this.loadingProfessionals.set(false);
      },
      error: () => {
        this.loadingProfessionals.set(false);
      },
    });
  }

  private loadAvailability(slug: string, date: string): void {
    this.loadingSlots.set(true);
    this.selectedTime.set('');
    const profId = this.useRandomProfessional() ? undefined : (this.selectedProfessional()?.Id ?? undefined);
    this.api.getAvailability(slug, date, profId).subscribe({
      next: (res) => {
        this.availableSlots.set(res.data);
        this.loadingSlots.set(false);
      },
      error: () => {
        this.loadingSlots.set(false);
        this.availableSlots.set([]);
      },
    });
  }

  generateWeekDates(weekStart: Date): { dayName: string; dayNumber: number; dateStr: string; isPast: boolean }[] {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      return {
        dayName: days[i],
        dayNumber: date.getDate(),
        dateStr,
        isPast: date < today,
      };
    });
  }

  // --- Métodos públicos ---
  selectProfessional(prof: PublicProfessional): void {
    this.selectedProfessional.set(prof);
    this.useRandomProfessional.set(false);
  }

  selectRandomProfessional(): void {
    this.selectedProfessional.set(null);
    this.useRandomProfessional.set(true);
  }

  selectDate(dateStr: string): void {
    this.selectedDate.set(dateStr);
  }

  goToStep(step: 1 | 2 | 3): void {
    this.currentStep.set(step);
  }

  previousWeek(): void {
    const current = this.currentWeekStart();
    const prev = new Date(current);
    prev.setDate(current.getDate() - 7);
    this.currentWeekStart.set(prev);
  }

  nextWeek(): void {
    const current = this.currentWeekStart();
    const next = new Date(current);
    next.setDate(current.getDate() + 7);
    this.currentWeekStart.set(next);
  }

  onBack(): void {
    if (this.showConfirmation()) {
      this.onClose();
      return;
    }
    if (this.currentStep() > 1) {
      this.currentStep.update(s => (s - 1) as 1 | 2 | 3);
    } else {
      this.onClose();
    }
  }

  onClose(): void {
    this.closed.emit();
    this.resetState();
  }

  submitBooking(): void {
    this.submitting.set(true);
    const dto: CreatePublicAppointmentDto = {
      ServiceId: this.selectedService().Id,
      ProfessionalId: this.useRandomProfessional() ? undefined : (this.selectedProfessional()?.Id ?? undefined),
      DtDate: this.selectedDate(),
      TStartTime: this.selectedTime(),
      ClientFirstName: this.clientFirstName(),
      ClientLastName: this.clientLastName(),
      ClientEmail: this.clientEmail(),
      ClientPhone: this.clientPhone(),
      VcBookingNotes: this.bookingNotes() || undefined,
    };

    this.api.createAppointment(this.slug(), dto).subscribe({
      next: (res) => {
        this.bookingResult.set(res.data);
        this.showConfirmation.set(true);
        this.submitting.set(false);
        this.booked.emit(res.data);
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }

  addToCalendar(): void {
    const result = this.bookingResult();
    if (!result) return;
    const service = this.selectedService();
    const date = this.selectedDate();

    const startRaw = `${date}T${result.TStartTime}`.replace(/[-:]/g, '');
    const endRaw = `${date}T${result.TEndTime}`.replace(/[-:]/g, '');
    const title = encodeURIComponent(service.VcName);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startRaw}/${endRaw}`;
    window.open(url, '_blank');
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('es-CO', options);
  }

  private resetState(): void {
    this.currentStep.set(1);
    this.selectedProfessional.set(null);
    this.useRandomProfessional.set(false);
    this.selectedDate.set('');
    this.selectedTime.set('');
    this.availableSlots.set([]);
    this.clientFirstName.set('');
    this.clientLastName.set('');
    this.clientEmail.set('');
    this.clientPhone.set('');
    this.bookingNotes.set('');
    this.bookingResult.set(null);
    this.showConfirmation.set(false);
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    this.currentWeekStart.set(d);
  }
}
