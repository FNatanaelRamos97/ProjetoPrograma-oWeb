import { useEffect, useMemo, useState } from "react";
import type { AdminDashboard } from "../../../types";
import { listAdminAppointments } from "@db/database";
import styles from "./Sections.module.css";

interface Props {
  dashboard: AdminDashboard | null;
}

type AdminAppointment = {
  id: number;
  serviceId: number;
  serviceName?: string;
  providerId: number;
  providerName?: string;
  clientId: number;
  clientName?: string;
  appointmentDate: string;
  status: "pendente" | "confirmado" | "cancelado";
  createdAt: string;
};

export default function AgendamentosSection({ dashboard }: Props) {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [statusFilter, setStatusFilter] = useState("todos");

  useEffect(() => {
    async function loadAppointments() {
      const token = localStorage.getItem("conectserv_token");

      if (!token) return;

      const data = await listAdminAppointments(token);

      setAppointments(data);
    }

    loadAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === "todos") {
      return appointments;
    }

    return appointments.filter((item) => item.status === statusFilter);
  }, [appointments, statusFilter]);

  const total = appointments.length;
  const confirmados = appointments.filter((item) => item.status === "confirmado").length;
  const pendentes = appointments.filter((item) => item.status === "pendente").length;
  const cancelados = appointments.filter((item) => item.status === "cancelado").length;

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionStatsRow}>
        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Total</span>
          <span className={styles.statCardValue}>{dashboard?.totalAppointments ?? total}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Confirmados</span>
          <span className={styles.statCardValue}>{confirmados}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Pendentes</span>
          <span className={styles.statCardValue}>{pendentes}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Cancelados</span>
          <span className={styles.statCardValue}>{cancelados}</span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h3 className={styles.tableCardTitle}>Agendamentos</h3>

          <div className={styles.tableFilters}>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendentes</option>
              <option value="confirmado">Confirmados</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>
        </div>

        <div className={styles.profTable}>
          <div className={styles.profTableHeader}>
            <span>Data</span>
            <span>Serviço</span>
            <span>Prestador</span>
            <span>Cliente</span>
            <span>Status</span>
          </div>

          {filteredAppointments.length === 0 ? (
            <p className={styles.emptyText}>Nenhum agendamento encontrado.</p>
          ) : (
            filteredAppointments.map((item) => (
              <div key={item.id} className={styles.profTableRow}>
                <span>{item.appointmentDate}</span>
                <span>{item.serviceName || `Serviço #${item.serviceId}`}</span>
                <span>{item.providerName || `Prestador #${item.providerId}`}</span>
                <span>{item.clientName || `Cliente #${item.clientId}`}</span>
                <span
                  className={`
                    ${styles.statusBadgeMin}
                    ${item.status === "confirmado" ? styles.badgeApproved : ""}
                    ${item.status === "pendente" ? styles.badgePending : ""}
                    ${item.status === "cancelado" ? styles.badgeRejected : ""}
                  `}
                >
                  {item.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}