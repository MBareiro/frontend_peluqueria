import { Component, ViewChild, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatRadioChange } from '@angular/material/radio';
import { User } from '../../../models/user.model';
import { Horario } from '../../../models/horario.model';
import { UserService } from '../../../services/user.service';
import { AppointmentService } from '../../../services/appointment.service';
import { ScheduleService } from '../../../services/schedule.service';
import { ServicesService } from '../../../services/services.service';
import { BloquedDayService } from 'src/app/services/bloqued-day.service';
import { DateFilterFn, MatDatepicker } from '@angular/material/datepicker';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormValidators } from '../../shared/form-validators/form-validators';
import { firstValueFrom, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BusinessConfigService } from '../../../services/business-config.service';
import { Observable } from 'rxjs';
import { BusinessConfig } from '../../../models/business-config.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.css'],
})
export class CreateAppointmentComponent implements OnDestroy {
  @ViewChild('picker') datepicker!: MatDatepicker<any>;
  @ViewChild('stepper') stepper!: MatStepper;
  private destroy$ = new Subject<void>();

  users: User[] = [];
  horario: Horario[] = [];              // índice 1..7 según tu API
  blockedDatesArray: string[] = [];     // YYYY-MM-DD (local)
  turnos: Array<{ id: string; value: string; label: string }> = [];
  services: Array<{ id?: number; description: string; duration: number; cost: number; active?: boolean }> = [];
  availableBarbers: User[] = [];
  businessConfig$: Observable<BusinessConfig | null>;

  selectedDate: Date | null = null;
  selectedValue: 'morning' | 'afternoon' | '' = '';
  userRole: string | null = null;

  loadingUsers = true;
  loadingCalendar = false;
  loadingSchedule = false;
  error = false;                        // no hay turnos disponibles
  formularioEnviadoExitoso = false;
  submitting = false;

  minDate: Date;

  personalDataForm!: FormGroup;
  styleDresserAndDateForm!: FormGroup;
  disponibilityForm!: FormGroup;

  constructor(
    public userService: UserService,
    public horarioService: ScheduleService,
  public appointmentService: AppointmentService,
  public servicesService: ServicesService,
    public formValidator: FormValidators,
    public blockedDayService: BloquedDayService,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private businessConfigService: BusinessConfigService
  ) {
    const currentDay = new Date();
    this.minDate = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() + 1);
    this.createForms();
    this.businessConfig$ = this.businessConfigService.config$;
  }

  ngOnInit() {
    this.chargeUser().then(() => {
      // si necesitás lógica por rol, llamala acá
    });
    this.loadServices();
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => this.userRole = u?.role_obj?.name || u?.role || null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadServices() {
    try {
      const data = await firstValueFrom(this.servicesService.list());
      this.services = data || [];
    } catch (err) {
      this.services = [];
      this.snackBar.open('Error al cargar servicios', 'Cerrar', { duration: 3000 });
    }
  }

  /** ---------- Forms ---------- */
  private createForms() {
    this.personalDataForm = new FormGroup({
      first_name: new FormControl<string | null>(null, [Validators.required, Validators.pattern("^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$")]),
      last_name: new FormControl<string | null>(null, [Validators.required]),
      email: new FormControl<string | null>(null, this.isUser() ? [] : [Validators.required, Validators.email]),
      phoneNumber: new FormControl<string | null>(null, this.isUser() ? [] : [Validators.required]),
    });

    // hairdresser y date empiezan deshabilitados (habilitamos cuando haya data)
    // serviceId enabled first; hairdresser disabled until a service is selected
    this.styleDresserAndDateForm = new FormGroup({
      hairdresserId: new FormControl<number | null>({ value: null, disabled: true }, [Validators.required]),
      serviceId: new FormControl<number | null>({ value: null, disabled: false }, [Validators.required]),
      date: new FormControl<Date | null>({ value: null, disabled: true }, [Validators.required]),
    });

    // schedule y time deshabilitados hasta que haya fecha + turnos
    this.disponibilityForm = new FormGroup({
      schedule: new FormControl<'morning' | 'afternoon' | ''>({ value: '' as any, disabled: true }, [Validators.required]),
      time: new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]),
    });
  }

  isUser(): boolean {
    return this.userRole === 'admin' || this.userRole === 'peluquero';
  }

  /** ---------- Carga de peluqueros ---------- */
  async chargeUser() {
    try {
      this.loadingUsers = true;
      const data = await this.userService.getUsers();
      this.users = (data || []).filter(u => u.active);
      this.styleDresserAndDateForm.get('serviceId')!.enable();
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      this.loadingUsers = false;
    }
  }

  async onServiceSelect(ev: MatSelectChange | null) {
    const serviceId = ev?.value ?? this.styleDresserAndDateForm.get('serviceId')!.value;
    if (!serviceId) {
      this.availableBarbers = [];
      this.styleDresserAndDateForm.get('hairdresserId')!.reset();
      this.styleDresserAndDateForm.get('hairdresserId')!.disable();
      this.styleDresserAndDateForm.get('date')!.reset();
      this.styleDresserAndDateForm.get('date')!.disable();
      this.resetScheduleAndTime();
      return;
    }

    try {
      this.loadingUsers = true;
      interface EmployeeServiceEntry { 
        id?: number;
        employee_id: number;
        employee_name?: string;
        service_id?: number;
        price?: number;
        duration?: number;
        offered?: boolean;
      }
      const barberEntries = await firstValueFrom(this.servicesService.listBarbersForService(Number(serviceId))) as EmployeeServiceEntry[];

      const barberIds = (barberEntries || []).map((b: EmployeeServiceEntry) => {
        if (b == null) return null;
        if (typeof b.employee_id !== 'undefined') return Number(b.employee_id);
        if (typeof (b as any).barber_id !== 'undefined') return Number((b as any).barber_id);
        if (typeof b.id !== 'undefined' && typeof b.service_id !== 'undefined') return Number(b.id);
        if ((b as any).employee && typeof (b as any).employee.id !== 'undefined') return Number((b as any).employee.id);
        if ((b as any).barber && typeof (b as any).barber.id !== 'undefined') return Number((b as any).barber.id);
        return null;
      }).filter((v: number | null): v is number => v !== null);
      // ensure users are loaded
      if (!this.users || this.users.length === 0) {
        const data = await this.userService.getUsers();
        this.users = (data || []).filter(u => u.active);
      }

      // Candidate barbers: those who offer the service
      const candidateBarbers = this.users.filter(u => barberIds.includes(u.id));

      // Temporalmente deshabilitado: mostrar todos los candidatos sin filtrar por disponibilidad
      this.availableBarbers = candidateBarbers;
      
      /* // Further filter candidates to only those who actually have enabled schedule days and
      // at least one non-blocked date in the next 30 days. This prevents showing barbers
      // who nominally offer the service but have no available days.
      this.availableBarbers = [];
      try {
        // run checks in parallel but limit concurrency if needed (here parallel for simplicity)
        const checks = await Promise.all(candidateBarbers.map(async (b) => {
          const ok = await this.barberHasAvailableSlot(b.id);
          return { barber: b, ok };
        }));
        this.availableBarbers = checks.filter(c => c.ok).map(c => c.barber);
      } catch (err) {
        // if something fails, fall back to showing the candidates (better UX than empty list)
        console.error('Error checking barber availability:', err);
        this.availableBarbers = candidateBarbers;
      } */

      if (this.availableBarbers.length > 0) {
        this.styleDresserAndDateForm.get('hairdresserId')!.enable();
      } else {
        // no barbers offer this service
        this.styleDresserAndDateForm.get('hairdresserId')!.reset();
        this.styleDresserAndDateForm.get('hairdresserId')!.disable();
        this.styleDresserAndDateForm.get('date')!.reset();
        this.styleDresserAndDateForm.get('date')!.disable();
        this.resetScheduleAndTime();
      }
    } catch (err) {
      this.availableBarbers = [];
      this.snackBar.open('Error al cargar peluqueros para el servicio', 'Cerrar', { duration: 3000 });
    } finally {
      this.loadingUsers = false;
    }
  }

  /** ---------- Al elegir peluquero ---------- */
  async peluquero() {
    try {
      this.loadingCalendar = true;

      const peluqueroID = this.styleDresserAndDateForm.get('hairdresserId')!.value;
      if (!peluqueroID) {
        // si sacan la selección, bloqueá todo lo siguiente
        this.styleDresserAndDateForm.get('date')!.reset();
        this.styleDresserAndDateForm.get('date')!.disable();
        this.resetScheduleAndTime();
        return;
      }

      await Promise.all([
        this.chargeHorario(),
        this.getBlockedDates(peluqueroID),
      ]);

      // habilitar fecha cuando horario + bloqueos listos
      this.styleDresserAndDateForm.get('date')!.enable();

      // limpiar selecciones dependientes
      this.selectedDate = null;
      this.resetScheduleAndTime();
    } catch (error) {
      console.error('Error en peluquero():', error);
    } finally {
      this.loadingCalendar = false;
    }
  }

  private resetScheduleAndTime() {
    const scheduleCtrl = this.disponibilityForm.get('schedule')!;
    const timeCtrl = this.disponibilityForm.get('time')!;
    scheduleCtrl.reset();
    scheduleCtrl.disable();
    timeCtrl.reset();
    timeCtrl.disable();
    this.turnos = [];
    this.error = false;
    this.selectedValue = '';
  }

  /** ---------- Obtener horario del peluquero elegido ---------- */
  async chargeHorario(): Promise<void> {
    try {
      const peluqueroID = this.styleDresserAndDateForm.get('hairdresserId')!.value;
      if (!peluqueroID) {
        this.horario = [];
        return;
      }
      const data: Horario[] = await this.horarioService.getHorarioUsuario(peluqueroID);
      this.horario = data || [];
    } catch (error) {
      this.horario = [];
      this.snackBar.open('Error al obtener horario', 'Cerrar', { duration: 3000 });
    }
  }

  /** ---------- Obtener días bloqueados ---------- */
  async getBlockedDates(peluqueroID: number) {
    try {
      interface BlockedDate { blocked_date: string | Date }
      const response = await this.blockedDayService.getBlockedDays(peluqueroID) as BlockedDate[];
      // guardamos YYYY-MM-DD en local para evitar problemas de TZ
      this.blockedDatesArray = (response || []).map((item: BlockedDate) => {
        const d = new Date(item.blocked_date);
        return this.toYMD(d);
      });
    } catch (error: any) {
      if (error?.status === 404) {
        this.blockedDatesArray = [];
      } else {
        this.snackBar.open('Error al obtener fechas bloqueadas', 'Cerrar', { duration: 3000 });
      }
    }
  }

  /** ---------- Datepicker filter: sólo días hábiles del peluquero y no bloqueados ---------- */
  esHabilitado: DateFilterFn<Date | null> = (date: Date | null) => {
    if (!date) return false;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const max = new Date(today); max.setDate(max.getDate() + 30);

    const day = new Date(date); day.setHours(0, 0, 0, 0);
    const withinRange = day >= today && day <= max;
    if (!withinRange) return false;

    const isBlocked = this.blockedDatesArray.includes(this.toYMD(day));

    // map 0..6 (Dom..Sab) -> 1..7 como usa tu backend
    const dow = day.getDay();
    const map: Record<number, number> = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 };
    const entry = this.horario?.[map[dow]] as any;

    // válido si tiene al menos un turno activo ese día
    const hasAnyShift = !!(entry?.active_morning || entry?.active_afternoon);

    return hasAnyShift && !isBlocked;
  };

  private toYMD(d: Date): string {
    // 2025-10-07 (local)
    return d.toLocaleDateString('en-CA');
  }

  // helpers for template summary
  get selectedService() {
    const id = this.styleDresserAndDateForm.get('serviceId')!.value;
    return this.services.find(s => s.id === id) || null;
  }

  get selectedBarberName(): string | null {
    const id = this.styleDresserAndDateForm.get('hairdresserId')!.value;
    const user = this.users.find(u => u.id === id) || this.availableBarbers.find(u => u.id === id);
    return user ? `${user.first_name} ${user.last_name}` : null;
  }

  /** ---------- Al elegir fecha ---------- */
  fechaSeleccionada(ev: any): void {
    this.selectedDate = ev?.value ?? null;

    // habilitar schedule, resetear time
    const scheduleCtrl = this.disponibilityForm.get('schedule')!;
    const timeCtrl = this.disponibilityForm.get('time')!;

    scheduleCtrl.reset();
    scheduleCtrl.enable();

    timeCtrl.reset();
    timeCtrl.disable();

    this.turnos = [];
    this.error = false;
    this.selectedValue = '';
  }

  /** ---------- Al elegir mañana/tarde ---------- */
  async onRadioChange(event: MatRadioChange) {
    this.loadingSchedule = true;
    this.turnos = [];
    const timeCtrl = this.disponibilityForm.get('time')!;
    timeCtrl.reset();
    timeCtrl.disable();

    this.selectedValue = (event.value as 'morning' | 'afternoon') || '';

    await this.chargeHorario(); // por si cambió algo en paralelo
    this.turnos = await this.createRadioButtonsForDay();

    if (this.turnos.length > 0) {
      timeCtrl.enable();
    } else {
      this.error = true;
    }
    this.loadingSchedule = false;
  }

  /** ---------- Generar slots disponibles para el día/periodo ---------- */
  private async createRadioButtonsForDay() {
    this.error = false;
    const resultados: Array<{ id: string; value: string; label: string }> = [];

    const periodo = this.disponibilityForm.get('schedule')!.value as 'morning' | 'afternoon' | '';
    const date = this.selectedDate;

    if (!periodo || !date || !this.horario) return resultados;

    const dow = date.getDay(); // 0=Dom..6=Sab
    const dayIndex: Record<number, number> = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 };
    const entry = this.horario[dayIndex[dow]] as any;
    if (!entry) return resultados;

    let start: string | undefined;
    let end: string | undefined;

    if (periodo === 'morning' && entry.active_morning) {
      start = entry.morning_start;
      end = entry.morning_end;
    } else if (periodo === 'afternoon' && entry.active_afternoon) {
      start = entry.afternoon_start;
      end = entry.afternoon_end;
    } else {
      this.error = true;
      return resultados;
    }

    if (!start || !end) return resultados;

    const horariosDelDia = this.generarHorasCada30(start, end);

    const ocupados = await this.appointmentBD(); // string[] de "HH:mm"
    const libres = horariosDelDia.filter(h => !ocupados.includes(h));

    libres.forEach((hora, i) => {
      resultados.push({ id: `radio_${i}`, value: hora, label: hora });
    });

    if (resultados.length === 0) this.error = true;

    return resultados;
  }

  private generarHorasCada30(period_start: string, period_end: string): string[] {
    const [sh, sm] = period_start.split(':').map(Number);
    const [eh, em] = period_end.split(':').map(Number);
    const slots: string[] = [];

    let cur = new Date(2000, 0, 1, sh, sm || 0, 0, 0);
    const end = new Date(2000, 0, 1, eh, em || 0, 0, 0);

    while (cur < end) {
      const hh = String(cur.getHours()).padStart(2, '0');
      const mm = String(cur.getMinutes()).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
      cur.setMinutes(cur.getMinutes() + 30);
    }
    return slots;
  }

  /**
   * Check whether a barber has at least one available (non-blocked) day within the next 30 days
   * considering their horario (active_morning/active_afternoon) and blocked days.
   */
  private async barberHasAvailableSlot(barberId: number): Promise<boolean> {
    try {
      const horarioArray = await this.horarioService.getHorarioUsuario(String(barberId)) as Horario[];
      if (!horarioArray || horarioArray.length === 0) return false;

      // quick check: any active day at all?
      const hasAnyActive = horarioArray.some((e: Horario) => {
        return e && (e.active_morning || e.active_afternoon);
      });
      if (!hasAnyActive) return false;

      // load blocked dates for that barber
      let blocked: string[] = [];
      try {
  const blockedRows: any = await this.blockedDayService.getBlockedDays(barberId);
        blocked = (blockedRows || []).map((b: any) => {
          const d = new Date(b.blocked_date);
          return d.toLocaleDateString('en-CA');
        });
      } catch (err) {
        // if blocked-day fetch fails, assume no blocked days (fail-open)
        blocked = [];
      }

      // search for any date between minDate and minDate+30 that matches an active day and is not blocked
      const start = new Date(this.minDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 30);

      const mapDow: Record<number, number> = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 };

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dow = mapDow[d.getDay()];
        const entry = horarioArray.find(h => h.day === dow);
        if (!entry) continue;
        if (!(entry.active_morning || entry.active_afternoon)) continue;
        const ymd = d.toLocaleDateString('en-CA');
        if (!blocked.includes(ymd)) return true;
      }

      return false;
    } catch (err) {
      console.error('barberHasAvailableSlot error', err);
      return false;
    }
  }

  private async appointmentBD(): Promise<string[]> {
    const periodo = this.disponibilityForm.get('schedule')!.value as 'morning' | 'afternoon' | '';
    const date: Date | null = this.styleDresserAndDateForm.get('date')!.value;
    const peluqueroID = this.styleDresserAndDateForm.get('hairdresserId')!.value;

    if (!periodo || !date || !peluqueroID) return [];
    return await this.appointmentService.getSpecificAppointments(
      periodo,
      this.toYMD(date),
      peluqueroID
    );
  }

  /** ---------- Submit ---------- */
  async onSubmit() {
    if (this.submitting) return;
    this.submitting = true;
    const firstName = this.personalDataForm.get('first_name')!.value;
    const lastName = this.personalDataForm.get('last_name')!.value;
    const email = this.personalDataForm.get('email')!.value;
    const phoneNumber = this.personalDataForm.get('phoneNumber')!.value;
    const hairdresserId = this.styleDresserAndDateForm.get('hairdresserId')!.value;
    const date: Date | null = this.styleDresserAndDateForm.get('date')!.value;
    const time = this.disponibilityForm.get('time')!.value as string | null;
    const scheduleValue = this.disponibilityForm.get('schedule')!.value as 'morning' | 'afternoon' | '';

    if (!date) {
      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'info',
        color: 'white',
        title: 'Debe seleccionar una fecha',
        background: '#191c24',
        timer: 4000,
        showConfirmButton: false,
      });
      this.submitting = false;
      this.formularioEnviadoExitoso = false;
      return;
    }

    const dateIso = this.toYMD(date);
    
    if (!scheduleValue) {
      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'info',
        color: 'white',
        title: 'Debe seleccionar mañana o tarde',
        background: '#191c24',
        timer: 4000,
        showConfirmButton: false,
      });
      this.submitting = false;
      this.formularioEnviadoExitoso = false;
      return;
    }
    
    const schedule = scheduleValue as 'morning' | 'afternoon';
    
    if (!time) {
      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'info',
        color: 'white',
        title: 'Debe seleccionar un horario',
        background: '#191c24',
        timer: 6500,
        showConfirmButton: false,
      });
      this.submitting = false;
      this.formularioEnviadoExitoso = false;
      return;
    }

    interface AppointmentPayload {
      first_name: string;
      last_name: string;
      email: string;
      phoneNumber: string;
      hairdresserId: number;
      date: string;
      time: string;
      schedule: 'morning' | 'afternoon';
      serviceId?: number;
    }

    const formData: AppointmentPayload = {
      first_name: firstName,
      last_name: lastName,
      email,
      phoneNumber,
      hairdresserId,
      date: dateIso,
      schedule,
      time,
    };
    // include selected service
    const serviceId = this.styleDresserAndDateForm.get('serviceId')!.value;
    if (serviceId) formData['serviceId'] = serviceId;

    try {
      if (email) {
        const response: any = await this.appointmentService.checkIfAppointmentTaken(email, dateIso, hairdresserId);
        if (response?.appointment_taken) {
          const Swal = (await import('sweetalert2')).default;
          Swal.fire({
            icon: 'warning',
            color: 'white',
            title: 'Advertencia',
            text: 'Usted ya tiene un turno reservado para este día',
            background: '#191c24',
            timer: 6500,
            showConfirmButton: false,
          });
          this.submitting = false;
          this.formularioEnviadoExitoso = false;
          return;
        }
      }

      const isConfirmed = await this.confirmAppointmentDetails(formData);
      if (!isConfirmed) {
        this.submitting = false;
        this.formularioEnviadoExitoso = false;
        return;
      }

      if (email && !this.isUser()) {
        // guest users: verify email code then create appointment (payment at venue)
        await this.sendConfirmationAndCreateAppointment(email, formData);
      } else {
        await this.createAppointment(formData);
      }
    } catch (error) {
      this.snackBar.open('Error al procesar la solicitud de cita', 'Cerrar', { duration: 4000 });
      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'error',
        color: 'white',
        title: 'Error',
        text: 'Ha ocurrido un error al procesar su solicitud. Por favor, intente nuevamente más tarde.',
        background: '#191c24',
        timer: 6500,
        showConfirmButton: false,
      });
      this.submitting = false;
      this.formularioEnviadoExitoso = false;
    }
    // ensure the submitting flag is cleared if we reach the end of this function
    this.submitting = false;
  }

  private async sendConfirmationAndCreateAppointment(email: string, formData: any) {
    const Swal = (await import('sweetalert2')).default;
    
    try {
      const phoneNumber = this.personalDataForm.get('phoneNumber')?.value;
      
      // PASO 1: Verificar si ya tiene un turno activo ANTES de enviar el código
      try {
        await this.appointmentService.check_active_appointment({ 
          email, 
          phoneNumber 
        });
      } catch (error: any) {
        // Si detecta turno activo (error 429), mostrar alerta y detener
        if (error?.status === 429 && error?.error?.showAlert) {
          const appointmentData = error.error.existingAppointment;
          
          await Swal.fire({
            icon: 'warning',
            title: '⚠️ Ya tienes un turno reservado',
            html: `
              <div style="text-align: left; padding: 20px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Ya tienes un turno pendiente:
                </p>
                <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                  <p style="margin: 8px 0;"><strong>📅 Fecha:</strong> ${appointmentData.date}</p>
                  <p style="margin: 8px 0;"><strong>🕐 Hora:</strong> ${appointmentData.time}</p>
                  <p style="margin: 8px 0;"><strong>ℹ️ Estado:</strong> ${appointmentData.status === 'programmed' ? 'Programado' : appointmentData.status}</p>
                </div>
                <p style="font-size: 14px; color: #666;">
                  Debes completar o cancelar este turno antes de reservar uno nuevo.
                </p>
              </div>
            `,
            background: '#191c24',
            color: 'white',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#f57c00'
          });
          return; // Detener el proceso completamente
        }
        
        // Si es otro tipo de error, mostrar error genérico
        console.error('Error al verificar turno activo:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error al verificar disponibilidad',
          text: 'Ha ocurrido un error al verificar si tienes turnos activos. Por favor, intenta nuevamente.',
          background: '#191c24',
          color: 'white',
        });
        return; // Detener el proceso
      }
      
      // PASO 2: Si no tiene turno activo, enviar código de confirmación
      const response: any = await this.appointmentService.send_confirmation_code({ 
        email
      });

      const { value: code, isConfirmed } = await Swal.fire({
        icon: 'info',
        title: 'Verificación de Código',
        input: 'text',
        color: 'white',
        text: 'Por favor, verifica tu correo electrónico. Hemos enviado un código de confirmación. Ingrésalo a continuación:',
        background: '#191c24',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Cargar',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
          preConfirm: async (code) => {
          if (!code) {
            Swal.showValidationMessage('Por favor, ingrese un código de confirmación.');
            return false;
          }
          try {
            const confirmResponse: any = await this.appointmentService.confirmAppointment({ email, code, formData });
            if (confirmResponse?.error) {
              const errorMessage = confirmResponse.error.status === 400
                ? confirmResponse.error.error.message
                : confirmResponse.error;
              Swal.showValidationMessage(`Error: ${errorMessage}`);
              return false;
            }
            return confirmResponse;
          } catch (error: any) {
            Swal.showValidationMessage('Error al confirmar el código. Intente nuevamente.');
            return false;
          }
        },
      });

      if (isConfirmed && code) {
        await this.createAppointment(formData);
      }
    } catch (error: any) {
      console.error('Error al enviar código de confirmación:', error);
      const Swal = (await import('sweetalert2')).default;
      
      // Error genérico al enviar el código
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar el código de confirmación',
        text: 'Ha ocurrido un error al intentar enviar el código de confirmación. Por favor, verifique que su correo electrónico sea válido.',
        background: '#191c24',
        color: 'white',
      });
    }
  }

  

  private async createAppointment(formData: any): Promise<void> {
    try {
      await firstValueFrom(this.appointmentService.createAppointment(formData));
      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'success',
        color: 'white',
        title: 'Turno Creado Exitosamente',
        background: '#191c24',
        timer: 2500,
        showConfirmButton: false,
      });
      this.turnos = [];

      // Deshabilitar controles dependientes tras crear el turno
      this.disponibilityForm.get('schedule')!.disable();
      this.styleDresserAndDateForm.get('date')!.disable();

      // recargar ruta para resetear
      const target = this.isUser() ? 'dashboard/create-appointment' : '/create-appointment';
      await this.router.navigateByUrl('/', { skipLocationChange: true });
      await this.router.navigate([target]);
      return;
    } catch (err: any) {
      this.snackBar.open('Error al crear el turno', 'Cerrar', { duration: 4000 });
      throw err;
    }
  }

  async confirmAppointmentDetails(formData: any): Promise<boolean> {
    const dateObj = new Date(formData.date);
    const formattedDate = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const Swal = (await import('sweetalert2')).default;
    const { isConfirmed } = await Swal.fire({
      title: 'Confirmar Turno',
      html: `
        <div>
          <p><strong>Nombre:</strong> ${formData.first_name} ${formData.last_name}</p>
          <p><strong>Email:</strong> ${formData.email || ''}</p>
          <p><strong>Teléfono:</strong> ${formData.phoneNumber}</p>
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Horario:</strong> ${formData.time}</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      background: '#191c24',
      color: 'white',
    });

    return isConfirmed;
  }

  // TrackBy functions para optimizar *ngFor
  trackByServiceId = (_index: number, service: { id?: number; description: string }): number | undefined => service.id;
  trackByUserId = (_index: number, user: User): number => user.id;
  trackByTurnoId = (_index: number, turno: { id: string; value: string; label: string }): string => turno.id;
}
