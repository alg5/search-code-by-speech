import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly router = inject(Router);

  getBreadcrumbs(): Observable<MenuItem[]> {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.buildBreadcrumbs())
    );
  }

  private buildBreadcrumbs(): MenuItem[] {
    const url = this.router.url;
    const segments = url.split('/').filter(segment => segment !== '');

    const breadcrumbs: MenuItem[] = [
      {
        label: 'Главная',
        icon: 'pi pi-home',
        routerLink: '/'
      }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = this.getLabelForSegment(segment);

      breadcrumbs.push({
        label,
        routerLink: currentPath
      });
    });

    return breadcrumbs;
  }

  private getLabelForSegment(segment: string): string {
    const labels: { [key: string]: string } = {
      'admin': 'Админ',
      'user': 'Пользователь',
      'dashboard': 'Панель',
      'profile': 'Профиль',
      'products': 'Продукты',
      'categories': 'Категории',
      'processing': 'Обработка',
      'users': 'Пользователи',
      'auth': 'Авторизация'
    };

    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  }
}
