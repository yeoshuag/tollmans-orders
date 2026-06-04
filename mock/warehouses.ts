export const WAREHOUSES = [
  'תל אביב מרכז',
  'שפיים',
  'ירושלים',
  'חיפה',
  'באר שבע',
  'אשדוד',
  'נתניה',
  'רמת גן',
  'הרצליה',
  'פתח תקווה',
]

export interface Branch { code: string; name: string }

export const BRANCHES: Branch[] = [
  { code: '210', name: 'לח"י דוט אאוטדור' },
  { code: '220', name: 'גן העיר' },
  { code: '250', name: 'בית יהושע' },
  { code: '260', name: 'טולמנס ביזנס' },
  { code: '261', name: 'HORECA' },
  { code: '270', name: 'סיטונאות' },
  { code: '280', name: 'מטבחים' },
  { code: '290', name: 'ראשון לציון' },
  { code: '330', name: "בית טולמנ'ס" },
  { code: '370', name: 'לח"י' },
  { code: '380', name: 'שפיים' },
  { code: '385', name: 'עודפים-קיסריה' },
  { code: '390', name: 'רדיזיין' },
]
