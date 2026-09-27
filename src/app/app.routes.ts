import { Routes } from '@angular/router';
import { MainLayoutComponent } from './features/layout/components/main-layout/main-layout.component';
import { SearchLayoutComponent } from './features/search/components/search-layout/search-layout.component';

// Sign-in and the admin/user areas are closed: the app is a public search demo only.
// Product data is now administered in custom-health (product_reference).
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [{ path: '', component: SearchLayoutComponent, pathMatch: 'full' }],
  },
  { path: '**', redirectTo: '' },
];
