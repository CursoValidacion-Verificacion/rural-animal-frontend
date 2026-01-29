import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {ShoppingCartComponent} from './shopping-cart.component';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ShoppingCartService} from "@app/services/shopping-cart.service";
import {PayPalService} from "@app/services/paypal.service";
import {AlertService} from "@app/services/alert.service";
import {signal, WritableSignal} from '@angular/core';
import {IPublication} from "@app/interfaces";
import {MatSnackBar} from '@angular/material/snack-bar';

describe('ShoppingCartComponent', () => {
    let component: ShoppingCartComponent;
    let fixture: ComponentFixture<ShoppingCartComponent>;
    let cartServiceMock: jest.Mocked<ShoppingCartService>;
    let paypalServiceMock: jest.Mocked<PayPalService>;
    let alertServiceMock: jest.Mocked<AlertService>;
    let routeMock: Partial<ActivatedRoute>;
    let routerMock: Partial<Router>;
    let items: WritableSignal<IPublication[]>;

    beforeEach(async () => {
        items = signal<IPublication[]>([]);

        cartServiceMock = {
            getItems: jest.fn().mockReturnValue(items),
            addItem: jest.fn(),
            removeItem: jest.fn(),
            clearCart: jest.fn(),
            getTotal: jest.fn(),
            getItemCount: jest.fn()
        } as unknown as jest.Mocked<ShoppingCartService>;

        paypalServiceMock = {
            createPayment: jest.fn(),
            executePayment: jest.fn(),
            cancelPayment: jest.fn(),
            find: jest.fn(),
            findAll: jest.fn(),
            findAllWithParams: jest.fn(),
            buildUrlParams: jest.fn()
        } as unknown as jest.Mocked<PayPalService>;

        alertServiceMock = {
            displayAlert: jest.fn(),
            snackBar: {} as MatSnackBar
        } as unknown as jest.Mocked<AlertService>;

        routeMock = {
            queryParams: of({})
        };

        routerMock = {};

        await TestBed.configureTestingModule({
            imports: [
                CommonModule,
                RouterModule,
                ShoppingCartComponent
            ],
            providers: [
                {provide: ShoppingCartService, useValue: cartServiceMock},
                {provide: PayPalService, useValue: paypalServiceMock},
                {provide: AlertService, useValue: alertServiceMock},
                {provide: ActivatedRoute, useValue: routeMock},
                {provide: Router, useValue: routerMock}
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ShoppingCartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crear el componente', () => {
        expect(component).toBeTruthy();
    });

    describe('Método: initializePaymentFlow', () => {
        it('debería procesar un pago exitosamente si se proporcionan paymentId y PayerID', () => {

            routeMock.queryParams = of({paymentId: '123', PayerID: '456'});
            jest.spyOn(paypalServiceMock, 'executePayment').mockReturnValue(of({}));

            component['initializePaymentFlow']();

            expect(paypalServiceMock.executePayment).toHaveBeenCalledWith('123', '456');
            expect(alertServiceMock.displayAlert).toHaveBeenCalledWith(
                'success',
                'Pago procesado exitosamente',
                'center',
                'top',
                ['success-snackbar']
            );
        });

        it('debería manejar un error al procesar el pago', () => {
            routeMock.queryParams = of({paymentId: '123', PayerID: '456'});
            jest.spyOn(paypalServiceMock, 'executePayment').mockReturnValue(
                throwError(() => new Error('Payment error'))
            );

            component['initializePaymentFlow']();

            expect(paypalServiceMock.executePayment).toHaveBeenCalledWith('123', '456');
            expect(alertServiceMock.displayAlert).toHaveBeenCalledWith(
                'error',
                'Error al procesar el pago',
                'center',
                'top',
                ['error-snackbar']
            );
        });
    });

    describe('Método: checkout', () => {
        it('debería crear un pago y redirigir a la URL proporcionada', () => {
            const mockItems = [
                {id: 1} as IPublication,
                {id: 2} as IPublication
            ];
            cartServiceMock.getItems.mockReturnValue(signal(mockItems));

            jest.spyOn(paypalServiceMock, 'createPayment').mockReturnValue(
                of({data: 'http://localhost/'})
            );

            component.checkout();

            expect(paypalServiceMock.createPayment).toHaveBeenCalled();
            expect(window.location.href).toBe('http://localhost/');
        });

        it('debería mostrar un error si no se recibe la URL de pago', () => {
            cartServiceMock.getItems.mockReturnValue(signal([{id: 1} as IPublication]));

            jest.spyOn(paypalServiceMock, 'createPayment').mockReturnValue(of({}));

            component.checkout();

            expect(alertServiceMock.displayAlert).toHaveBeenCalledWith(
                'error',
                'Error: No se recibió URL de pago',
                'center',
                'top',
                ['error-snackbar']
            );
        });

        it('debería mostrar un error si el carrito está vacío', () => {
            cartServiceMock.getItems.mockReturnValue(signal([]));

            component.checkout();

            expect(alertServiceMock.displayAlert).toHaveBeenCalledWith(
                'warning',
                'El carrito está vacío',
                'center',
                'top',
                ['warning-snackbar']
            );
        });
    });
});