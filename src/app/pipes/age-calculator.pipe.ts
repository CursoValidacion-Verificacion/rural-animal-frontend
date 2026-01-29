import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ageCalculator',
  standalone: true
})
export class AgeCalculatorPipe implements PipeTransform {
  transform(birthDate: Date | string | undefined, format: 'years' | 'months' | 'days' | 'full' = 'full'): string {

    if (!birthDate) {
      return 'Fecha no disponible';
    }

    const birth = new Date(birthDate);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    switch (format) {
      case 'years':
        return `${years} ${years === 1 ? 'año' : 'años'}`;
      case 'months':
        const totalMonths = years * 12 + months;
        return `${totalMonths} ${totalMonths === 1 ? 'mes' : 'meses'}`;
      case 'days':
        const oneDay = 24 * 60 * 60 * 1000;
        const totalDays = Math.floor((today.getTime() - birth.getTime()) / oneDay);
        return `${totalDays} ${totalDays === 1 ? 'día' : 'días'}`;
      default:
        let age = '';
        if (years > 0) {
          age += `${years} ${years === 1 ? 'año' : 'años'}`;
        }
        if (months > 0) {
          age += age ? ' y ' : '';
          age += `${months} ${months === 1 ? 'mes' : 'meses'}`;
        }
        if (years === 0 && months === 0) {
          age = `${days} ${days === 1 ? 'día' : 'días'}`;
        }
        return age;
    }
  }
}