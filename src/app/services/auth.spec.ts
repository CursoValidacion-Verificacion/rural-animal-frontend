import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AuthService} from './auth.service';
import {ILoginResponse, IRoleType, IUser} from '../interfaces';


describe('Servicio de Autenticación', () => {
   let servicio: AuthService;
   let httpMock: HttpTestingController;


   const usuarioMock: IUser = {
       email: 'test@test.com',
       authorities: [{authority: IRoleType.admin}]
   };


   const respuestaLoginMock: ILoginResponse = {
       accessToken: 'mock-token',
       expiresIn: 3600
   };


   beforeEach(() => {
       TestBed.configureTestingModule({
           imports: [HttpClientTestingModule],
           providers: [AuthService]
       });
       servicio = TestBed.inject(AuthService);
       httpMock = TestBed.inject(HttpTestingController);
   });


   afterEach(() => {
       httpMock.verify();
       localStorage.clear();
   });


   it('debería crear el servicio', () => {
       expect(servicio).toBeTruthy();
   });


   describe('cierre de sesión', () => {
       it('debería limpiar token y datos del usuario', () => {
           localStorage.setItem('access_token', JSON.stringify('test-token'));
           localStorage.setItem('auth_user', JSON.stringify(usuarioMock));


           servicio.logout();


           expect(servicio.getAccessToken()).toBe('');
           expect(localStorage.getItem('access_token')).toBeNull();
           expect(localStorage.getItem('auth_user')).toBeNull();
       });
   });


   describe('verificación de token', () => {
       it('debería retornar true cuando existe token', () => {
           localStorage.setItem('access_token', JSON.stringify('test-token'));
           servicio['load']();
           expect(servicio.check()).toBe(true);
       });


       it('debería retornar false cuando no existe token', () => {
           localStorage.clear();
           expect(servicio.check()).toBe(false);
       });
   });


   describe('verificación de roles', () => {
       beforeEach(() => {
           servicio['user'] = usuarioMock;
       });


       it('debería retornar true cuando el usuario tiene el rol', () => {
           expect(servicio.hasRole(IRoleType.admin)).toBe(true);
       });


       it('debería retornar false cuando el usuario no tiene el rol', () => {
           expect(servicio.hasRole(IRoleType.buyer)).toBe(false);
       });
   });




   describe('acciones disponibles', () => {
       it('debería retornar true cuando el usuario tiene rol requerido y es admin', () => {
           servicio['user'] = {
               email: 'test@test.com',
               authorities: [
                   {authority: IRoleType.admin},
                   {authority: 'TEST_ROLE'}
               ]
           };


           expect(servicio.areActionsAvailable(['TEST_ROLE'])).toBe(true);
       });


       it('debería retornar false cuando el usuario no es admin', () => {
           servicio['user'] = {
               email: 'test@test.com',
               authorities: [
                   {authority: IRoleType.buyer},
                   {authority: 'TEST_ROLE'}
               ]
           };


           expect(servicio.areActionsAvailable(['TEST_ROLE'])).toBe(false);
       });
   });
});
