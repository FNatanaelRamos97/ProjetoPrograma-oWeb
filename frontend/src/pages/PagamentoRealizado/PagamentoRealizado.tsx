import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Check,
  ShieldCheck,
  MessageCircle,
  Home,
  Clock,
  Star,
} from "lucide-react";
import NavBar from "../../components/NavBar/NavBar";
import { useAuth } from "../../contexts/AuthContext";
import { createReview, getStripeCheckoutSession } from "@db/database";
import styles from "./PagamentoRealizado.module.css";
import { useEffect, useState } from "react";

export default function PagamentoRealizado() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const state = location.state as {
    providerName?: string;
    serviceName?: string;
    value?: string;
    serviceId?: number;
    providerId?: number;
    appointmentId?: number;
    paymentMethod?: string;
  } | null;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  const payment = paymentData?.payment;

  const serviceId = payment?.serviceId;
  const providerId = payment?.providerId;
  const appointmentId = payment?.appointmentId;
  const value = payment
    ? `R$ ${Number(payment.grossAmount).toFixed(2).replace(".", ",")}`
    : (state?.value ?? "R$ 0,00");

  const providerName = state?.providerName ?? "prestador";
  const serviceName = state?.serviceName ?? "serviço contratado";
  const paymentMethod = "Stripe Checkout";

  useEffect(() => {
    async function checkPayment() {
      if (!token || !sessionId) {
        setCheckingPayment(false);
        return;
      }

      const result = await getStripeCheckoutSession(sessionId, token);
      setPaymentData(result);
      setCheckingPayment(false);
    }

    checkPayment();
  }, [token, sessionId]);

  const today = new Date();
  const formattedDate = today
    .toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/ de /g, " ");

  async function handleSubmitReview() {
    if (!token || !serviceId || !providerId || !appointmentId || rating === 0)
      return;
    setSubmitting(true);
    const result = await createReview(
      { appointmentId, serviceId, providerId, rating, comment },
      token,
    );
    if (result) setReviewSubmitted(true);
    setSubmitting(false);
  }

  if (checkingPayment) {
    return (
      <div className={styles.page}>
        <NavBar />
        <div className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}>Verificando pagamento...</h1>
            <p className={styles.subtitle}>
              Estamos consultando a confirmação da Stripe.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData || paymentData.paymentStatus !== "paid") {
    return (
      <div className={styles.page}>
        <NavBar />
        <div className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}>Pagamento não confirmado</h1>
            <p className={styles.subtitle}>
              O pagamento ainda não foi confirmado pela Stripe.
            </p>
            <button
              className={styles.homeBtn}
              onClick={() => navigate("/meus-pedidos")}
            >
              Voltar aos pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Success icon */}
          <div className={styles.successIcon}>
            <Check size={28} className={styles.checkIcon} />
          </div>

          {/* Title */}
          <h1 className={styles.title}>Pagamento realizado com sucesso</h1>

          {/* Subtitle */}
          <p className={styles.subtitle}>
            Seu pagamento foi confirmado e o prestador já pode iniciar o
            atendimento.
          </p>

          {/* Info card */}
          <div className={styles.infoCard}>
            <ShieldCheck size={18} className={styles.infoIcon} />
            <p className={styles.infoText}>
              Pagamento protegido e processado com segurança.
            </p>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              className={styles.chatBtn}
              onClick={() => navigate("/chat", { state: { providerName } })}
            >
              <MessageCircle size={20} />
              Falar com {providerName}
            </button>
            <button className={styles.homeBtn} onClick={() => navigate("/hub")}>
              <Home size={20} />
              Voltar ao início
            </button>
          </div>

          {/* Details card */}
          <div className={styles.detailsCard}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Serviço</span>
              <span className={styles.detailValue}>{serviceName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Pagamento</span>
              <span className={styles.detailValue}>
                {paymentMethod}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Valor</span>
              <span className={styles.detailValue}>{value}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Data</span>
              <span className={styles.detailValue}>{formattedDate}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <span
                className={`${styles.timelineDot} ${styles.timelineDotDone}`}
              />
              <span
                className={`${styles.timelineText} ${styles.timelineTextDone}`}
              >
                Pagamento confirmado
              </span>
            </div>
            <div className={styles.timelineItem}>
              <span
                className={`${styles.timelineDot} ${styles.timelineDotDone}`}
              />
              <span
                className={`${styles.timelineText} ${styles.timelineTextDone}`}
              >
                Prestador notificado
              </span>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineDot} />
              <span className={styles.timelineText}>
                Atendimento em preparação
              </span>
              <Clock size={12} className={styles.timelinePendingIcon} />
            </div>
          </div>

          {/* Review */}
          {!reviewSubmitted && serviceId && providerId && appointmentId && (
            <div className={styles.reviewCard}>
              <h3 className={styles.reviewTitle}>Avalie o serviço</h3>
              <div className={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`${styles.starBtn} ${(hoverRating || rating) >= star ? styles.starActive : ""}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star size={24} />
                  </button>
                ))}
              </div>
              <textarea
                className={styles.reviewTextarea}
                placeholder="Conte sua experiência (opcional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <button
                className={styles.reviewSubmitBtn}
                onClick={handleSubmitReview}
                disabled={rating === 0 || submitting}
              >
                {submitting ? "Enviando..." : "Avaliar"}
              </button>
            </div>
          )}

          {reviewSubmitted && (
            <div className={styles.reviewThanks}>
              <Check size={18} /> Avaliação enviada com sucesso!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
