import {ITimeSlot} from "@app/interfaces/time-slot";

export interface IAvailability {
    date: string;
    availableSlots: ITimeSlot[];
}