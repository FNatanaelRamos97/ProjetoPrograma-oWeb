import NavBar from "../../components/NavBar/NavBar";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import styles from "./Admin.module.css";
import { useEffect, useState } from "react";
import {
  getAdminDashboard,
  listAdminServices,
  listProviderRequests,
  listUsers,
} from "../../../../database/database.ts";
import { useAuth } from "../../contexts/AuthContext";
import type {
  AdminDashboard,
  ProviderRequest,
  Service,
  User,
} from "../../types/index.ts";

const salesData = [
  { month: "Jan", value: 4200 },
  { month: "Fev", value: 5800 },
  { month: "Mar", value: 7200 },
  { month: "Abr", value: 6100 },
  { month: "Mai", value: 8900 },
  { month: "Jun", value: 10300 },
  { month: "Jul", value: 9500 },
  { month: "Ago", value: 12100 },
  { month: "Set", value: 13800 },
  { month: "Out", value: 15200 },
  { month: "Nov", value: 17400 },
  { month: "Dez", value: 20100 },
];

const agendaData = [
  { day: "Seg", value: 12 },
  { day: "Ter", value: 18 },
  { day: "Qua", value: 15 },
  { day: "Qui", value: 22 },
  { day: "Sex", value: 28 },
  { day: "Sáb", value: 20 },
  { day: "Dom", value: 8 },
];

const orderDistribution = [
  { name: "Concluídos", value: 184, color: "#10b981" },
  { name: "Em Andamento", value: 67, color: "#3b82f6" },
  { name: "Pendentes", value: 34, color: "#f59e0b" },
  { name: "Cancelados", value: 18, color: "#ef4444" },
];

const categoryData = [
  { name: "Serviços Residenciais", value: 42, color: "#3b82f6" },
  { name: "Serviços Técnicos", value: 28, color: "#8b5cf6" },
  { name: "Design & Criação", value: 18, color: "#f59e0b" },
  { name: "Outros Serviços", value: 12, color: "#10b981" },
];

const recentActivity = [
  {
    icon: "💰",
    text: "Nova venda realizada",
    time: "Há 5 min",
    value: "R$ 240,00",
  },
  { icon: "📅", text: "Novo agendamento", time: "Há 15 min", value: "" },
  {
    icon: "✅",
    text: "Pedido concluído",
    time: "Há 32 min",
    value: "R$ 180,00",
  },
  {
    icon: "📦",
    text: "Novo pedido recebido",
    time: "Há 1 hora",
    value: "R$ 520,00",
  },
  {
    icon: "⭐",
    text: "Avaliação recebida",
    time: "Há 2 horas",
    value: "5 estrelas",
  },
  { icon: "💬", text: "Mensagem do cliente", time: "Há 3 horas", value: "" },
];

const sidebarItems = [
  { id: "painel", label: "Painel", icon: "◉" },
  { id: "vendas", label: "Vendas", icon: "📊" },
  { id: "produtos", label: "Produtos", icon: "⊞" },
  { id: "pedidos", label: "Pedidos", icon: "📋" },
  { id: "agendamentos", label: "Agendamentos", icon: "◷" },
  { id: "clientes", label: "Clientes", icon: "👥" },
  { id: "prestadores", label: "Prestadores", icon: "⚡" },
  { id: "relatorios", label: "Relatórios", icon: "📈" },
  { id: "avaliacoes", label: "Avaliações", icon: "⭐" },
  { id: "mensagens", label: "Mensagens", icon: "💬" },
  { id: "configuracoes", label: "Configurações", icon: "⚙" },
];

export default function Admin() {
  const [activeSidebar, setActiveSidebar] = useState("painel");

  const { token } = useAuth();

  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providerRequests, setProviderRequests] = useState<ProviderRequest[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const dynamicMetrics = [
    {
      title: "Usuários",
      value: String(dashboard?.totalUsers ?? 0),
      growth: "",
      period: "cadastrados",
      color: "#3b82f6",
      sparkData: [1, 2, 3, 4, 5, 6],
    },
    {
      title: "Clientes",
      value: String(dashboard?.totalClients ?? 0),
      growth: "",
      period: "ativos",
      color: "#10b981",
      sparkData: [1, 2, 3, 4, 5, 6],
    },
    {
      title: "Prestadores",
      value: String(dashboard?.totalProviders ?? 0),
      growth: "",
      period: "aprovados",
      color: "#8b5cf6",
      sparkData: [1, 2, 3, 4, 5, 6],
    },
    {
      title: "Agendamentos",
      value: String(dashboard?.totalAppointments ?? 0),
      growth: "",
      period: "registrados",
      color: "#f59e0b",
      sparkData: [1, 2, 3, 4, 5, 6],
    },
  ];

  useEffect(() => {
    async function loadData() {
      if (!token) return;

      setLoading(true);

      const [dashboardData, usersData, servicesData, requestsData] =
        await Promise.all([
          getAdminDashboard(token),
          listUsers(token),
          listAdminServices(token),
          listProviderRequests(token),
        ]);

      setDashboard(dashboardData);
      setUsers(usersData);
      setServices(servicesData);
      setProviderRequests(requestsData);
      setLoading(false);
    }

    loadData();
  }, [token]);

  return (
    <div className={styles.wrapper}>
      <NavBar />

      <div className={styles.body}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <nav className={styles.sidebarNav}>
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  className={`${styles.sidebarItem} ${activeSidebar === item.id ? styles.sidebarItemActive : ""}`}
                  onClick={() => setActiveSidebar(item.id)}
                >
                  <span className={styles.sidebarIcon}>{item.icon}</span>
                  <span className={styles.sidebarLabel}>{item.label}</span>
                  {activeSidebar === item.id && (
                    <span className={styles.sidebarActiveDot} />
                  )}
                </button>
              ))}
            </nav>
            <div className={styles.sidebarStatus}>
              <span className={styles.statusDot} />
              <span>Atualizado agora</span>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>
          {/* HEADER */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.headerTitle}>Olá, Admin 👋</h1>
              <p className={styles.headerSubtitle}>
                Aqui está o resumo geral da sua plataforma.
              </p>
            </div>
            <div className={styles.dateSelector}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Últimos 30 dias</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* METRICS CARDS */}
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
                  <div
                    className={styles.metricIcon}
                    style={{ background: `${m.color}15`, color: m.color }}
                  >
                    {idx === 0
                      ? "💰"
                      : idx === 1
                        ? "📦"
                        : idx === 2
                          ? "📋"
                          : "📅"}
                  </div>
                </div>
                <div className={styles.sparkline}>
                  <svg
                    width="100%"
                    height="32"
                    viewBox="0 0 100 32"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id={`sparkGrad${idx}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={m.color}
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor={m.color}
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d={m.sparkData
                        .map(
                          (v, i) =>
                            `${i === 0 ? "M" : "L"}${(i / (m.sparkData.length - 1)) * 100},${32 - (v / Math.max(...m.sparkData)) * 28}`,
                        )
                        .join(" ")}
                      fill="none"
                      stroke={m.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={`${m.sparkData.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (m.sparkData.length - 1)) * 100},${32 - (v / Math.max(...m.sparkData)) * 28}`).join(" ")} L100,32 L0,32 Z`}
                      fill={`url(#sparkGrad${idx})`}
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {activeSidebar === "clientes" && (
            <div className={styles.bottomCard}>
              <h3 className={styles.bottomCardTitle}>Clientes</h3>
              <div className={styles.tableList}>
                {users
                  .filter((user) => user.role === "cliente")
                  .map((user) => (
                    <div key={user.id} className={styles.tableRow}>
                      <span>{user.name}</span>
                      <span>{user.email}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeSidebar === "prestadores" && (
            <div className={styles.bottomCard}>
              <h3 className={styles.bottomCardTitle}>Prestadores</h3>
              <div className={styles.tableList}>
                {users
                  .filter((user) => user.role === "prestador")
                  .map((user) => (
                    <div key={user.id} className={styles.tableRow}>
                      <span>{user.name}</span>
                      <span>{user.email}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeSidebar === "produtos" && (
            <div className={styles.bottomCard}>
              <h3 className={styles.bottomCardTitle}>Serviços</h3>
              <div className={styles.tableList}>
                {services.map((service) => (
                  <div key={service.id} className={styles.tableRow}>
                    <span>{service.name}</span>
                    <span>R$ {service.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSidebar === "pedidos" && (
            <div className={styles.bottomCard}>
              <h3 className={styles.bottomCardTitle}>
                Solicitações de prestador
              </h3>
              <div className={styles.tableList}>
                {providerRequests.map((request) => (
                  <div key={request.id} className={styles.tableRow}>
                    <span>{request.userName}</span>
                    <span>{request.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHARTS ROW */}
          <div className={styles.chartsRow}>
            <div className={styles.chartCard}>
              <div className={styles.chartCardHeader}>
                <h3 className={styles.chartTitle}>Evolução das Vendas</h3>
                <span className={styles.chartPeriod}>2025</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,15,35,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "13px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                    cursor={{ stroke: "rgba(59,130,246,0.3)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    fill="url(#salesGrad)"
                    dot={{ fill: "#3b82f6", strokeWidth: 0, r: 3 }}
                    activeDot={{
                      fill: "#3b82f6",
                      stroke: "#fff",
                      strokeWidth: 2,
                      r: 5,
                    }}
                  />
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,15,35,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "13px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                    cursor={{ fill: "rgba(59,130,246,0.08)" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BOTTOM SECTION */}
          <div className={styles.bottomSection}>
            {/* DONUT */}
            <div className={styles.bottomCard}>
              <h3 className={styles.bottomCardTitle}>
                Distribuição de Pedidos
              </h3>
              <div className={styles.donutWrapper}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={orderDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {orderDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,15,35,0.95)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "13px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.donutLegend}>
                  {orderDistribution.map((item, idx) => (
                    <div key={idx} className={styles.legendItem}>
                      <span
                        className={styles.legendDot}
                        style={{ background: item.color }}
                      />
                      <span className={styles.legendLabel}>{item.name}</span>
                      <span className={styles.legendValue}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CATEGORY BARS */}
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
                      <div
                        className={styles.categoryBarFill}
                        style={{
                          width: `${cat.value}%`,
                          background: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIVITY */}
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
                    {act.value && (
                      <span className={styles.activityValue}>{act.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
