import NavBar from "../../components/NavBar/NavBar";
import styles from "./Admin.module.css";
import { useEffect, useState } from "react";
import {
  approveProviderRequest,
  getAdminDashboard,
  getAllTransactions,
  getSalesLogs,
  getSalesStats,
  listAdminServices,
  listProviderRequests,
  listUsers,
  rejectProviderRequest,
  getAllWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  getAdminReviews,
  type AdminReview,
  type WithdrawalRequest,
} from "@db/database";
import { useAuth } from "../../contexts/AuthContext";
import type {
  AdminDashboard,
  ProviderRequest,
  SalesLog,
  SalesStats,
  Service,
  Transaction,
  User,
} from "../../types/index";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  ClipboardList,
  Calendar,
  Users,
  UserCheck,
  BarChart3,
  Star,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";
import PainelSection from "./sections/PainelSection";
import VendasSection from "./sections/VendasSection";
import ProdutosSection from "./sections/ProdutosSection";
import PedidosSection from "./sections/PedidosSection";
import AgendamentosSection from "./sections/AgendamentosSection";
import ClientesSection from "./sections/ClientesSection";
import PrestadoresSection from "./sections/PrestadoresSection";
import RelatoriosSection from "./sections/RelatoriosSection";
import AvaliacoesSection from "./sections/AvaliacoesSection";
import MensagensSection from "./sections/MensagensSection";
import ConfiguracoesSection from "./sections/ConfiguracoesSection";
import RepassesSection from "./sections/RepasseSection";

type SidebarItem = { id: string; label: string; icon: LucideIcon };

const sidebarGroups: { group: string; items: SidebarItem[] }[] = [
  {
    group: "NEGÓCIO",
    items: [
      { id: "painel", label: "Painel", icon: LayoutDashboard },
      { id: "vendas", label: "Vendas", icon: TrendingUp },
      { id: "produtos", label: "Produtos", icon: Package },
      { id: "repasses", label: "Repasses", icon: TrendingUp },
    ],
  },
  {
    group: "OPERAÇÃO",
    items: [
      { id: "pedidos", label: "Pedidos", icon: ClipboardList },
      { id: "agendamentos", label: "Agendamentos", icon: Calendar },
      { id: "clientes", label: "Clientes", icon: Users },
      { id: "prestadores", label: "Prestadores", icon: UserCheck },
    ],
  },
  {
    group: "CRM",
    items: [
      { id: "relatorios", label: "Relatórios", icon: BarChart3 },
      { id: "avaliacoes", label: "Avaliações", icon: Star },
      { id: "mensagens", label: "Mensagens", icon: MessageSquare },
      { id: "configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

const sectionHeaders: Record<string, { title: string; subtitle: string }> = {
  painel: {
    title: "Olá, Admin 👋",
    subtitle: "Aqui está o resumo geral da sua plataforma.",
  },
  vendas: {
    title: "Vendas 💰",
    subtitle: "Acompanhe todas as transações e receitas da plataforma.",
  },
  produtos: {
    title: "Serviços 📦",
    subtitle: "Gerencie todos os serviços cadastrados na plataforma.",
  },
  pedidos: {
    title: "Análise de Prestadores 📋",
    subtitle: "Avalie e gerencie as solicitações para se tornar prestador.",
  },
  agendamentos: {
    title: "Agendamentos 📅",
    subtitle: "Visualize e gerencie todos os agendamentos da plataforma.",
  },
  clientes: {
    title: "Clientes 👥",
    subtitle: "Gerencie os clientes cadastrados na plataforma.",
  },
  prestadores: {
    title: "Prestadores ⚡",
    subtitle: "Gerencie os prestadores de serviços da plataforma.",
  },
  relatorios: {
    title: "Relatórios 📈",
    subtitle: "Gere relatórios personalizados sobre a plataforma.",
  },
  avaliacoes: {
    title: "Avaliações ⭐",
    subtitle: "Modere e acompanhe as avaliações dos serviços.",
  },
  mensagens: {
    title: "Mensagens 💬",
    subtitle: "Central de mensagens da plataforma.",
  },
  configuracoes: {
    title: "Configurações ⚙",
    subtitle: "Configure os parâmetros da plataforma.",
  },
  repasses: {
    title: "Repasses 💸",
    subtitle: "Analise e aprove as solicitações de repasse dos prestadores.",
  },
};

export default function Admin() {
  const [activeSidebar, setActiveSidebar] = useState("painel");
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providerRequests, setProviderRequests] = useState<ProviderRequest[]>(
    [],
  );
  const [salesLogs, setSalesLogs] = useState<SalesLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      setLoading(true);
      const [d, u, s, r, sl, tx, ss, wr, rv] = await Promise.all([
        getAdminDashboard(token),
        listUsers(token),
        listAdminServices(token),
        listProviderRequests(token),
        getSalesLogs(token),
        getAllTransactions(token),
        getSalesStats(token),
        getAllWithdrawalRequests(token),
        getAdminReviews(token),
      ]);

      setWithdrawalRequests(wr);
      setDashboard(d);
      setUsers(u);
      setServices(s);
      setProviderRequests(r);
      setSalesLogs(sl);
      setTransactions(tx);
      setSalesStats(ss);
      setLoading(false);
      setReviews(rv);
    }
    loadData();
  }, [token]);

  const handleApprove = async (id: number) => {
    if (!token) return;
    const ok = await approveProviderRequest(id, token);
    if (ok)
      setProviderRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "aprovado" as const } : r,
        ),
      );
  };

  const handleReject = async (id: number) => {
    if (!token) return;
    const ok = await rejectProviderRequest(id, token);
    if (ok)
      setProviderRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "recusado" as const } : r,
        ),
      );
  };

  const handleApproveWithdrawal = async (id: number) => {
    if (!token) return;

    const ok = await approveWithdrawalRequest(id, token);

    if (ok) {
      setWithdrawalRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "pago" as const } : item,
        ),
      );
    }
  };

  const handleRejectWithdrawal = async (id: number) => {
    if (!token) return;

    const ok = await rejectWithdrawalRequest(id, token);

    if (ok) {
      setWithdrawalRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "recusado" as const } : item,
        ),
      );
    }
  };

  const header = sectionHeaders[activeSidebar];

  function renderSection() {
    switch (activeSidebar) {
      case "painel":
        return (
          <PainelSection
            dashboard={dashboard}
            salesLogs={salesLogs}
            services={services}
            salesStats={salesStats}
          />
        );
      case "vendas":
        return <VendasSection salesLogs={salesLogs} />;
      case "produtos":
        return <ProdutosSection services={services} />;
      case "pedidos":
        return (
          <PedidosSection
            providerRequests={providerRequests}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        );
      case "agendamentos":
        return <AgendamentosSection dashboard={dashboard} />;
      case "clientes":
        return <ClientesSection users={users} />;
      case "prestadores":
        return <PrestadoresSection users={users} services={services} />;
      case "relatorios":
        return <RelatoriosSection />;
      case "avaliacoes":
        return <AvaliacoesSection reviews={reviews}/>;
      case "mensagens":
        return <MensagensSection />;
      case "configuracoes":
        return <ConfiguracoesSection />;
      case "repasses":
        return (
          <RepassesSection
            withdrawalRequests={withdrawalRequests}
            onApprove={handleApproveWithdrawal}
            onReject={handleRejectWithdrawal}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className={styles.wrapper}>
      <NavBar />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <nav className={styles.sidebarNav}>
              {sidebarGroups.map((group) => (
                <div key={group.group} className={styles.sidebarGroup}>
                  <span className={styles.sidebarGroupLabel}>
                    {group.group}
                  </span>
                  {group.items.map((item) => {
                    const isActive = activeSidebar === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ""}`}
                        onClick={() => setActiveSidebar(item.id)}
                      >
                        {isActive && (
                          <span className={styles.sidebarIndicator} />
                        )}
                        <Icon className={styles.sidebarIcon} size={18} />
                        <span className={styles.sidebarLabel}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className={styles.sidebarStatus}>
              <span className={styles.statusDot} />
              <span>Online</span>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.headerTitle}>{header.title}</h1>
              <p className={styles.headerSubtitle}>{header.subtitle}</p>
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
          {loading ? (
            <p className={styles.headerSubtitle}>Carregando...</p>
          ) : (
            renderSection()
          )}
        </main>
      </div>
    </div>
  );
}
