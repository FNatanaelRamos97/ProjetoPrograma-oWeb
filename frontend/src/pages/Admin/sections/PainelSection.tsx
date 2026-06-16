import { useMemo } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import type { AdminDashboard, SalesLog, SalesStats, Service } from '../../../types'
import styles from './Sections.module.css'

interface Props {
  dashboard: AdminDashboard | null
  salesLogs: SalesLog[]
  services: Service[]
  salesStats: SalesStats | null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Agora'
  if (mins < 60) return `Há ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Há ${hrs} hora${hrs > 1 ? 's' : ''}`
  const days = Math.floor(hrs / 24)
  return `Há ${days} dia${days > 1 ? 's' : ''}`
}

export default function PainelSection({ dashboard, salesLogs, services, salesStats }: Props) {
  const salesData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const monthly: Record<string, number> = {}
    months.forEach(m => { monthly[m] = 0 })
    salesLogs.forEach(log => {
      const d = new Date(log.createdAt)
      monthly[months[d.getMonth()]] += log.amount
    })
    return months.map(month => ({ month, value: Math.round(monthly[month]) }))
  }, [salesLogs])

  const agendaData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const daily: Record<string, number> = {}
    days.forEach(d => { daily[d] = 0 })
    salesLogs.forEach(log => {
      daily[days[new Date(log.createdAt).getDay()]]++
    })
    return days.map(day => ({ day, value: daily[day] }))
  }, [salesLogs])

  const orderDistribution = useMemo(() => {
    const completed = salesLogs.filter(l => l.status === 'confirmado').length
    const pending = salesLogs.filter(l => l.status === 'pendente').length
    const cancelled = salesLogs.filter(l => l.status === 'cancelado').length
    return [
      { name: 'Concluídos', value: completed || 1, color: '#10b981' },
      { name: 'Pendentes', value: pending || 1, color: '#f59e0b' },
      { name: 'Cancelados', value: cancelled || 0, color: '#ef4444' },
    ]
  }, [salesLogs])

  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {}
    services.forEach(s => { catMap[s.category] = (catMap[s.category] || 0) + 1 })
    const total = services.length || 1
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']
    return Object.entries(catMap).map(([name, count], i) => ({
      name, value: Math.round((count / total) * 100), color: colors[i % colors.length]
    }))
  }, [services])

  const recentActivity = useMemo(() => {
    return salesLogs.slice(0, 6).map(log => ({
      icon: log.status === 'confirmado' ? '✅' : log.status === 'cancelado' ? '❌' : '📦',
      text: log.serviceName
        ? `${log.status === 'confirmado' ? 'Venda concluída' : 'Nova venda'}: ${log.serviceName}`
        : log.status === 'confirmado' ? 'Venda concluída' : 'Nova venda',
      time: timeAgo(log.createdAt),
      value: `R$ ${log.amount.toFixed(2)}`
    }))
  }, [salesLogs])

  const dynamicMetrics = useMemo(() => {
    const monthlyVals = salesData.map(d => d.value)
    const maxVal = Math.max(...monthlyVals, 1)
    const prevMonths = monthlyVals.slice(0, 6).reduce((a, b) => a + b, 0)
    const recentMonths = monthlyVals.slice(6).reduce((a, b) => a + b, 0)
    const revenueGrowth = prevMonths > 0 ? `+${Math.round(((recentMonths - prevMonths) / prevMonths) * 100)}%` : ''

    return [
      { title: 'Receita Total', value: `R$ ${(salesStats?.totalRevenue ?? 0).toFixed(2)}`, growth: revenueGrowth, period: 'acumulada', color: '#10b981', sparkData: monthlyVals, maxVal },
      { title: 'Usuários', value: String(dashboard?.totalUsers ?? 0), growth: '', period: 'cadastrados', color: '#3b82f6', sparkData: monthlyVals, maxVal },
      { title: 'Vendas', value: String(salesStats?.totalSales ?? 0), growth: '', period: 'total', color: '#8b5cf6', sparkData: monthlyVals, maxVal },
      { title: 'Agendamentos', value: String(dashboard?.totalAppointments ?? 0), growth: '', period: 'registrados', color: '#f59e0b', sparkData: monthlyVals, maxVal },
    ]
  }, [salesData, salesStats, dashboard])

  const tooltipStyle = { background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '13px' }

  return (
    <>
      <div className={styles.metricsGrid}>
        {dynamicMetrics.map((m, idx) => (
          <div key={idx} className={styles.metricCard}>
            <div className={styles.metricTop}>
              <div className={styles.metricInfo}>
                <span className={styles.metricTitle}>{m.title}</span>
                <span className={styles.metricValue}>{m.value}</span>
                <div className={styles.metricGrowth}>
                  <span className={styles.growthValue}>{m.growth}</span>
                  <span className={styles.growthPeriod}>{m.period}</span>
                </div>
              </div>
              <div className={styles.metricIcon} style={{ background: `${m.color}15`, color: m.color }}>
                {idx === 0 ? '💰' : idx === 1 ? '👥' : idx === 2 ? '📊' : '📅'}
              </div>
            </div>
            <div className={styles.sparkline}>
              <svg width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`sparkGrad${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={m.color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={m.color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={m.sparkData.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (m.sparkData.length - 1)) * 100},${32 - (v / m.maxVal) * 28}`).join(' ')} fill="none" stroke={m.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d={`${m.sparkData.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (m.sparkData.length - 1)) * 100},${32 - (v / m.maxVal) * 28}`).join(' ')} L100,32 L0,32 Z`} fill={`url(#sparkGrad${idx})`} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartCardHeader}>
            <h3 className={styles.chartTitle}>Evolução das Vendas</h3>
            <span className={styles.chartPeriod}>{new Date().getFullYear()}</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesData}>
              <defs><linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(59,130,246,0.3)' }} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth="2.5" fill="url(#salesGrad)" dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartCardHeader}>
            <h3 className={styles.chartTitle}>Agendamentos por Dia</h3>
            <span className={styles.chartPeriod}>Esta semana</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={agendaData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(59,130,246,0.08)' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.bottomCard}>
          <h3 className={styles.bottomCardTitle}>Distribuição de Pedidos</h3>
          <div className={styles.donutWrapper}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={orderDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {orderDistribution.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutLegend}>
              {orderDistribution.map((item, idx) => (
                <div key={idx} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: item.color }} />
                  <span className={styles.legendLabel}>{item.name}</span>
                  <span className={styles.legendValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.bottomCard}>
          <h3 className={styles.bottomCardTitle}>Vendas por Categoria</h3>
          <div className={styles.categoryList}>
            {categoryData.map((cat, idx) => (
              <div key={idx} className={styles.categoryItem}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryName}>{cat.name}</span>
                  <span className={styles.categoryValue}>{cat.value}%</span>
                </div>
                <div className={styles.categoryBarTrack}>
                  <div className={styles.categoryBarFill} style={{ width: `${cat.value}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.bottomCard}>
          <h3 className={styles.bottomCardTitle}>Atividade Recente</h3>
          <div className={styles.activityList}>
            {recentActivity.map((act, idx) => (
              <div key={idx} className={styles.activityItem}>
                <span className={styles.activityIcon}>{act.icon}</span>
                <div className={styles.activityContent}>
                  <span className={styles.activityText}>{act.text}</span>
                  <span className={styles.activityTime}>{act.time}</span>
                </div>
                {act.value && <span className={styles.activityValue}>{act.value}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
