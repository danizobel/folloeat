/**
 * FolloEat - Opening Hours & "Aperto Ora" Engine
 * Computes live operational status for Follonica merchants based on Italian system time (Europe/Rome).
 */

import { Merchant } from './types';

export interface MerchantSchedule {
  lunch_open?: string;   // e.g. "12:00"
  lunch_close?: string;  // e.g. "15:00"
  dinner_open?: string;  // e.g. "19:00"
  dinner_close?: string; // e.g. "23:30"
  all_day_open?: string; // e.g. "07:30"
  all_day_close?: string;// e.g. "23:30"
  weekly_off_day?: number | null; // 0=Dom, 1=Lun, 2=Mar, 3=Mer, 4=Gio, 5=Ven, 6=Sab
}

export interface OpenStatusResult {
  isOpen: boolean;
  statusLabel: string;
  badgeClass: string;
  badgeDotClass: string;
  scheduleSummary: string;
  nextTransition: string;
  reason?: string;
}

const DAYS_NAMES_IT = [
  'Domenica',
  'Lunedì',
  'Martedì',
  'Mercoledì',
  'Giovedì',
  'Venerdì',
  'Sabato'
];

/**
 * Returns current Italian date & time in Europe/Rome timezone
 */
export function getItalianTime(date: Date = new Date()): {
  dayOfWeek: number;
  hour: number;
  minute: number;
  totalMinutes: number;
  timeStr: string;
} {
  // Format to Europe/Rome components
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Rome',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });

  const parts = formatter.formatToParts(date);
  let hour = date.getHours();
  let minute = date.getMinutes();
  let dayOfWeek = date.getDay();

  for (const part of parts) {
    if (part.type === 'hour') hour = parseInt(part.value, 10);
    if (part.type === 'minute') minute = parseInt(part.value, 10);
  }

  // Double check weekday in Rome
  const dayFormatter = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    weekday: 'short'
  });
  const shortDay = dayFormatter.format(date).toLowerCase();
  if (shortDay.startsWith('dom')) dayOfWeek = 0;
  else if (shortDay.startsWith('lun')) dayOfWeek = 1;
  else if (shortDay.startsWith('mar')) dayOfWeek = 2;
  else if (shortDay.startsWith('mer')) dayOfWeek = 3;
  else if (shortDay.startsWith('gio')) dayOfWeek = 4;
  else if (shortDay.startsWith('ven')) dayOfWeek = 5;
  else if (shortDay.startsWith('sab')) dayOfWeek = 6;

  const totalMinutes = hour * 60 + minute;
  const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  return { dayOfWeek, hour, minute, totalMinutes, timeStr };
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Resolves standard schedule for a merchant based on category or custom configuration
 */
export function getMerchantSchedule(merchant: Merchant): MerchantSchedule {
  const cat = (merchant.category || '').toLowerCase();
  const name = merchant.name.toLowerCase();

  // 1. Gelaterie, Bar, Pasticcerie & Caffè (Continuous daytime & evening)
  if (
    cat.includes('gelat') ||
    cat.includes('pasticc') ||
    cat.includes('bar ') ||
    cat.includes('caff') ||
    name.includes('peggi') ||
    name.includes('pagni') ||
    name.includes('ricci') ||
    name.includes('villa rosa')
  ) {
    return {
      all_day_open: '07:30',
      all_day_close: '23:30',
      weekly_off_day: merchant.weekly_off_day !== undefined ? merchant.weekly_off_day : null
    };
  }

  // 2. Chioschi Pineta & Schiacciate
  if (
    cat.includes('pineta') ||
    cat.includes('chiosco') ||
    cat.includes('schiacc') ||
    name.includes('boschetto') ||
    name.includes('fratelli') ||
    name.includes('ghiottone')
  ) {
    return {
      all_day_open: '11:00',
      all_day_close: '22:30',
      weekly_off_day: merchant.weekly_off_day !== undefined ? merchant.weekly_off_day : null
    };
  }

  // 3. Pizzerie, Burger & Pub
  if (
    cat.includes('pizz') ||
    cat.includes('burger') ||
    cat.includes('pub') ||
    name.includes('pizz') ||
    name.includes('lampadino') ||
    name.includes('disco rosso') ||
    name.includes('poldo') ||
    name.includes('yankees')
  ) {
    return {
      lunch_open: '12:00',
      lunch_close: '14:30',
      dinner_open: '19:00',
      dinner_close: '23:30',
      // Default off day for traditional pizzerias in Follonica: Monday (1)
      weekly_off_day: merchant.weekly_off_day !== undefined ? merchant.weekly_off_day : 1
    };
  }

  // 4. Ristoranti di Pesce, Trattorie & Chalet
  return {
    lunch_open: '12:00',
    lunch_close: '15:00',
    dinner_open: '19:00',
    dinner_close: '23:30',
    // Default off day for seafood restaurants: Wednesday (3)
    weekly_off_day: merchant.weekly_off_day !== undefined ? merchant.weekly_off_day : 3
  };
}

/**
 * Determines whether a merchant is currently open at the specified date/time.
 */
export function isMerchantOpenNow(merchant: Merchant, targetDate: Date = new Date()): OpenStatusResult {
  const { dayOfWeek, totalMinutes, timeStr } = getItalianTime(targetDate);
  const schedule = getMerchantSchedule(merchant);

  // Check 1: Snooze status (Manual closure in dashboard)
  if (merchant.snooze_until) {
    const snoozeEnd = new Date(merchant.snooze_until);
    if (snoozeEnd > targetDate) {
      return {
        isOpen: false,
        statusLabel: 'Chiuso temporaneamente',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
        badgeDotClass: 'bg-rose-500',
        scheduleSummary: 'Pausa momentanea',
        nextTransition: 'Riapertura a breve',
        reason: 'Pausa ordini attivata dal locale'
      };
    }
  }

  // Check 2: Vacation
  if (merchant.vacation_start && merchant.vacation_end) {
    const start = new Date(merchant.vacation_start);
    const end = new Date(merchant.vacation_end);
    if (targetDate >= start && targetDate <= end) {
      return {
        isOpen: false,
        statusLabel: 'Chiuso per ferie',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        badgeDotClass: 'bg-amber-500',
        scheduleSummary: 'Chiusura stagionale',
        nextTransition: `Riapre il ${end.toLocaleDateString('it-IT')}`,
        reason: 'Ferie'
      };
    }
  }

  // Check 3: Weekly off day
  const effectiveOffDay = schedule.weekly_off_day;
  if (effectiveOffDay !== null && effectiveOffDay !== undefined && dayOfWeek === effectiveOffDay) {
    const dayName = DAYS_NAMES_IT[effectiveOffDay];
    return {
      isOpen: false,
      statusLabel: `Chiuso (${dayName})`,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      badgeDotClass: 'bg-slate-400',
      scheduleSummary: `Riposo settimanale: ${dayName}`,
      nextTransition: 'Apre domani',
      reason: `Giorno di riposo settimanale (${dayName})`
    };
  }

  // Check 4: All-day continuous schedule (Bar / Gelaterie / Pineta)
  if (schedule.all_day_open && schedule.all_day_close) {
    const openMin = parseTimeToMinutes(schedule.all_day_open);
    const closeMin = parseTimeToMinutes(schedule.all_day_close);

    const isOpen = totalMinutes >= openMin && totalMinutes < closeMin;
    const scheduleSummary = `${schedule.all_day_open} - ${schedule.all_day_close}`;

    if (isOpen) {
      return {
        isOpen: true,
        statusLabel: 'Aperto ora',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        badgeDotClass: 'bg-emerald-500 animate-pulse',
        scheduleSummary,
        nextTransition: `Chiude alle ${schedule.all_day_close}`
      };
    } else if (totalMinutes < openMin) {
      return {
        isOpen: false,
        statusLabel: 'Chiuso',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        badgeDotClass: 'bg-slate-400',
        scheduleSummary,
        nextTransition: `Apre alle ${schedule.all_day_open}`
      };
    } else {
      return {
        isOpen: false,
        statusLabel: 'Chiuso per la notte',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        badgeDotClass: 'bg-slate-400',
        scheduleSummary,
        nextTransition: `Riapre domani alle ${schedule.all_day_open}`
      };
    }
  }

  // Check 5: Split lunch / dinner schedule (Pizzerie, Trattorie, Ristoranti)
  const lunchOpenMin = schedule.lunch_open ? parseTimeToMinutes(schedule.lunch_open) : null;
  const lunchCloseMin = schedule.lunch_close ? parseTimeToMinutes(schedule.lunch_close) : null;
  const dinnerOpenMin = schedule.dinner_open ? parseTimeToMinutes(schedule.dinner_open) : null;
  const dinnerCloseMin = schedule.dinner_close ? parseTimeToMinutes(schedule.dinner_close) : null;

  const scheduleSummary = `${schedule.lunch_open || ''}-${schedule.lunch_close || ''} • ${schedule.dinner_open || ''}-${schedule.dinner_close || ''}`;

  // Currently in lunch service
  if (lunchOpenMin !== null && lunchCloseMin !== null && totalMinutes >= lunchOpenMin && totalMinutes < lunchCloseMin) {
    return {
      isOpen: true,
      statusLabel: 'Aperto (Pranzo)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      badgeDotClass: 'bg-emerald-500 animate-pulse',
      scheduleSummary,
      nextTransition: `Servizio pranzo fino alle ${schedule.lunch_close}`
    };
  }

  // Currently in dinner service
  if (dinnerOpenMin !== null && dinnerCloseMin !== null && totalMinutes >= dinnerOpenMin && totalMinutes < dinnerCloseMin) {
    return {
      isOpen: true,
      statusLabel: 'Aperto (Cena)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      badgeDotClass: 'bg-emerald-500 animate-pulse',
      scheduleSummary,
      nextTransition: `Servizio cena fino alle ${schedule.dinner_close}`
    };
  }

  // Afternoon break between lunch and dinner
  if (lunchCloseMin !== null && dinnerOpenMin !== null && totalMinutes >= lunchCloseMin && totalMinutes < dinnerOpenMin) {
    return {
      isOpen: false,
      statusLabel: 'Pausa pomeridiana',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeDotClass: 'bg-amber-400',
      scheduleSummary,
      nextTransition: `Riapre a cena alle ${schedule.dinner_open}`,
      reason: 'Pausa pomeridiana tra pranzo e cena'
    };
  }

  // Before lunch opening
  if (lunchOpenMin !== null && totalMinutes < lunchOpenMin) {
    return {
      isOpen: false,
      statusLabel: 'Chiuso',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      badgeDotClass: 'bg-slate-400',
      scheduleSummary,
      nextTransition: `Apre a pranzo alle ${schedule.lunch_open}`
    };
  }

  // After dinner closure
  return {
    isOpen: false,
    statusLabel: 'Chiuso',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    badgeDotClass: 'bg-slate-400',
    scheduleSummary,
    nextTransition: schedule.lunch_open ? `Riapre domani alle ${schedule.lunch_open}` : 'Riapre domani'
  };
}
