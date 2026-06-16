import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./NavBar.module.css";

const defaultNavItems = [
  {
    id: "hub",
    label: "Home",
    route: "/hub",
    icon: "/botao-home.png",
    isImage: true,
  },
  {
    id: "explorar",
    label: "Explorar",
    route: "/explorar",
    icon: "/lancamento-do-produto.png",
    isImage: true,
  },
  {
    id: "profissionais",
    label: "Profissionais",
    route: "/profissionais",
    icon: "/homem-de-negocios.png",
    isImage: true,
  }
];

const notifications = [
  {
    id: 1,
    icon: "💰",
    title: "Novo orçamento recebido",
    subtitle: "João Silva enviou um orçamento",
    time: "Há 5 min",
  },
  {
    id: 2,
    icon: "💬",
    title: "Profissional respondeu",
    subtitle: "Maria Santos respondeu sua solicitação",
    time: "Há 15 min",
  },
  {
    id: 3,
    icon: "✅",
    title: "Pedido concluído",
    subtitle: "Serviço de limpeza finalizado",
    time: "Há 32 min",
  },
  {
    id: 4,
    icon: "📦",
    title: "Novo pedido recebido",
    subtitle: "Você tem um novo pedido de serviço",
    time: "Há 1 hora",
  },
];

interface NavBarProps {
  navItems?: typeof defaultNavItems;
}

export default function NavBar({ navItems: customNavItems }: NavBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isPrestador, isAdmin, isPrestadorPendente, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const items = customNavItems ?? defaultNavItems;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navInner}>
        <button className={styles.logo} onClick={() => navigate("/hub")}>
          <svg
            className={styles.logoIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          ConectServ
        </button>

        <div className={styles.centerGroup}>
          <div className={styles.links}>
            {items.map((item) => {
              const isActive = location.pathname === item.route;
              return (
                <button
                  key={item.id}
                  className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
                  onClick={() => navigate(item.route)}
                >
                  <span className={styles.linkIcon}>
                    {(item as any).isImage ? (
                      <img src={item.icon} alt="" className={styles.linkImg} />
                    ) : (
                      item.icon
                    )}
                  </span>
                  <span className={styles.linkLabel}>{item.label}</span>
                  {isActive && <span className={styles.linkGlow} />}
                </button>
              );
            })}
            {(isPrestador || isAdmin) && (
              <>
                <button
                  className={`${styles.link} ${location.pathname === "/minha-agenda" ? styles.linkActive : ""}`}
                  onClick={() => navigate("/minha-agenda")}
                >
                  <span className={styles.linkIcon}>📅</span>
                  <span className={styles.linkLabel}>Minha Agenda</span>
                </button>

                <button
                  className={`${styles.link} ${location.pathname === "/cadastrar-servico" ? styles.linkActive : ""}`}
                  onClick={() => navigate("/cadastrar-servico")}
                >
                  <span className={styles.linkIcon}>+</span>
                  <span className={styles.linkLabel}>Cadastrar</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className={styles.rightGroup}>
          <button
            className={styles.iconBtn}
            title="Buscar"
            onClick={() => navigate("/explorar")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="20"
              height="20"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* Notifications bell */}
          <div className={styles.notifWrapper} ref={notifRef}>
            <button
              className={styles.iconBtn}
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              title="Notificações"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="20"
                height="20"
              >
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className={styles.notifBadge}>{notifications.length}</span>
            </button>

            {notifOpen && (
              <div className={styles.notifPanel}>
                <div className={styles.notifHeader}>
                  <span className={styles.notifTitle}>Notificações</span>
                  <button className={styles.notifAction}>
                    Marcar todas como lidas
                  </button>
                </div>
                <div className={styles.notifList}>
                  {notifications.map((n) => (
                    <div key={n.id} className={styles.notifItem}>
                      <span className={styles.notifItemIcon}>{n.icon}</span>
                      <div className={styles.notifItemContent}>
                        <span className={styles.notifItemTitle}>{n.title}</span>
                        <span className={styles.notifItemSub}>
                          {n.subtitle}
                        </span>
                      </div>
                      <span className={styles.notifItemTime}>{n.time}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.notifFooter}>
                  <button className={styles.notifFooterBtn}>Ver todas</button>
                </div>
              </div>
            )}
          </div>

          {user && (
            <div className={styles.profileDropdown} ref={profileRef}>
              <button
                className={styles.avatar}
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
              >
                {user.profileImageUrl ? (
                  <img
                    className={styles.avatarImg}
                    src={user.profileImageUrl}
                    alt={user.name}
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </button>
              {profileOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownAvatar}>
                      {user.profileImageUrl ? (
                        <img
                          className={styles.dropdownAvatarImg}
                          src={user.profileImageUrl}
                          alt={user.name}
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className={styles.dropdownName}>{user.name}</span>
                      <span className={styles.dropdownRole}>
                        {user.role === "prestador" ? "Prestador" : "Cliente"}
                      </span>
                    </div>
                  </div>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/perfil");
                    }}
                  >
                    <span className={styles.dropdownItemIcon}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="16"
                        height="16"
                      >
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    Ver perfil
                  </button>
                  <div className={styles.dropdownDivider} />
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/meus-pedidos");
                    }}
                  >
                    <span className={styles.dropdownItemIcon}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="16"
                        height="16"
                      >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </span>
                    Meus Pedidos
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/chat");
                    }}
                  >
                    <span className={styles.dropdownItemIcon}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="16"
                        height="16"
                      >
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                    </span>
                    Mensagens
                  </button>
                  <div className={styles.dropdownDivider} />
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/configuracoes");
                    }}
                  >
                    <span className={styles.dropdownItemIcon}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="16"
                        height="16"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                      </svg>
                    </span>
                    Configurações
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/carteira");
                    }}
                  >
                    <span className={styles.dropdownItemIcon}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="16"
                        height="16"
                      >
                        <rect x="1" y="4" width="22" height="16" rx="2" />
                        <path d="M1 10h22" />
                      </svg>
                    </span>
                    Carteira
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/sobre");
                    }}
                  >
                    <span className={styles.dropdownItemIcon}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="16"
                        height="16"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </span>
                    Sobre a ConectServ
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/ajuda");
                    }}
                  >
                    <span className={styles.dropdownItemIcon}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="16"
                        height="16"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </span>
                    Ajuda e Suporte
                  </button>
                  {user.role === "cliente" && (
                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/tornar-se-prestador");
                      }}
                    >
                      <span className={styles.dropdownItemIcon}>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          width="16"
                          height="16"
                        >
                          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <polyline points="17 11 19 13 23 9" />
                        </svg>
                      </span>
                      ✨ Tornar-se prestador
                    </button>
                  )}
                  {isPrestadorPendente && (
                    <button
                      className={`${styles.dropdownItem} ${styles.dropdownItemDisabled}`}
                      disabled
                    >
                      <span className={styles.dropdownItemIcon}>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          width="16"
                          height="16"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </span>
                      ⏳ Solicitação em análise
                    </button>
                  )}
                  {(isPrestador || isAdmin) && (
                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/minha-agenda");
                      }}
                    >
                      <span className={styles.dropdownItemIcon}>📅</span>
                      Minha Agenda
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button
                        className={styles.dropdownItem}
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/admin");
                        }}
                      >
                        <span className={styles.dropdownItemIcon}>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="16"
                            height="16"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </span>
                        Painel Admin
                      </button>
                      <button
                        className={styles.dropdownItem}
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/cadastrar-servico");
                        }}
                      >
                        <span className={styles.dropdownItemIcon}>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="16"
                            height="16"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </span>
                        Cadastrar Serviço
                      </button>
                    </>
                  )}
                  <div className={styles.dropdownDivider} />
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                    onClick={handleLogout}
                  >
                    <span className={styles.dropdownItemIcon}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="16"
                        height="16"
                      >
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </span>
                    Sair da conta
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
