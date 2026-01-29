import {HttpTestingController, HttpClientTestingModule} from "@angular/common/http/testing";
import {PublicationService} from "@app/services/publication.service";
import {AlertService} from "@app/services/alert.service";
import {TestBed} from "@angular/core/testing";
import {IPublication} from "@app/interfaces";
import {AuthService} from "@app/services/auth.service";

describe('PublicationService', () => {
    let service: PublicationService;
    let httpMock: HttpTestingController;
    let alertService: AlertService;
    let authService: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                PublicationService,
                AlertService,
                AuthService
            ]
        });

        service = TestBed.inject(PublicationService);
        httpMock = TestBed.inject(HttpTestingController);
        alertService = TestBed.inject(AlertService);
        authService = TestBed.inject(AuthService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    const mockPublication: IPublication = {
        id: 1,
        title: 'Test publicación',
        specie: 'Ovino',
        race: 'Gyr',
        gender: 'Macho',
        weight: 50,
        birthDate: new Date(),
        senasaCertificate: '202412',
        price: 10000,
        startDate: new Date(),
        endDate: new Date(),
        minimumIncrease: 10,
        type: 'Venta',
        creationDate: new Date(),
        direction: {
            id: 1,
            province: 'San José',
            provinceId: '1',
            canton: 'Goicoechea',
            cantonId: '2',
            district: 'San Francisco de Goicoechea',
            districtId: '10',
            otherDetails: '250 mtrs oeste del centro comercial de guadalupe'
        },
        photos: [{
            id: 1,
            url: 'Test URL',
            name: 'Test',
            cloudinaryId: 'URL',
            publicationId: 12
        }]
    };

    const mockResponse = {
        data: [mockPublication],
        meta: {
            page: 1,
            size: 5,
            totalPages: 1,
            pageNumber: 0,
            totalElements: 1
        }
    };

    it('debería retornar todas las publicaciones', () => {
        service.getAll();

        const req = httpMock.expectOne(`publications?page=1&size=6`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        expect(service.publications$()).toEqual([mockPublication]);
    });

    it('debería guardar o crear una publicación', () => {
        jest.spyOn(alertService, 'displayAlert');

        service.save(mockPublication);

        const req = httpMock.expectOne('publications');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockPublication);
        req.flush({
            data: mockPublication,
            message: 'Publicación creada exitosamente'
        });

        expect(alertService.displayAlert).toHaveBeenCalledWith(
            'success',
            'Publicación creada exitosamente',
            'center',
            'top',
            ['success-snackbar']
        );
    });

    it('debería actualizar una publicación existente', () => {
        jest.spyOn(alertService, 'displayAlert');

        service.update(mockPublication, 'Se actualiza correctamente.');

        const req = httpMock.expectOne(`publications/${mockPublication.id}`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(mockPublication);
        req.flush({data: mockPublication});

        expect(alertService.displayAlert).toHaveBeenCalledWith(
            'success',
            'Información actualizada con éxito',
            'center',
            'top',
            ['success-snackbar']
        );
    });

    it('debería obtener publicaciones de ventas', () => {
        service.getSalesPublications();

        const req = httpMock.expectOne(`publications/sales?page=1&size=6`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        expect(service.sales$()).toEqual([mockPublication]);
    });

    it('debería obtener publicaciones de subastas', () => {
        service.getAuctionsPublications();

        const req = httpMock.expectOne(`publications/auctions?page=1&size=6`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        expect(service.auctions$()).toEqual([mockPublication]);
    });

    it('debería obtener publicaciones filtradas', () => {
        const filters = {
            type: 'Venta',
            search: 'test',
            sort: 'asc'
        };

        service.getFilteredPublications(filters);

        const req = httpMock.expectOne(
            `publications/filtered?page=1&size=6&type=Venta&search=test&sort=asc`
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        expect(service.publications$()).toEqual([mockPublication]);
    });

    it('debería obtener publicaciones por usuario', () => {
        const mockUser = {
            id: 1,
            role: {title: 'USER'}
        };
        jest.spyOn(authService, 'getUser').mockReturnValue(mockUser);

        const filters = {
            type: 'Venta',
            search: 'test',
            sort: 'asc'
        };

        service.getAllByUser(filters);

        const req = httpMock.expectOne(
            `publications/user/1/publications?page=1&size=6&type=Venta&search=test&sort=asc`
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        expect(service.publications$()).toEqual([mockPublication]);
    });

    it('debería seleccionar publicaciones según el rol del usuario - ADMIN', () => {
        const mockAdminUser = {
            id: 1,
            role: {title: 'ADMIN'}
        };
        jest.spyOn(authService, 'getUser').mockReturnValue(mockAdminUser);

        const filters = {
            type: 'Venta',
            search: 'test',
            sort: 'asc'
        };

        service.selectUser(filters);

        const req = httpMock.expectOne(
            `publications/filtered?page=1&size=6&type=Venta&search=test&sort=asc`
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('debería seleccionar publicaciones según el rol del usuario - USER', () => {
        const mockNormalUser = {
            id: 1,
            role: {title: 'USER'}
        };
        jest.spyOn(authService, 'getUser').mockReturnValue(mockNormalUser);

        const filters = {
            type: 'Venta',
            search: 'test',
            sort: 'asc'
        };

        service.selectUser(filters);

        const req = httpMock.expectOne(
            `publications/user/1/publications?page=1&size=6&type=Venta&search=test&sort=asc`
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });
});