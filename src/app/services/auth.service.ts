import {inject, Injectable} from "@angular/core";
import {IAuthority, ILoginResponse, IRoleType, IUser} from "../interfaces";
import {Observable, tap} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "src/environments/environment";
import * as bcrypt from 'bcryptjs';

@Injectable({
    providedIn: "root",
})
export class AuthService {
    private accessToken!: string;
    private expiresIn!: number;
    private user: IUser = {email: "", authorities: []};
    private http: HttpClient = inject(HttpClient);
    private baseUrl = environment.apiUrl;
    private saltRounds = 10;

    constructor() {
        this.load();
    }

    public save(): void {
        if (this.user) localStorage.setItem("auth_user", JSON.stringify(this.user));

        if (this.accessToken)
            localStorage.setItem("access_token", JSON.stringify(this.accessToken));

        if (this.expiresIn)
            localStorage.setItem("expiresIn", JSON.stringify(this.expiresIn));
    }

    private load(): void {
        let token = localStorage.getItem("access_token");
        if (token) this.accessToken = JSON.parse(token);
        let exp = localStorage.getItem("expiresIn");
        if (exp) this.expiresIn = JSON.parse(exp);
        const user = localStorage.getItem("auth_user");
        if (user) this.user = JSON.parse(user);
    }

    public getUser(): IUser | undefined {
        return this.user;
    }

    public getAccessToken(): string | null {
        return this.accessToken;
    }

    public check(): boolean {
        if (!this.accessToken) {
            return false;
        } else {
            return true;
        }
    }

    private encryptPassword(password: string, callback: (hashedPassword: string) => void): void {
        bcrypt.genSalt(this.saltRounds, (err, salt) => {
            if (err) {
                console.error('Error al generar salt:', err);
                return;
            }
            bcrypt.hash(password, salt, (err, hashedPassword) => {
                if (err) {
                    console.error('Error al hacer el hash de la contraseña.:', err);
                    return;
                }
                callback(hashedPassword);
            });
        });
    }

    public verifyPassword(
        plainPassword: string,
        hashedPassword: string,
        callback: (isMatch: boolean) => void
    ): void {
        bcrypt.compare(plainPassword, hashedPassword, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                callback(false);
                return;
            }
            callback(isMatch);
        });
    }

    public login(credentials: { email: string; password: string }): Observable<ILoginResponse> {
        return this.http.post<ILoginResponse>("auth/login", credentials).pipe(
            tap((response: any) => {
                this.accessToken = response.token;
                this.user.email = credentials.email;
                this.expiresIn = response.expiresIn;
                this.user = response.authUser;

                // Llamada a la encriptación de la contraseña, con un callback
                this.encryptPassword(credentials.password, (encryptedPassword: string) => {
                    console.log('Contraseña encriptada:', encryptedPassword);

                    this.save();
                });
            })
        );
    }


    public hasRole(role: string): boolean {
        return this.user.authorities
            ? this.user?.authorities.some((authority) => authority.authority == role)
            : false;
    }

    public isSuperAdmin(): boolean {
        return this.user.authorities
            ? this.user?.authorities.some(
                (authority) => authority.authority == IRoleType.superAdmin
            )
            : false;
    }

    public hasAnyRole(roles: any[]): boolean {
        return roles.some((role) => this.hasRole(role));
    }

    public getPermittedRoutes(routes: any[]): any[] {
        let permittedRoutes: any[] = [];
        for (const route of routes) {
            if (route.data && route.data.authorities) {
                if (this.hasAnyRole(route.data.authorities)) {
                    permittedRoutes.unshift(route);
                }
            }
        }
        return permittedRoutes;
    }

    public signup(user: IUser): Observable<ILoginResponse> {
        return this.http.post<ILoginResponse>("auth/signup", user);
    }

    public logout() {
        this.accessToken = "";
        localStorage.removeItem("access_token");
        localStorage.removeItem("expiresIn");
        localStorage.removeItem("auth_user");
    }

    public getUserAuthorities(): IAuthority[] | undefined {
        return this.getUser()?.authorities ? this.getUser()?.authorities : [];
    }

    public areActionsAvailable(routeAuthorities: string[]): boolean {
        // definición de las variables de validación
        let allowedUser: boolean = false;
        let isAdmin: boolean = false;
        // se obtienen los permisos del usuario
        let userAuthorities = this.getUserAuthorities();
        // se valida que sea una ruta permitida para el usuario
        for (const authority of routeAuthorities) {
            if (userAuthorities?.some((item) => item.authority == authority)) {
                allowedUser = userAuthorities?.some(
                    (item) => item.authority == authority
                );
            }
            if (allowedUser) break;
        }
        // se valida que el usuario tenga un rol de administración
        if (
            userAuthorities?.some(
                (item) =>
                    item.authority == IRoleType.admin ||
                    item.authority == IRoleType.superAdmin
            )
        ) {
            isAdmin = userAuthorities?.some(
                (item) =>
                    item.authority == IRoleType.admin ||
                    item.authority == IRoleType.superAdmin
            );
        }
        return allowedUser && isAdmin;
    }

    public loginWithGoogle() {
        console.log("Inicializando login del comprador");
        const baseUrl = this.baseUrl.endsWith("/")
            ? this.baseUrl.slice(0, -1)
            : this.baseUrl;
        window.location.href = `${baseUrl}/oauth2/authorization/google`;
    }

    handleGoogleCallback(sessionId: string): Observable<ILoginResponse> {
        return this.http.get<ILoginResponse>(`auth/oauth/token/${sessionId}`).pipe(
            tap({
                next: (response: any) => {
                    if (!response) {
                        throw new Error("No se recibió respuesta del servidor");
                    }

                    this.accessToken = response.token;
                    this.expiresIn = response.expiresIn;

                    if (response.authUser) {
                        this.user = response.authUser;
                    } else {
                        throw new Error("Datos de usuario inválidos recibidos");
                    }

                    this.save();
                },
                error: (error) => {
                    throw error;
                },
            })
        );
    }

    completeRegistration(sessionId: string, role: string): Observable<any> {
        return this.http
            .post(
                "auth/complete-registration",
                {role},
                {
                    params: new HttpParams().set("sessionId", sessionId),
                }
            )
            .pipe(
                tap((response: any) => {
                    if (response.token) {
                        this.accessToken = response.token;
                        this.expiresIn = response.expiresIn;
                        this.user = response.authUser;
                        this.save();
                    }
                })
            );
    }
}
