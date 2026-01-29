import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Canton, District, Province } from '@app/interfaces';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AddressComponent implements OnChanges{
  
  @Input() addressForm!: FormGroup;
  @Input() provinces: Province[] = [];
  @Input() cantons: Canton[] = [];
  @Input() districts: District[] = [];

  @Output() provinceChange = new EventEmitter<string>();
  @Output() cantonChange = new EventEmitter<string>();

  // Variables de tipo de interfa de dirección para su uso externo.
  provinceData: Province = { id: '', name: '' };
  cantonData: Canton = { id: '', name: '' };
  districtData: District = { id: '', name: '' };

  ngOnChanges(changes: SimpleChanges): void {

    // Variables que convierten los valores de la base de datos en interfaces para la dirección.

    this.provinceData.id  = changes['addressForm'].currentValue.controls['provinceId'].value
    this.provinceData.name = changes['addressForm'].currentValue.controls['province'].value
    
    this.cantonData.id = changes['addressForm'].currentValue.controls['cantonId'].value
    this.cantonData.name = changes['addressForm'].currentValue.controls['canton'].value

    this.districtData.id = changes['addressForm'].currentValue.controls['districtId'].value
    this.districtData.name = changes['addressForm'].currentValue.controls['district'].value


    // Llamado de las funciones que cambian los valores de los campos respectivos.
    this.onProvinceSelectExternal(this.provinceData);
       

  }

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

  // Manejo para direcciones externas

  onProvinceSelectExternal(province: Province): void{
    if (province.id) {
      this.provinceChange.emit(province.id);
      this.addressForm.patchValue({
        provinceId: province.id,
        province: province.name,
        cantonId: '',
        canton: '',
        districtId: '',
        district: ''
      });

      this.onCantonSelectExternal(this.cantonData);

    }
  }

  onCantonSelectExternal(canton: Canton): void{
    if(canton.id){
      this.cantonChange.emit(canton.id);
      this.addressForm.patchValue({
        cantonId: canton.id,
        canton: canton.name,
        districtId: '',
        district: ''
      });
      
      this.onDistrictSelectExternal(this.districtData);
    }
    
  }

  onDistrictSelectExternal(district: District): void{
    const districtId = district.id;
    const districtName = district.name;

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


