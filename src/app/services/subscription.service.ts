import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Subscription {
  _id: string;
  email: string;
  plan: string;
  startDate: string;
  credits: number;
}

export interface RemainingSessions {
  plan: string;
  remaining: number;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getRemaining(email: string): Observable<RemainingSessions | null> {
    return this.http.get<RemainingSessions | null>(`${this.apiUrl}/subscriptions/remaining`, {
      params: { email },
    });
  }

  getAll(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/subscriptions`);
  }

  create(email: string, plan: string): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/subscriptions`, { email, plan });
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subscriptions/${id}`);
  }
}
