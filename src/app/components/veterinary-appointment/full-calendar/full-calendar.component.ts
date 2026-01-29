import {ChangeDetectorRef, Component, effect, inject, Input, OnInit, signal, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FullCalendarModule, FullCalendarComponent as FullCalendar} from "@fullcalendar/angular";
import {CalendarOptions, EventApi, EventClickArg, EventInput} from "@fullcalendar/core";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import {IAppointment} from "@app/interfaces/appointment";
import esLocale from '@fullcalendar/core/locales/es';
import {SweetAlert2Service} from "@app/services/sweet-alert2.service";

@Component({
    selector: 'app-full-calendar',
    standalone: true,
    imports: [
        CommonModule,
        FullCalendarModule],
    templateUrl: './full-calendar.component.html',
    styleUrl: './full-calendar.component.scss'
})
export class FullCalendarComponent implements OnInit {
    @ViewChild('calendar') calendarComponent!: FullCalendar;
    @Input() appointments: IAppointment[] = [];
    private changeDetector: ChangeDetectorRef = inject(ChangeDetectorRef);
    private sweetAlert:SweetAlert2Service=inject(SweetAlert2Service);

    calendarVisible = signal(true);
    currentEvents = signal<EventApi[]>([]);

    /**
     * Opciones de configuración para el componente.
     *
     * Este objeto define configuraciones y comportamientos específicos para un componente de calendario, incluyendo plugins, localización, diseño del encabezado o "header", textos de botones, vistas iniciales, y formato de eventos y horas.
     *
     * @typedef {Object} CalendarOptions
     * @property {Array} plugins - Lista de plugins del calendario para agregar funcionalidades específicas como vistas de tipo rejilla de día, rejilla de hora y lista.
     * @property {Object} locale - Parámetros regionales de configuración del calendario, en este caso especifica la localización en español.
     * @property {Object} headerToolbar - Configuración de botones y disposición del encabezado del calendario, determinando las secciones a la izquierda, centro y derecha.
     * @property {Object} buttonText - Textos personalizados para los botones de navegación y vista del calendario.
     * @property {string} initialView - Vista inicial predeterminada cuando el calendario es cargado por primera vez.
     * @property {boolean} weekends - Determina si los días del fin de semana son visibles en el calendario.
     * @property {boolean} editable - Indica si los eventos del calendario pueden ser editados directamente en la interfaz.
     * @property {boolean} selectable - Determina si se pueden seleccionar elementos en el calendario.
     * @property {boolean} dayMaxEvents - Configura si agrupar múltiples eventos en un mismo día cuando hay un máximo de eventos sobrepasados.
     * @property {Function} eventClick - Manejador de eventos para el click en eventos, enlazado a un método de la clase que contiene la lógica.
     * @property {Function} eventsSet - Llamado cuando los eventos son cargados o actualizados, enlazado a un método de manejo de evento.
     * @property {Function} events - Método que transforma y establece eventos a partir de una lista de citas, usando un callback de éxito para finalizar el proceso.
     * @property {Object} slotLabelFormat - Formato para las etiquetas de tiempo en las franjas horarias del calendario, configurando cómo se muestra la hora y si es en formato de 12 horas.
     * @property {Object} eventTimeFormat - Define el formato de tiempo que se muestra en los eventos, específicamente definiendo el formato de hora y si es con formato de 12 horas.
     */
    calendarOptions = signal<CalendarOptions>({
        plugins: [
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
        ],
        locale: esLocale,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            list: 'Lista'
        },
        initialView: 'dayGridMonth',
        weekends: true,
        editable: false,
        selectable: false,
        dayMaxEvents: true,
        eventClick: this.handleEventClick.bind(this),
        eventsSet: this.handleEvents.bind(this),
        events: (_info, successCallback) => {
            const events = this.transformAppointmentsToEvents(this.appointments);
            successCallback(events);
        },
        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        },
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }
    });

    /**
     * Método del ciclo de vida del componente en Angular que se ejecuta una vez terminada la inicialización del componente.
     * Permite realizar tareas adicionales de inicialización, tal como se vincula un efecto que verifica si existen citas en
     * el componente actual. Si hay citas, se procede a actualizar los eventos del componente asociado al calendario.
     *
     * @return {void} No retorna ningún valor.
     */
    ngOnInit(): void {
        effect(() => {
            if (this.appointments.length > 0 && this.calendarComponent) {
                this.calendarComponent.getApi().refetchEvents();
            }
        });
    }

    /**
     * Convierte una lista de citas en un arreglo de eventos adecuados para ser utilizados en un calendario.
     *
     * @param appointments Lista de objetos de tipo IAppointment que representan las citas a transformar.
     * @return Arreglo de objetos de tipo EventInput que representan los eventos transformados a partir de las citas.
     */
    private transformAppointmentsToEvents(appointments: IAppointment[]): EventInput[] {
        return appointments.map(appointment => ({
            id: appointment.id?.toString(),
            title: `${appointment.veterinaryName} - ${appointment.fullName || 'Sin paciente'}`,
            start: appointment.startDate,
            end: appointment.endDate,
            backgroundColor: this.getStatusColor(appointment.status),
            borderColor: this.getStatusColor(appointment.status),
            extendedProps: {
                status: appointment.status,
                veterinary: `${appointment.veterinaryName} ${appointment.firstSurname} ${appointment.secondSurname || ''}`,
                email: appointment.email,
                speciality: appointment.speciality,
                patient: appointment.fullName
            }
        }));
    }

    /**
     * Devuelve el color correspondiente al estado proporcionado.
     *
     * @param status El estado cuyo color se desea obtener. Puede ser "confirmada", "pendiente", "cancelada" u otro valor.
     * @return Un string representando el código de color hexadecimal asociado al estado. Si el estado es "confirmada",
     *         el color será '#4CAF50'; si es "pendiente", será '#FFC107'; si es "cancelada", será '#F44336'.
     *         Para cualquier otro valor de estado, se devuelve '#2196F3'.
     */
    private getStatusColor(status: string): string {
        switch (status.toLowerCase()) {
            case 'confirmada':
                return '#4CAF50';
            case 'pendiente':
                return '#FFC107';
            case 'cancelada':
                return '#F44336';
            default:
                return '#2196F3';
        }
    }

    /**
     * Método para alternar el estado de visibilidad del calendario.
     * Cambia el valor booleano actual del atributo `calendarVisible` a su opuesto.
     *
     * @return {void} No devuelve ningún valor.
     */
    handleCalendarToggle(): void {
        this.calendarVisible.update((bool) => !bool);
    }

    /**
     * Maneja el cambio de estado de la visualización de fines de semana en el calendario.
     *
     * Este método altera las opciones del calendario para alternar la visibilidad de los fines de semana.
     * Cambia el valor booleano de la propiedad `weekends` en el objeto de opciones del calendario.
     *
     * @return {void} No devuelve valor ya que actualiza directamente las opciones del calendario.
     */
    handleWeekendsToggle(): void {
        this.calendarOptions.update((options) => ({
            ...options,
            weekends: !options.weekends,
        }));
    }

    /**
     * Maneja el evento de clic en un elemento de evento, mostrando una alerta con los detalles de la cita seleccionada.
     *
     * @param clickInfo Información sobre el evento clic, incluyendo detalles del evento asociado.
     * @return void No devuelve ningún valor. La función activa una alerta para mostrar detalles de la cita.
     */
    handleEventClick(clickInfo: EventClickArg) {
        const event = clickInfo.event;

        this.sweetAlert.showDetailedInfo({
            veterinary: event.extendedProps['veterinary'],
            email: event.extendedProps['email'],
            speciality: event.extendedProps['speciality'],
            status: event.extendedProps['status'],
            patient: event.extendedProps['patient'],
            start: event.start,
            end: event.end
        }, {
            title: 'Detalles de la Cita',
            labels: {
                veterinary: 'Veterinario',
                email: 'Correo',
                speciality: 'Especialidad',
                status: 'Estado',
                patient: 'Usuario',
                start: 'Inicio',
                end: 'Fin'
            },
            textColor: '#333333'
        });
    }

    /**
     * Maneja y actualiza la lista de eventos actuales, activando un cambio en el detector de cambios.
     *
     * @param events - Array de objetos de tipo EventApi que representan los eventos que se van a manejar y establecer como actuales.
     * @return void - Esta función no devuelve un valor.
     */
    handleEvents(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges();
    }
}