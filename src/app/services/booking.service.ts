import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Booking {
  name: string;
  email: string;
  date: string;
  time: string;
  duration: number;
  plan?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createBooking(booking: Booking): Observable<any> {
    const payload = {
      name: booking.name,
      email: booking.email,
      date: `${booking.date}T${booking.time}:00.000Z`,
      duration: Number(booking.duration),
      plan: booking.plan || undefined,
    };

    return this.http.post(`${this.apiUrl}/bookings`, payload);
  }

  getBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings`);
  }

  getLastBookingName(email: string): Observable<{ name: string } | null> {
    return this.http.get<{ name: string } | null>(`${this.apiUrl}/bookings/last-name`, {
      params: { email },
    });
  }

  deleteBooking(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bookings/${id}`);
  }
}