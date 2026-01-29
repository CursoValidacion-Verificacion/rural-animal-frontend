import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Canton, District, Province } from '@app/interfaces';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule],
  templateUrl: './address-forms.component.html',
  styleUrl: './address-forms.component.scss'
})
export class AddressFormComponent {
  @Input() addressForm!: FormGroup;
  @Input() provinces: Province[] = [];
  @Input() cantons: Canton[] = [];
  @Input() districts: District[] = [];

  @Output() provinceChange = new EventEmitter<string>();
  @Output() cantonChange = new EventEmitter<string>();

  onProvinceSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const provinceId = select.value;
    const provinceName = select.options[select.selectedIndex].text;

    if (provinceId) {
      this.provinceChange.emit(provinceId);
      this.addressForm.patchValue({
        provinceId: provinceId,
        province: provinceName,
        cantonId: '',
        canton: '',
        districtId: '',
        district: ''
      });
    }
  }

  onCantonSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const cantonId = select.value;
    const cantonName = select.options[select.selectedIndex].text;

    if (cantonId) {
      this.cantonChange.emit(cantonId);
      this.addressForm.patchValue({
        cantonId: cantonId,
        canton: cantonName,
        districtId: '',
        district: ''
      });
    }
  }

  onDistrictSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const districtId = select.value;
    const districtName = select.options[select.selectedIndex].text;

    this.addressForm.patchValue({
      districtId: districtId,
      district: districtName
    });
  }

  showError(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }
}