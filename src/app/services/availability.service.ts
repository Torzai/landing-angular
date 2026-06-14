import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
}

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAvailability(): Observable<AvailabilitySlot[]> {
    return this.http.get<AvailabilitySlot[]>(`${this.apiUrl}/availability`);
  }

  updateAvailability(slots: AvailabilitySlot[]): Observable<AvailabilitySlot[]> {
    return this.http.put<AvailabilitySlot[]>(`${this.apiUrl}/availability`, { slots });
  }

  getAvailableSlots(date: string, duration: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/availability/slots`, {
      params: { date, duration },
    });
  }
}
