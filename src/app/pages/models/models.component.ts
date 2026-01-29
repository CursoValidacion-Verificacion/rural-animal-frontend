import { Component } from "@angular/core";
import { AnimalFilterComponent } from "@app/components/animal/animal-filter/animal-filter.component";

@Component({
  selector: "app-models",
  standalone: true,
  imports: [AnimalFilterComponent],
  templateUrl: "./models.component.html",
  styleUrls: ["./models.component.scss"],
})
export class ModelsComponent {}
