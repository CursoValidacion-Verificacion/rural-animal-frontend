import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BillsComponent} from './bills.component';
import {BillService} from '@app/services/bill.service';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {ITransaction} from '@app/interfaces';

describe('BillsComponent', () => {
    let component: BillsComponent;
    let fixture: ComponentFixture<BillsComponent>;
    let billServiceMock: jest.Mocked<BillService>;

    const mockTransaction: ITransaction = {
        id: 1,
        status: 'COMPLETED',
        subTotal: 100,
        total: 118,
        tax: 18,
        creationDate: new Date('2024-03-01T10:00:00')
    };

    beforeEach(async () => {
        billServiceMock = {
            search: {page: 1},
            selectUser: jest.fn(),
            downloadBill: jest.fn(),
        } as any;

        await TestBed.configureTestingModule({
            imports: [
                BillsComponent,
                ReactiveFormsModule
            ],
            providers: [
                FormBuilder,
                {provide: BillService, useValue: billServiceMock}
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BillsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crear el componente', () => {
        expect(component).toBeTruthy();
    });

    it('debería inicializar con valores por defecto', () => {
        expect(component.showDetails).toBeFalsy();
        expect(component.selectedTransaction).toBeNull();
        expect(billServiceMock.selectUser).toHaveBeenCalled();
        expect(billServiceMock.search.page).toBe(1);
    });

    describe('setDetails', () => {
        it('debería establecer los valores del formulario correctamente cuando los datos de las factura están completos', () => {
            component.setDetails(mockTransaction);

            const formValue = component.billForm.getRawValue();
            expect(formValue).toMatchObject({
                id: '1',
                status: 'COMPLETED',
                subTotal: 100,
                total: 118,
                IVA: 18
            });
            expect(formValue.billDate ? formValue.billDate.split('T')[0] : null).toBe('2024-03-01');
            expect(component.showDetails).toBeTruthy();
        });

        it('debería manejar valores indefinidos en los datos de la factura', () => {
            const incompleteBill: Partial<ITransaction> = {
                id: undefined,
                status: undefined,
                subTotal: undefined,
                total: undefined,
                tax: undefined,
                creationDate: undefined
            };

            component.setDetails(incompleteBill as ITransaction);

            expect(component.billForm.getRawValue()).toEqual({
                id: '',
                status: '',
                subTotal: 0,
                total: 0,
                IVA: 0,
                billDate: null
            });
        });
    });

    describe('showDetailsForm', () => {
        it('debería alternar el valor de showDetails', () => {
            expect(component.showDetails).toBeFalsy();

            component.showDetailsForm();
            expect(component.showDetails).toBeTruthy();

            component.showDetailsForm();
            expect(component.showDetails).toBeFalsy();
        });
    });

    describe('downloadTransaction', () => {
        it('debería llamar a billService.downloadBill con la transacción correctamente', () => {
            component.downloadTransaction(mockTransaction);
            expect(billServiceMock.downloadBill).toHaveBeenCalledWith(mockTransaction);
        });
    });
});