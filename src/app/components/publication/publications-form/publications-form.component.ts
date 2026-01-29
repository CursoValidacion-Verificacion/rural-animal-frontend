import {CommonModule} from "@angular/common";
import {HttpClient} from "@angular/common/http";
import {
    Component,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from "@angular/core";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {
    Animals,
    Canton,
    District,
    IPhoto,
    IPublication,
    Province,
    Species,
} from "@app/interfaces";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {
    MAT_DATE_FORMATS,
    MatNativeDateModule,
    DateAdapter,
    NativeDateAdapter,
} from "@angular/material/core";

// JSON de los animales
import jsonAnimals from "src/assets/data/jsonAnimals.json";

// Imports para la dirección
import {AddressComponent} from "../../address/address.component";
import {AddressService} from "@app/services/address.service";
import {MatFormField, MatHint, MatLabel} from "@angular/material/form-field";

declare const cloudinary: any;

@Component({
    selector: "app-publications-form",
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        AddressComponent,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDatepickerModule,
    ],
    templateUrl: "./publications-form.component.html",
    styleUrl: "./publications-form.component.scss",
})
export class PublicationsFormComponent implements OnChanges, OnInit {
    //Manejo de dirección
    private addressService = inject(AddressService);
    provinces: Province[] = [];
    cantons: Canton[] = [];
    districts: District[] = [];

    //Animales
    animalsData: Animals;
    selectedSpecies: string | null = null;

    // Variables de Cloudinary

    cloudName = "dsilbekp2";
    uploadPreset = "kabqnv26";
    myWidget: any;
    public cloudinaryResults: any[] = [];

    // Arreglo para imágenes
    public photoArray: IPhoto[] = [];

    @Input() publicationForm!: FormGroup;
    @Input() addressForm!: FormGroup;
    @Input() changeButtonType!: boolean;
    @Output() callSaveMethod: EventEmitter<IPublication> =
        new EventEmitter<IPublication>();
    @Output() callUpdateMethod: EventEmitter<IPublication> =
        new EventEmitter<IPublication>();
    public httpClient: HttpClient = inject(HttpClient);

    //Manejo de tipo de publicación
    public selectedType: string = "";

    types = [
        {id: 1, name: "Subasta"},
        {id: 2, name: "Venta"},
    ];

    //Manejo de animales
    // Función para obtener las razas de una especie seleccionada
    get races() {
        return this.selectedSpecies
            ? this.animalsData.species.find(
                (species: Species) => species.kind === this.selectedSpecies
            )?.races
            : null;
    }

    //Variables para manejar mínimos de las fechas.
    todayLimit: string;
    maxDate: Date;
    minDate: Date;
    minDateTime: string;

    constructor() {
        // JSON de animales dentro de la interfaz
        this.animalsData = jsonAnimals;

        const today = new Date();
        this.todayLimit = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        )
            .toISOString()
            .split("T")[0];
        this.minDateTime = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        )
            .toISOString()
            .slice(0, 16);


        this.maxDate = new Date(today.getFullYear() + 5, 11, 31);
        this.minDate = new Date(today.getFullYear() - 25, 11, 31);

        this.myWidget = cloudinary.createUploadWidget(
            {
                cloudName: this.cloudName,
                uploadPreset: this.uploadPreset,
                theme: "white",
            },
            (error: any, result: any) => {
                if (!error && result && result.event === "success") {
                    this.cloudinaryResults.push(result.info);
                    const uploadedImage = document.getElementById("uploadedimage");
                    if (uploadedImage) {
                        uploadedImage.setAttribute("src", result.info.secure_url);
                    }
                }
            }
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes["publicationForm"].currentValue.controls["type"].value) {
            this.typeSelected();
            this.onSpeciesChange();
        }
    }

    // Llamado del json para las provincias
    async ngOnInit() {
        this.provinces = await this.addressService.getProvinces();
    }

    typeSelected() {
        this.selectedType = this.publicationForm.controls["type"].value;
    }

    onSpeciesChange() {
        this.selectedSpecies = this.publicationForm.controls["specie"].value;
    }

    callSave() {
        this.photoArray = this.cloudinaryResults.map(
            (result: any): IPhoto => ({
                url: result.url,
                name: result.original_filename,
                cloudinaryId: result.public_id,
            })
        );

        const todayForm = new Date();
        let publication: IPublication = {
            title: this.publicationForm.controls["title"].value,
            type: this.publicationForm.controls["type"].value,
            specie: this.publicationForm.controls["specie"].value,
            race: this.publicationForm.controls["race"].value,
            gender: this.publicationForm.controls["gender"].value,
            weight: this.publicationForm.controls["weight"].value,
            birthDate: this.publicationForm.controls["birthDate"].value,
            senasaCertificate:
            this.publicationForm.controls["senasaCertificate"].value,
            price: this.publicationForm.controls["price"].value,
            startDate: this.publicationForm.controls["startDate"].value,
            endDate: this.publicationForm.controls["endDate"].value,
            minimumIncrease: this.publicationForm.controls["minimumIncrease"].value,
            creationDate: todayForm,
            direction: {
                id: this.addressForm.controls["id"].value,
                province: this.addressForm.controls["province"].value,
                provinceId: this.addressForm.controls["provinceId"].value,
                canton: this.addressForm.controls["canton"].value,
                cantonId: this.addressForm.controls["cantonId"].value,
                district: this.addressForm.controls["district"].value,
                districtId: this.addressForm.controls["districtId"].value,
                otherDetails: this.addressForm.controls["otherDetails"].value,
            },
            photos: this.photoArray,
        };

        if (this.publicationForm.controls["id"].value) {
            publication.id = this.publicationForm.controls["id"].value;
        }

        let auctionStartDate = new Date(publication.startDate);

        if (auctionStartDate.getTime() > todayForm.getTime()) {
            publication.state = "Activa";
        } else {
            publication.state = "Activa";
        }

        if (publication.id) {
            this.callUpdateMethod.emit(publication);
        } else {
            this.callSaveMethod.emit(publication);
        }

        this.resetForm();
    }

    // Control de cambios de los campos de dirección
    async handleProvinceChange(provinceId: string) {
        if (provinceId) {
            this.cantons = await this.addressService.getCantones(provinceId);
            this.districts = [];
        }
    }

    async handleCantonChange(cantonId: string) {
        this.provinces = await this.addressService.getProvinces();

        const provinceId = this.provinces.find(
            (p) => p.name === this.addressForm.get("province")?.value
        )?.id;

        if (provinceId && cantonId) {
            this.districts = await this.addressService.getDistricts(
                provinceId,
                cantonId
            );
        }
    }

    resetForm() {
        this.publicationForm.reset();
        this.publicationForm.controls["type"].setValue("");
        this.selectedType = "";
        this.publicationForm.controls["gender"].setValue("");
        this.publicationForm.controls["specie"].setValue("");
        this.publicationForm.controls["race"].setValue("");
        this.addressForm.reset();
        this.addressForm.controls["provinceId"].setValue("");
        this.addressForm.controls["cantonId"].setValue("");
        this.addressForm.controls["districtId"].setValue("");
    }

    openWidget() {
        this.myWidget.open();
    }
}
