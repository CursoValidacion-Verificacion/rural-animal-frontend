import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ModalComponent} from "@app/components/modal/modal.component";
import {ITransaction} from "@app/interfaces";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-bills-list',
  standalone: true,
    imports: [
  CommonModule,
    ],
  templateUrl: './bills-list.component.html',
  styleUrl: './bills-list.component.scss'
})
export class BillsListComponent {
  @Input() title: string = '';
  @Input() transactions: ITransaction[] = [];
  @Output() callDetails: EventEmitter<ITransaction> = new EventEmitter<ITransaction>();
}
