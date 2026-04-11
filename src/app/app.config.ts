import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';


import { routes } from './app.routes';
import { MyBootstrapLikePreset } from './shared/models/constants';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MyBootstrapLikePreset,
        options: {
            darkModeSelector: 'none', 
            cssLayer: {
                name: 'primeng', 
                order: 'primeng, theme'
            }
        }
      },
      // translation: HEBREW_LOCALE,
      ripple: true
    }),
  ]
};
