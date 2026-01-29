import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LoginComponent} from './login.component';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {AuthService} from '@app/services/auth.service';
import {UserService} from '@app/services/user.service';
import {ProfileService} from '@app/services/profile.service';
import {ModalService} from '@app/services/modal.service';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {CommonModule} from '@angular/common';
import {ModalComponent} from '@app/components/modal/modal.component';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authServiceMock: jest.Mocked<AuthService>;
    let userServiceMock: jest.Mocked<UserService>;
    let profileServiceMock: jest.Mocked<ProfileService>;
    let modalServiceMock: jest.Mocked<ModalService>;
    let routerMock: jest.Mocked<Router>;
    let routeMock: Partial<ActivatedRoute>;

    beforeEach(async () => {
        authServiceMock = {
            login: jest.fn(),
            loginWithGoogle: jest.fn()
        } as unknown as jest.Mocked<AuthService>;

        userServiceMock = {
            sendRestoreEmail: jest.fn()
        } as unknown as jest.Mocked<UserService>;

        profileServiceMock = {} as jest.Mocked<ProfileService>;

        modalServiceMock = {
            closeAll: jest.fn()
        } as unknown as jest.Mocked<ModalService>;

        routerMock = {
            navigateByUrl: jest.fn(),
            events: of(),
            url: '',
            createUrlTree: jest.fn(),
            serializeUrl: jest.fn(() => '')
        } as unknown as jest.Mocked<Router>;

        routeMock = {
            queryParams: of({})
        };

        await TestBed.configureTestingModule({
            imports: [
                CommonModule,
                FormsModule,
                RouterTestingModule.withRoutes([]),
                LoginComponent,
                ModalComponent
            ],
            providers: [
                {provide: AuthService, useValue: authServiceMock},
                {provide: UserService, useValue: userServiceMock},
                {provide: ProfileService, useValue: profileServiceMock},
                {provide: ModalService, useValue: modalServiceMock},
                {provide: Router, useValue: routerMock},
                {provide: ActivatedRoute, useValue: routeMock}
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crear el componente', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('debería mostrar error de autenticación de Google', () => {
            routeMock.queryParams = of({error: 'auth_failed'});
            component.ngOnInit();
            expect(component.loginError).toBe('Error durante la autenticación con Google');
        });

        it('debería mostrar error de sesión no válida', () => {
            routeMock.queryParams = of({error: 'no_session'});
            component.ngOnInit();
            expect(component.loginError).toBe('Sesión no válida');
        });
    });

    describe('handleLogin', () => {
        const mockEvent = {preventDefault: jest.fn()} as unknown as Event;

        beforeEach(() => {
            jest.clearAllMocks();

            component.loginForm = {
                email: 'test@email.com',
                password: 'password123'
            };

            component.emailModel = {
                valid: true,
                control: {
                    markAsTouched: jest.fn(),
                    setErrors: jest.fn(),
                    errors: null
                }
            } as any;

            component.passwordModel = {
                valid: true,
                control: {
                    markAsTouched: jest.fn(),
                    setErrors: jest.fn(),
                    errors: null
                }
            } as any;
        });

        it('debería navegar al perfil con login exitoso', async () => {
            authServiceMock.login.mockImplementation(() => of({accessToken: 'mockToken', expiresIn: 5000}));

            component.handleLogin(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(authServiceMock.login).toHaveBeenCalledWith(component.loginForm);
            expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/app/profile');
        });

        it('debería mostrar error con credenciales incorrectas', async () => {
            authServiceMock.login.mockImplementation(() => throwError(() => ({status: 401})));

            component.handleLogin(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(component.loginError).toBe('Correo electrónico o contraseña incorrectos');
        });

        it('debería mostrar error cuando el usuario no existe', async () => {
            authServiceMock.login.mockImplementation(() => throwError(() => ({status: 404})));

            component.handleLogin(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(component.loginError).toBe('Usuario no encontrado');
        });

        it('debería mostrar error con datos inválidos', async () => {
            authServiceMock.login.mockImplementation(() => throwError(() => ({status: 400})));

            component.handleLogin(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(component.loginError).toBe('Por favor, verifica tus datos');
        });

        it('debería mostrar error genérico', async () => {
            authServiceMock.login.mockImplementation(() => throwError(() => ({status: 500})));

            component.handleLogin(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(component.loginError).toBe('Error al iniciar sesión. Por favor, intenta nuevamente');
        });

        it('debería marcar campos como tocados si son inválidos', async () => {
            component.emailModel = {
                valid: false,
                control: {
                    markAsTouched: jest.fn(),
                    setErrors: jest.fn(),
                    errors: {'required': true}
                }
            } as any;

            component.passwordModel = {
                valid: false,
                control: {
                    markAsTouched: jest.fn(),
                    setErrors: jest.fn(),
                    errors: {'required': true}
                }
            } as any;

            component.handleLogin(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(component.emailModel.control.markAsTouched).toHaveBeenCalled();
            expect(component.passwordModel.control.markAsTouched).toHaveBeenCalled();
            expect(authServiceMock.login).not.toHaveBeenCalled();
        });
    });

    describe('handleRestoreLogin', () => {
        const mockEvent = {preventDefault: jest.fn()} as unknown as Event;

        const mockForm = {
            invalid: false as boolean,
            value: {},
            control: {
                markAllAsTouched: jest.fn(),
                setErrors: jest.fn()
            }
        } as any;

        beforeEach(() => {
            component.restoreForm = {
                restoreEmail: ''
            };

            userServiceMock.sendRestoreEmail = jest.fn().mockReturnValue(of(undefined));
            jest.clearAllMocks();
        });

        it('debería enviar email de restauración y cerrar modal si el formulario es válido', (done) => {
            component.restoreForm.restoreEmail = 'test@email.com';

            component.handleRestoreLogin(mockForm, mockEvent);

            setTimeout(() => {
                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(userServiceMock.sendRestoreEmail).toHaveBeenCalledWith('test@email.com');
                expect(modalServiceMock.closeAll).toHaveBeenCalled();
                done();
            });
        });

        it('debería marcar campos como tocados si el formulario es inválido', () => {
            Object.defineProperty(mockForm, 'invalid', {
                get: jest.fn(() => true),
                configurable: true
            });

            component.handleRestoreLogin(mockForm, mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockForm.control.markAllAsTouched).toHaveBeenCalled();
            expect(userServiceMock.sendRestoreEmail).not.toHaveBeenCalled();
            expect(modalServiceMock.closeAll).not.toHaveBeenCalled();
        });
    });

    describe('loginWithGoogle', () => {
        it('debería llamar al método loginWithGoogle del AuthService', () => {
            component.loginWithGoogle();
            expect(authServiceMock.loginWithGoogle).toHaveBeenCalled();
        });
    });

    describe('togglePasswordVisibility', () => {
        it('debería alternar la visibilidad de la contraseña', () => {
            expect(component.showPassword).toBe(false);

            component.togglePasswordVisibility();
            expect(component.showPassword).toBe(true);

            component.togglePasswordVisibility();
            expect(component.showPassword).toBe(false);
        });
    });
});