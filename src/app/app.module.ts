// Angular core & locale
import { NgModule, LOCALE_ID, APP_INITIALIZER } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs);

// Angular platform
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Routing
import { AppRoutingModule } from './app-routing.module';

// HTTP
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material (centralizado)
import { MaterialModule } from './shared/material.module';

// App root
import { AppComponent } from './app.component';

// Components
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { DashboardNavigationComponent } from './components/dashboard-navigation/dashboard-navigation.component';
import { LoginComponent } from './components/login/login.component';
import { ErrorPageComponent } from './components/shared/error-page/error-page.component';
import { ForgotPasswordComponent } from './components/account/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/account/reset-password/reset-password.component';
import { MapComponent } from './components/map/map.component';
import { LandingPageComponent } from './components/shared/landing-page/landing-page.component';

// Public appointment components (accessible to guests without login)
import { CancelAppointmentComponent } from './components/appointment/cancel-appointment/cancel-appointment.component';
import { AppointmentCancelledComponent } from './components/appointment/appointment-cancelled/appointment-cancelled.component';

// Super Admin components
import { SuperAdminDashboardComponent } from './components/admin/super-admin-dashboard/super-admin-dashboard.component';
import { TenantListComponent } from './components/admin/tenant-list/tenant-list.component';
import { TenantDetailsComponent } from './components/admin/tenant-details/tenant-details.component';
import { TenantFormDialogComponent } from './components/admin/tenant-form-dialog/tenant-form-dialog.component';
import { BillingListComponent } from './components/admin/billing-list/billing-list.component';

// Interceptors & utils
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { TenantInterceptor } from './interceptors/tenant.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { FormValidators } from './components/shared/form-validators/form-validators';
import { AuthService } from './services/auth.service';
import { TenantSelectorComponent } from './components/shared/tenant-selector/tenant-selector.component';

@NgModule({
  declarations: [
    AppComponent,
    TenantSelectorComponent,
    // Shared/Core components (always loaded)
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    CarouselComponent,
    DashboardNavigationComponent,
    LoginComponent,
    ErrorPageComponent,
    MapComponent,
    
    // Password recovery (public routes)
    ForgotPasswordComponent,
    ResetPasswordComponent,
    
    // Public appointment components (accessible to guests without login)
    CancelAppointmentComponent,
    AppointmentCancelledComponent,
    
    // Super Admin components
    SuperAdminDashboardComponent,
    TenantListComponent,
    TenantDetailsComponent,
    TenantFormDialogComponent,
    BillingListComponent,
    
    // Landing page genérica
    LandingPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,

    // Forms
    FormsModule,
    ReactiveFormsModule,

    // Material (centralizado)
    MaterialModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-ES' },
    FormValidators,
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: TenantInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => auth.init(),
      deps: [AuthService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
