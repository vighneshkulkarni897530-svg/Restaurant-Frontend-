'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Grid,
  Calendar,
  Sparkles,
  Download,
  UtensilsCrossed,
  DollarSign,
} from 'lucide-react';
import { api } from '../../../lib/api';

export default function AdminReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadReport = async () => {
    try {
      const res = await api.getSalesReport();
      if (res.success && res.report) {
        setReport(res.report);
      }
    } catch (e) {
      console.error('Failed to load sales report', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleExportCSV = () => {
    if (!report) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Orders,Revenue\n';
    report.salesTrend?.forEach((row: any) => {
      csvContent += `${row.date},${row.orders},${row.revenue}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Generating Sales Analytics...
      </div>
    );
  }

  const maxRevenueTrend = Math.max(
    ...(report?.salesTrend?.map((t: any) => t.revenue) || [1000]),
    100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-amber-400" />
            <span>Sales Analytics & Business Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze daily revenue trends, best-selling gourmet dishes, and table turnover performance.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl glass-card border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</span>
          <div className="text-3xl font-black text-white gold-gradient-text mt-2">
            ₹{report?.totalRevenue ? report.totalRevenue.toFixed(2) : '0.00'}
          </div>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>Across all completed orders</span>
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settled Orders Count</span>
          <div className="text-3xl font-black text-white mt-2">
            {report?.totalPaidOrders ?? 0}
          </div>
          <p className="text-xs text-slate-400 mt-1">Dine-in guests served</p>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Performing Section</span>
          <div className="text-3xl font-black text-amber-400 mt-2">
            {report?.tablePerformance?.[0]?.section || 'Indoor Bistro'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Highest order volume area</p>
        </div>
      </div>

      {/* Visual 7-Day Revenue Trend Chart */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">7-Day Revenue & Volume Trend</h3>
          </div>
        </div>

        <div className="pt-6 pb-2 grid grid-cols-7 gap-2 sm:gap-4 items-end h-56">
          {report?.salesTrend?.map((day: any, idx: number) => {
            const heightPercent = Math.max(8, Math.round((day.revenue / maxRevenueTrend) * 100));

            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="text-[10px] font-bold text-amber-300">
                  {day.revenue > 0 ? `₹${day.revenue}` : '₹0'}
                </div>

                <div
                  className="w-full max-w-[48px] rounded-t-xl gold-gradient-bg shadow-lg shadow-amber-500/10 hover:brightness-110 transition-all cursor-pointer relative group"
                  style={{ height: `${heightPercent}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] text-white font-bold whitespace-nowrap z-20 transition-opacity">
                    {day.orders} Orders
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-semibold">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Best-Selling Dishes */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Top 5 Best-Selling Dishes</h3>
            </div>
            <span className="text-xs text-amber-400 font-bold">By Quantity</span>
          </div>

          <div className="space-y-3">
            {report?.topDishes?.map((dish: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl gold-gradient-bg text-slate-950 font-black text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-white">{dish.name}</h4>
                    <p className="text-[10px] text-slate-400">{dish.quantity} orders served</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-400">₹{dish.revenue.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500">Total Revenue</div>
                </div>
              </div>
            ))}

            {(!report?.topDishes || report.topDishes.length === 0) && (
              <div className="py-6 text-center text-xs text-slate-500">
                No dish sales recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Table Performance Breakdown */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Grid className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-sm text-white">Table Utilization Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400">By Revenue</span>
          </div>

          <div className="space-y-3">
            {report?.tablePerformance?.map((t: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-800 text-sky-400 font-bold text-xs flex items-center justify-center">
                    {t.tableNumber}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-white">Table {t.tableNumber}</h4>
                    <p className="text-[10px] text-slate-400">{t.section}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white">₹{t.revenue.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">{t.orders} Orders placed</div>
                </div>
              </div>
            ))}

            {(!report?.tablePerformance || report.tablePerformance.length === 0) && (
              <div className="py-6 text-center text-xs text-slate-500">
                No table order data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
