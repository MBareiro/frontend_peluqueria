import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoClientComponent } from './info-client.component';

describe('InfoClientComponent', () => {
  let component: InfoClientComponent;
  let fixture: ComponentFixture<InfoClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoClientComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InfoClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
