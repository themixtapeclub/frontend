// lib/data/products/utils/extractors.ts
export const extractString = (field: any): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (Array.isArray(field)) {
    return field
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          if (item.main) return item.main;
          if (item.name) return item.name;
          if (item.title) return item.title;
          if (item._type === 'reference' && item._ref) return '';
        }
        return String(item);
      })
      .filter(Boolean)
      .join(', ');
  }
  if (typeof field === 'object') {
    if (field.main) return field.main;
    if (field.name) return field.name;
    if (field.title) return field.title;
    if (field._type === 'reference' && field._ref) return '';
  }
  return String(field);
};

export const extractWeek = (weekField: any): string => {
  if (!weekField) return '';
  if (typeof weekField === 'string') return weekField;
  if (Array.isArray(weekField)) {
    const wwyy = weekField.find((w: any) => typeof w === 'string' && /^\d{4}$/.test(w));
    if (wwyy) return wwyy;
    const anyString = weekField.find((w: any) => typeof w === 'string');
    if (anyString) return anyString;
    return weekField[0] ? String(weekField[0]) : '';
  }
  return String(weekField);
};

export const slugToLabelName = (slug: string): string => {
  return slug
    .replace(/--+/g, ' & ')
    .replace(/-/g, ' ')
    .replace(/\s+and\s+/gi, ' & ');
};
