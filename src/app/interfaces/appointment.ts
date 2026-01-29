export interface IAppointment {
    id?: number;
    veterinaryName: string;
    firstSurname: string;
    secondSurname?: string;
    email: string;
    speciality: string;
    status: string
    startDate: Date;
    endDate: Date;
    fullName?:string;
}