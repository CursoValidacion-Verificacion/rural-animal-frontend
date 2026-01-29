/**
 * Interfaz que representa un mensaje en el sistema de subastas.
 *
 * @interface AuctionMessage
 * @property {string} action - La acción realizada en la subasta (por ejemplo, "pujar", "ganar").
 * @property {number} publicationId - El identificador de la publicación de la subasta.
 * @property {number} bidAmount - El monto de la puja realizada.
 * @property {number} userId - El identificador del usuario que realiza la puja.
 * @property {string} bidderName - El nombre del usuario que realiza la puja.
 * @property {string} bidDate - La fecha y hora en que se realizó la puja.
 */
export interface AuctionMessage {
    action: string;
    publicationId: number;
    bidAmount: number;
    userId: number;
    bidderName: string;
    bidDate: string;
}