export interface Customer {
  id: string
  idNumber: string
  firstName: string
  lastName: string
  phone: string
  phone2?: string
  email: string
  city: string
  address: string
  zip: string
  floor?: string
  apartment?: string
  elevator?: boolean
  customerType: 'פרטי' | 'עסקי'
  localOrTourist: 'מקומי' | 'תייר'
  companyName?: string
  companyNumber?: string
  architect?: string
  architectCode?: string
  notes?: string
}

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    idNumber: '123456789',
    firstName: 'ישראל',
    lastName: 'ישראלי',
    phone: '050-1234567',
    email: 'israel@example.com',
    city: 'תל אביב',
    address: 'רחוב הרצל 1',
    zip: '6100000',
    floor: '3',
    apartment: '12',
    elevator: true,
    customerType: 'פרטי',
    localOrTourist: 'מקומי',
  },
  {
    id: 'c2',
    idNumber: '987654321',
    firstName: 'שרה',
    lastName: 'כהן',
    phone: '052-9876543',
    email: 'sarah@example.com',
    city: 'ירושלים',
    address: 'שדרות בן גוריון 45',
    zip: '9100000',
    floor: '2',
    apartment: '8',
    elevator: false,
    customerType: 'פרטי',
    localOrTourist: 'מקומי',
  },
  {
    id: 'c3',
    idNumber: '555444333',
    firstName: 'מיכאל',
    lastName: 'לוי',
    phone: '054-5554443',
    email: 'michael@designstudio.co.il',
    city: 'הרצליה',
    address: 'רחוב סוקולוב 20',
    zip: '4610000',
    customerType: 'עסקי',
    localOrTourist: 'מקומי',
    companyName: 'לוי עיצוב פנים',
    companyNumber: '515123456',
    architect: 'מיכאל לוי',
    architectCode: 'A-1234',
  },
  {
    id: 'c4',
    idNumber: '',
    firstName: 'James',
    lastName: 'Wilson',
    phone: '050-7771234',
    email: 'james.wilson@email.com',
    city: 'Tel Aviv',
    address: 'Gordon 5',
    zip: '6330000',
    customerType: 'פרטי',
    localOrTourist: 'תייר',
  },
  {
    id: 'c5',
    idNumber: '111222333',
    firstName: 'דנה',
    lastName: 'אברהם',
    phone: '053-1112223',
    phone2: '03-5551234',
    email: 'dana@luxuryhotels.co.il',
    city: 'נתניה',
    address: 'שדרות ויצמן 100',
    zip: '4240000',
    customerType: 'עסקי',
    localOrTourist: 'מקומי',
    companyName: 'פאר מלונות בע"מ',
    companyNumber: '512345678',
    notes: 'לקוח VIP, הנחה קבועה',
  },
]
