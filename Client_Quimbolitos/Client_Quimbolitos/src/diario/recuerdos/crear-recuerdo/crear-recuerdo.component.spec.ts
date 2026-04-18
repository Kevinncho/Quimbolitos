import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CrearRecuerdoComponent } from './crear-recuerdo.component';

describe('CrearRecuerdoComponent', () => {
  let component: CrearRecuerdoComponent;
  let fixture: ComponentFixture<CrearRecuerdoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearRecuerdoComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearRecuerdoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
