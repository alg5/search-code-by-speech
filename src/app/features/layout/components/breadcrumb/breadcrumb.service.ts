import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { combineLatest, Observable } from 'rxjs';
import { LanguageService } from '../../../../core/services/language.service';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  getBreadcrumbs(): Observable<MenuItem[]> {
    return combineLatest([
      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
      ),
      this.languageService.langChanges$.pipe(startWith(this.languageService.currentLang())),
    ]).pipe(map(() => this.buildBreadcrumbs()));
  }

  private buildBreadcrumbs(): MenuItem[] {
    const root = this.router.routerState.snapshot.root;
    const breadcrumbs: MenuItem[] = [];
    let url = '';

    const addBreadcrumb = (route: any) => {
      if (route.routeConfig?.path && route.routeConfig.path.trim() !== '') {
        const path = route.routeConfig.path;
        url += `/${path}`;

        // Разбиваем путь на сегменты и создаём breadcrumb для КАЖДОГО
        const segments = path.split('/').filter((s: string) => s.trim() !== '');

        // Если это составной путь (например "admin/products"),
        // нужно создать breadcrumbs для каждого сегмента
        if (segments.length > 1) {
          // Удаляем последний добавленный, если он был составным
          breadcrumbs.pop();

          let segmentUrl = '';
          for (const segment of segments) {
            segmentUrl += `/${segment}`;
            breadcrumbs.push({
              label: `breadcrumb.${segment}`,
              routerLink: segmentUrl,
            });
          }
        } else {
          breadcrumbs.push({
            label: `breadcrumb.${path}`,
            routerLink: url,
          });
        }
      }

      if (route.firstChild) {
        addBreadcrumb(route.firstChild);
      }
    };

    addBreadcrumb(root);

    return breadcrumbs;
  }
}
