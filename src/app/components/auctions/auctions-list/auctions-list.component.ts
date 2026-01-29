import { CommonModule } from "@angular/common";
import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from "@angular/core";
import { PaginationComponent } from "@app/components/pagination/pagination.component";
import { IPublication } from "@app/interfaces";

@Component({
  selector: "app-auctions-list",
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: "./auctions-list.component.html",
  styleUrl: "./auctions-list.component.scss",
})
export class AuctionsListComponent implements OnChanges {
  @Input() auctionsPublications: IPublication[] = [];
  @Output() viewDetails = new EventEmitter<IPublication>();

  filteredAuctionsPublications: IPublication[] = [];
  filters: Record<string, string> = {};

  constructor() {}


  ngOnChanges() {
    if (this.auctionsPublications) {
      this.filteredAuctionsPublications = [...this.auctionsPublications];
      this.applyFiltersAndSorting();
    }
  }

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
      this.filteredAuctionsPublications.sort((a, b) => a.price - b.price);
    } else if (criteria === "especie") {
      this.filteredAuctionsPublications.sort((a, b) =>
        a.specie.localeCompare(b.specie)
      );
    }
  }

  private applyFiltersAndSorting() {
    this.filteredAuctionsPublications = this.auctionsPublications.filter(
      (publication) =>
        (!this.filters["type"] || publication.type === this.filters["type"]) &&
        (!this.filters["specie"] ||
          publication.specie === this.filters["specie"])
    );
    this.sortPublicationsBySelectedCriteria();
  }
}
