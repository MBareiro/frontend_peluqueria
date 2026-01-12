import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let clonedRequest = request;
    // Send credentials (cookies) with every request so httpOnly cookie auth works.
    clonedRequest = request.clone({ withCredentials: true });

    // Aquí pasamos la solicitud clonada al siguiente manejador
    return next.handle(clonedRequest);
  }
}
