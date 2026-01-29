import { CommonModule } from "@angular/common";
import {Component, EventEmitter, Input, Output, OnInit, OnChanges} from "@angular/core";
import { PaginationComponent } from "@app/components/pagination/pagination.component";
import { IPublication } from "@app/interfaces";

@Component({
  selector: "app-sales-list",
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: "./sales-list.component.html",
  styleUrl: "./sales-list.component.scss",
})
export class SalesListComponent implements OnChanges {
  @Input() salesPublications: IPublication[] = [];
  @Output() viewDetails = new EventEmitter<IPublication>();
  filteredSalesPublications: IPublication[] = [];
  filters: Record<string, string> = {};

  constructor() {}

  ngOnChanges() {
    if (this.salesPublications) {
      this.filteredSalesPublications = [...this.salesPublications];
      this.applyFiltersAndSorting();
    }
  }

  // Emite el evento con la publicación seleccionada
  showDetails(publication: IPublication) {
    this.viewDetails.emit(publication);
  }

  filterPublications(event: Event, criteria: string) {
    const selectElement = event.target as HTMLSelectElement;
    this.filters[criteria] = selectElement.value;

    this.applyFiltersAndSorting();
  }

  private sortPublicationsBySelectedCriteria() {
    if (this.filters["sort"]) {
      this.sortPublications(this.filters["sort"]);
    }
  }

  sortPublications(criteria: string) {
    if (criteria === "precio") {
      this.filteredSalesPublications.sort((a, b) => a.price - b.price);
    } else if (criteria === "especie") {
      this.filteredSalesPublications.sort((a, b) =>
        a.specie.localeCompare(b.specie)
      );
    }
  }

  private applyFiltersAndSorting() {
    this.filteredSalesPublications = this.salesPublications.filter(
      (publication) =>
        (!this.filters["type"] || publication.type === this.filters["type"]) &&
        (!this.filters["specie"] ||
          publication.specie === this.filters["specie"])
    );
    this.sortPublicationsBySelectedCriteria();
  }
}
