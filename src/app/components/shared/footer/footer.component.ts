import { Component, OnInit } from '@angular/core';
import { BusinessConfigService } from '../../../services/business-config.service';
import { Observable } from 'rxjs';
import { BusinessConfig } from '../../../models/business-config.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  config$!: Observable<BusinessConfig | null>;
  currentYear: number = new Date().getFullYear();

  constructor(private businessConfigService: BusinessConfigService) {}

  ngOnInit(): void {
    this.config$ = this.businessConfigService.config$;
  }
}
