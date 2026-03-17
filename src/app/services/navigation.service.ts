import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  visible: boolean;
  order: number;
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private items$: Observable<NavigationItem[]> | null = null;

  constructor(private http: HttpClient) {}

  getNavigationItems(): Observable<NavigationItem[]> {
    if (!this.items$) {
      this.items$ = this.http.get<{ items: NavigationItem[] }>('assets/config/navigation.json').pipe(
        map(config => config.items.filter(item => item.visible).sort((a, b) => a.order - b.order)),
        catchError(() => of([])),
        shareReplay(1)
      );
    }
    return this.items$;
  }
}
