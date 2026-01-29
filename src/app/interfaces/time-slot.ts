import {IVeterinaryAvailability} from "@app/interfaces/veterinary-availability";

export interface ITimeSlot {
    startTime: string;
    endTime: string;
    availableVeterinarians: IVeterinaryAvailability[];
}