import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listServices, deleteService } from "@db/database";
import { useAuth } from "../../contexts/AuthContext";
import type { Service } from "../../types";
import NavBar from "../../components/NavBar/NavBar";
import styles from "./Produtos.module.css";

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

function getCategoryIcon(name: string) {
  const first = name.charAt(0).toUpperCase();
  return first;
}

type SortOption = "recent" | "price-asc" | "price-desc" | "name-asc";

export default function Produtos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState<SortOption>("recent");
  const [sortOpen, setSortOpen] = useState(false);

  const category = searchParams.get("cat") || "";

  useEffect(() => {
    listServices().then(setServices);
  }, []);

  const filtered = useMemo(() => {
    let result = services.filter((s) => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase());
      const matchesCat =
        !category || s.category.toLowerCase() === category.toLowerCase();
      return matchesSearch && matchesCat;
    });

    switch (sort) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result = [...result].sort((a, b) => Number(b.id) - Number(a.id));
    }

    return result;
  }, [services, search, sort, category]);

  const handleDelete = async (id: number | string) => {
    const token = localStorage.getItem("conectserv_token");

    if (!token) {
      alert(
        "Token não encontrado. Faça login novamente e tente excluir o serviço.",
      );
      return;
    }

    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este serviço?",
    );

    if (!confirmDelete) {
      return;
    }

    const ok = await deleteService(id, token);

    if (!ok) {
      alert(
        "Não foi possível excluir o serviço. Verifique o console do navegador.",
      );
      return;
    }

    setServices((prev) => prev.filter((s) => String(s.id) !== String(id)));

    alert("Serviço excluído com sucesso.");
  };

  const sortLabels: Record<SortOption, string> = {
    recent: "Mais recentes",
    "price-asc": "Menor preço",
    "price-desc": "Maior preço",
    "name-asc": "A-Z",
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <NavBar />
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.topLeft}>
            <h1 className={styles.pageTitle}>Produtos</h1>
            <p className={styles.pageSub}>
              Encontre o serviço ideal para você.
            </p>
          </div>
          <div className={styles.topRight}>
            <div className={styles.searchWrapper}>
              <svg
                className={styles.searchIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Buscar serviços..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.sortWrapper}>
              <button
                className={styles.sortBtn}
                onClick={() => setSortOpen(!sortOpen)}
              >
                {sortLabels[sort]} <span className={styles.sortArrow}>⌄</span>
              </button>
              {sortOpen && (
                <div className={styles.sortDropdown}>
                  {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                    <button
                      key={key}
                      className={`${styles.sortItem} ${key === sort ? styles.sortItemActive : ""}`}
                      onClick={() => {
                        setSort(key);
                        setSortOpen(false);
                      }}
                    >
                      {sortLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className={styles.empty}>
            {search
              ? "Nenhum serviço encontrado para esta busca."
              : "Nenhum serviço cadastrado ainda."}
          </p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((item, i) => {
              const ratingValue = Number(item.averageRating ?? 0);
              const totalReviews = Number(item.totalReviews ?? 0);
              return (
                <div
                  key={item.id}
                  className={styles.card}
                  onClick={() => navigate(`/produtos/${item.id}`)}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <img
                      className={styles.cardImage}
                      src={item.imageUrls[0]}
                      alt={item.name}
                    />
                  ) : item.imageUrl ? (
                    <img
                      className={styles.cardImage}
                      src={item.imageUrl}
                      alt={item.name}
                    />
                  ) : (
                    <div className={styles.cardTop}>
                      <div className={styles.cardIcon}>
                        {getCategoryIcon(item.name)}
                      </div>
                    </div>
                  )}

                  <h3 className={styles.cardName}>{item.name}</h3>
                  <p className={styles.cardDesc}>
                    {item.description.length > 60
                      ? item.description.slice(0, 60) + "..."
                      : item.description ||
                        "Serviço profissional de qualidade."}
                  </p>

                  <div className={styles.cardDivider} />

                  <div className={styles.cardFooter}>
                    <div className={styles.cardProvider}>
                      <div className={styles.providerAvatar}>
                        {item.provider_name.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.providerInfo}>
                        <span className={styles.providerName}>
                          {item.provider_name}
                        </span>
                        <div className={styles.providerRating}>
                          <Stars count={Math.round(ratingValue)} />
                          <span className={styles.ratingCount}>
                            ({totalReviews})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.priceArea}>
                      <span className={styles.verifiedBadge}>✓ Verificado</span>
                      <span className={styles.cardPrice}>
                        R$ {item.price.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>

                  {String(user?.id) === String(item.provider_id) && (
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      Excluir
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
