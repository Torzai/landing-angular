import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, Booking } from '../../services/booking.service';
import { AvailabilityService } from '../../services/availability.service';
import { PlanSelectionService } from '../../services/plan-selection.service';
import { SubscriptionService, RemainingSessions } from '../../services/subscription.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent {
  private availabilityService = inject(AvailabilityService);
  private planSelectionService = inject(PlanSelectionService);
  private subscriptionService = inject(SubscriptionService);

  booking: Booking = { name: '', email: '', date: '', time: '', duration: 1, plan: '' };
  msg = '';
  error = '';
  today = this.formatDate(new Date());
  showCalendar = false;
  currentMonth = new Date();
  calendarDays: any[] = [];

  availableSlots = signal<string[]>([]);
  loadingSlots = signal(false);
  selectedTime = signal('');
  remainingSessions = signal<RemainingSessions | null>(null);

  private readonly mentorTimeZone = 'Europe/Madrid';
  readonly visitorTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  readonly planOptions = [
    { value: 'Popular', label: 'Popular - 149€' },
    { value: 'Intensivo', label: 'Intensivo - 450€' },
  ];

  constructor(private bookingService: BookingService) {
    this.generateCalendar();
    effect(() => {
      this.booking.plan = this.planSelectionService.selectedPlan();
    });
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // getDay() is Sun=0..Sat=6, but the grid starts on Monday, so shift it to Mon=0..Sun=6
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    this.calendarDays = [];

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      this.calendarDays.push(this.createDateObj(date, false));
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push(this.createDateObj(date, true));
    }

    // Next month days
    const remainingDays = 42 - this.calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      this.calendarDays.push(this.createDateObj(date, false));
    }
  }

  createDateObj(date: Date, currentMonth: boolean) {
    const dateStr = this.formatDate(date);
    const isToday = dateStr === this.today;
    return { day: date.getDate(), dateStr, currentMonth, isToday };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  checkRemainingSessions() {
    const email = this.booking.email.trim();
    if (!email || !email.includes('@')) {
      this.remainingSessions.set(null);
      return;
    }

    this.subscriptionService.getRemaining(email).subscribe({
      next: (info) => {
        this.remainingSessions.set(info);
        if (info?.name && !this.booking.name.trim()) {
          this.booking.name = info.name;
        }
      },
      error: () => this.remainingSessions.set(null),
    });

    this.bookingService.getLastBookingName(email).subscribe({
      next: (info) => {
        if (info?.name && !this.booking.name.trim()) {
          this.booking.name = info.name;
        }
      },
      error: () => {},
    });
  }

  planLabel(value: string): string {
    return this.planOptions.find((option) => option.value === value)?.label ?? value;
  }

  clearPlan() {
    this.planSelectionService.selectedPlan.set('');
    this.booking.plan = '';
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  selectDate(dateStr: string) {
    this.booking.date = dateStr;
    this.showCalendar = false;
    this.loadAvailableSlots();
  }

  loadAvailableSlots() {
    this.selectedTime.set('');
    if (!this.booking.date) {
      this.availableSlots.set([]);
      return;
    }

    this.loadingSlots.set(true);
    this.availabilityService.getAvailableSlots(this.booking.date, this.booking.duration).subscribe({
      next: (slots) => {
        this.availableSlots.set(slots);
        this.loadingSlots.set(false);
      },
      error: () => {
        this.availableSlots.set([]);
        this.loadingSlots.set(false);
      }
    });
  }

  selectTime(slot: string) {
    this.selectedTime.set(slot);
  }

  localSlotTime(slot: string): string {
    return this.formatTimeInZone(slot, this.visitorTimeZone);
  }

  referenceSlotTime(slot: string): string {
    return this.formatTimeInZone(slot, this.mentorTimeZone);
  }

  showReferenceTime(): boolean {
    return this.visitorTimeZone !== this.mentorTimeZone;
  }

  private formatTimeInZone(slot: string, timeZone: string): string {
    const utcDate = new Date(`${this.booking.date}T${slot}:00Z`);
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone,
    }).format(utcDate);
  }

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  submit(form: any) {
    if (form.invalid || !this.selectedTime()) {
      this.error = 'Completa todos los campos y selecciona un horario antes de enviar.';
      this.msg = '';
      return;
    }

    const booking = { ...this.booking, time: this.selectedTime() };
    this.bookingService.createBooking(booking).subscribe({
      next: () => {
        this.msg = booking.plan
          ? '✓ Reserva confirmada. El administrador validará tu plan en breve y se pondrá en contacto contigo.'
          : '✓ Reserva confirmada. Te contactaremos para confirmar los detalles.';
        this.error = '';
        this.resetForm(form);
        setTimeout(() => (this.msg = ''), 6000);
      },
      error: () => {
        this.error = 'Ocurrió un error al enviar la reserva. Intenta de nuevo.';
        this.msg = '';
      }
    });
  }

  private resetForm(form: any) {
    this.planSelectionService.selectedPlan.set('');
    this.booking = { name: '', email: '', date: '', time: '', duration: 1, plan: '' };
    this.availableSlots.set([]);
    this.selectedTime.set('');
    this.remainingSessions.set(null);
    form.resetForm(this.booking);
  }
}
