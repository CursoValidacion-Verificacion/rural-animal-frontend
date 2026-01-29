import {Component, computed, inject, OnInit} from "@angular/core";
import {LoaderComponent} from "@app/components/loader/loader.component";
import {VeterinaryAppointmentService} from "@app/services/veterinary-appointment.service";
import {FullCalendarComponent} from "@app/components/veterinary-appointment/full-calendar/full-calendar.component";
import {AuthService} from "@app/services/auth.service";
import {IRoleType} from "@app/interfaces";
import {VeterinaryAppointmentListComponent} from "@app/components/veterinary-appointment/veterinary-appointment-list/veterinary-appointment-list.component";
import {
    VeterinaryAppointmentFormComponent
} from "@app/pages/appointment/veterinary-appointment-form/veterinary-appointment-form.component";



/**
 * Componente encargado de gestionar y mostrar las citas veterinarias.
 * Proporciona una interfaz para visualizar y administrar las citas a través de un calendario
 * y una lista de citas, permitiendo la interacción con las mismas mediante un formulario.
 *
 * Propiedades protegidas:
 * - `authService`: Servicio inyectado para manejar la lógica de autenticación de usuarios.
 * - `veterinaryAppointmentService`: Servicio inyectado para manejar la lógica de citas veterinarias.
 * - `appointments`: Propiedad calculada que gestiona la suscripción a las citas obtenidas desde
 *   el `veterinaryAppointmentService`.
 */
@Component({
    selector: 'app-appointment',
    standalone: true,
    imports: [
        LoaderComponent,
        FullCalendarComponent,
        VeterinaryAppointmentListComponent,
        VeterinaryAppointmentFormComponent
    ],
    templateUrl: './veterinary-appointment.component.html',
    styleUrl: './veterinary-appointment.component.scss'
})
export class VeterinaryAppointmentComponent implements OnInit {
    protected authService: AuthService = inject(AuthService);
    protected veterinaryAppointmentService: VeterinaryAppointmentService = inject(VeterinaryAppointmentService);
    protected readonly IRoleType = IRoleType;
    protected appointments = computed(() => this.veterinaryAppointmentService.appointments$());

    /**
     * Método del ciclo de vida de Angular que se ejecuta al inicializar el componente.
     * Verifica los roles del usuario actual usando el servicio de autenticación `authService`.
     * Si el usuario tiene rol de superAdmin o admin, llama a `getAllAppointments` del servicio `veterinaryAppointmentService`.
     * De lo contrario, llama a `getMyAppointments`.
     *
     * @return void
     */
    ngOnInit() {
        if (this.authService.hasAnyRole([IRoleType.superAdmin, IRoleType.admin])) {
            this.veterinaryAppointmentService.getAllAppointments();
        } else {
            this.veterinaryAppointmentService.getMyAppointments();
        }
    }
}