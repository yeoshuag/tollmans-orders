export type OrderStatus = 'טיוטה' | 'הצעת מחיר' | 'הזמנה'

export interface OrderLine {
  code: string
  name: string
  finish: string
  location: string
  warehouse: string
  source: 'מלאי' | 'תצוגה' | 'יבוא' | 'מלאי בדרך' | '29'
  brand: string
  model: string
  dimensions: string
  unitPrice: number
  discountPct: number
  quantity: number
  deliveryDate?: string
  notes?: string
}

export interface Order {
  id: string
  docNumber: string
  status: OrderStatus
  customerId: string
  customerName: string
  agentId: string
  agentName: string
  branchCode: string
  branchName: string
  date: string
  validUntil?: string
  lines: OrderLine[]
  subtotal: number
  generalDiscountPct: number
  shippingAmount: number
  shippingIsPercent: boolean
  currency: '₪' | '€' | '$'
  customerType: 'פרטי' | 'עסקי'
  localOrTourist: 'מקומי' | 'תייר'
  deliveryType: string
  pickupBranch?: string
  stockDeliveryDate?: string
  importDeliveryDate?: string
  splitDelivery?: boolean
  distributionNotes?: string
  notesToCustomer?: string
  internalNotes?: string
  officeNotes?: string
  paymentTerms: string
}

const today = new Date()
const fmt = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000)

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-001',
    docNumber: '26330000001',
    status: 'טיוטה',
    customerId: 'c1',
    customerName: 'ישראל ישראלי',
    agentId: 'a01',
    agentName: 'יוסי כהן',
    branchCode: '330',
    branchName: "בית טולמנ'ס",
    date: fmt(addDays(today, -3)),
    lines: [
      {
        code: 'SOF-001',
        name: 'ספה תלת מושבית OSLO',
        finish: 'בד בוקלה אפור כהה',
        location: 'סלון',
        warehouse: 'רמת גן',
        source: 'מלאי',
        brand: 'BoConcept',
        model: 'Oslo 3-Seater',
        dimensions: '230×90×80 ס"מ',
        unitPrice: 8900,
        discountPct: 15,
        quantity: 1,
      },
    ],
    subtotal: 7565,
    generalDiscountPct: 0,
    shippingAmount: 500,
    shippingIsPercent: false,
    currency: '₪',
    customerType: 'פרטי',
    localOrTourist: 'מקומי',
    deliveryType: 'הובלה והרכבה ע"י טולמנס',
    paymentTerms: 'תשלום מלא במעמד ההזמנה',
  },
  {
    id: 'ord-002',
    docNumber: '26330000002',
    status: 'הצעת מחיר',
    customerId: 'c2',
    customerName: 'שרה כהן',
    agentId: 'a02',
    agentName: 'מירה לוי',
    branchCode: '330',
    branchName: "בית טולמנ'ס",
    date: fmt(addDays(today, -10)),
    validUntil: fmt(addDays(today, 20)),
    lines: [
      {
        code: 'TBL-202',
        name: 'שולחן אוכל NERO',
        finish: 'אגוז שחור',
        location: 'פינת אוכל',
        warehouse: 'ירושלים',
        source: 'מלאי',
        brand: 'Minotti',
        model: 'Nero Dining 200',
        dimensions: '200×100×76 ס"מ',
        unitPrice: 12400,
        discountPct: 0,
        quantity: 1,
      },
      {
        code: 'CHR-115',
        name: 'כיסא אוכל FLORA',
        finish: 'לבן שקוף',
        location: 'פינת אוכל',
        warehouse: 'ירושלים',
        source: 'מלאי',
        brand: 'Kartell',
        model: 'Flora Chair',
        dimensions: '55×58×88 ס"מ',
        unitPrice: 1650,
        discountPct: 10,
        quantity: 6,
      },
    ],
    subtotal: 21310,
    generalDiscountPct: 0,
    shippingAmount: 0,
    shippingIsPercent: false,
    currency: '₪',
    customerType: 'פרטי',
    localOrTourist: 'מקומי',
    deliveryType: 'הובלה והרכבה ע"י טולמנס',
    paymentTerms: '50% בהזמנה 50% עם הגעה למחסן',
  },
  {
    id: 'ord-003',
    docNumber: '26370000001',
    status: 'הצעת מחיר',
    customerId: 'c3',
    customerName: 'מיכאל לוי',
    agentId: 'a03',
    agentName: 'דוד ישראלי',
    branchCode: '370',
    branchName: 'לח"י',
    date: fmt(addDays(today, -25)),
    validUntil: fmt(addDays(today, 5)),
    lines: [
      {
        code: 'BED-501',
        name: 'מיטה זוגית LUNO',
        finish: 'עץ ורדן + בד אוף-וויט',
        location: 'חדר שינה ראשי',
        warehouse: 'תל אביב מרכז',
        source: 'מלאי',
        brand: 'Poliform',
        model: 'Luno King 180',
        dimensions: '200×200×110 ס"מ',
        unitPrice: 18500,
        discountPct: 12,
        quantity: 1,
      },
      {
        code: 'RUG-088',
        name: 'שטיח KENZA',
        finish: 'צמר טבעי חום/שמנת',
        location: 'חדר שינה',
        warehouse: 'הרצליה',
        source: 'מלאי',
        brand: 'Nanimarquina',
        model: 'Kenza 200×300',
        dimensions: '200×300 ס"מ',
        unitPrice: 4800,
        discountPct: 0,
        quantity: 1,
      },
    ],
    subtotal: 21080,
    generalDiscountPct: 5,
    shippingAmount: 0,
    shippingIsPercent: false,
    currency: '₪',
    customerType: 'עסקי',
    localOrTourist: 'מקומי',
    deliveryType: 'הובלה והרכבה ע"י טולמנס',
    paymentTerms: '25% בהזמנה 25% תוך שבועיים 45% עם הגעה 5% לאחר אספקה',
  },
  {
    id: 'ord-004',
    docNumber: '26380000001',
    status: 'הזמנה',
    customerId: 'c4',
    customerName: 'James Wilson',
    agentId: 'a04',
    agentName: 'רחל מזרחי',
    branchCode: '380',
    branchName: 'שפיים',
    date: fmt(addDays(today, -15)),
    lines: [
      {
        code: 'LGT-340',
        name: 'מנורת רצפה ARC',
        finish: 'כרום',
        location: 'סלון',
        warehouse: 'רמת גן',
        source: 'תצוגה',
        brand: 'Flos',
        model: 'Arco Floor Lamp',
        dimensions: 'גובה 240 ס"מ',
        unitPrice: 6200,
        discountPct: 20,
        quantity: 1,
      },
      {
        code: 'ACC-710',
        name: 'אגרטל MURANO',
        finish: 'ענבר/זהב',
        location: 'סלון',
        warehouse: 'תל אביב מרכז',
        source: 'מלאי',
        brand: 'Venini',
        model: 'Murano Blown Glass',
        dimensions: 'גובה 35 ס"מ',
        unitPrice: 1200,
        discountPct: 0,
        quantity: 2,
      },
    ],
    subtotal: 7360,
    generalDiscountPct: 0,
    shippingAmount: 0,
    shippingIsPercent: false,
    currency: '$',
    customerType: 'פרטי',
    localOrTourist: 'תייר',
    deliveryType: 'איסוף עצמי מהמחסן',
    pickupBranch: '380',
    paymentTerms: 'תשלום מלא במעמד ההזמנה',
  },
  {
    id: 'ord-005',
    docNumber: '26260000001',
    status: 'הזמנה',
    customerId: 'c5',
    customerName: 'דנה אברהם',
    agentId: 'a05',
    agentName: 'אלי ברק',
    branchCode: '260',
    branchName: 'טולמנס ביזנס',
    date: fmt(addDays(today, -5)),
    lines: [
      {
        code: 'SOF-001',
        name: 'ספה תלת מושבית OSLO',
        finish: 'בד בוקלה אפור כהה',
        location: 'לובי',
        warehouse: 'תל אביב מרכז',
        source: 'יבוא',
        brand: 'BoConcept',
        model: 'Oslo 3-Seater',
        dimensions: '230×90×80 ס"מ',
        unitPrice: 8900,
        discountPct: 20,
        quantity: 4,
      },
      {
        code: 'STG-622',
        name: 'מדף קיר SPAN',
        finish: 'לבן',
        location: 'לובי',
        warehouse: 'תל אביב מרכז',
        source: 'מלאי',
        brand: 'String',
        model: 'Span Wall Unit 120',
        dimensions: '120×22×30 ס"מ',
        unitPrice: 2300,
        discountPct: 8,
        quantity: 6,
      },
    ],
    subtotal: 41072,
    generalDiscountPct: 0,
    shippingAmount: 3,
    shippingIsPercent: true,
    currency: '₪',
    customerType: 'עסקי',
    localOrTourist: 'מקומי',
    deliveryType: 'פרויקט',
    importDeliveryDate: fmt(addDays(today, 90)),
    paymentTerms: '25% בהזמנה 25% תוך שבועיים 45% עם הגעה 5% לאחר אספקה',
    internalNotes: 'פרויקט מלון פאר נתניה',
  },
  {
    id: 'ord-006',
    docNumber: '26290000001',
    status: 'הזמנה',
    customerId: 'c1',
    customerName: 'ישראל ישראלי',
    agentId: 'a06',
    agentName: 'נועה שמיר',
    branchCode: '290',
    branchName: 'ראשון לציון',
    date: fmt(addDays(today, -2)),
    lines: [
      {
        code: 'CHR-115',
        name: 'כיסא אוכל FLORA',
        finish: 'לבן שקוף',
        location: 'פינת אוכל',
        warehouse: 'פתח תקווה',
        source: 'מלאי',
        brand: 'Kartell',
        model: 'Flora Chair',
        dimensions: '55×58×88 ס"מ',
        unitPrice: 1650,
        discountPct: 10,
        quantity: 4,
      },
    ],
    subtotal: 5940,
    generalDiscountPct: 0,
    shippingAmount: 300,
    shippingIsPercent: false,
    currency: '₪',
    customerType: 'פרטי',
    localOrTourist: 'מקומי',
    deliveryType: 'הובלה והרכבה ע"י טולמנס',
    stockDeliveryDate: fmt(addDays(today, 14)),
    paymentTerms: 'תשלום מלא במעמד ההזמנה',
  },
]
