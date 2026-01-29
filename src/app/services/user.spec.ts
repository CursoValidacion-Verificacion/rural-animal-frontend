import {TestBed} from '@angular/core/testing';
import {UserService} from './user.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AlertService} from './alert.service';

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;
    let alertService: AlertService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                UserService,
                AlertService
            ]
        });

        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
        alertService = TestBed.inject(AlertService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        password: '123456'
    };

    const mockResponse = {
        data: [mockUser],
        meta: {
            page: 1,
            size: 5,
            totalPages: 1
        }
    };

    it('debería retornar todos los usuarios', () => {
        service.getAll();

        const req = httpMock.expectOne(`users?page=1&size=5`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        expect(service.users$()).toEqual([mockUser]);
    });

    it('debería guardar o crear un usuario', () => {
        jest.spyOn(alertService, 'displayAlert');

        service.save(mockUser);

        const req = httpMock.expectOne('users');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockUser);
        req.flush({data: mockUser});

        expect(alertService.displayAlert).toHaveBeenCalledWith(
            'success',
            'El usuario fue correctamente registrado, por favor vericar la cuenta por correo electrónico',
            'center',
            'top',
            ['success-snackbar']
        );
    });

    it('debería actualizar un usuario existente', () => {
        jest.spyOn(alertService, 'displayAlert');

        service.update(mockUser);

        const req = httpMock.expectOne(`users/${mockUser.id}`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(mockUser);
        req.flush({data: mockUser});

        expect(alertService.displayAlert).toHaveBeenCalledWith(
            'success',
            'Información actualizada con éxito',
            'center',
            'top',
            ['success-snackbar']
        );
    });

    it('debería eliminar un usuario', () => {
        jest.spyOn(alertService, 'displayAlert');

        service.delete(mockUser);

        const req = httpMock.expectOne(`users/${mockUser.id}`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        expect(alertService.displayAlert).toHaveBeenCalledWith(
            'success',
            'Usuario eliminado con éxito',
            'center',
            'top',
            ['success-snackbar']
        );
    });

    it('debería filtrar usuarios', () => {
        const keyword = 'test';
        service.filterUsers(keyword);

        const req = httpMock.expectOne(`users/filter?page=1&size=5&keyword=test`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        expect(service.users$()).toEqual([mockUser]);
    });

    it('debería autenticar un correo electrónico', () => {
        jest.spyOn(alertService, 'displayAlert');

        service.sendAuthenticationEmail(mockUser);

        const req = httpMock.expectOne(`users/authenticate`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockUser);
        req.flush({});

        expect(alertService.displayAlert).toHaveBeenCalledWith(
            'success',
            'El correo fue correctamente enviado',
            'center',
            'top',
            ['success-snackbar']
        );
    });

    it('debería restablecer la contraseña', () => {
        jest.spyOn(alertService, 'displayAlert');
        const email = 'test@test.com';

        service.sendRestoreEmail(email);

        const req = httpMock.expectOne(`users/forgotPassword`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(email);
        req.flush({});

        expect(alertService.displayAlert).toHaveBeenCalledWith(
            'success',
            'El correo fue correctamente enviado',
            'center',
            'top',
            ['success-snackbar']
        );
    });
});