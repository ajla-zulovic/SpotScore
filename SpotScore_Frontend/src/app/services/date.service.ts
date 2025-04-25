import { Injectable } from '@angular/core';
import { format } from 'date-fns';
import { enUS, de, fr, bs } from 'date-fns/locale';
@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }
  getFormattedDate(dateString: string, locale: string = 'en-US'): string {
    if (!dateString) return 'Invalid Date';
    
    const date = new Date(dateString);
    const locales = { 'en-US': enUS, 'de-DE': de, 'fr-FR': fr, 'bs-BA': bs };

    return format(date, 'PPpp', { locale: locales[locale] || enUS });
  }
}
