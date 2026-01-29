import {Component, inject, Input} from '@angular/core';
import {LoaderComponent} from "@app/components/loader/loader.component";
import {PaginationComponent} from "@app/components/pagination/pagination.component";
import {BillService} from "@app/services/bill.service";
import {AuthService} from "@app/services/auth.service";
import {BillsListComponent} from "@app/components/bill/bills-list/bills-list.component";
import {BillsDetailsComponent} from "@app/components/bill/bills-details/bills-details.component";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {IPublication, ITransaction} from "@app/interfaces";

@Component({
  selector: 'app-bills',
  standalone: true,
    imports: [
        LoaderComponent,
        PaginationComponent,
        BillsListComponent,
        BillsDetailsComponent
    ],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.scss'
})
export class BillsComponent {

    showDetails: boolean = false;

    public selectedTransaction: ITransaction | null = null;
    public transactionService: BillService = inject(BillService);

    public fb: FormBuilder = inject(FormBuilder);
    billForm = new FormGroup({
        id: new FormControl({value: '', disabled: true}),
        status: new FormControl({value: '', disabled: true}),
        subTotal: new FormControl({value: 0, disabled: true}),
        total: new FormControl({value: 0, disabled: true}),
        IVA: new FormControl({value: 0, disabled: true}),
        billDate: new FormControl({value: '', disabled: true}),
    })

    constructor(){
        this.transactionService.search.page = 1;
        this.transactionService.selectUser();
    }

    setDetails(bill: ITransaction){

        this.selectedTransaction = bill

        this.billForm.controls["id"].setValue(bill.id ? bill.id.toString() : '');
        this.billForm.controls["status"].setValue(bill.status ? bill.status : '');
        this.billForm.controls["subTotal"].setValue(bill.subTotal !== undefined ? bill.subTotal : 0);
        this.billForm.controls["total"].setValue(bill.total !== undefined ? bill.total : 0);
        this.billForm.controls["IVA"].setValue(bill.tax !== undefined ? bill.tax : 0);
        this.billForm.controls["billDate"].setValue(bill.creationDate? new Date(bill.creationDate).toISOString().slice(0, 16) : null);
        this.showDetailsForm();
    }

    showDetailsForm(){
        this.showDetails = !this.showDetails;
    }

    downloadTransaction(transaction: ITransaction){
        this.transactionService.downloadBill(transaction);
    }



}
