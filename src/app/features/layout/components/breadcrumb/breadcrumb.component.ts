import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { BreadcrumbService } from './breadcrumb.service';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';

@Component({
  selector: 'spr-breadcrumb',
  standalone: true,
  imports: [CommonModule, BreadcrumbModule, RouterModule, TranslatePipe],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  private readonly breadcrumbService = inject(BreadcrumbService);
  private subscription?: Subscription;

  breadcrumbs$ = this.breadcrumbService.getBreadcrumbs();

  breadcrumbs: MenuItem[] = [];

  home: MenuItem = {
    icon: 'pi pi-home',
    routerLink: '/',
  };

  ngOnInit() {
    this.subscription = this.breadcrumbService
      .getBreadcrumbs()
      .subscribe((breadcrumbs) => (this.breadcrumbs = breadcrumbs));
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
