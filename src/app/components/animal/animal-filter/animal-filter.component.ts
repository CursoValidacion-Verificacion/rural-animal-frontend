import { Component } from "@angular/core";
import { AnimalStageViewerComponent } from "../animal-stage-viewer/animal-stage-viewer.component";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-animal-filter",
  standalone: true,
  imports: [AnimalStageViewerComponent, FormsModule, CommonModule],
  templateUrl: "./animal-filter.component.html",
  styleUrls: ["./animal-filter.component.scss"],
})
export class AnimalFilterComponent {
  speciesList: string[] = [
    "Asno",
    "Bovino",
    "Bubalino",
    "Caprino",
    "Conejo",
    "Equino",
    "Gallina",
    "Ovino",
    "Pato",
    "Pavo",
    "Pollo de Engorde",
    "Porcino",
  ];

  breedsData: {
    [key in
      | "Asno"
      | "Bovino"
      | "Bubalino"
      | "Caprino"
      | "Conejo"
      | "Equino"
      | "Gallina"
      | "Ovino"
      | "Pato"
      | "Pavo"
      | "Pollo de Engorde"
      | "Porcino"]: string[];
  } = {
    Asno: ["Criollo", "Muleno"],
    Bovino: ["Angus", "Brahman", "Gyr", "Holstein", "Jersey", "Simmental"],
    Bubalino: ["Búfalo de Agua", "Búfalo de Mediterráneo"],
    Caprino: ["Alpina", "Boer", "Nubian", "Saanen"],
    Conejo: ["California", "Flemish Giant", "Nueva Zelanda", "Rex"],
    Equino: [
      "Criollo Costarricense",
      "Paso Fino",
      "Percherón",
      "Pura Raza Española",
    ],
    Gallina: ["Rhode Island Red", "Leghorn", "Plymouth Rock", "Sussex"],
    Ovino: ["Dorper", "Merino", "Pelibuey", "Suffolk"],
    Pato: ["Pato Khaki Campbell", "Pato Muscovy", "Pato Pekín"],
    Pavo: ["Bronceado", "Pavo Blanco"],
    "Pollo de Engorde": ["Arbor Acres", "Cobb 500", "Hubbard Flex", "Ross 308"],
    Porcino: ["Berkshire", "Duroc", "Landrace", "Pietran", "Yorkshire"],
  };

  selectedSpecies:
    | "Asno"
    | "Bovino"
    | "Bubalino"
    | "Caprino"
    | "Conejo"
    | "Equino"
    | "Gallina"
    | "Ovino"
    | "Pato"
    | "Pavo"
    | "Pollo de Engorde"
    | "Porcino"
    | "" = "";
  selectedBreed: string = "";
  breeds: string[] = [];
  modelPaths = { bebe: "", joven: "", adulto: "" };

  onSpeciesChange() {
    if (this.selectedSpecies) {
      this.breeds = this.breedsData[this.selectedSpecies] || [];
    } else {
      this.breeds = [];
    }
    this.selectedBreed = "";
    this.resetModelPaths();
  }

  onBreedChange() {
    const basePath = `assets/models/${this.selectedSpecies}/${this.selectedBreed}`;
    this.modelPaths = {
      bebe: `${basePath}/bebe.glb`,
      joven: `${basePath}/joven.glb`,
      adulto: `${basePath}/adulto.glb`,
    };
  }

  private resetModelPaths() {
    this.modelPaths = { bebe: "", joven: "", adulto: "" };
  }
}
