import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { AvailabilityService } from '../../services/availability.service';
import { SubscriptionService, Subscription } from '../../services/subscription.service';
import { PLAN_SESSION_CREDITS } from '../../plan-quotas';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  private authService = inject(AuthService);
  private bookingService = inject(BookingService);
  private availabilityService = inject(AvailabilityService);
  private subscriptionService = inject(SubscriptionService);

  isAuthenticated = this.authService.isAuthenticated;

  credentials = { username: '', password: '' };
  loginError = '';

  bookings = signal<any[]>([]);
  loadingBookings = signal(false);
  loadError = signal('');

  readonly availabilityDays = [
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
    { value: 0, label: 'Dom' },
  ];
  readonly availabilityTimes = this.generateTimeSlots(8, 26);

  availabilitySet = signal<Set<string>>(new Set());
  loadingAvailability = signal(false);
  savingAvailability = signal(false);
  availabilityError = signal('');
  availabilitySaved = signal(false);

  readonly subscriptionPlans = Object.keys(PLAN_SESSION_CREDITS);

  subscriptions = signal<Subscription[]>([]);
  loadingSubscriptions = signal(false);
  subscriptionError = signal('');
  savingSubscription = signal(false);
  subscriptionSaved = signal(false);
  newSubscription = { email: '', plan: this.subscriptionPlans[0] };

  constructor() {
    if (this.isAuthenticated()) {
      this.loadBookings();
      this.loadAvailability();
      this.loadSubscriptions();
    }
  }

  private generateTimeSlots(startHour: number, endHour: number): string[] {
    const times: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const h = hour % 24;
      times.push(`${h.toString().padStart(2, '0')}:00`);
      times.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return times;
  }

  login(form: NgForm) {
    if (form.invalid) {
      this.loginError = 'Introduce usuario y contraseña.';
      return;
    }

    this.loginError = '';
    this.authService.login(this.credentials.username, this.credentials.password).subscribe({
      next: () => {
        this.credentials = { username: '', password: '' };
        this.loadBookings();
        this.loadAvailability();
        this.loadSubscriptions();
      },
      error: () => {
        this.loginError = 'Usuario o contraseña incorrectos.';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.bookings.set([]);
    this.availabilitySet.set(new Set());
    this.subscriptions.set([]);
  }

  loadBookings() {
    this.loadingBookings.set(true);
    this.loadError.set('');
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.loadingBookings.set(false);
      },
      error: () => {
        this.loadError.set('No se pudieron cargar las reservas.');
        this.loadingBookings.set(false);
      }
    });
  }

  cancelBooking(booking: any) {
    if (!confirm(`¿Cancelar la reserva de ${booking.name} (${booking.email})? Se borrará permanentemente.`)) {
      return;
    }

    this.bookingService.deleteBooking(booking._id).subscribe({
      next: () => {
        this.bookings.set(this.bookings().filter((b) => b._id !== booking._id));
      },
      error: () => {
        this.loadError.set('No se pudo cancelar la reserva.');
      }
    });
  }

  loadAvailability() {
    this.loadingAvailability.set(true);
    this.availabilityError.set('');
    this.availabilityService.getAvailability().subscribe({
      next: (slots) => {
        this.availabilitySet.set(new Set(slots.map((slot) => `${slot.dayOfWeek}-${slot.startTime}`)));
        this.loadingAvailability.set(false);
      },
      error: () => {
        this.availabilityError.set('No se pudo cargar la disponibilidad.');
        this.loadingAvailability.set(false);
      }
    });
  }

  isSlotActive(dayOfWeek: number, time: string): boolean {
    return this.availabilitySet().has(`${dayOfWeek}-${time}`);
  }

  toggleSlot(dayOfWeek: number, time: string) {
    const key = `${dayOfWeek}-${time}`;
    const updated = new Set(this.availabilitySet());
    if (updated.has(key)) {
      updated.delete(key);
    } else {
      updated.add(key);
    }
    this.availabilitySet.set(updated);
  }

  saveAvailability() {
    this.savingAvailability.set(true);
    this.availabilityError.set('');
    this.availabilitySaved.set(false);

    const slots = Array.from(this.availabilitySet()).map((key) => {
      const [dayOfWeek, startTime] = key.split('-');
      return { dayOfWeek: Number(dayOfWeek), startTime };
    });

    this.availabilityService.updateAvailability(slots).subscribe({
      next: () => {
        this.savingAvailability.set(false);
        this.availabilitySaved.set(true);
        setTimeout(() => this.availabilitySaved.set(false), 2000);
      },
      error: () => {
        this.savingAvailability.set(false);
        this.availabilityError.set('No se pudo guardar la disponibilidad.');
      }
    });
  }

  loadSubscriptions() {
    this.loadingSubscriptions.set(true);
    this.subscriptionError.set('');
    this.subscriptionService.getAll().subscribe({
      next: (subscriptions) => {
        this.subscriptions.set(subscriptions);
        this.loadingSubscriptions.set(false);
      },
      error: () => {
        this.subscriptionError.set('No se pudieron cargar las suscripciones.');
        this.loadingSubscriptions.set(false);
      }
    });
  }

  cancelSubscription(subscription: Subscription) {
    if (!confirm(`¿Cancelar la suscripción de ${subscription.email}? Se borrará permanentemente.`)) {
      return;
    }

    this.subscriptionService.delete(subscription._id).subscribe({
      next: () => {
        this.subscriptions.set(this.subscriptions().filter((s) => s._id !== subscription._id));
      },
      error: () => {
        this.subscriptionError.set('No se pudo cancelar la suscripción.');
      }
    });
  }

  assignSubscription(form: NgForm) {
    if (form.invalid) {
      this.subscriptionError.set('Introduce un email válido y selecciona un plan.');
      return;
    }

    this.savingSubscription.set(true);
    this.subscriptionError.set('');
    this.subscriptionSaved.set(false);

    this.subscriptionService.create(this.newSubscription.email, this.newSubscription.plan).subscribe({
      next: () => {
        this.savingSubscription.set(false);
        this.subscriptionSaved.set(true);
        this.newSubscription = { email: '', plan: this.subscriptionPlans[0] };
        form.resetForm(this.newSubscription);
        this.loadSubscriptions();
        setTimeout(() => this.subscriptionSaved.set(false), 2000);
      },
      error: () => {
        this.savingSubscription.set(false);
        this.subscriptionError.set('No se pudo asignar el plan.');
      }
    });
  }
}
