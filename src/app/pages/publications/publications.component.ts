import {
    Component,
    inject,
} from '@angular/core';
import { PublicationsListComponent } from "@app/components/publication/publications-list/publications-list.component";
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { ModalComponent } from '@app/components/modal/modal.component';
import { LoaderComponent } from '@app/components/loader/loader.component';
import { PublicationService } from '@app/services/publication.service';
import { ModalService } from '@app/services/modal.service';
import { FormBuilder, Validators } from '@angular/forms';
import { IPublication } from '@app/interfaces';
import { PublicationsFormComponent } from '@app/components/publication/publications-form/publications-form.component';
import { AuthService } from '@app/services/auth.service';
import {string} from "three/src/nodes/tsl/TSLCore";

@Component({
    selector: 'app-publications',
    standalone: true,
    imports: [
        PublicationsListComponent,
        PublicationsFormComponent,
        PaginationComponent,
        LoaderComponent,
    ],
    templateUrl: './publications.component.html',
    styleUrl: './publications.component.scss'
})
export class PublicationsComponent {
    public publicationService: PublicationService = inject(PublicationService);
    filters: Record<string, string> = {};
    public showForm: boolean = false;

    // Cuando es falso será para crear y cuando sea verdadero será para actualizar
    public changeButtonType: boolean = false;


    public fb: FormBuilder = inject(FormBuilder);
    publicationForm = this.fb.group({
        id: [''],
        title: ['', Validators.required],
        type: ['', Validators.required],
        specie: ['', Validators.required],
        race: ['', Validators.required],
        gender: ['', Validators.required],
        weight: ['', [Validators.required, Validators.min(0)]],
        birthDate: ['', Validators.required],
        senasaCertificate: ['', Validators.required],
        price: ['', [Validators.required, Validators.min(0)]],
        startDate: [''],
        endDate: [''],
        minimumIncrease: ['', Validators.min(1)],
        state: [''],
        creationDate: ['']
    });

    addressForm = this.fb.group({
        id: [''],
        provinceId: ['', Validators.required],
        province: ['', Validators.required],
        cantonId: ['', Validators.required],
        canton: ['', Validators.required],
        districtId: ['', Validators.required],
        district: ['', Validators.required],
        otherDetails: ['', Validators.required],
    });


    constructor() {
        this.publicationService.search.page = 1;
        this.publicationService.selectUser(this.filters = {
      type: '',
      sort: '',
      order: ''
    });
    
  }

    savePublication(publication: IPublication) {
        this.publicationService.save(publication);
        this.showPublicationForm();
    }

    deletePublication(publication: IPublication) {
        publication.state = "Deleted";
        publication.user = undefined;
        this.publicationService.update(publication, ("La publicación " + publication.title + " fue eliminada con éxito"));
    }

    callEdition(publication: IPublication) {
        publication.user = undefined;
        this.publicationService.update(publication, ("La publicación " + publication.title + " fue actualizada con éxito"));
        this.showPublicationForm();
    }

    callCreation() {
        this.changeButtonType = false;
        this.showPublicationForm();
    }

    editPublication(publication: IPublication) {

        this.publicationForm.controls["id"].setValue(publication.id ? publication.id.toString() : '');
        this.publicationForm.controls["title"].setValue(publication.title ? publication.title : '');
        this.publicationForm.controls["specie"].setValue(publication.specie ? publication.specie : '');
        this.publicationForm.controls["race"].setValue(publication.race ? publication.race : '');
        this.publicationForm.controls["gender"].setValue(publication.gender ? publication.gender : '');
        this.publicationForm.controls["weight"].setValue(publication.weight ? JSON.stringify(publication.weight) : '');
        this.publicationForm.controls["birthDate"].setValue(publication.birthDate ? new Date(publication.birthDate).toISOString().split('T')[0] : null);
        this.publicationForm.controls["senasaCertificate"].setValue(publication.senasaCertificate ? publication.senasaCertificate : '');
        this.publicationForm.controls["price"].setValue(publication.price ? JSON.stringify(publication.price) : '');
        this.publicationForm.controls["startDate"].setValue(publication.startDate ? new Date(publication.startDate).toISOString().slice(0, 16) : null);
        this.publicationForm.controls["endDate"].setValue(publication.endDate ? new Date(publication.endDate).toISOString().slice(0, 16) : null);
        this.publicationForm.controls["minimumIncrease"].setValue(publication.minimumIncrease ? publication.minimumIncrease.toString() : '');
        this.publicationForm.controls['type'].setValue(publication.type);
        this.publicationForm.controls["state"].setValue(publication.state ? publication.state : '');
        this.publicationForm.controls["creationDate"].setValue(publication.creationDate ? JSON.stringify(publication.creationDate) : '');
        this.addressForm.controls["id"]?.setValue(publication.direction.id ? publication.direction.id.toString() : '');

        this.addressForm.controls["province"]?.setValue(publication.direction.province ? publication.direction.province : '');
        this.addressForm.controls["provinceId"]?.setValue(publication.direction.provinceId ? publication.direction.provinceId : '');
        this.addressForm.controls["cantonId"]?.setValue(publication.direction.cantonId ? publication.direction.cantonId : '');
        this.addressForm.controls["districtId"]?.setValue(publication.direction.districtId ? publication.direction.districtId : '');
        this.addressForm.controls["otherDetails"]?.setValue(publication.direction.otherDetails ? publication.direction.otherDetails : '');

        this.changeButtonType = true;
        this.showPublicationForm();

    }


    showPublicationForm() {
        this.showForm = !this.showForm;
    }

    // Actualizar los filtros desde la lista
    setFilters(filters: Record<string, string>): void {
        this.filters = filters;
        if (this.publicationService.search.page != null) {
            this.filterPublication();
        }
    }


  // Filtrar las publicaciones con los filtros actuales
  filterPublication(): void {
    this.publicationService.selectUser(this.filters);
  }





}
