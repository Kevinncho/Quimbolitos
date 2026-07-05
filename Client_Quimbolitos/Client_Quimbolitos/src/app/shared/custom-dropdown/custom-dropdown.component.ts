import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

export interface CustomDropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-dropdown.component.html',
  styleUrl: './custom-dropdown.component.css'
})
export class CustomDropdownComponent {
  @Input() label = '';
  @Input() placeholder = 'Selecciona una opcion';
  @Input() options: CustomDropdownOption[] = [];
  @Input() value = '';
  @Input() ariaLabel = 'Abrir menu desplegable';
  @Output() valueChange = new EventEmitter<string>();

  abierto = false;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  get selectedLabel(): string {
    return this.options.find((option) => option.value === this.value)?.label || this.placeholder;
  }

  toggleDropdown(): void {
    this.abierto = !this.abierto;
  }

  cerrarDropdown(): void {
    this.abierto = false;
  }

  seleccionar(value: string): void {
    this.valueChange.emit(value);
    this.cerrarDropdown();
  }

  onButtonKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.abierto = true;
    }

    if (event.key === 'Escape') {
      this.cerrarDropdown();
    }
  }

  onOptionKeydown(event: KeyboardEvent, value: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.seleccionar(value);
    }

    if (event.key === 'Escape') {
      this.cerrarDropdown();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.cerrarDropdown();
    }
  }
}
