import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/components/auth/auth.component';
import { MainLayoutComponent } from './features/layout/components/main-layout/main-layout.component';
import { SearchLayoutComponent } from './features/search/components/search-layout/search-layout.component';
import { AdminDashboardComponent } from './features/admin/components/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './features/user/components/user-dashboard/user-dashboard.component';
import { UserProfileComponent } from './features/user/components/user-profile/user-profile.component';
import { AdminGuard } from './shared/guards/admin-guard';
import { AdminUsersComponent } from './features/admin/components/admin-users/admin-users.component';
import { AdminProductsComponent } from './features/admin/components/admin-products/admin-products.component';
import { AdminCategoriesComponent } from './features/admin/components/admin-categories/admin-categories.component';
import { AdminProcessingComponent } from './features/admin/components/admin-processing/admin-processing.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: SearchLayoutComponent, pathMatch: 'full' },
      { path: 'auth', component: AuthComponent },
      { path: 'admin', component: AdminDashboardComponent, canActivate: [AdminGuard] },
      { path: 'admin/users', component: AdminUsersComponent, canActivate: [AdminGuard] },
      { path: 'admin/products', component: AdminProductsComponent, canActivate: [AdminGuard] },
      { path: 'admin/categories', component: AdminCategoriesComponent, canActivate: [AdminGuard] },
      { path: 'admin/processing', component: AdminProcessingComponent, canActivate: [AdminGuard] },
      { path: 'user/dashboard', component: UserDashboardComponent },
      { path: 'user/profile', component: UserProfileComponent },
    ],
  },
  // { path: '**', redirectTo: '' }
];
