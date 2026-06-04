export interface Agent {
  id: string
  name: string
  branchCode: string
}

export const MOCK_AGENTS: Agent[] = [
  { id: 'a01', name: 'יוסי כהן', branchCode: '330' },
  { id: 'a02', name: 'מירה לוי', branchCode: '330' },
  { id: 'a03', name: 'דוד ישראלי', branchCode: '370' },
  { id: 'a04', name: 'רחל מזרחי', branchCode: '380' },
  { id: 'a05', name: 'אלי ברק', branchCode: '260' },
  { id: 'a06', name: 'נועה שמיר', branchCode: '290' },
]
