import {CommonModule} from "@angular/common";
import {Component, EventEmitter, inject, Input, OnChanges, Output,} from "@angular/core";
import {ModalComponent} from "@app/components/modal/modal.component";
import {IPublication} from "@app/interfaces";
import {ModalService} from "@app/services/modal.service";
import {PublicationService} from "@app/services/publication.service";
import {debounceTime, Subject} from "rxjs";

@Component({
    selector: "app-publications-list",
    standalone: true,
    imports: [CommonModule, ModalComponent],
    templateUrl: "./publications-list.component.html",
    styleUrls: ["./publications-list.component.scss"],
})
export class PublicationsListComponent implements OnChanges {
    @Input() title: string = "";
    @Input() publications: IPublication[] = [];
    @Output() callEditionAction: EventEmitter<IPublication> = new EventEmitter<IPublication>();
    @Output() callDeleteAction: EventEmitter<IPublication> = new EventEmitter<IPublication>();
    @Output() filter: EventEmitter<Record<string, string>> = new EventEmitter<Record<string, string>>();
    public modalService: ModalService = inject(ModalService);

    searchSubject: Subject<string> = new Subject();
    filteredPublications: IPublication[] = [];

    filters: Record<string, string> = {};

        constructor() {
    }

    ngOnChanges() {
        if (this.publications) {
            this.filteredPublications = [...this.publications];
        }
    }

    filterPublications(event: Event, criteria: string) {

        this.searchSubject.pipe(debounceTime(3000)).subscribe((searchTerm) => {
            this.filters['search'] = searchTerm;
        });
        this.filters[criteria] = (event.target as HTMLInputElement).value.trim();
        this.filter.emit(this.filters);

    }
}