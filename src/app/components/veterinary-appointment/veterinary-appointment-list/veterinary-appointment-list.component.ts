import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DatePipe} from "@angular/common";
import {IAppointment} from "@app/interfaces/appointment";

/**
 * Componente `VeterinaryAppointmentListComponent` que representa una lista de citas veterinarias.
 *
 * Este componente es parte de una aplicación Angular y se utiliza para mostrar una lista de citas relacionadas con servicios veterinarios.
 * Contiene la capacidad de recibir como entrada un título y un conjunto de citas, y emite un evento para manejar acciones sobre un modal.
 *
 * Selector del componente: `app-appointment-list`.
 *
 * Propiedades de entrada:
 * - `title`: Un string que representa el título de la lista de citas.
 * - `appointments`: Un array de objetos de tipo `IAppointment` que representa las citas que se mostrarán en la lista.
 *
 * Eventos de salida:
 * - `callModalAction`: Emite un objeto de tipo `IAppointment` que permite manejar acciones cuando se requiere interacción con un modal en relación a una cita específica.
 *
 * Dependencias importadas:
 * - `DatePipe`: Utilizado para formatear fechas dentro del componente.
 */
@Component({
    selector: 'app-veterinary-appointment-list',
    standalone: true,
    imports: [
        DatePipe
    ],
    templateUrl: './veterinary-appointment-list.component.html',
    styleUrl: './veterinary-appointment-list.component.scss'
})
export class VeterinaryAppointmentListComponent {
    @Input() title: string = '';
    @Input() appointments: IAppointment[] = [];
    @Output() callModalAction: EventEmitter<IAppointment> = new EventEmitter<IAppointment>();
}
