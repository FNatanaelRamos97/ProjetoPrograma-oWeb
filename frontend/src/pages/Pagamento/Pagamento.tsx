import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  ShieldCheck,
  LoaderCircle,
  Zap,
  Shield,
  Wallet,
  FileText,
  Smartphone,
  Landmark,
  PiggyBank,
} from "lucide-react";
import NavBar from "../../components/NavBar/NavBar";
import styles from "./Pagamento.module.css";
import {
  createStripeCheckoutSession,
  createMercadoPagoCheckoutSession,
  createAbacatePayCheckoutSession,
} from "@db/database";
import { useAuth } from "../../contexts/AuthContext";

type PaymentMethod = "cartao" | "pix" | "paypal" | "boleto" | "picpay" | "mercadopago" | "abacatepay";

const methodOptions: {
  id: PaymentMethod;
  label: string;
  icon: typeof CreditCard;
  desc: string;
}[] = [
  {
    id: "cartao",
    label: "Cartão",
    icon: CreditCard,
    desc: "Crédito ou débito",
  },
  { id: "pix", label: "PIX", icon: Zap, desc: "Pagamento instantâneo" },
  { id: "picpay", label: "PicPay", icon: Smartphone, desc: "Carteira digital" },
  { id: "paypal", label: "PayPal", icon: Wallet, desc: "Conta PayPal" },
  { id: "boleto", label: "Boleto", icon: FileText, desc: "Boleto bancário" },
  { id: "mercadopago", label: "Mercado Pago", icon: Landmark, desc: "Pague com Mercado Pago" },
  { id: "abacatepay", label: "Abacate Pay", icon: PiggyBank, desc: "Pague com Abacate Pay" },
];

export default function Pagamento() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as Record<string, unknown> | null;
  const [method, setMethod] = useState<PaymentMethod>("cartao");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { token } = useAuth();

  const appointmentId = Number(state?.appointmentId);

  function parseAmount(value: unknown) {
    if (typeof value === "number") return value;

    if (typeof value === "string") {
      const cleaned = value
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim();

      const parsed = Number(cleaned);

      return Number.isNaN(parsed) ? 0 : parsed;
    }

    return 0;
  }

  const amount = parseAmount(state?.value);
  const serviceName = String(state?.serviceName ?? "Serviço contratado");
  const providerName = String(state?.providerName ?? "Prestador");

  const handleStripeSubmit = useCallback(async () => {
    setError("");

    if (!token) {
      setError("Faça login novamente.");
      return;
    }

    if (!appointmentId) {
      setError("Agendamento não encontrado.");
      return;
    }

    setLoading(true);

    const checkout = await createStripeCheckoutSession(appointmentId, token);

    setLoading(false);

    if (!checkout) {
      setError("Não foi possível iniciar o pagamento.");
      return;
    }

    if ("error" in checkout) {
      setError(checkout.error);
      return;
    }

    window.location.href = checkout.checkoutUrl;
  }, [appointmentId, token]);

  const handleMercadoPagoSubmit = useCallback(async () => {
    setError("");

    if (!token) {
      setError("Faça login novamente.");
      return;
    }

    if (!appointmentId) {
      setError("Agendamento não encontrado.");
      return;
    }

    setLoading(true);

    const checkout = await createMercadoPagoCheckoutSession(appointmentId, token);

    setLoading(false);

    if (!checkout) {
      setError("Não foi possível iniciar o pagamento com Mercado Pago.");
      return;
    }

    if ("error" in checkout) {
      setError(checkout.error);
      return;
    }

    window.location.href = checkout.checkoutUrl;
  }, [appointmentId, token]);

  const handleAbacatePaySubmit = useCallback(async () => {
    setError("");

    if (!token) {
      setError("Faça login novamente.");
      return;
    }

    if (!appointmentId) {
      setError("Agendamento não encontrado.");
      return;
    }

    setLoading(true);

    const checkout = await createAbacatePayCheckoutSession(appointmentId, token);

    setLoading(false);

    if (!checkout) {
      setError("Não foi possível iniciar o pagamento com Abacate Pay.");
      return;
    }

    if ("error" in checkout) {
      setError(checkout.error);
      return;
    }

    window.location.href = checkout.checkoutUrl;
  }, [appointmentId, token]);

  const handleMethodAction = useCallback(() => {
    const target: Record<PaymentMethod, string> = {
      cartao: "",
      pix: "/pix",
      picpay: "/picpay",
      paypal: "/paypal",
      boleto: "/boleto",
      mercadopago: "",
      abacatepay: "",
    };
    const path = target[method];
    if (path) navigate(path, { state });
  }, [method, navigate, state]);

  return (
    <div className={styles.page}>
      <div className={styles.bgCircle1} />
      <div className={styles.bgCircle2} />
      <div className={styles.bgCircle3} />
      <NavBar />
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Left — Form */}
          <div className={styles.leftCol}>
            <div className={styles.header}>
              <div className={styles.headerIcon}>
                <CreditCard size={20} />
              </div>
              <div>
                <h1 className={styles.headerTitle}>Pagamento</h1>
                <p className={styles.headerSub}>
                  Escolha a forma de pagamento e finalize a contratação do
                  serviço.
                </p>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {/* Method selector */}
            <div className={styles.methodGrid}>
              {methodOptions.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`${styles.methodCard} ${method === m.id ? styles.methodCardActive : ""}`}
                    onClick={() => setMethod(m.id)}
                  >
                    <Icon size={20} className={styles.methodIcon} />
                    <span className={styles.methodLabel}>{m.label}</span>
                    <span className={styles.methodDesc}>{m.desc}</span>
                  </button>
                );
              })}
            </div>

            {method === "cartao" && (
              <div className={styles.otherMethodBox}>
                <div className={styles.otherMethodIcon}>
                  <CreditCard size={28} />
                </div>

                <h3 className={styles.otherMethodTitle}>
                  Pagamento com crédito ou débito
                </h3>

                <p className={styles.otherMethodDesc}>
                  Clique no botão abaixo para acessar o ambiente seguro da
                  Stripe e inserir os dados do cartão.
                </p>

                <button
                  className={styles.otherMethodBtn}
                  onClick={handleStripeSubmit}
                  disabled={loading}
                  type="button"
                >
                  <span className={styles.btnContent}>
                    {loading ? (
                      <>
                        <LoaderCircle size={18} className={styles.spinner} />
                        <span>Redirecionando...</span>
                      </>
                    ) : (
                      <>
                        <Shield size={18} />
                        <span>Pagar com cartão</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}

            {method === "mercadopago" && (
              <div className={styles.otherMethodBox}>
                <div className={styles.otherMethodIcon}>
                  <Landmark size={28} />
                </div>

                <h3 className={styles.otherMethodTitle}>
                  Pagamento com Mercado Pago
                </h3>

                <p className={styles.otherMethodDesc}>
                  Você será redirecionado para o ambiente seguro do Mercado Pago
                  para finalizar o pagamento.
                </p>

                <button
                  className={styles.otherMethodBtn}
                  onClick={handleMercadoPagoSubmit}
                  disabled={loading}
                  type="button"
                >
                  <span className={styles.btnContent}>
                    {loading ? (
                      <>
                        <LoaderCircle size={18} className={styles.spinner} />
                        <span>Redirecionando...</span>
                      </>
                    ) : (
                      <>
                        <Landmark size={18} />
                        <span>Pagar com Mercado Pago</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}

            {method === "abacatepay" && (
              <div className={styles.otherMethodBox}>
                <div className={styles.otherMethodIcon}>
                  <PiggyBank size={28} />
                </div>

                <h3 className={styles.otherMethodTitle}>
                  Pagamento com Abacate Pay
                </h3>

                <p className={styles.otherMethodDesc}>
                  Você será redirecionado para o ambiente seguro do Abacate Pay
                  para finalizar o pagamento.
                </p>

                <button
                  className={styles.otherMethodBtn}
                  onClick={handleAbacatePaySubmit}
                  disabled={loading}
                  type="button"
                >
                  <span className={styles.btnContent}>
                    {loading ? (
                      <>
                        <LoaderCircle size={18} className={styles.spinner} />
                        <span>Redirecionando...</span>
                      </>
                    ) : (
                      <>
                        <PiggyBank size={18} />
                        <span>Pagar com Abacate Pay</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}

            {/* Other methods — info + action */}
            {method !== "cartao" && method !== "mercadopago" && method !== "abacatepay" && (
              <div className={styles.otherMethodBox}>
                <div className={styles.otherMethodIcon}>
                  {method === "pix" && <Zap size={28} />}
                  {method === "picpay" && <Smartphone size={28} />}
                  {method === "paypal" && <Wallet size={28} />}
                  {method === "boleto" && <FileText size={28} />}
                </div>
                <h3 className={styles.otherMethodTitle}>
                  {method === "pix"
                    ? "Pagamento via PIX"
                    : method === "picpay"
                      ? "Pagamento via PicPay"
                      : method === "paypal"
                        ? "Pagamento via PayPal"
                        : "Boleto Bancário"}
                </h3>
                <p className={styles.otherMethodDesc}>
                  {method === "pix" &&
                    "Pagamento instantâneo e seguro. O código PIX é gerado na hora."}
                  {method === "picpay" &&
                    "Redirecionamento para o ambiente seguro do PicPay."}
                  {method === "paypal" &&
                    "Redirecionamento para o ambiente seguro do PayPal."}
                  {method === "boleto" &&
                    "Gere o boleto e pague em qualquer banco ou casa lotérica."}
                </p>
                <button
                  className={styles.otherMethodBtn}
                  onClick={handleMethodAction}
                >
                  {method === "boleto"
                    ? "Gerar Boleto"
                    : `Pagar com ${methodOptions.find((m) => m.id === method)?.label}`}
                </button>
              </div>
            )}

            {/* Security card */}
            <div className={styles.securityCard}>
              <ShieldCheck size={22} className={styles.securityIcon} />
              <div>
                <strong className={styles.securityTitle}>
                  Pagamento 100% seguro
                </strong>
                <p className={styles.securityText}>
                  Seus dados estão protegidos com criptografia de ponta a ponta.
                </p>
              </div>
            </div>
          </div>

          {/* Right — Card preview + summary */}
          <div className={styles.rightCol}>
            <div className={styles.cardPreview}>
              <div className={styles.cardShine} />
              <ShieldCheck size={36} />
              <span className={styles.cardNumber}>Stripe Checkout</span>

              <div className={styles.cardBottom}>
                <div>
                  <span className={styles.cardLabel}>Ambiente</span>
                  <span className={styles.cardValue}>Seguro</span>
                </div>

                <div>
                  <span className={styles.cardLabel}>Pagamento</span>
                  <span className={styles.cardValue}>Teste</span>
                </div>
              </div>
            </div>

            <div className={styles.brandsRow}>
              <span className={styles.brand}>Visa</span>
              <span className={styles.brand}>Mastercard</span>
              <span className={styles.brand}>Amex</span>
              <span className={styles.brand}>Elo</span>
            </div>

            <div className={styles.summary}>
              <h3 className={styles.summaryTitle}>Resumo do Pagamento</h3>

              <div className={styles.summaryRow}>
                <span>Serviço</span>
                <span>{serviceName}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Prestador</span>
                <span>{providerName}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Valor da compra</span>
                <span>R$ {amount.toFixed(2).replace(".", ",")}</span>
              </div>

              <div className={styles.summaryDivider} />

              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>R$ {amount.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
