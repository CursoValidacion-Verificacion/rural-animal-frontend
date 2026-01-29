import { Injectable } from '@angular/core';
import { Canton, District, Province } from '@app/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private baseUrl = 'https://ubicaciones.paginasweb.cr'

  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch(`${this.baseUrl}/provincias.json`);
      const data = await response.json() as { [key: string]: string };

      return Object.entries(data).map(([id, name]) => ({
        id,
        name
      }));
    } catch (error) {
      console.error('Error al obtener provincias:', error);
      return [];
    }
  }

  async getCantones(provinceId: string): Promise<Canton[]> {
    try {
      const response = await fetch(`${this.baseUrl}/provincia/${provinceId}/cantones.json`);
      const data = await response.json() as { [key: string]: string };

      return Object.entries(data).map(([id, name]) => ({
        id,
        name
      }));
    } catch (error) {
      console.error('Error al obtener cantones:', error);
      return [];
    }
  }

  async getDistricts(provinceId: string, cantonId: string): Promise<District[]> {
    try {
      const response = await fetch(`${this.baseUrl}/provincia/${provinceId}/canton/${cantonId}/distritos.json`);
      const data = await response.json() as { [key: string]: string };

      return Object.entries(data).map(([id, name]) => ({
        id,
        name
      }));
    } catch (error) {
      console.error('Error al obtener distritos:', error);
      return [];
    }
  }
}
