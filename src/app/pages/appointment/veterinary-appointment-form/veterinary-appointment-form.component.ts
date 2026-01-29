import {Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ITimeSlot} from "@app/interfaces/time-slot";
import {IVeterinaryAvailability} from "@app/interfaces/veterinary-availability";
import {VeterinaryAppointmentService} from "@app/services/veterinary-appointment.service";
import {CommonModule, DatePipe} from "@angular/common";
import {LoaderComponent} from "@app/components/loader/loader.component";
import {ICreateAppointment} from "@app/interfaces/create-appointment";
import {AlertService} from "@app/services/alert.service";

@Component({
    selector: 'app-appointment-form',
    standalone: true,
    imports: [
        DatePipe,
        ReactiveFormsModule,
        CommonModule,
        LoaderComponent
    ],
    templateUrl: './veterinary-appointment-form.component.html',
    styleUrl: './veterinary-appointment-form.component.scss'
})
export class VeterinaryAppointmentFormComponent implements OnInit {
    veterinaryService: VeterinaryAppointmentService = inject(VeterinaryAppointmentService);
    appointmentForm: FormGroup;
    selectedTimeSlots: ITimeSlot[] = [];
    availableVeterinarians: IVeterinaryAvailability[] = [];
    selectedDate: string | null = null;
    selectedTimeSlot: string | null = null;
    currentStep = signal(1);
    private alertService: AlertService = inject(AlertService);

    constructor(
        private fb: FormBuilder
    ) {
        this.appointmentForm = this.fb.group({
            selectedDate: ['', Validators.required],
            selectedTimeSlot: ['', Validators.required],
            selectedVeterinary: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.getAvailableDates();
    }

    /**
     * Obtiene las fechas disponibles desde la fecha actual hasta tres días después.
     *
     * Este método calcula un rango de fechas que comienza en la fecha actual
     * y finaliza tres días después de la misma. Luego, utiliza un servicio
     * de veterinaria para obtener las fechas disponibles en ese rango.
     *
     * @return {void} No devuelve un valor, pero se espera que el servicio
     *                 de veterinaria maneje internamente las fechas disponibles.
     */
    getAvailableDates(): void {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 3);

        this.veterinaryService.getAvailableDates(startDate, endDate);
    }

    /**
     * Selecciona una fecha específica para una cita, ajustando el formulario
     * correspondiente y actualizando los horarios disponibles.
     *
     * @param date La fecha seleccionada para la cita en formato de cadena.
     * @return void
     */
    selectDate(date: string) {
        this.selectedDate = date;
        this.selectedTimeSlot = null;
        const availability = this.veterinaryService.availability$().find(a => a.date === date);
        if (availability) {
            this.selectedTimeSlots = availability.availableSlots;
            this.appointmentForm.patchValue({
                selectedDate: date,
                selectedTimeSlot: '',
                selectedVeterinary: ''
            });
            this.currentStep.set(2);
        }
    }

    /**
     * Selecciona un intervalo de tiempo específico y actualiza el formulario de cita con la información correspondiente.
     * Busca el intervalo de tiempo seleccionado entre los intervalos disponibles y, si se encuentra, establece los veterinarios disponibles para ese tiempo.
     * También define el paso actual del proceso al paso 3.
     *
     * @param time La hora seleccionada en formato de cadena.
     * @return No devuelve un valor.
     */
    selectTimeSlot(time: string) {
        console.log('hora seleccionada', time)
        this.selectedTimeSlot = time;
        const timeSlot = this.selectedTimeSlots.find(slot => slot.startTime === time);
        if (timeSlot) {
            this.availableVeterinarians = timeSlot.availableVeterinarians;
            this.appointmentForm.patchValue({
                selectedTimeSlot: time,
                selectedVeterinary: ''
            });
            this.currentStep.set(3);
        }
    }

    /**
     * Selecciona un veterinario para la cita actual al actualizar el campo correspondiente en el formulario.
     *
     * @param vetId El identificador único del veterinario que será seleccionado.
     * @return void No devuelve ningún valor.
     */
    selectVeterinarian(vetId: number) {
        this.appointmentForm.patchValue({
            selectedVeterinary: vetId
        });
    }

    /**
     * Obtiene el estado de un paso en un proceso secuencial.
     *
     * @param step - El número del paso para el cual se desea obtener el estado.
     * @return El estado del paso, que puede ser 'pending' si el paso aún no ha llegado a ser el actual,
     * 'active' si el paso es el actual, o 'completed' si el paso ya ha sido completado.
     */
    getStepStatus(step: number): 'pending' | 'active' | 'completed' {
        if (this.currentStep() > step) return 'completed';
        if (this.currentStep() === step) return 'active';
        return 'pending';
    }

    /**
     * Maneja el evento de envío de un formulario para crear una cita con un veterinario.
     * Este método verifica la validez del formulario, selecciona el veterinario disponible
     * basado en los datos proporcionados, calcula los tiempos de inicio y fin de la cita,
     * y luego intenta crear la cita a través de un servicio externo. Si la operación es exitosa,
     * muestra un alert de éxito y reinicia el formulario; si ocurre un error, muestra un alert
     * de error.
     *
     * @return void
     */
    onSubmit() {
        if (this.appointmentForm.valid) {
            const selectedVet = this.availableVeterinarians.find(
                vet => vet.id === this.appointmentForm.get('selectedVeterinary')?.value
            );

            if (!selectedVet || !this.selectedTimeSlot) {
                return;
            }

            const [datePart, timePart] = this.selectedTimeSlot.split('T');
            const [hours, minutes] = timePart.split(':');

            const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + 30;
            const endHour = Math.floor(totalMinutes / 60);
            const endMinute = totalMinutes % 60;

            const startDate = `${datePart}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00.000`;
            const endDate = `${datePart}T${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00.000`;

            const appointmentData: ICreateAppointment = {
                veterinaryId: selectedVet.id,
                startDate: startDate,
                endDate: endDate
            };

            this.veterinaryService.createAppointment(appointmentData)
                .subscribe({
                    next: () => {
                        this.alertService.displayAlert('success', 'Cita creada satisfactoriamente!', 'center', "top", ['success-snackbar']);
                        this.resetForm();
                        this.getAvailableDates();
                    },
                    error: (error) => {
                        this.alertService.displayAlert('error', 'Error al crear la cita.');
                        console.error('Error al crear la cita:', error);
                    }
                });
        }
    }

    /**
     * Restablece el formulario de cita a su estado inicial.
     * Este método reinicia el formulario de citas, restableciendo todos los
     * valores del formulario y parámetros relacionados a su estado predeterminado.
     * Esto incluye la fecha seleccionada, el intervalo de tiempo seleccionado,
     * la lista de intervalos de tiempo seleccionados, los veterinarios disponibles
     * y el paso actual del proceso.
     *
     * @return {void} No retorna ningún valor.
     */
    resetForm(): void {
        this.appointmentForm.reset();
        this.selectedDate = null;
        this.selectedTimeSlot = null;
        this.selectedTimeSlots = [];
        this.availableVeterinarians = [];
        this.currentStep.set(1);
    }

    /**
     * Retrocede al paso anterior en un flujo de pasos múltiples, actualizando el estado de los datos del formulario según el paso actual.
     *
     * Cuando el paso actual es mayor a 1, decrementa el paso actual.
     * Si el paso resultante es el primer paso, reinicia la fecha y la franja horaria seleccionadas y actualiza los campos correspondientes del formulario.
     * Si el paso resultante es el segundo paso, reinicia la franja horaria seleccionada y actualiza los campos correspondientes del formulario.
     *
     * @return {void} No devuelve un valor, ya que su propósito es actualizar el estado interno del flujo de pasos y del formulario asociado.
     */
    goBack(): void {
        if (this.currentStep() > 1) {
            this.currentStep.set(this.currentStep() - 1);

            if (this.currentStep() === 1) {
                this.selectedDate = null;
                this.selectedTimeSlot = null;
                this.appointmentForm.patchValue({
                    selectedDate: '',
                    selectedTimeSlot: '',
                    selectedVeterinary: ''
                });
            } else if (this.currentStep() === 2) {
                this.selectedTimeSlot = null;
                this.appointmentForm.patchValue({
                    selectedTimeSlot: '',
                    selectedVeterinary: ''
                });
            }
        }
    }
}