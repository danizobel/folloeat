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
  Store,
  CheckCircle2,
  Trophy,
  PlusCircle,
  Percent,
  Receipt
} from 'lucide-react';

interface AdminDailyTransactionsChartProps {
  orders: Order[];
  merchants: Merchant[];
  isLoading?: boolean;
  onSimulateOrder?: (newOrder: Order) => void;
}

export type TimeRange = 7 | 14 | 30;
export type ChartMetric = 'volume' | 'orders' | 'commissions';
export type BreakdownMode = 'total' | 'payment_method';

export interface DayBucket {
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

export interface PeriodStats {
  totalVol: number;
  cardVol: number;
  cashVol: number;
  totalOrders: number;
  dailyAvg: number;
  avgTicketOverall: number;
  cardPct: number;
  commissionsTotal: number;
  growthPct: number;
  peakDay: DayBucket | null;
}

interface TopMerchantRank {
  id: string;
  name: string;
  volume: number;
  ordersCount: number;
  percentOfTotal: number;
}

export default function AdminDailyTransactionsChart({
  orders,
  merchants,
  isLoading = false,
  onSimulateOrder
}: AdminDailyTransactionsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Filter & Mode state
  const [timeRange, setTimeRange] = useState<TimeRange>(14);
  const [metric, setMetric] = useState<ChartMetric>('volume');
  const [breakdownMode, setBreakdownMode] = useState<BreakdownMode>('total');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('ALL');

  // Window resize responsive redraw trigger
  const [viewportWidth, setViewportWidth] = useState<number>(800);

  // Interactive selected bar state
  const [hoveredDay, setHoveredDay] = useState<DayBucket | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayBucket | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Quick order simulator modal
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simMerchantId, setSimMerchantId] = useState<string>(merchants[0]?.id || 'm_michele_01');
  const [simAmount, setSimAmount] = useState<string>('32.50');
  const [simPaymentMethod, setSimPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');

  // Observe container size
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.clientWidth);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute daily aggregated data based on timeRange and selectedMerchantId
  const dailyData: DayBucket[] = useMemo(() => {
    const buckets: DayBucket[] = [];
    const now = new Date();
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

    const dailyAvg = dailyData.length > 0 ? totalVol / dailyData.length : 0;
    const avgTicketOverall = totalOrders > 0 ? totalVol / totalOrders : 0;
    const cardPct = totalVol > 0 ? (cardVol / totalVol) * 100 : 0;
    const commissionsTotal = Number((totalVol * 0.08).toFixed(2));

    // Comparative Growth: Compare first half of range with second half
    const half = Math.floor(dailyData.length / 2);
    const firstHalfVol = dailyData.slice(0, half).reduce((sum, d) => sum + d.totalVolume, 0);
    const secondHalfVol = dailyData.slice(half).reduce((sum, d) => sum + d.totalVolume, 0);
    let growthPct = 0;
    if (firstHalfVol > 0) {
      growthPct = Number((((secondHalfVol - firstHalfVol) / firstHalfVol) * 100).toFixed(1));
    }

    return {
      totalVol: Number(totalVol.toFixed(2)),
      cardVol: Number(cardVol.toFixed(2)),
      cashVol: Number(cashVol.toFixed(2)),
      totalOrders,
      dailyAvg: Number(dailyAvg.toFixed(2)),
      avgTicketOverall: Number(avgTicketOverall.toFixed(2)),
      cardPct: Number(cardPct.toFixed(1)),
      commissionsTotal,
      growthPct,
      peakDay
    };
  }, [dailyData]);

  // Top 3 Merchants Leaderboard in the active period
  const topMerchants: TopMerchantRank[] = useMemo(() => {
    const merchantMap: Record<string, { id: string; name: string; volume: number; ordersCount: number }> = {};

    dailyData.forEach(d => {
      d.orders.forEach(o => {
        const mId = o.merchant_id;
        const mName = o.merchant_name || 'Ristorante';
        if (!merchantMap[mId]) {
          merchantMap[mId] = { id: mId, name: mName, volume: 0, ordersCount: 0 };
        }
        merchantMap[mId].volume += o.total_order_amount;
        merchantMap[mId].ordersCount++;
      });
    });

    const totalPeriodVol = periodStats.totalVol || 1;
    return Object.values(merchantMap)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3)
      .map(m => ({
        ...m,
        volume: Number(m.volume.toFixed(2)),
        percentOfTotal: Number(((m.volume / totalPeriodVol) * 100).toFixed(1))
      }));
  }, [dailyData, periodStats.totalVol]);

  // D3 Chart Rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 800;
    const height = 350;
    const margin = { top: 38, right: 30, bottom: 46, left: 65 };
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    svg
      .attr('viewBox', `0 0 ${containerWidth} ${height}`)
      .attr('width', '100%')
      .attr('height', height)
      .style('overflow', 'visible');

    // Defs for gradients & drop shadow filters
    const defs = svg.append('defs');

    // Drop shadow filter for active bars
    const shadowFilter = defs.append('filter')
      .attr('id', 'd3-bar-shadow')
      .attr('x', '-10%').attr('y', '-10%')
      .attr('width', '120%').attr('height', '130%');
    shadowFilter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '3')
      .attr('stdDeviation', '3')
      .attr('flood-color', '#0284c7')
      .attr('flood-opacity', '0.25');

    // Linear Gradients
    const gradVolume = defs.append('linearGradient')
      .attr('id', 'grad-volume')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradVolume.append('stop').attr('offset', '0%').attr('stop-color', '#0284c7');
    gradVolume.append('stop').attr('offset', '100%').attr('stop-color', '#38bdf8');

    const gradCard = defs.append('linearGradient')
      .attr('id', 'grad-card')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradCard.append('stop').attr('offset', '0%').attr('stop-color', '#4f46e5');
    gradCard.append('stop').attr('offset', '100%').attr('stop-color', '#818cf8');

    const gradCash = defs.append('linearGradient')
      .attr('id', 'grad-cash')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradCash.append('stop').attr('offset', '0%').attr('stop-color', '#d97706');
    gradCash.append('stop').attr('offset', '100%').attr('stop-color', '#fbbf24');

    const gradComm = defs.append('linearGradient')
      .attr('id', 'grad-comm')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradComm.append('stop').attr('offset', '0%').attr('stop-color', '#059669');
    gradComm.append('stop').attr('offset', '100%').attr('stop-color', '#34d399');

    // Main Chart Canvas Group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale Band
    const xScale = d3.scaleBand()
      .domain(dailyData.map(d => d.dateKey))
      .range([0, innerWidth])
      .padding(timeRange === 7 ? 0.38 : timeRange === 14 ? 0.28 : 0.22);

    // Y Scale domain calculation
    let maxY = 100;
    if (metric === 'volume') {
      const maxVal = d3.max(dailyData, d => d.totalVolume) || 0;
      maxY = Math.max(maxVal * 1.20, 50);
    } else if (metric === 'orders') {
      const maxVal = d3.max(dailyData, d => d.orderCount) || 0;
      maxY = Math.max(maxVal + 2, 6);
    } else {
      const maxVal = d3.max(dailyData, d => d.commission) || 0;
      maxY = Math.max(maxVal * 1.20, 10);
    }

    const yScale = d3.scaleLinear()
      .domain([0, maxY])
      .nice()
      .range([innerHeight, 0]);

    // 1. Weekend background stripes
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

    // 3. Average Benchmark Reference Line
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

      // Tag badge at the end of the average line
      avgGroup.append('rect')
        .attr('x', innerWidth - 85)
        .attr('y', avgY - 18)
        .attr('width', 82)
        .attr('height', 16)
        .attr('rx', 4)
        .attr('fill', '#f1f5f9')
        .attr('stroke', '#cbd5e1');

      avgGroup.append('text')
        .attr('x', innerWidth - 44)
        .attr('y', avgY - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#475569')
        .attr('font-size', '9px')
        .attr('font-weight', '700')
        .text(`Media: ${metric === 'orders' ? avgValue.toFixed(1) : `€${avgValue.toFixed(0)}`}`);
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

      // Selection Ring for Active Day
      barGroup.filter(d => selectedDay?.dateKey === d.dateKey)
        .append('rect')
        .attr('x', -3)
        .attr('y', d => yScale(d.totalVolume) - 3)
        .attr('width', barWidth + 6)
        .attr('height', d => Math.max(0, innerHeight - yScale(d.totalVolume) + 3))
        .attr('fill', 'none')
        .attr('stroke', '#0284c7')
        .attr('stroke-width', 2)
        .attr('rx', 5);

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

          barGroup.transition().duration(150).style('opacity', item => (item.dateKey === d.dateKey ? 1 : 0.35));
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

      const barGroup = g.selectAll('.single-bar-group')
        .data(dailyData)
        .enter()
        .append('g')
        .attr('class', 'single-bar-group')
        .style('cursor', 'pointer');

      // The Bar
      const bars = barGroup.append('rect')
        .attr('class', 'single-bar')
        .attr('x', d => xScale(d.dateKey) || 0)
        .attr('width', xScale.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', d => {
          if (selectedDay?.dateKey === d.dateKey) return '#0f172a';
          if (d.isToday) return '#0284c7';
          return fillUrl;
        })
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('filter', 'url(#d3-bar-shadow)');

      // Selection Ring for Active Day
      barGroup.filter(d => selectedDay?.dateKey === d.dateKey)
        .append('rect')
        .attr('x', d => (xScale(d.dateKey) || 0) - 3)
        .attr('y', d => {
          const val = metric === 'volume' ? d.totalVolume : metric === 'orders' ? d.orderCount : d.commission;
          return yScale(val) - 3;
        })
        .attr('width', xScale.bandwidth() + 6)
        .attr('height', d => {
          const val = metric === 'volume' ? d.totalVolume : metric === 'orders' ? d.orderCount : d.commission;
          return Math.max(0, innerHeight - yScale(val) + 3);
        })
        .attr('fill', 'none')
        .attr('stroke', '#0284c7')
        .attr('stroke-width', 2)
        .attr('rx', 5);

      // Entrance animation
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
        barGroup.append('text')
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
      barGroup
        .on('mouseenter', (event, d) => {
          setHoveredDay(d);
          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x: mx, y: my });

          barGroup.transition().duration(150).style('opacity', item => (item.dateKey === d.dateKey ? 1 : 0.35));
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

    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('.tick line').remove();
    yAxisGroup.selectAll('.tick text')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('dx', '-4px');

  }, [dailyData, metric, breakdownMode, timeRange, periodStats, selectedDay, viewportWidth]);

  // Handler for simulating order injection
  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMerchant = merchants.find(m => m.id === simMerchantId) || merchants[0];
    const amountNum = parseFloat(simAmount) || 28.50;

    const fakeOrder: Order = {
      id: `ORD-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      merchant_id: targetMerchant.id,
      merchant_name: targetMerchant.name,
      customer_name: 'Cliente Test Follonica',
      customer_phone: '+39 347 5802200',
      delivery_pin: '5802',
      delivery_address: 'Via Roma 10, 58022 Follonica (GR)',
      zone: 'Centro',
      total_food_amount: Number((amountNum - 0.15).toFixed(2)),
      platform_fee: 0.15,
      total_order_amount: amountNum,
      payment_method: simPaymentMethod,
      stripe_payment_intent_id: simPaymentMethod === 'CARD' ? `pi_test_${Date.now()}` : undefined,
      capture_status: 'CAPTURED',
      status: 'COMPLETED',
      cutlery_requested: 0,
      items_json: JSON.stringify([
        { name: 'Ordine Test SuperAdmin', price: amountNum - 0.15, quantity: 1 }
      ]),
      follo_points_earned: Math.floor(amountNum),
      created_at: new Date().toISOString()
    };

    if (onSimulateOrder) {
      onSimulateOrder(fakeOrder);
    }
    setIsSimulatorOpen(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
      {/* Header with Title & Interactive Segmented Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-follo-blue flex items-center justify-center border border-sky-100 shadow-2xs">
              <BarChart3 className="w-5 h-5 text-follo-blue" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Volume Transazioni Giornaliere Esercenti (D3.js)
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                  Live Analytics
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Monitoraggio Incassi Ristoratori Follonica</span>
                <span aria-hidden="true">·</span>
                <span>Libreria d3.js</span>
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
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 px-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-follo-blue cursor-pointer transition-colors max-w-[200px] truncate"
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

          {/* Simulate New Order Button */}
          {onSimulateOrder && (
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Simula un nuovo ordine test per osservare l'aggiornamento animato di D3"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Simula Ordine</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate KPI Summary Ribbon with Growth & Ticket */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 bg-gradient-to-br from-slate-50 to-sky-50/40 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Volume Totale ({timeRange} gg)
            </span>
            {periodStats.growthPct !== 0 && (
              <span className={`text-[10px] font-black flex items-center gap-0.5 ${
                periodStats.growthPct > 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                <TrendingUp className="w-3 h-3" />
                <span>{periodStats.growthPct > 0 ? `+${periodStats.growthPct}%` : `${periodStats.growthPct}%`}</span>
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            €{periodStats.totalVol.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
            {periodStats.totalOrders} ordini completati
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Media Giornaliera
          </span>
          <div className="text-2xl font-black text-follo-blue mt-1">
            €{periodStats.dailyAvg.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
            Scontrino medio €{periodStats.avgTicketOverall.toFixed(2)}
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Incasso Stripe Carta
            </span>
            <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            €{periodStats.cardVol.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
            {periodStats.cardPct}% quota digitale
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Contanti alla Consegna
            </span>
            <Banknote className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            €{periodStats.cashVol.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
            {(100 - periodStats.cardPct).toFixed(1)}% saldo COD
          </span>
        </div>

        <div className="col-span-2 md:col-span-1 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Picco Massimo
            </span>
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            €{periodStats.peakDay ? periodStats.peakDay.totalVolume.toFixed(2) : '0.00'}
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5 truncate">
            {periodStats.peakDay ? `${periodStats.peakDay.displayDate} (${periodStats.peakDay.orderCount} ordini)` : 'Nessun picco'}
          </span>
        </div>
      </div>

      {/* D3 Chart Canvas Area */}
      <div className="relative" ref={containerRef}>
        {/* Floating D3 Tooltip */}
        {hoveredDay && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1.5 w-68 animate-in fade-in"
            style={{
              left: Math.min(Math.max(10, tooltipPos.x - 120), (containerRef.current?.clientWidth || 800) - 290),
              top: Math.max(10, tooltipPos.y - 150)
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
                <span className="text-slate-400">Ordini / Scontrino:</span>
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
            <div className="text-[9px] text-slate-400 text-center pt-1 border-t border-slate-800/80">
              💡 Clicca sulla barra per aprire la lista ordini dettagliata
            </div>
          </div>
        )}

        {/* SVG Chart Element */}
        <svg ref={svgRef} className="w-full select-none" />

        {/* Chart Legend & Interactive Hints */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-4">
            {breakdownMode === 'payment_method' && metric === 'volume' ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-600 inline-block shadow-2xs"></span>
                  <span className="font-semibold text-slate-700">Carta Stripe (Online)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block shadow-2xs"></span>
                  <span className="font-semibold text-slate-700">Contanti alla Consegna (COD)</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-sky-600 inline-block shadow-2xs"></span>
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

          <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Passa il mouse sulle barre per i dati analitici · Clicca per visualizzare gli scontrini</span>
          </div>
        </div>
      </div>

      {/* Top 3 Ristoranti Leaderboard del Periodo */}
      {selectedMerchantId === 'ALL' && topMerchants.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Top 3 Esercenti per Volume Transato ({timeRange} Giorni)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Quota sul transato consolidato
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topMerchants.map((tm, idx) => (
              <div
                key={tm.id}
                onClick={() => setSelectedMerchantId(tm.id)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                    idx === 0
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-800'
                      : 'bg-amber-700/20 text-amber-800'
                  }`}>
                    {idx === 0 ? '1°' : idx === 1 ? '2°' : '3°'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-follo-blue transition-colors">
                      {tm.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 block">
                      {tm.ordersCount} ordini evasi
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-slate-900 block">
                    €{tm.volume.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-follo-blue">
                    {tm.percentOfTotal}% quota
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Volume Totale Giorno</span>
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

      {/* Simulator Modal for Admin Quick Testing */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-follo-blue" />
                <h3 className="font-black text-slate-900 text-base">Simula Nuova Transazione</h3>
              </div>
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Genera istantaneamente una transazione di test a nome di un ristoratore per testare la risposta animata del grafico D3.js in tempo reale.
            </p>

            <form onSubmit={handleSimulateSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ristoratore Follonica</label>
                <select
                  value={simMerchantId}
                  onChange={e => setSimMerchantId(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-follo-blue"
                >
                  {merchants.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Importo Ordine (€)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="5"
                    max="300"
                    value={simAmount}
                    onChange={e => setSimAmount(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-follo-blue"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Metodo Pagamento</label>
                  <select
                    value={simPaymentMethod}
                    onChange={e => setSimPaymentMethod(e.target.value as 'CARD' | 'CASH')}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-follo-blue"
                  >
                    <option value="CARD">Carta Stripe (Online)</option>
                    <option value="CASH">Contanti alla Consegna (COD)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSimulatorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-follo-blue hover:bg-follo-blue-dark text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Registra Transazione Live</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
