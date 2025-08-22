// lib/data/products/index/utils/week-helpers.ts

export function getCurrentWeekWWYY(): string {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
  const yearShort = year.toString().slice(-2);
  return `${weekNumber.toString().padStart(2, '0')}${yearShort}`;
}

export function getPreviousWeekWWYY(weekStr: string): string {
  const week = parseInt(weekStr.slice(0, 2));
  const year = parseInt(weekStr.slice(2, 4));
  if (week > 1) {
    return `${(week - 1).toString().padStart(2, '0')}${year.toString().padStart(2, '0')}`;
  } else {
    const prevYear = year - 1;
    return `52${prevYear.toString().padStart(2, '0')}`;
  }
}

export function sortWeeksByRecency(weeks: string[]): string[] {
  return weeks
    .filter((week): week is string => typeof week === 'string' && /^\d{4}$/.test(week))
    .sort((a, b) => {
      const aSort = a.slice(2) + a.slice(0, 2);
      const bSort = b.slice(2) + b.slice(0, 2);
      return bSort.localeCompare(aSort);
    });
}

export function getTargetWeeks(maxWeeks: number, availableWeeks: string[]): string[] {
  const sortedWeeks = sortWeeksByRecency(availableWeeks);
  const targetWeeks: string[] = [];
  let currentWeek = getCurrentWeekWWYY();
  let weeksChecked = 0;
  const maxWeeksToCheck = 52;
  const weeksNeeded = Math.min(maxWeeks, sortedWeeks.length);

  while (targetWeeks.length < weeksNeeded && weeksChecked < maxWeeksToCheck) {
    if (sortedWeeks.includes(currentWeek)) {
      targetWeeks.push(currentWeek);
    }
    currentWeek = getPreviousWeekWWYY(currentWeek);
    weeksChecked++;
  }

  return targetWeeks;
}
