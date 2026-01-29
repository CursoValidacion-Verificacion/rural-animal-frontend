import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatListModule} from "@angular/material/list";
import {IPublication, ITransaction} from "@app/interfaces";

@Component({
  selector: 'app-bills-details',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
      MatListModule
  ],
  templateUrl: './bills-details.component.html',
  styleUrl: './bills-details.component.scss'
})
export class BillsDetailsComponent {
  @Input() billForm!: FormGroup;
  @Input() transaction!: ITransaction;
  @Output() downloadedTransaction: EventEmitter<ITransaction> = new EventEmitter<ITransaction>();


  download() {
    let temporalId: number | undefined = this.transaction.user?.id
    let temporalPublications: IPublication[] | undefined = this.transaction.publications;
    this.transaction.user = undefined;
    this.transaction.user = {id: temporalId};
    this.transaction.publications = undefined;
    this.downloadedTransaction.emit(this.transaction);
    this.transaction.publications = temporalPublications;
  }
}
