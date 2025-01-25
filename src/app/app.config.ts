import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment.prod';
import { routes } from './app.routes';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { AngularEditorModule } from '@kolkov/angular-editor';
import {  provideHttpClient } from '@angular/common/http';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // provideHttpClient(withInterceptors([customInterceptor])),
    ReactiveFormsModule,
    FormsModule,
    provideAnimationsAsync(),
    MatDialog,
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
    provideFirebaseApp(() => initializeApp({ ...environment.firebaseConfig })),
    provideFirestore(() => getFirestore()),
    AngularEditorModule,
    provideHttpClient(),
  ],
};
