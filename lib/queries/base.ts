// lib/queries/base.ts
// Base query builders

export const createBaseSanityQuery = (
  filters: string = '',
  orderBy: string = 'orderRank asc, _createdAt desc'
) => `
  *[_type == "product" && !(_id in path("drafts.**"))${filters ? ` && ${filters}` : ''}] 
  | order(${orderBy})
`;

export const createBaseMixtapeQuery = (
  filters: string = '',
  orderBy: string = 'orderRank asc, _createdAt desc'
) => `
  *[_type == "mixtape" && !(_id in path("drafts.**"))${filters ? ` && ${filters}` : ''}] 
  | order(${orderBy})
`;

// Week helper function - handles both old WK format and new WWYY format
export const getCurrentWeekFilters = () => {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();

  // Generate current week in WWYY format
  const currentWeekString = `${currentWeek.toString().padStart(2, '0')}${currentYear
    .toString()
    .slice(-2)}`;

  // Generate last 6 weeks in WWYY format
  const recentWeeks = [];
  for (let i = 0; i < 7; i++) {
    const weekNum = currentWeek - i;
    const year = weekNum <= 0 ? currentYear - 1 : currentYear;
    const adjustedWeek = weekNum <= 0 ? 52 + weekNum : weekNum;
    recentWeeks.push(`${adjustedWeek.toString().padStart(2, '0')}${year.toString().slice(-2)}`);
  }

  // Separate current week from older weeks
  const olderWeeks = recentWeeks.slice(1);

  return {
    currentWeek: currentWeekString,
    olderWeeks: olderWeeks,
    recentWeeks: recentWeeks,
    // Filter for current + last 6 weeks (includes both new WWYY and old WK formats)
    allWeeksFilter: `(week in [${recentWeeks
      .map((w) => `"${w}"`)
      .join(', ')}] || week match "WK*")`,
    // Filter for just older weeks (in stock only)
    olderWeeksFilter: `week in [${olderWeeks.map((w) => `"${w}"`).join(', ')}]`
  };
};

// Generate extended weeks for new arrivals - starts from current week and goes back
export const generateExtendedWeeksForNewArrivals = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const currentWeek = Math.ceil(dayOfYear / 7);
  const currentYearShort = currentYear.toString().slice(-2);

  const extendedWeeks = [];
  let weekNum = currentWeek;
  let yearNum = parseInt(currentYearShort);

  // Generate up to 20 weeks going backwards from current week
  for (let i = 0; i < 20; i++) {
    const weekCode = `${weekNum.toString().padStart(2, '0')}${yearNum.toString().padStart(2, '0')}`;
    extendedWeeks.push(weekCode);

    // Move to previous week
    weekNum--;
    if (weekNum < 1) {
      weekNum = 52; // Go to week 52 of previous year
      yearNum--;
      if (yearNum < 0) yearNum = 99; // Handle year rollover
    }
  }

  return extendedWeeks;
};

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
