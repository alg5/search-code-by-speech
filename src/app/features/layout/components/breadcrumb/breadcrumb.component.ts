import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { BreadcrumbService } from './breadcrumb.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'spr-breadcrumb',
  standalone: true,
  imports: [CommonModule, BreadcrumbModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  private readonly breadcrumbService = inject(BreadcrumbService);
  private subscription?: Subscription;

  breadcrumbs: MenuItem[] = [];

  home: MenuItem = {
    icon: 'pi pi-home',
    routerLink: '/'
  };

  ngOnInit() {
    // Инициализируем breadcrumbs сразу
    this.breadcrumbs = this.breadcrumbService['buildBreadcrumbs']();

    // Подписываемся на изменения маршрута
    this.subscription = this.breadcrumbService.getBreadcrumbs().subscribe(
      breadcrumbs => this.breadcrumbs = breadcrumbs
    );
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
