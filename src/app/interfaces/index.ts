import { NumberValueAccessor } from "@angular/forms";

export interface ILoginResponse {
  accessToken: string;
  expiresIn: number;
}

export interface IResponse<T> {
  data: T;
}

export interface IUser {
  id?: number;
  name?: string;
  lastName1?: string;
  lastName2?: string;
  identification?: string;
  vco?: string;
  email?: string;
  password?: string;
  birthDate?: string;
  phoneNumber?: string;
  state?: string;
  direction?: IDirection;
  role?: IRole;
  failedAttempts?: string;
  lockTime?: string;
  authorities?: IAuthority[];
}

export interface IDirection {
  id?: number;
  province?: string;
  canton?: string;
  district?: string;
  otherDetails?: string;
}

export interface IAuthority {
  authority: string;
}

export interface IFeedBackMessage {
  type?: IFeedbackStatus;
  message?: string;
}

export enum IFeedbackStatus {
  success = "SUCCESS",
  error = "ERROR",
  default = "",
}

export enum IRoleType {
  admin = "ROLE_ADMIN",
  superAdmin = "ROLE_SUPER_ADMIN",
  buyer = "ROLE_BUYER",
  seller = "ROLE_SELLER",
}

export interface IRole {
  id?: number;
  title: string;
  description?: string;
}


export interface ISearch {
  page?: number;
  size?: number;
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
}

export interface IDirection {
  id?: number;
  province?: string;
  provinceId?: string;
  canton?: string;
  cantonId?: string;
  district?: string;
  districtId?: string;
  otherDetails?: string;
}

export interface IPublication {
  id?: number;
  title: string;
  specie: string;
  race: string;
  gender: string;
  weight: number;
  birthDate: Date;
  senasaCertificate: string;
  price: number;
  startDate: Date;
  endDate: Date;
  minimumIncrease: number;
  type: string;
  state?: string;
  creationDate: Date;
  direction: IDirection;
  user?: IUser;
  photos?: IPhoto[];
}

export interface IPhoto {
  id?: number;
  url?: string;
  name?: string;
  cloudinaryId?: string;
  publicationId?: number;
}

export interface INotification {
  id?: number;
  title: string;
  description: string;
  type?: string;
  creationDate?: Date;
  publication?: IPublication;
  user: IUser;
  state: string;
}

export interface ITransaction {
  id: number;
  status: string;
  subTotal: number;
  total: number;
  tax: number;
  creationDate?: Date;
  user?: IUser;
  publications?: IPublication[];
}

export interface Province {
  id: string;
  name: string;
}

export interface Canton {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
}

// Interfaces para manejar el JSON de animales

export interface Animals {
  species: Species[];
}

export interface Species {
  kind: string;
  races: Race[];
}

export interface Race {
  name: string;
}
