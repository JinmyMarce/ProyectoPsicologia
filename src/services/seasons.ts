export interface Season {
  name: string;
  description: string;
  color: string;
  gradient: string;
  icon: string;
  months: number[];
}

export class SeasonService {
  private static seasons: Season[] = [
    {
      name: 'Verano',
      description: 'Temporada de verano',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      icon: '☀️',
      months: [12, 1, 2, 3]
    },
    {
      name: 'Otoño',
      description: 'Temporada de otoño',
      color: '#d97706',
      gradient: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
      icon: '🍂',
      months: [3, 4, 5, 6]
    },
    {
      name: 'Invierno',
      description: 'Temporada de invierno',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      icon: '❄️',
      months: [6, 7, 8, 9]
    },
    {
      name: 'Primavera',
      description: 'Temporada de primavera',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icon: '🌸',
      months: [9, 10, 11, 12]
    }
  ];

  static getCurrentSeason(date: Date = new Date()): Season {
    const month = date.getMonth() + 1; // getMonth() devuelve 0-11
    const day = date.getDate();
    
    // Verano: 21 de diciembre al 20 de marzo
    if ((month === 12 && day >= 21) || month === 1 || month === 2 || (month === 3 && day <= 20)) {
      return this.seasons[0]; // Verano
    }
    
    // Otoño: 20 de marzo al 21 de junio
    if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day <= 21)) {
      return this.seasons[1]; // Otoño
    }
    
    // Invierno: 21 de junio al 22 de septiembre
    if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day <= 22)) {
      return this.seasons[2]; // Invierno
    }
    
    // Primavera: 22 de septiembre al 21 de diciembre
    if ((month === 9 && day >= 22) || month === 10 || month === 11 || (month === 12 && day <= 21)) {
      return this.seasons[3]; // Primavera
    }
    
    // Fallback a verano
    return this.seasons[0];
  }

  static getAllSeasons(): Season[] {
    return this.seasons;
  }
}





