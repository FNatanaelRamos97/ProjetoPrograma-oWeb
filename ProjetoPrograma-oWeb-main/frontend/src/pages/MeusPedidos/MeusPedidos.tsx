import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  CalendarDays,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Package,
  X,
  MapPin,
  User,
  FileText,
  ShieldCheck,
  MessageCircle,
  Star,
} from "lucide-react";
import NavBar from "../../components/NavBar/NavBar";
import styles from "./MeusPedidos.module.css";
import {
  getMyAppointments,
  confirmAppointment,
  cancelAppointment,
  createReview,
} from "@db/database";
import { useAuth } from "../../contexts/AuthContext";
import type { ClientAppointment } from "../../types";

type TabValue =
  | "all"
  | "pendente_pagamento"
  | "pago"
  | "em_execucao"
  | "concluido"
  | "cancelado"
  | "reembolsado";

function formatCurrency(value?: number | string | null) {
  const numberValue = Number(value ?? 0);

  return `R$ ${numberValue.toFixed(2).replace(".", ",")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Data não informada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: ClientAppointment["status"]) {
  const labels: Record<ClientAppointment["status"], string> = {
    pendente: "Aguardando pagamento",
    confirmado: "Pagamento confirmado",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };

  return labels[status] ?? status;
}

function getStatusIcon(status: ClientAppointment["status"]) {
  if (status === "concluido") return CheckCircle;
  if (status === "cancelado" || status === "reembolsado") return XCircle;
  return Clock;
}

function getStatusClass(status: ClientAppointment["status"]) {
  if (status === "concluido") return styles.badgeCompleted;
  if (status === "cancelado" || status === "reembolsado") {
    return styles.badgeCancelled;
  }

  return styles.badgeInProgress;
}

export default function MeusPedidos() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<ClientAppointment | null>(null);

  const [orders, setOrders] = useState<ClientAppointment[]>([]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const itemsPerPage = 5;

  async function loadOrders() {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const data = await getMyAppointments(token);
    console.log("MEUS PEDIDOS:", data);
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, [token]);

  const filtered = useMemo(() => {
    let result = orders;

    if (activeTab !== "all") {
      result = result.filter((order) => order.status === activeTab);
    }

    if (search) {
      const q = search.toLowerCase();

      result = result.filter((order) => {
        const serviceName = order.serviceName?.toLowerCase() ?? "";
        const providerName = order.providerName?.toLowerCase() ?? "";
        const orderNumber = `con-${order.id}`.toLowerCase();

        return (
          serviceName.includes(q) ||
          providerName.includes(q) ||
          orderNumber.includes(q)
        );
      });
    }

    return result;
  }, [orders, activeTab, search]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;

    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const analytics = useMemo(() => {
    const total = orders.length;

    const totalSpent = orders
      .filter((order) => order.status !== "cancelado")
      .reduce((acc, order) => acc + Number(order.price ?? 0), 0);

    const inProgress = orders.filter(
      (order) =>
        order.status === "pago" ||
        order.status === "em_execucao" ||
        order.status === "pendente_pagamento",
    ).length;

    return { total, totalSpent, inProgress };
  }, [orders]);

  function openModal(order: ClientAppointment) {
    setSelectedOrder(order);
    setRating(0);
    setComment("");
    setReviewMessage("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 200);
  }

  async function handleConfirmConclusion() {
    if (!token || !selectedOrder) return;

    const ok = await confirmAppointment(selectedOrder.id, token);

    if (!ok) return;

    const updatedOrder: ClientAppointment = {
      ...selectedOrder,
      status: "concluido",
    };

    setOrders((prev) =>
      prev.map((item) => (item.id === selectedOrder.id ? updatedOrder : item)),
    );

    setSelectedOrder(updatedOrder);
  }

  async function handleCancelAppointment() {
    if (!token || !selectedOrder) return;

    const reason = "Cancelado pelo cliente";
    const ok = await cancelAppointment(selectedOrder.id, reason, token);

    if (!ok) return;

    const updatedOrder: ClientAppointment = {
      ...selectedOrder,
      status: "cancelado",
    };

    setOrders((prev) =>
      prev.map((item) => (item.id === selectedOrder.id ? updatedOrder : item)),
    );

    setSelectedOrder(updatedOrder);
  }

  async function handleCreateReview() {
    if (!token || !selectedOrder || rating === 0) return;

    setSubmittingReview(true);
    setReviewMessage("");

    const result = await createReview(
      {
        appointmentId: selectedOrder.id,
        serviceId: selectedOrder.serviceId,
        providerId: selectedOrder.providerId,
        rating,
        comment,
      },
      token,
    );

    if (result) {
      setReviewMessage("Avaliação enviada com sucesso.");
      setRating(0);
      setComment("");
    } else {
      setReviewMessage(
        "Não foi possível enviar a avaliação. Verifique se o serviço já foi concluído.",
      );
    }

    setSubmittingReview(false);
  }

  const tabLabel: Record<TabValue, string> = {
    all: "Todos",
    pendente_pagamento: "Aguardando pagamento",
    pago: "Pagos",
    em_execucao: "Em execução",
    concluido: "Concluídos",
    cancelado: "Cancelados",
    reembolsado: "Reembolsados",
  };

  return (
    <div className={styles.page}>
      <NavBar />

      <div className={styles.container}>
        <div className={styles.mainPanel}>
          <div className={styles.topSection}>
            <div className={styles.topLeft}>
              <h1 className={styles.pageTitle}>Meus Pedidos</h1>
              <p className={styles.pageSub}>
                Acompanhe todos os serviços que você contratou.
              </p>
            </div>

            <div className={styles.topRight}>
              <div className={styles.searchWrapper}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Buscar pedido ou serviço..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <button className={styles.filterBtn}>
                <SlidersHorizontal size={16} />
              </button>
            </div>
          </div>

          <div className={styles.analyticsRow}>
            <div className={styles.analyticsCard}>
              <span className={styles.analyticsValue}>{analytics.total}</span>
              <span className={styles.analyticsLabel}>Total de pedidos</span>
            </div>

            <div className={styles.analyticsCard}>
              <span className={styles.analyticsValue}>
                {formatCurrency(analytics.totalSpent)}
              </span>
              <span className={styles.analyticsLabel}>Total gasto</span>
            </div>

            <div className={styles.analyticsCard}>
              <span className={styles.analyticsValue}>
                {analytics.inProgress}
              </span>
              <span className={styles.analyticsLabel}>Em andamento</span>
            </div>
          </div>

          <div className={styles.tabsRow}>
            {(Object.entries(tabLabel) as [TabValue, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  className={`${styles.tab} ${
                    activeTab === key ? styles.tabActive : ""
                  }`}
                  onClick={() => {
                    setActiveTab(key);
                    setCurrentPage(1);
                  }}
                >
                  {label}
                </button>
              ),
            )}
          </div>

          {loading ? (
            <div className={styles.skeletonList}>
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className={styles.skeletonCard}>
                  <div className={styles.skeletonShimmer} />
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonLines}>
                    <div
                      className={styles.skeletonLine}
                      style={{ width: "40%" }}
                    />
                    <div
                      className={styles.skeletonLine}
                      style={{ width: "60%" }}
                    />
                    <div
                      className={styles.skeletonLine}
                      style={{ width: "25%" }}
                    />
                  </div>
                  <div className={styles.skeletonRight}>
                    <div
                      className={styles.skeletonLine}
                      style={{ width: "70px", height: "20px" }}
                    />
                    <div
                      className={styles.skeletonLine}
                      style={{ width: "50px", height: "28px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <Package size={40} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>Nenhum pedido encontrado</h3>
              <p className={styles.emptyText}>
                {search
                  ? "Tente alterar sua busca ou limpar os filtros."
                  : "Você ainda não contratou nenhum serviço."}
              </p>

              {!search && (
                <button
                  className={styles.emptyBtn}
                  onClick={() => navigate("/explorar")}
                >
                  Explorar serviços
                </button>
              )}
            </div>
          ) : (
            <div className={styles.orderList}>
              {paginated.map((order, index) => {
                const StatusIcon = getStatusIcon(order.status);

                return (
                  <div
                    key={order.id}
                    className={styles.orderCard}
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    <div className={styles.cardLeft}>
                      <div className={styles.avatar}>
                        {(order.providerName ?? "P").charAt(0)}
                      </div>

                      <div className={styles.cardInfo}>
                        <span className={styles.cardTitle}>
                          {order.serviceName ?? "Serviço contratado"}
                        </span>

                        <span className={styles.cardOrderNumber}>
                          CON-{String(order.id).padStart(3, "0")}
                        </span>

                        <span className={styles.cardProvider}>
                          <User size={12} />
                          {order.providerName ?? "Prestador"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardCenter}>
                      <span className={styles.cardInfoRow}>
                        <CalendarDays size={13} />
                        {formatDate(order.appointmentDate)}
                      </span>

                      <span className={styles.cardInfoRow}>
                        <CreditCard size={13} />
                        Stripe Checkout
                      </span>
                    </div>

                    <div className={styles.cardRight}>
                      <span
                        className={`${styles.statusBadge} ${getStatusClass(
                          order.status,
                        )}`}
                      >
                        <StatusIcon size={12} />
                        {getStatusLabel(order.status)}
                      </span>

                      <div className={styles.cardRightBottom}>
                        <span
                          className={`${styles.cardValue} ${
                            order.status === "cancelado" ||
                            order.status === "reembolsado"
                              ? styles.cardValueMuted
                              : ""
                          }`}
                        >
                          {formatCurrency(order.price)}
                        </span>

                        <button
                          className={styles.viewBtn}
                          onClick={() => openModal(order)}
                        >
                          Ver detalhes <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filtered.length > 0 && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageArrow}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`${styles.pageBtn} ${
                      currentPage === page ? styles.pageBtnActive : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                className={styles.pageArrow}
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {modalOpen && selectedOrder && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>
              <X size={18} />
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalAvatar}>
                {(selectedOrder.providerName ?? "P").charAt(0)}
              </div>

              <div className={styles.modalHeaderInfo}>
                <h2 className={styles.modalTitle}>
                  {selectedOrder.serviceName ?? "Serviço contratado"}
                </h2>

                <span className={styles.modalOrderNumber}>
                  CON-{String(selectedOrder.id).padStart(3, "0")}
                </span>
              </div>
            </div>

            <div className={styles.modalStatus}>
              {(() => {
                const Icon = getStatusIcon(selectedOrder.status);

                return (
                  <span
                    className={`${styles.modalStatusBadge} ${getStatusClass(
                      selectedOrder.status,
                    )}`}
                  >
                    <Icon size={14} />
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                );
              })()}
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>
                  <FileText size={14} /> Detalhes do serviço
                </h4>

                <p className={styles.modalDescription}>
                  {selectedOrder.serviceName ?? "Serviço contratado"}
                </p>
              </div>

              <div className={styles.modalGrid}>
                <div className={styles.modalGridItem}>
                  <span className={styles.modalGridLabel}>Valor</span>
                  <span className={styles.modalGridValue}>
                    {formatCurrency(selectedOrder.price)}
                  </span>
                </div>

                <div className={styles.modalGridItem}>
                  <span className={styles.modalGridLabel}>Pagamento</span>
                  <span className={styles.modalGridValue}>Stripe Checkout</span>
                </div>

                <div className={styles.modalGridItem}>
                  <span className={styles.modalGridLabel}>Data</span>
                  <span className={styles.modalGridValue}>
                    {formatDate(selectedOrder.appointmentDate)}
                  </span>
                </div>

                <div className={styles.modalGridItem}>
                  <span className={styles.modalGridLabel}>Prestador</span>
                  <span className={styles.modalGridValue}>
                    {selectedOrder.providerName ?? "Prestador"}
                  </span>
                </div>
              </div>

              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>
                  <MapPin size={14} /> Endereço
                </h4>

                <p className={styles.modalDescription}>
                  Endereço informado no atendimento.
                </p>
              </div>

              {selectedOrder.status === "concluido" && (
                <div className={styles.modalSection}>
                  <h4 className={styles.modalSectionTitle}>
                    <Star size={14} /> Avaliação do serviço
                  </h4>

                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={styles.viewBtn}
                        onClick={() => setRating(star)}
                      >
                        {star <= rating ? "★" : "☆"}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Escreva um comentário opcional"
                    rows={3}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      padding: 12,
                      resize: "vertical",
                    }}
                  />

                  <button
                    className={styles.viewBtn}
                    onClick={handleCreateReview}
                    disabled={rating === 0 || submittingReview}
                    style={{ marginTop: 12 }}
                  >
                    {submittingReview ? "Enviando..." : "Enviar avaliação"}
                  </button>

                  {reviewMessage && (
                    <p className={styles.modalDescription}>{reviewMessage}</p>
                  )}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.modalChatBtn}
                onClick={() => {
                  closeModal();
                  navigate("/chat", {
                    state: {
                      providerName: selectedOrder.providerName ?? "Prestador",
                    },
                  });
                }}
              >
                <MessageCircle size={16} />
                Falar com{" "}
                {(selectedOrder.providerName ?? "Prestador").split(" ")[0]}
              </button>

              <button className={styles.modalSecurity}>
                <ShieldCheck size={14} />
                Pedido protegido
              </button>

              {selectedOrder.status === "confirmado" && (
                <button
                  className={styles.viewBtn}
                  onClick={handleConfirmConclusion}
                >
                  Confirmar conclusão
                </button>
              )}

              {selectedOrder.status === "confirmado" && (
                <button
                  className={styles.viewBtn}
                  onClick={handleCancelAppointment}
                >
                  Cancelar pedido
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}