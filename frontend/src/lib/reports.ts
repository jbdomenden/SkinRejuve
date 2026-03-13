export type ReportRequest = {
  module: string
  fromDate: string
  toDate: string
  status: string
  staff: string
}

function toCsvRow(values: string[]) {
  return values.map((v) => `"${v.replaceAll('"', '""')}"`).join(',')
}

export function exportCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => toCsvRow(row)).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportModuleReportCsv(request: ReportRequest) {
  const rows = [
    ['module', 'from_date', 'to_date', 'status', 'staff', 'generated_at'],
    [request.module, request.fromDate, request.toDate, request.status, request.staff, new Date().toISOString()],
  ]
  exportCsv(`${request.module.toLowerCase().replaceAll(' ', '_')}-report.csv`, rows)
}
