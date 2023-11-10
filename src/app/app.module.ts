import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importa FormsModule
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { DashboardNavigationComponent } from './components/dashboard-navigation/dashboard-navigation.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { CreateAppointmentComponent } from './components/appointment/create-appointment/create-appointment.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { UserListComponent } from './components/user/user-list/user-list.component';
import { UserCreateComponent } from './components/user/user-create/user-create.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatDateFormats, MatNativeDateModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { ListAppointmentComponent } from './components/appointment/list-appointment/list-appointment.component';
import { ErrorPageComponent } from './components/shared/error-page/error-page.component';
import { ChangePasswordComponent } from './components/account/change-password/change-password.component';
import { ProfileComponent } from './components/account/profile/profile.component';
import { FormValidators } from './components/shared/form-validators/form-validators';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { ForgotPasswordComponent } from './components/account/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/account/reset-password/reset-password.component';
import { CancelAppointmentComponent } from './components/appointment/cancel-appointment/cancel-appointment.component';
import { AppointmentCancelledComponent } from './components/appointment/appointment-cancelled/appointment-cancelled.component';
import { CancelAppointmentsComponent } from './components/appointment/cancel-appointments/cancel-appointments.component';
import {  DateFnsModule, DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { es } from 'date-fns/locale';

export const DATE_FORMATS: MatDateFormats = { 
  parse: { dateInput: 'dd-MM-yyyy'},
  display: { 
    dateInput: 'dd-MM-yyyy-MM',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'yyyy',
  }
}
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    CarouselComponent,
    HeaderComponent,
    LoginComponent,
    DashboardNavigationComponent,
    CreateAppointmentComponent,
    ScheduleComponent,
    UserListComponent,
    UserCreateComponent,
    ListAppointmentComponent,
    ErrorPageComponent,
    ChangePasswordComponent,
    ProfileComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    CancelAppointmentComponent,
    AppointmentCancelledComponent,
    CancelAppointmentsComponent,    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatDividerModule,
    DateFnsModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-ES', }, 
    FormValidators,
    { provide: DateAdapter, useClass: DateFnsAdapter},
    { provide: MAT_DATE_FORMATS, useValue: es}
  ], 
  bootstrap: [AppComponent]
})
export class AppModule { }
