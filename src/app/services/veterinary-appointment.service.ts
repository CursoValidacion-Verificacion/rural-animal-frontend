import {Injectable, signal} from '@angular/core';
import {BaseService} from "@app/services/base-service";
import {IAppointment} from "@app/interfaces/appointment";
import {finalize, Subscription, tap} from "rxjs";
import {ISearch} from "@app/interfaces";
import {IAvailability} from "@app/interfaces/availability";
import {ICreateAppointment} from "@app/interfaces/create-appointment";

/**
 * Servicio para gestionar las citas veterinarias.
 *
 * Esta clase proporciona métodos para recuperar, crear y verificar la disponibilidad de citas veterinarias.
 * Extiende la funcionalidad de BaseService para operar sobre entidades de tipo IAppointment.
 * Utiliza señales para gestionar y emitir el estado de las citas, su disponibilidad y la carga.
 *
 * Propiedades disponibles para suscripción:
 * - `isLoading$`: Indica el estado de carga actual del servicio.
 * - `appointments$`: Proporciona la lista actual de citas del usuario.
 * - `availability$`: Proporciona las fechas disponibles para citas en un rango determinado.
 */
@Injectable({
    providedIn: 'root'
})
export class VeterinaryAppointmentService extends BaseService<IAppointment> {

    protected override source: string = 'veterinary_appointments';
    private appointmentListSignal = signal<IAppointment[]>([]);
    private availabilitySignal = signal<IAvailability[]>([]);
    private loadingSignal = signal(false);

    get isLoading$() {
        return this.loadingSignal;
    }

    get appointments$() {
        return this.appointmentListSignal;
    }

    get availability$() {
        return this.availabilitySignal;
    }

    public totalItems: any = [];
    public search: ISearch = {
        page: 1,
        size: 10
    }

    /**
     * Recupera una lista de citas del usuario con parámetros de búsqueda específicos.
     *
     * Esta función ejecuta una búsqueda paginada de citas basándose en los parámetros
     * definidos en el objeto de búsqueda del contexto actual. Actualiza la meta-información
     * de la búsqueda y la señal de lista de citas con los datos recibidos.
     *
     * @return {Subscription} Retorna una suscripción que se completa cuando se finaliza
     * el flujo de datos al recuperar las citas.
     */
    getMyAppointments(): Subscription {
        return this.findAllWithParams({page: this.search.page, size: this.search.size})
            .pipe(
                tap((response: any) => {
                    this.search = {...this.search, ...response.meta}
                    this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages : 0}, (_, i) => i + 1);
                    this.appointmentListSignal.set(response.data);
                })
            ).subscribe();
    }

    /**
     * Obtiene las fechas disponibles dentro del rango especificado.
     *
     * @param startDate - La fecha de inicio del rango para obtener disponibilidad.
     * @param endDate - La fecha final del rango para obtener disponibilidad.
     * @return Una suscripción que gestiona el flujo de fechas disponibles y actualiza el estado de carga y disponibilidad.
     */
    getAvailableDates(startDate: Date, endDate: Date) {
        this.loadingSignal.set(true);

        const params = {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        };

        return this.findAllWithParamsAndCustomSource('availability', params)
            .pipe(
                tap((response: any) => {
                    this.availabilitySignal.set(response.data);
                }),
                finalize(() => {
                    this.loadingSignal.set(false);
                })
            ).subscribe();
    }

    /**
     * Método para crear una nueva cita.
     *
     * Este método inicia el proceso de creación de una cita utilizando los datos proporcionados,
     * gestionando el estado de carga durante dicho proceso y actualizando la lista de citas del usuario al finalizar.
     *
     * @param appointmentData Datos necesarios para la creación de la cita que cumplen con la interfaz ICreateAppointment.
     * @return Un observable que representa el resultado del intento de añadir la cita.
     */
    createAppointment(appointmentData: ICreateAppointment) {
        this.loadingSignal.set(true);

        return this.add(appointmentData).pipe(
            tap(() => {
                this.getMyAppointments();
            }),
            finalize(() => {
                this.loadingSignal.set(false);
            })
        );
    }

    /**
     * Método para recuperar todas las citas disponibles.
     *
     * Este método envía una solicitud al backend para obtener todas las citas sin paginación.
     * Actualiza el estado de carga y emite la lista completa de citas a través de la señal correspondiente.
     *
     * @return Una suscripción que gestiona el flujo de datos al recuperar todas las citas.
     */
    getAllAppointments(): Subscription {
        this.loadingSignal.set(true);

        return this.findAllWithParamsAndCustomSource('all')
            .pipe(
                tap((response: any) => {
                    this.appointmentListSignal.set(response.data);
                }),
                finalize(() => {
                    this.loadingSignal.set(false);
                })
            ).subscribe();
    }
}
