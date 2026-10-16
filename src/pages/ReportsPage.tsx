import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { formatCurrency, formatNumber } from '../utils/formatters.ts';
import { BarChart3, Download, Printer, Filter } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('contracts');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.reports.getData({
        reportType,
        startDate,
        endDate,
      });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate]);

  const handleDownloadCSV = () => {
    const url = `/api/reports?reportType=${reportType}&startDate=${startDate}&endDate=${endDate}&format=csv`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = reportData?.columns || [];
  const rows = reportData?.data || [];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Analytical Reports &amp; Export</h2>
          <p className="text-xs text-stone-500">
            Generate and export official compliance records, procurement totals, and financial summaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 rounded-lg border border-stone-200 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Report Controls Card */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            <span>Report Category:</span>
          </span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-semibold text-stone-900"
          >
            <option value="contracts">Contracts Performance Report</option>
            <option value="harvests">Harvest &amp; Yield Audit Report</option>
            <option value="deliveries">Produce Deliveries Report</option>
            <option value="settlements">Settlements &amp; Outstanding Balances</option>
            <option value="visits">Agronomic Field Inspections</option>
            <option value="issues">Input Shortages &amp; Issues</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden"
          />
        </div>

        <div className="ml-auto text-stone-500 text-[11px]">
          Total records: <strong className="text-stone-900">{rows.length}</strong>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-800">
              <tr>
                {columns.map((col: any) => (
                  <th key={col.key} className="py-3 px-4">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={columns.length || 6} className="py-12 text-center text-stone-400">
                    Compiling analytical dataset...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length || 6} className="py-12 text-center text-stone-400">
                    No records found matching date criteria.
                  </td>
                </tr>
              ) : (
                rows.map((row: any, rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-stone-50/60 transition-colors">
                    {columns.map((col: any) => {
                      const val = row[col.key];
                      const isMoney = col.key.includes('Amount') || col.key.includes('Price') || col.key.includes('Value') || col.key.includes('Balance');
                      const isQty = col.key.includes('Quantity') || col.key.includes('Yield');

                      return (
                        <td key={col.key} className="py-2.5 px-4 tabular-nums">
                          {isMoney ? (
                            <span className="font-semibold">{formatCurrency(val)}</span>
                          ) : isQty ? (
                            <span className="font-medium">{formatNumber(val)}</span>
                          ) : (
                            String(val !== undefined ? val : '-')
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
