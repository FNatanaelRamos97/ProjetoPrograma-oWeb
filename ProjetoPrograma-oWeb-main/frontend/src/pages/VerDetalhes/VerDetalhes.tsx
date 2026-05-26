import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getServiceById } from "@db/database";
import type { Service } from "../../types";
import NavBar from "../../components/NavBar/NavBar";
import styles from "./VerDetalhes.module.css";

const carouselSlides = [
  {
    gradient: "linear-gradient(135deg, #2563eb, #1e40af)",
    icon: "🧹",
    label: "Limpeza profissional",
  },
  {
    gradient: "linear-gradient(135deg, #059669, #047857)",
    icon: "🧽",
    label: "Ambiente higienizado",
  },
  {
    gradient: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    icon: "✨",
    label: "Resultado impecável",
  },
];

const includedItems = [
  "Limpeza geral de ambientes",
  "Limpeza de banheiros",
  "Limpeza de cozinha",
  "Aspiração de pisos e tapetes",
  "Higienização de superfícies",
  "Organização básica",
];

function Stars({ count }: { count: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= count ? styles.starFilled : styles.starEmpty}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function VerDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Service | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (id) getServiceById(Number(id)).then(setProduct);
  }, [id]);

  if (!product) {
    return (
      <div className={styles.page}>
        <NavBar />
        <div className={styles.notFound}>Produto não encontrado.</div>
      </div>
    );
  }

  const rating = {
    stars: Math.min(4 + (product.id % 2), 5),
    count: 10 + product.id * 3,
  };
  const ratingNum = (4.5 + (product.id % 5) * 0.1).toFixed(1);

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/hub" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link to="/explorar" className={styles.breadcrumbLink}>
            Produtos
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>

        {/* Main card */}
        <div className={styles.card}>
          {/* Left - Carousel */}
          <div className={styles.carouselCol}>
            <div className={styles.carousel}>
              <button
                className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
                onClick={() =>
                  setCurrent(
                    (prev) =>
                      (prev - 1 + carouselSlides.length) %
                      carouselSlides.length,
                  )
                }
                aria-label="Anterior"
              >
                ‹
              </button>
              <div
                className={styles.carouselSlide}
                style={{ background: carouselSlides[current].gradient }}
              >
                <span className={styles.carouselIcon}>
                  {carouselSlides[current].icon}
                </span>
                <span className={styles.carouselLabel}>
                  {carouselSlides[current].label}
                </span>
              </div>
              <button
                className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
                onClick={() =>
                  setCurrent((prev) => (prev + 1) % carouselSlides.length)
                }
                aria-label="Próximo"
              >
                ›
              </button>
              <div className={styles.carouselDots}>
                {carouselSlides.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.carouselDot} ${i === current ? styles.carouselDotActive : ""}`}
                    onClick={() => setCurrent(i)}
                  />
                ))}
              </div>
            </div>
            {/* Thumbnails */}
            <div className={styles.thumbnails}>
              {carouselSlides.map((slide, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === current ? styles.thumbActive : ""}`}
                  onClick={() => setCurrent(i)}
                  style={{ background: slide.gradient }}
                >
                  <span className={styles.thumbIcon}>{slide.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right - Info */}
          <div className={styles.infoCol}>
            <span className={styles.badge}>Serviço</span>
            <h1 className={styles.title}>{product.name}</h1>

            <div className={styles.providerRow}>
              <span className={styles.providerName}>
                {product.provider_name}
              </span>
              <span className={styles.verifiedBadge}>
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="14"
                  height="14"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                Verificado
              </span>
            </div>

            <div className={styles.ratingRow}>
              <Stars count={rating.stars} />
              <span className={styles.ratingNum}>{ratingNum}</span>
              <span className={styles.ratingCount}>
                ({rating.count} avaliações)
              </span>
            </div>

            <div className={styles.priceCard}>
              <span className={styles.priceLabel}>Preço</span>
              <span className={styles.priceValue}>
                R$ {product.price.toFixed(2)}
              </span>
            </div>

            <p className={styles.description}>{product.description}</p>

            {/* Included items */}
            <div className={styles.includedSection}>
              <h3 className={styles.includedTitle}>O que está incluso</h3>
              <div className={styles.includedGrid}>
                {includedItems.map((item, i) => (
                  <div key={i} className={styles.includedItem}>
                    <svg
                      className={styles.checkIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Button */}
            <button
              className={styles.mainBtn}
              onClick={() =>
                navigate(`/agenda/${product.id}`, {
                  state: {
                    serviceId: product.id,
                    providerId: product.provider_id,
                    providerName: product.provider_name,
                    serviceName: product.name,
                  },
                })
              }
            >
              Escolher data
            </button>
            <p className={styles.btnHint}>
              Orçamento sem compromisso • Resposta rápida
            </p>

            {/* Footer badges */}
            <div className={styles.footerBadges}>
              <div className={styles.footerBadge}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="14"
                  height="14"
                >
                  <path d="M9 12l2 2 4-4" />
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Profissional verificado
              </div>
              <div className={styles.footerBadge}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="14"
                  height="14"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Avaliações reais
              </div>
              <div className={styles.footerBadge}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="14"
                  height="14"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Serviço com garantia
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
