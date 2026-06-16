import { useMemo, useState } from "react";
import styles from "./Sections.module.css";
import type { AdminReview } from "@db/database";

interface Props {
  reviews: AdminReview[];
}

export default function AvaliacoesSection({ reviews }: Props) {
  const [ratingFilter, setRatingFilter] = useState("todas");
  const [serviceFilter, setServiceFilter] = useState("todos");

  const services = useMemo(() => {
    const unique = new Map<number, string>();

    reviews.forEach((review) => {
      unique.set(review.serviceId, review.serviceName);
    });

    return Array.from(unique.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesRating =
        ratingFilter === "todas" || review.rating === Number(ratingFilter);

      const matchesService =
        serviceFilter === "todos" || review.serviceId === Number(serviceFilter);

      return matchesRating && matchesService;
    });
  }, [reviews, ratingFilter, serviceFilter]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);

    return total / reviews.length;
  }, [reviews]);

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function renderStars(rating: number) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionStatsRow}>
        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Média Geral</span>
          <span className={styles.statCardValue}>
            ⭐ {averageRating.toFixed(1)}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Total</span>
          <span className={styles.statCardValue}>{reviews.length}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statCardLabel}>Denunciadas</span>
          <span className={styles.statCardValue}>0</span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h3 className={styles.tableCardTitle}>Avaliações</h3>

          <div className={styles.tableFilters}>
            <select
              className={styles.filterSelect}
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
            >
              <option value="todas">Todas as notas</option>
              <option value="5">5 estrelas</option>
              <option value="4">4 estrelas</option>
              <option value="3">3 estrelas</option>
              <option value="2">2 estrelas</option>
              <option value="1">1 estrela</option>
            </select>

            <select
              className={styles.filterSelect}
              value={serviceFilter}
              onChange={(event) => setServiceFilter(event.target.value)}
            >
              <option value="todos">Todos os serviços</option>

              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.profTable}>
          <div className={styles.profTableHeader}>
            <span>Cliente</span>
            <span>Serviço</span>
            <span>Nota</span>
            <span>Comentário</span>
            <span>Data</span>
          </div>

          {filteredReviews.length === 0 ? (
            <p className={styles.emptyText}>Nenhuma avaliação registrada.</p>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className={styles.profTableRow}>
                <span>{review.clientName}</span>

                <span>{review.serviceName}</span>

                <span title={`${review.rating} estrelas`}>
                  {renderStars(review.rating)}
                </span>

                <span>
                  {review.comment && review.comment.trim().length > 0
                    ? review.comment
                    : "Sem comentário"}
                </span>

                <span>{formatDate(review.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}