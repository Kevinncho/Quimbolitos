import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleRecuerdoComponent } from './detalle-recuerdo.component';

describe('DetalleRecuerdoComponent', () => {
  let component: DetalleRecuerdoComponent;
  let fixture: ComponentFixture<DetalleRecuerdoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleRecuerdoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleRecuerdoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
