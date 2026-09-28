'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Order, Merchant } from '@/lib/types';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  CreditCard,
  Banknote,
  DollarSign,
  Filter,
  X,
  ChevronDown,
  Info,
  Clock,
  Sparkles,
  ArrowUpRight,
  Layers,
  Store
} from 'lucide-react';

interface AdminDailyTransactionsChartProps {
  orders: Order[];
  merchants: Merchant[];
  isLoading?: boolean;
}

export type TimeRange = 7 | 14 | 30;
export type ChartMetric = 'volume' | 'orders' | 'commissions';
export type BreakdownMode = 'total' | 'payment_method';

interface DayBucket {
  date: Date;
  dateKey: string;     // YYYY-MM-DD
  displayDate: string; // e.g. "27 Set"
  fullDateStr: string; // e.g. "Domenica 27 Settembre 2026"
  isWeekend: boolean;
  isToday: boolean;
  totalVolume: number;
  cardVolume: number;
  cashVolume: number;
  commission: number;
  orderCount: number;
  cardOrdersCount: number;
  cashOrdersCount: number;
  avgTicket: number;
  topMerchantName: string;
  topMerchantAmount: number;
  orders: Order[];
}

interface PeriodStats {
  totalVol: number;
  cardVol: number;
  cashVol: number;
  totalOrders: number;
  dailyAvg: number;
  avgTicketOverall: number;
  cardPct: number;
  commissionsTotal: number;
  peakDay: DayBucket | null;
}

export default function AdminDailyTransactionsChart({
  orders,
  merchants,
  isLoading = false
}: AdminDailyTransactionsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Filter & Mode state
  const [timeRange, setTimeRange] = useState<TimeRange>(14);
  const [metric, setMetric] = useState<ChartMetric>('volume');
  const [breakdownMode, setBreakdownMode] = useState<BreakdownMode>('total');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('ALL');

  // Interactive selected bar state
  const [hoveredDay, setHoveredDay] = useState<DayBucket | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayBucket | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Compute daily aggregated data based on timeRange and selectedMerchantId
  const dailyData: DayBucket[] = useMemo(() => {
    const buckets: DayBucket[] = [];
    const now = new Date();
    // Normalize today to start of day in local time
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Generate days for the selected range (oldest to newest)
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${dayNum}`;

      const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isToday = i === 0;

      // Short format in Italian
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
      const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
      const monthFull = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
      ];
      const dayFull = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

      const displayDate = isToday ? 'Oggi' : `${d.getDate()} ${monthNames[d.getMonth()]}`;
      const fullDateStr = `${dayFull[dayOfWeek]} ${d.getDate()} ${monthFull[d.getMonth()]} ${year}`;

      // Filter matching orders for this date
      const dayOrders = orders.filter(o => {
        if (o.status === 'CANCELLED') return false;
        if (selectedMerchantId !== 'ALL' && o.merchant_id !== selectedMerchantId) return false;

        const orderDate = new Date(o.created_at);
        const oYear = orderDate.getFullYear();
        const oMonth = String(orderDate.getMonth() + 1).padStart(2, '0');
        const oDay = String(orderDate.getDate()).padStart(2, '0');
        return `${oYear}-${oMonth}-${oDay}` === dateKey;
      });

      let totalVolume = 0;
      let cardVolume = 0;
      let cashVolume = 0;
      let cardOrdersCount = 0;
      let cashOrdersCount = 0;
      const merchantSums: Record<string, { name: string; amount: number }> = {};

      for (const ord of dayOrders) {
        const val = ord.total_order_amount;
        totalVolume += val;

        if (ord.payment_method === 'CARD') {
          cardVolume += val;
          cardOrdersCount++;
        } else {
          cashVolume += val;
          cashOrdersCount++;
        }

        const mId = ord.merchant_id;
        const mName = ord.merchant_name || 'Ristoratore';
        if (!merchantSums[mId]) {
          merchantSums[mId] = { name: mName, amount: 0 };
        }
        merchantSums[mId].amount += val;
      }

      // Identify top merchant of the day
      let topMerchantName = 'Nessun ordine';
      let topMerchantAmount = 0;
      for (const item of Object.values(merchantSums)) {
        if (item.amount > topMerchantAmount) {
          topMerchantAmount = item.amount;
          topMerchantName = item.name;
        }
      }

      const commission = Number((totalVolume * 0.08).toFixed(2));
      const orderCount = dayOrders.length;
      const avgTicket = orderCount > 0 ? Number((totalVolume / orderCount).toFixed(2)) : 0;

      buckets.push({
        date: d,
        dateKey,
        displayDate,
        fullDateStr,
        isWeekend,
        isToday,
        totalVolume: Number(totalVolume.toFixed(2)),
        cardVolume: Number(cardVolume.toFixed(2)),
        cashVolume: Number(cashVolume.toFixed(2)),
        commission,
        orderCount,
        cardOrdersCount,
        cashOrdersCount,
        avgTicket,
        topMerchantName,
        topMerchantAmount: Number(topMerchantAmount.toFixed(2)),
        orders: dayOrders
      });
    }

    return buckets;
  }, [orders, timeRange, selectedMerchantId]);

  // Aggregate Period Summary Stats
  const periodStats: PeriodStats = useMemo<PeriodStats>(() => {
    let totalVol = 0;
    let cardVol = 0;
    let cashVol = 0;
    let totalOrders = 0;
    let maxDayVolume = 0;
    let peakDay: DayBucket | null = null;

    for (const d of dailyData) {
      totalVol += d.totalVolume;
      cardVol += d.cardVolume;
      cashVol += d.cashVolume;
      totalOrders += d.orderCount;
      if (d.totalVolume > maxDayVolume) {
        maxDayVolume = d.totalVolume;
        peakDay = d;
      }
    }

    const activeDaysCount = dailyData.filter(d => d.totalVolume > 0).length || 1;
    const dailyAvg = dailyData.length > 0 ? totalVol / dailyData.length : 0;
    const avgTicketOverall = totalOrders > 0 ? totalVol / totalOrders : 0;
    const cardPct = totalVol > 0 ? (cardVol / totalVol) * 100 : 0;
    const commissionsTotal = Number((totalVol * 0.08).toFixed(2));

    return {
      totalVol: Number(totalVol.toFixed(2)),
      cardVol: Number(cardVol.toFixed(2)),
      cashVol: Number(cashVol.toFixed(2)),
      totalOrders,
      dailyAvg: Number(dailyAvg.toFixed(2)),
      avgTicketOverall: Number(avgTicketOverall.toFixed(2)),
      cardPct: Number(cardPct.toFixed(1)),
      commissionsTotal,
      peakDay
    };
  }, [dailyData]);

  // D3 Chart Rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clean slate on render

    const containerWidth = containerRef.current.clientWidth || 800;
    const height = 340;
    const margin = { top: 32, right: 28, bottom: 44, left: 62 };
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    svg
      .attr('viewBox', `0 0 ${containerWidth} ${height}`)
      .attr('width', '100%')
      .attr('height', height)
      .style('overflow', 'visible');

    // Defs for gradients & shadow filters
    const defs = svg.append('defs');

    // Volume Gradient (FolloEat Sky Blue)
    const gradVolume = defs.append('linearGradient')
      .attr('id', 'grad-volume')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradVolume.append('stop').attr('offset', '0%').attr('stop-color', '#0284c7');
    gradVolume.append('stop').attr('offset', '100%').attr('stop-color', '#38bdf8');

    // Card Gradient (Stripe Indigo)
    const gradCard = defs.append('linearGradient')
      .attr('id', 'grad-card')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradCard.append('stop').attr('offset', '0%').attr('stop-color', '#4f46e5');
    gradCard.append('stop').attr('offset', '100%').attr('stop-color', '#818cf8');

    // Cash Gradient (Amber Orange)
    const gradCash = defs.append('linearGradient')
      .attr('id', 'grad-cash')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradCash.append('stop').attr('offset', '0%').attr('stop-color', '#d97706');
    gradCash.append('stop').attr('offset', '100%').attr('stop-color', '#fbbf24');

    // Commission Gradient (Emerald Green)
    const gradComm = defs.append('linearGradient')
      .attr('id', 'grad-comm')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradComm.append('stop').attr('offset', '0%').attr('stop-color', '#059669');
    gradComm.append('stop').attr('offset', '100%').attr('stop-color', '#34d399');

    // Main Chart Group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const xScale = d3.scaleBand()
      .domain(dailyData.map(d => d.dateKey))
      .range([0, innerWidth])
      .padding(timeRange === 7 ? 0.38 : timeRange === 14 ? 0.28 : 0.22);

    // Y Scale domain calculation
    let maxY = 100;
    if (metric === 'volume') {
      const maxVal = d3.max(dailyData, d => d.totalVolume) || 0;
      maxY = Math.max(maxVal * 1.18, 50);
    } else if (metric === 'orders') {
      const maxVal = d3.max(dailyData, d => d.orderCount) || 0;
      maxY = Math.max(maxVal + 2, 6);
    } else {
      const maxVal = d3.max(dailyData, d => d.commission) || 0;
      maxY = Math.max(maxVal * 1.18, 10);
    }

    const yScale = d3.scaleLinear()
      .domain([0, maxY])
      .nice()
      .range([innerHeight, 0]);

    // 1. Weekend background stripes to visualize weekly rhythm (Follonica peak on weekends)
    g.selectAll('.weekend-band')
      .data(dailyData.filter(d => d.isWeekend))
      .enter()
      .append('rect')
      .attr('class', 'weekend-band')
      .attr('x', d => (xScale(d.dateKey) || 0) - (xScale.step() * xScale.paddingInner()) / 2)
      .attr('y', 0)
      .attr('width', xScale.step())
      .attr('height', innerHeight)
      .attr('fill', '#f8fafc')
      .attr('rx', 4);

    // 2. Horizontal Gridlines
    const yTicks = yScale.ticks(5);
    g.selectAll('.grid-line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // 3. Average Reference Line (for volume or orders)
    let avgValue = 0;
    if (metric === 'volume') avgValue = periodStats.dailyAvg;
    else if (metric === 'orders') avgValue = periodStats.totalOrders / (dailyData.length || 1);
    else avgValue = periodStats.commissionsTotal / (dailyData.length || 1);

    if (avgValue > 0 && yScale(avgValue) > 0 && yScale(avgValue) < innerHeight) {
      const avgY = yScale(avgValue);
      const avgGroup = g.append('g').attr('class', 'avg-reference-line');

      avgGroup.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', avgY)
        .attr('y2', avgY)
        .attr('stroke', '#64748b')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4');

      avgGroup.append('text')
        .attr('x', innerWidth - 6)
        .attr('y', avgY - 5)
        .attr('text-anchor', 'end')
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .text(`Media: ${metric === 'orders' ? avgValue.toFixed(1) : `€${avgValue.toFixed(1)}`}`);
    }

    // 4. Render Bars
    if (breakdownMode === 'payment_method' && metric === 'volume') {
      // Stacked Bar Mode: Card (bottom) + Cash (top)
      const barWidth = xScale.bandwidth();

      const barGroup = g.selectAll('.bar-group')
        .data(dailyData)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('transform', d => `translate(${xScale(d.dateKey)},0)`)
        .style('cursor', 'pointer');

      // Card Segment (Bottom)
      barGroup.append('rect')
        .attr('class', 'bar-card')
        .attr('x', 0)
        .attr('width', barWidth)
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', 'url(#grad-card)')
        .attr('rx', 3)
        .transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr('y', d => yScale(d.cardVolume))
        .attr('height', d => Math.max(0, innerHeight - yScale(d.cardVolume)));

      // Cash Segment (Stacked Above Card)
      barGroup.append('rect')
        .attr('class', 'bar-cash')
        .attr('x', 0)
        .attr('width', barWidth)
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', 'url(#grad-cash)')
        .attr('rx', 3)
        .transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr('y', d => yScale(d.totalVolume))
        .attr('height', d => Math.max(0, yScale(d.cardVolume) - yScale(d.totalVolume)));

      // Top Value Label on Stacked Bar
      barGroup.append('text')
        .attr('x', barWidth / 2)
        .attr('y', d => yScale(d.totalVolume) - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#334155')
        .attr('font-size', timeRange === 30 ? '9px' : '10px')
        .attr('font-weight', '700')
        .style('opacity', 0)
        .text(d => (d.totalVolume > 0 ? `€${Math.round(d.totalVolume)}` : ''))
        .transition()
        .delay(400)
        .duration(300)
        .style('opacity', 1);

      // Interactive Events on Stacked Bar Group
      barGroup
        .on('mouseenter', (event, d) => {
          setHoveredDay(d);
          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x: mx, y: my });

          barGroup.transition().duration(150).style('opacity', item => (item.dateKey === d.dateKey ? 1 : 0.4));
        })
        .on('mousemove', (event) => {
          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x: mx, y: my });
        })
        .on('mouseleave', () => {
          setHoveredDay(null);
          setTooltipPos(null);
          barGroup.transition().duration(200).style('opacity', 1);
        })
        .on('click', (_, d) => {
          setSelectedDay(prev => (prev?.dateKey === d.dateKey ? null : d));
        });

    } else {
      // Single Unified Bar Mode
      let fillUrl = 'url(#grad-volume)';
      if (metric === 'commissions') fillUrl = 'url(#grad-comm)';
      else if (metric === 'orders') fillUrl = '#0284c7';

      const bars = g.selectAll('.single-bar')
        .data(dailyData)
        .enter()
        .append('rect')
        .attr('class', 'single-bar')
        .attr('x', d => xScale(d.dateKey) || 0)
        .attr('width', xScale.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', d => {
          if (selectedDay?.dateKey === d.dateKey) return '#0f172a';
          if (d.isToday) return '#2563eb';
          return fillUrl;
        })
        .attr('rx', 4)
        .attr('ry', 4)
        .style('cursor', 'pointer');

      // Animated Entrance
      bars.transition()
        .duration(600)
        .delay((_, idx) => idx * 18)
        .ease(d3.easeCubicOut)
        .attr('y', d => {
          const val = metric === 'volume' ? d.totalVolume : metric === 'orders' ? d.orderCount : d.commission;
          return yScale(val);
        })
        .attr('height', d => {
          const val = metric === 'volume' ? d.totalVolume : metric === 'orders' ? d.orderCount : d.commission;
          return Math.max(0, innerHeight - yScale(val));
        });

      // Bar Top Labels
      if (timeRange <= 14) {
        g.selectAll('.bar-label')
          .data(dailyData)
          .enter()
          .append('text')
          .attr('class', 'bar-label')
          .attr('x', d => (xScale(d.dateKey) || 0) + xScale.bandwidth() / 2)
          .attr('y', d => {
            const val = metric === 'volume' ? d.totalVolume : metric === 'orders' ? d.orderCount : d.commission;
            return yScale(val) - 6;
          })
          .attr('text-anchor', 'middle')
          .attr('fill', '#475569')
          .attr('font-size', '10px')
          .attr('font-weight', '700')
          .style('opacity', 0)
          .text(d => {
            if (metric === 'volume') return d.totalVolume > 0 ? `€${Math.round(d.totalVolume)}` : '';
            if (metric === 'orders') return d.orderCount > 0 ? `${d.orderCount}` : '';
            return d.commission > 0 ? `€${d.commission.toFixed(1)}` : '';
          })
          .transition()
          .delay(400)
          .duration(300)
          .style('opacity', 1);
      }

      // Interactive Events on Unified Bars
      bars
        .on('mouseenter', (event, d) => {
          setHoveredDay(d);
          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x: mx, y: my });

          bars.transition().duration(150).style('opacity', item => (item.dateKey === d.dateKey ? 1 : 0.35));
        })
        .on('mousemove', (event) => {
          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x: mx, y: my });
        })
        .on('mouseleave', () => {
          setHoveredDay(null);
          setTooltipPos(null);
          bars.transition().duration(200).style('opacity', 1);
        })
        .on('click', (_, d) => {
          setSelectedDay(prev => (prev?.dateKey === d.dateKey ? null : d));
        });
    }

    // 5. X Axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(dateKey => {
        const item = dailyData.find(d => d.dateKey === dateKey);
        return item ? item.displayDate : dateKey;
      });

    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', '#cbd5e1');
    xAxisGroup.selectAll('.tick line').attr('stroke', '#cbd5e1');
    xAxisGroup.selectAll('.tick text')
      .attr('fill', '#64748b')
      .attr('font-size', timeRange === 30 ? '9px' : '10px')
      .attr('font-weight', d => {
        const item = dailyData.find(i => i.dateKey === d);
        return item?.isToday ? '900' : item?.isWeekend ? '700' : '500';
      })
      .attr('dy', '10px');

    // 6. Y Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => {
        if (metric === 'orders') return `${d}`;
        return `€${d}`;
      });

    const yAxisGroup = g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    yAxisGroup.select('.domain').remove(); // Clean modern chart look (no vertical left axis line)
    yAxisGroup.selectAll('.tick line').remove();
    yAxisGroup.selectAll('.tick text')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('dx', '-4px');

  }, [dailyData, metric, breakdownMode, timeRange, periodStats, selectedDay]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
      {/* Header with Title & Interactive Segmented Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-follo-blue/10 text-follo-blue flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Volume Transazioni Giornaliere Esercenti (D3.js)
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Monitoraggio Incassi Follonica</span>
                <span aria-hidden="true">·</span>
                <span>Alimentato da d3.js</span>
                <span aria-hidden="true">·</span>
                <span>Fuso Orario Europe/Rome</span>
              </div>
            </div>
          </div>
        </div>

        {/* Control Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Merchant Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedMerchantId}
              onChange={(e) => {
                setSelectedMerchantId(e.target.value);
                setSelectedDay(null);
              }}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 px-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-follo-blue cursor-pointer transition-colors"
            >
              <option value="ALL">Tutti i Ristoranti (Consolidato)</option>
              {merchants.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setMetric('volume')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                metric === 'volume'
                  ? 'bg-white text-follo-blue shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Volume (€)
            </button>
            <button
              onClick={() => setMetric('orders')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                metric === 'orders'
                  ? 'bg-white text-follo-blue shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              N° Ordini
            </button>
            <button
              onClick={() => setMetric('commissions')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                metric === 'commissions'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Comm. 8%
            </button>
          </div>

          {/* Breakdown Mode (Only applicable on volume metric) */}
          {metric === 'volume' && (
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setBreakdownMode('total')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  breakdownMode === 'total'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Barra totale unica"
              >
                Totale
              </button>
              <button
                onClick={() => setBreakdownMode('payment_method')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  breakdownMode === 'payment_method'
                    ? 'bg-white text-follo-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Spaccato tra Stripe Carta e Contanti COD"
              >
                <Layers className="w-3 h-3 text-indigo-500" />
                <span>Carta/Contanti</span>
              </button>
            </div>
          )}

          {/* Time Range Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setTimeRange(7);
                setSelectedDay(null);
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                timeRange === 7
                  ? 'bg-follo-blue text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7G
            </button>
            <button
              onClick={() => {
                setTimeRange(14);
                setSelectedDay(null);
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                timeRange === 14
                  ? 'bg-follo-blue text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14G
            </button>
            <button
              onClick={() => {
                setTimeRange(30);
                setSelectedDay(null);
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                timeRange === 30
                  ? 'bg-follo-blue text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30G
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Summary Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Volume Totale ({timeRange} gg)
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            €{periodStats.totalVol.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {periodStats.totalOrders} ordini totali
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Media Giornaliera
          </span>
          <div className="text-xl font-black text-follo-blue mt-1">
            €{periodStats.dailyAvg.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Scontrino medio €{periodStats.avgTicketOverall.toFixed(2)}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Incasso Stripe Carta
          </span>
          <div className="text-xl font-black text-indigo-600 mt-1">
            €{periodStats.cardVol.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            {periodStats.cardPct}% quota digitale
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Contanti alla Consegna
          </span>
          <div className="text-xl font-black text-amber-600 mt-1">
            €{periodStats.cashVol.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {(100 - periodStats.cardPct).toFixed(1)}% saldo COD
          </span>
        </div>

        <div className="col-span-2 md:col-span-1 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Picco Massimo Giornaliero
          </span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            €{periodStats.peakDay ? periodStats.peakDay.totalVolume.toFixed(2) : '0.00'}
          </div>
          <span className="text-[11px] text-slate-500 block truncate">
            {periodStats.peakDay ? `${periodStats.peakDay.displayDate} (${periodStats.peakDay.orderCount} ordini)` : 'Nessun picco'}
          </span>
        </div>
      </div>

      {/* D3 Chart Canvas Area */}
      <div className="relative" ref={containerRef}>
        {/* Floating D3 Tooltip */}
        {hoveredDay && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 w-64 animate-in fade-in"
            style={{
              left: Math.min(Math.max(10, tooltipPos.x - 120), (containerRef.current?.clientWidth || 800) - 270),
              top: Math.max(10, tooltipPos.y - 140)
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-black text-slate-200">{hoveredDay.fullDateStr}</span>
              {hoveredDay.isToday && (
                <span className="text-[9px] font-bold bg-follo-blue text-white px-1.5 py-0.5 rounded">
                  Oggi
                </span>
              )}
            </div>

            <div className="space-y-1 pt-0.5">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-400">Volume Totale:</span>
                <span className="text-sky-300 text-sm">€{hoveredDay.totalVolume.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-indigo-400" />
                  <span>Carta Stripe:</span>
                </span>
                <span className="text-slate-200 font-semibold">
                  €{hoveredDay.cardVolume.toFixed(2)} ({hoveredDay.cardOrdersCount})
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Banknote className="w-3 h-3 text-amber-400" />
                  <span>Contanti COD:</span>
                </span>
                <span className="text-slate-200 font-semibold">
                  €{hoveredDay.cashVolume.toFixed(2)} ({hoveredDay.cashOrdersCount})
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Ordini / Scontrino Medio:</span>
                <span className="text-slate-200 font-semibold">
                  {hoveredDay.orderCount} ordini · €{hoveredDay.avgTicket.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-emerald-400 font-bold">
                <span>Commissione FolloEat (8%):</span>
                <span>€{hoveredDay.commission.toFixed(2)}</span>
              </div>
              {hoveredDay.topMerchantAmount > 0 && (
                <div className="text-[10px] text-slate-400 pt-0.5 truncate">
                  🏆 Top: <strong className="text-slate-200">{hoveredDay.topMerchantName}</strong> (€{hoveredDay.topMerchantAmount.toFixed(2)})
                </div>
              )}
            </div>
            <div className="text-[9px] text-slate-500 text-center pt-1">
              Clicca sulla barra per ispezionare gli ordini del giorno
            </div>
          </div>
        )}

        {/* SVG Chart Element */}
        <svg ref={svgRef} className="w-full select-none" />

        {/* Chart Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-4">
            {breakdownMode === 'payment_method' && metric === 'volume' ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-600 inline-block"></span>
                  <span className="font-semibold text-slate-700">Carta Stripe</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span>
                  <span className="font-semibold text-slate-700">Contanti alla Consegna</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-sky-600 inline-block"></span>
                <span className="font-semibold text-slate-700">
                  {metric === 'volume' ? 'Volume Totale Transato (€)' : metric === 'orders' ? 'Numero Ordini Evasi' : 'Commissione Piattaforma (8%)'}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200 inline-block"></span>
              <span className="text-slate-500 font-medium">Fine Settimana (Sab/Dom)</span>
            </div>
          </div>

          <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Passa il mouse sulle barre per i dettagli · Clicca per aprire il registro ordini</span>
          </div>
        </div>
      </div>

      {/* Day Inspector Card (Shown when a bar is clicked) */}
      {selectedDay && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl animate-in fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-follo-blue text-white flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-follo-blue tracking-wider block">
                  Dettaglio Transazioni Giornaliere Selezionate
                </span>
                <h3 className="text-base font-black text-white">
                  {selectedDay.fullDateStr}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Totale Giorno</span>
                <span className="text-lg font-black text-emerald-400">
                  €{selectedDay.totalVolume.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Chiudi ispezione giorno"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {selectedDay.orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider rounded-xl">
                  <tr>
                    <th className="p-2.5 rounded-l-lg">ID Ordine</th>
                    <th className="p-2.5">Ristoratore</th>
                    <th className="p-2.5">Cliente & Destinazione</th>
                    <th className="p-2.5">Metodo</th>
                    <th className="p-2.5">Importo Cibo</th>
                    <th className="p-2.5">Comm. 8%</th>
                    <th className="p-2.5 text-right rounded-r-lg font-black">Totale Ordine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedDay.orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-2.5 font-mono font-bold text-white">{o.id}</td>
                      <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-follo-blue" />
                        <span>{o.merchant_name}</span>
                      </td>
                      <td className="p-2.5">
                        <span className="font-semibold text-slate-200">{o.customer_name}</span>
                        <span className="block text-[10px] text-slate-400">{o.delivery_address || 'Follonica'}</span>
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.payment_method === 'CARD'
                            ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
                            : 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                        }`}>
                          {o.payment_method === 'CARD' ? 'Carta Stripe' : 'Contanti COD'}
                        </span>
                      </td>
                      <td className="p-2.5 font-semibold text-slate-200">€{o.total_food_amount.toFixed(2)}</td>
                      <td className="p-2.5 font-bold text-emerald-400">
                        €{(o.total_food_amount * 0.08).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right font-black text-white">
                        €{o.total_order_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">
              Nessuna transazione registrata per la data o il ristoratore selezionato.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
