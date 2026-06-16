import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Image, Check } from "lucide-react";
import { createService } from "@db/database";
import { useAuth } from "../../contexts/AuthContext";
import NavBar from "../../components/NavBar/NavBar";
import styles from "./CadastroServico.module.css";

const CATEGORIES = [
  "Consultoria",
  "Aulas e Cursos",
  "Design Gráfico",
  "Desenvolvimento Web",
  "Programação e TI",
  "Marketing Digital",
  "Redes Sociais",
  "Edição de Vídeo",
  "Fotografia",
  "Música e Áudio",
  "Tradução e Conteúdo",
  "Assistente Virtual",
  "Suporte Técnico",
  "Manutenção e Reparos",
  "Limpeza e Organização",
  "Reformas e Construção",
  "Jardinagem e Paisagismo",
  "Saúde e Bem-Estar",
  "Beleza e Estética",
  "Pet Care",
  "Eventos e Cerimônias",
  "Transporte e Mudanças",
  "Entregas e Frete",
  "Advocacia e Jurídico",
  "Finanças e Contabilidade",
  "Administração",
  "Outra",
];

const SUBCATEGORIES: Record<string, string[]> = {
  Consultoria: [
    "Financeira",
    "RH",
    "Marketing",
    "TI",
    "Empresarial",
    "Vendas",
    "Estratégica",
    "Outra",
  ],
  "Aulas e Cursos": [
    "Particulares",
    "Online",
    "Presencial",
    "Reforço Escolar",
    "Idiomas",
    "Música",
    "Dança",
    "Esportes",
    "Outra",
  ],
  "Design Gráfico": [
    "Logotipos",
    "Identidade Visual",
    "Social Media",
    "Apresentações",
    "Mockups",
    " banners",
    "Flyers",
    "Embalagens",
    "Outra",
  ],
  "Desenvolvimento Web": [
    "Sites",
    "Lojas Virtuais",
    "Landing Pages",
    "Portfólios",
    "Aplicações Web",
    "Manutenção",
    "Hospedagem",
    "Outra",
  ],
  "Programação e TI": [
    "Desenvolvimento de Software",
    "Suporte Técnico",
    "Banco de Dados",
    "Automação",
    "API",
    "Segurança",
    "Cloud",
    "Outra",
  ],
  "Marketing Digital": [
    "Gestão de Tráfego",
    "SEO",
    "Email Marketing",
    "Inbound",
    "Outbound",
    "Anúncios",
    "Analytics",
    "Outra",
  ],
  "Redes Sociais": [
    "Criação de Conteúdo",
    "Gestão de Perfis",
    "Campanhas Pagas",
    "Design para Redes",
    "Reels",
    "Copy para Redes",
    "Outra",
  ],
  "Edição de Vídeo": [
    "YouTube",
    "Redes Sociais",
    "Vídeos Institucionais",
    " Edição",
    "Animação",
    "Motion Graphics",
    "Outra",
  ],
  Fotografia: [
    "Ensaios",
    "Eventos",
    "Produto",
    "Aérea",
    "Edição de Fotos",
    "Book",
    "Outra",
  ],
  "Música e Áudio": [
    "Produção Musical",
    "Mixagem e Masterização",
    "Edição de Áudio",
    "Podcast",
    "Trilha Sonora",
    "Locução",
    "Outra",
  ],
  "Tradução e Conteúdo": [
    "Textos",
    "Tradução",
    "Revisão",
    "Copywriting",
    "Redação Técnica",
    "Ghostwriting",
    "Outra",
  ],
  "Assistente Virtual": [
    "Administrativo",
    "Agendamento",
    "Atendimento ao Cliente",
    "Gestão de E-mails",
    "Pesquisas",
    "Outra",
  ],
  "Suporte Técnico": [
    "Hardware",
    "Software",
    "Redes",
    "Configuração",
    "Manutenção de Computadores",
    "Outra",
  ],
  "Manutenção e Reparos": [
    "Elétrica",
    "Hidráulica",
    "Pintura",
    "Montagem",
    "Ar Condicionado",
    "Marcenaria",
    "Outra",
  ],
  "Limpeza e Organização": [
    "Residencial",
    "Comercial",
    "Pós-Obra",
    "Organização",
    "Office Cleaning",
    "Outra",
  ],
  "Reformas e Construção": [
    "Projetos",
    "Execução",
    "Revestimentos",
    "Drywall",
    "Pisos",
    "Telhado",
    "Outra",
  ],
  "Jardinagem e Paisagismo": [
    "Manutenção",
    "Projetos",
    "Corte",
    "Plantio",
    "Irrigação",
    "Podas",
    "Outra",
  ],
  "Saúde e Bem-Estar": [
    "Personal Trainer",
    "Nutrição",
    "Psicologia",
    "Fisioterapia",
    "Terapias",
    "Massoterapia",
    "Outra",
  ],
  "Beleza e Estética": [
    "Cabelo",
    "Unhas",
    "Maquiagem",
    "Depilação",
    "Massagem",
    "Design de Sobrancelhas",
    "Outra",
  ],
  "Pet Care": [
    "Banho e Tosa",
    "Passeio",
    "Hotel",
    "Adestramento",
    "Veterinário",
    "Pet Sitter",
    "Outra",
  ],
  "Eventos e Cerimônias": [
    "Buffet",
    "Decoração",
    "DJ",
    "Cerimonial",
    "Iluminação",
    "Fotografia de Eventos",
    "Outra",
  ],
  "Transporte e Mudanças": [
    "Mudanças",
    "Transporte de Veículos",
    "Entregas Grandes",
    "Fretes",
    "Outra",
  ],
  "Entregas e Frete": [
    "Delivery",
    "Encomendas",
    "Express",
    "Logística",
    "Roteirização",
    "Outra",
  ],
  "Advocacia e Jurídico": [
    "Trabalhista",
    "Civil",
    "Criminal",
    "Empresarial",
    "Contratos",
    "Digital",
    "Outra",
  ],
  "Finanças e Contabilidade": [
    "Contabilidade",
    "Declaração de Imposto",
    "Planejamento Financeiro",
    "Empréstimos",
    "Consultoria Financeira",
    "Outra",
  ],
  Administração: [
    "Tarefas",
    "BP",
    "Contas a Pagar/Receber",
    "Secretaria Executiva",
    "Burocracia",
    "Outra",
  ],
  Outra: ["Geral"],
};

export default function CadastroServico() {
  const navigate = useNavigate();
  const { user, isPrestador, isAdmin, token } = useAuth();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [price, setPrice] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user || (!isPrestador && !isAdmin)) {
    return (
      <div className={styles.page}>
        <NavBar />
        <div className={styles.container}>
          <div className={styles.errorBanner}>
            Apenas prestadores de serviço e administradores podem cadastrar
            serviços.
          </div>
        </div>
      </div>
    );
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory("");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - imageFiles.length;
    const toAdd = files.slice(0, remaining);

    for (const file of toAdd) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`A imagem "${file.name}" deve ter no máximo 5MB.`);
        continue;
      }
      imageFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    }
    setImageFiles([...imageFiles]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Faça login novamente.");
      return;
    }

    if (!name || !price) {
      setError("Nome e preço são obrigatórios.");
      return;
    }

    if (!category) {
      setError("Selecione uma categoria.");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("subcategory", subcategory);
    formData.append("estimatedTime", estimatedTime);
    formData.append("location", localizacao);

    for (const file of imageFiles) {
      formData.append("images", file);
    }

    const service = await createService(formData, token);

    if (!service) {
      setError("Não foi possível cadastrar o serviço.");
      return;
    }

    navigate("/produtos");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.container}>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <span className={styles.formBadge}>📋 Publicar serviço</span>

          <div className={styles.header}>
            <h1 className={styles.title}>Cadastrar Serviço</h1>
            <p className={styles.subtitle}>
              Preencha os dados para anunciar seu serviço na plataforma.
            </p>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>
                Nome do Serviço<span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Consultoria Financeira"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Categoria</label>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.select}
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.selectArrow} size={18} />
              </div>
            </div>

            {category && (
              <div className={styles.field}>
                <label className={styles.label}>Subcategoria</label>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.select}
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {(SUBCATEGORIES[category] || []).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectArrow} size={18} />
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>
                Preço (R$)<span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="89,90"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Tempo estimado</label>
              <input
                className={styles.input}
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="Ex: 2 horas, 1 semana"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Localização</label>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.select}
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                >
                  <option value="">Selecione um estado</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
                <ChevronDown className={styles.selectArrow} size={18} />
              </div>
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>
                Imagens do serviço (opcional, até 3)
              </label>
              {imagePreviews.length > 0 && (
                <div className={styles.previewGrid}>
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className={styles.uploadPreview}>
                      <img
                        className={styles.previewThumb}
                        src={preview}
                        alt={`Preview ${i + 1}`}
                      />
                      <div className={styles.uploadInfo}>
                        <div className={styles.uploadFileName}>
                          {imageFiles[i]?.name}
                        </div>
                        <div className={styles.uploadFileSize}>
                          {imageFiles[i] ? formatFileSize(imageFiles[i].size) : ""}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => handleRemoveImage(i)}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {imageFiles.length < 3 && (
                <div
                  className={styles.uploadArea}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className={styles.uploadIcon} size={32} />
                  <span className={styles.uploadTitle}>
                    {imageFiles.length === 0
                      ? "Adicione imagens do seu serviço"
                      : `Adicione mais (${3 - imageFiles.length} restantes)`}
                  </span>
                  <span className={styles.uploadHint}>PNG, JPG até 5MB cada</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className={styles.uploadHidden}
                onChange={handleImageSelect}
                multiple
              />
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>Descrição completa</label>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva seu serviço com detalhes: o que está incluso, como funciona, quais são os diferenciais..."
              />
            </div>
          </div>

          <div className={styles.tipsCard}>
            <div className={styles.tipsTitle}>Dicas para um bom anúncio</div>
            <div className={styles.tipsList}>
              <span className={styles.tipItem}>
                <Check className={styles.tipIcon} size={16} />
                Use fotos reais
              </span>
              <span className={styles.tipItem}>
                <Check className={styles.tipIcon} size={16} />
                Informe prazo estimado
              </span>
              <span className={styles.tipItem}>
                <Check className={styles.tipIcon} size={16} />
                Descreva o que está incluso
              </span>
              <span className={styles.tipItem}>
                <Check className={styles.tipIcon} size={16} />
                Escolha a categoria correta
              </span>
            </div>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => navigate("/produtos")}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Cadastrar Serviço
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
