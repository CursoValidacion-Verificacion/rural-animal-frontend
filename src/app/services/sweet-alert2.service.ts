import {Injectable} from '@angular/core';
import Swal from 'sweetalert2';

/**
 * servicio para mostrar difrentes tipos de alertas utilizando sweetAlert2
 * @Injectable {root} indica que este servicio se proporciona ene el nivel raíz
 * */
@Injectable({
    providedIn: 'root'
})
export class SweetAlert2Service {

    /**
     * muestra una alerta de confirmación.
     * @param title el título de la alerta.
     * @param text el texto descriptivo de la alerta.
     * @param icon el ícono de la alerta (puede ser 'warning', 'error', 'success', 'info' o 'question').
     * @returns una promesa que se resuelve con un valor booleano indicando si se confirmó la acción.
     */
    async confirm(
        title: string = '¿Está seguro?',
        text: string = 'Esta acción no se puede deshacer',
        icon: 'warning' | 'error' | 'success' | 'info' | 'question' = 'warning'
    ): Promise<boolean> {
        const result = await Swal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        });

        return result.isConfirmed;
    }

    /**
     * muestra una alerta de éxito.
     * @param title el título de la alerta.
     * @param text el texto descriptivo de la alerta.
     */
    success(
        title: string = 'Éxito',
        text: string = 'Operación completada correctamente'
    ): void {
        Swal.fire({
            title,
            text,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
        }).then();
    }

    /**
     * muestra una alerta de error.
     * @param title el título de la alerta.
     * @param text el texto descriptivo de la alerta.
     */
    error(
        title: string = 'Error',
        text: string = 'Ha ocurrido un error'
    ): void {
        Swal.fire({
            title,
            text,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#d33'
        }).then();
    }

    /**
     * muestra una alerta de advertencia.
     * @param title el título de la alerta.
     * @param text el texto descriptivo de la alerta.
     */
    warning(
        title: string = 'Advertencia',
        text: string = 'Tenga precaución'
    ): void {
        Swal.fire({
            title,
            text,
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#f8bb86'
        }).then();
    }

    /**
     * muestra una alerta informativa.
     * @param title el título de la alerta.
     * @param text el texto descriptivo de la alerta.
     */
    info(
        title: string = 'Información',
        text: string
    ): void {
        Swal.fire({
            title,
            text,
            icon: 'info',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3fc3ee'
        }).then();
    }

    /**
     * muestra un toast rápido.
     * @param text el texto del toast.
     * @param icon el ícono del toast (puede ser 'success', 'error', 'warning' o 'info').
     * @param position la posición del toast (puede ser 'top', 'top-start', 'top-end', 'center', 'bottom', 'bottom-start' o 'bottom-end').
     */
    toast(
        text: string,
        icon: 'success' | 'error' | 'warning' | 'info' = 'success',
        position: 'top' | 'top-start' | 'top-end' | 'center' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end'
    ): void {
        const Toast = Swal.mixin({
            toast: true,
            position,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        Toast.fire({
            icon,
            title: text
        }).then();
    }

    /**
     * muestra una alerta de carga (loading).
     * @param title el título de la alerta.
     * @param text el texto descriptivo de la alerta.
     */
    async loading(
        title: string = 'Cargando...',
        text: string = 'Por favor espere'
    ): Promise<void> {
        Swal.fire({
            title,
            text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        }).then();
    }

    /**
     * cierra la alerta de carga (loading).
     */
    closeLoading(): void {
        Swal.close();
    }

    /**
     * Muestra información detallada de un objeto de datos en un diálogo modal.
     *
     * @param data Un objeto que contiene los datos a presentar. Las claves del objeto se usan para identificar los campos.
     * @param config Un objeto de configuración opcional que permite personalizar la presentación de la información.
     *               - title: (opcional) Título del diálogo modal. Por defecto es 'Información Detallada'.
     *               - dateFormat: (opcional) Opciones de formato de fecha para campos que contienen objetos de tipo Date.
     *               - exclude: (opcional) Lista de claves que deben excluirse de la presentación de información.
     *               - labels: (opcional) Mapa de claves a etiquetas personalizadas que reemplazan el uso de las claves originales en la presentación.
     *               - locale: (opcional) Locale para formatear las fechas. El valor predeterminado es 'es-ES'.
     *               - textColor: (opcional) Color de texto HTML para el contenido de la presentación. El valor por defecto es '#000000'.
     *
     * @return No devuelve ningún valor.
     */
    showDetailedInfo(
        data: Record<string, any>,
        config: {
            title?: string;
            dateFormat?: Intl.DateTimeFormatOptions;
            exclude?: string[];
            labels?: Record<string, string>;
            locale?: string;
            textColor?: string;
        } = {}
    ): void {
        const {
            title = 'Información Detallada',
            dateFormat = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            },
            exclude = [],
            labels = {},
            locale = 'es-ES',
            textColor = '#000000'
        } = config;

        const formatValue = (key: string, value: any): string => {
            if (value instanceof Date) {
                return value.toLocaleDateString(locale, dateFormat);
            }
            if (value === null || value === undefined) {
                return '';
            }
            return String(value);
        };

        const formattedDetails = Object.entries(data)
            .filter(([key]) => !exclude.includes(key))
            .map(([key, value]) => {
                const label = labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
                const formattedValue = formatValue(key, value);
                return formattedValue ? `\n${label}: ${formattedValue}` : '';
            })
            .filter(line => line.length > 0)
            .join('');

        const finalText = formattedDetails.trim();

        Swal.fire({
            title,
            html: `<div style="color: ${textColor}; text-align: left; white-space: pre-line;">${finalText}</div>`,
            icon: 'info',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#77c040'
        }).then();
    }
}
