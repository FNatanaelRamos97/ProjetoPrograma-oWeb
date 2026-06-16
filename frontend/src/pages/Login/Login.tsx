import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, loginUser } from "../../../../database/database.ts";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Login.module.css";

type Mode = "login" | "register" | "reset";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [identity, setIdentity] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const showError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await loginUser(email, password);

      if (!result) {
        showError("Email ou senha inválidos");
        return;
      }

      login(result.user, result.token);
      navigate(result.user.role === "admin" ? "/admin" : "/hub");
    } catch {
      showError("Erro ao conectar ao servidor");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      showError("Senhas não conferem");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phone", phone);
    formData.append("identity", identity);

    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      const result = await createUser(formData);

      if (result.error) {
        showError(result.error);
        return;
      }

      if (!result.data) {
        showError("Não foi possível cadastrar o usuário.");
        return;
      }

      setMode("login");
      setPassword("");
      setConfirmPassword("");
      alert("Cadastro realizado. Faça login para continuar.");
    } catch {
      showError("Erro ao cadastrar. Tente novamente.");
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Se houver conta com este email, uma mensagem de redefinição será enviada.");
    setMode("login");
  };

  const hasError = error.length > 0;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    e.currentTarget.style.setProperty("--mouse-x", String(x));
    e.currentTarget.style.setProperty("--mouse-y", String(y));
  }, []);

  return (
    <div className={styles.page} onMouseMove={handleMouseMove}>
      <div className={`${styles.bgCircle} ${styles.bgCircle1}`} />
      <div className={`${styles.bgCircle} ${styles.bgCircle2}`} />
      <div className={`${styles.bgCircle} ${styles.bgCircle3}`} />
      <div className={`${styles.bgCircle} ${styles.bgCircle4}`} />
      <div className={styles.bgGlow} />
      <div className={styles.bgParticles} />

      <div className={`${styles.card} ${shake ? styles.cardShake : ""}`}>
        {error && (
          <p className={styles.error}>
            <span className={styles.errorIcon}>✕</span> {error}
          </p>
        )}

        {mode === "login" && (
          <form className={styles.form} onSubmit={handleLogin}>
            <h1 className={styles.title}>Bem-vindo</h1>

            <input
              className={`${styles.input} ${hasError ? styles.inputError : ""}`}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />

            <input
              className={`${styles.input} ${hasError ? styles.inputError : ""}`}
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />

            <button className={styles.btn} type="submit">
              Entrar
            </button>

            <div className={styles.linkRow}>
              <button type="button" className={styles.linkBtn} onClick={() => setMode("reset")}>
                Esqueceu a senha?
              </button>

              <button type="button" className={styles.linkBtn} onClick={() => setMode("register")}>
                Cadastre-se
              </button>
            </div>
          </form>
        )}

        {mode === "register" && (
          <form className={styles.form} onSubmit={handleRegister}>
            <h1 className={styles.title}>Criar Conta</h1>

            <input className={styles.input} type="text" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />

            <input className={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <input className={styles.input} type="text" placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />

            <input className={styles.input} type="text" placeholder="Identidade" value={identity} onChange={(e) => setIdentity(e.target.value)} />

            <input
              ref={fileInputRef}
              className={styles.input}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setProfileImage(e.target.files?.[0] ?? null)}
            />

            <div className={styles.fieldWrapper}>
              <input
                className={`${styles.input} ${password.length > 0 && password.length < 6 ? styles.inputError : ""}`}
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {password.length > 0 && (
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthBar}>
                    <div
                      className={styles.strengthFill}
                      style={{ width: `${Math.min((password.length / 6) * 100, 100)}%` }}
                    />
                  </div>

                  <span className={password.length >= 6 ? styles.strengthOk : styles.strengthWeak}>
                    {password.length}/6 caracteres
                  </span>
                </div>
              )}
            </div>

            <input
              className={`${styles.input} ${confirmPassword.length > 0 && password !== confirmPassword ? styles.inputError : ""}`}
              type="password"
              placeholder="Confirmar Senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button className={styles.btn} type="submit">
              Cadastrar
            </button>

            <div className={styles.linkRow}>
              <button type="button" className={styles.linkBtn} onClick={() => setMode("login")}>
                Já tem conta? Faça login
              </button>
            </div>
          </form>
        )}

        {mode === "reset" && (
          <form className={styles.form} onSubmit={handleReset}>
            <h1 className={styles.title}>Redefinir Senha</h1>

            <p className={styles.hint}>
              Digite seu email para receber um link de redefinição.
            </p>

            <input className={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <button className={styles.btn} type="submit">
              Enviar Link
            </button>

            <div className={styles.linkRow}>
              <button type="button" className={styles.linkBtn} onClick={() => setMode("login")}>
                Voltar ao login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}