import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { CrearMemoriaMapaComponent } from './crear-memoria-mapa.component';

describe('CrearMemoriaMapaComponent', () => {
  let component: CrearMemoriaMapaComponent;
  let fixture: ComponentFixture<CrearMemoriaMapaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearMemoriaMapaComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearMemoriaMapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
