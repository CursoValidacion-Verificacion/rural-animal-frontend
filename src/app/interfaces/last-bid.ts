/**
 * Interfaz que representa la última puja en el sistema de subastas.
 *
 * @interface LastBid
 * @property {number} amount - El monto de la última puja realizada.
 * @property {number} userId - El identificador del usuario que realizó la última puja.
 * @property {string} bidderName - El nombre del usuario que realizó la última puja.
 * @property {string} bidDate - La fecha y hora en que se realizó la última puja
 */
export interface LastBid {
    amount: number;
    userId: number;
    bidderName: string;
    bidDate: string;
}