import { useEffect, useMemo, useState } from "react";
import type { Service } from "../../../types";
import { deleteServiceAdmin, updateService } from "@db/database";
import styles from "./Sections.module.css";

interface Props {
  services: Service[];
}

type EditingService = {
  id: number | string;
  name: string;
  category: string;
  price: string;
  description: string;
};

export default function ProdutosSection({ services }: Props) {
  const [localServices, setLocalServices] = useState<Service[]>(services);
  const [search, setSearch] = useState("");
  const [editingService, setEditingService] = useState<EditingService | null>(null);

  useEffect(() => {
    setLocalServices(services);
  }, [services]);

  const filteredServices = useMemo(() => {
    const searchLower = search.toLowerCase().trim();

    if (!searchLower) {
      return localServices;
    }

    return localServices.filter((service) => {
      return (
        service.name.toLowerCase().includes(searchLower) ||
        service.category.toLowerCase().includes(searchLower)
      );
    });
  }, [localServices, search]);

  const getToken = () => {
    return localStorage.getItem("conectserv_token");
  };

  const handleDelete = async (id: number | string) => {
    const token = getToken();

    if (!token) {
      alert("Token não encontrado. Faça login novamente.");
      return;
    }

    const confirmDelete = window.confirm("Tem certeza que deseja excluir este serviço?");

    if (!confirmDelete) {
      return;
    }

    const ok = await deleteServiceAdmin(id, token);

    if (!ok) {
      alert("Não foi possível excluir o serviço. Verifique o console do navegador.");
      return;
    }

    setLocalServices((prev) =>
      prev.filter((service) => String(service.id) !== String(id))
    );

    alert("Serviço excluído com sucesso.");
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService({
      id: service.id,
      name: service.name,
      category: service.category,
      price: String(service.price),
      description: service.description || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingService(null);
  };

  const handleSaveEdit = async () => {
    const token = getToken();

    if (!token) {
      alert("Token não encontrado. Faça login novamente.");
      return;
    }

    if (!editingService) {
      return;
    }

    const priceAsNumber = Number(editingService.price.replace(",", "."));

    if (!editingService.name.trim()) {
      alert("Informe o nome do serviço.");
      return;
    }

    if (!editingService.category.trim()) {
      alert("Informe a categoria do serviço.");
      return;
    }

    if (Number.isNaN(priceAsNumber) || priceAsNumber < 0) {
      alert("Informe um preço válido.");
      return;
    }

    const updatedService = await updateService(
      editingService.id,
      {
        name: editingService.name.trim(),
        category: editingService.category.trim(),
        price: priceAsNumber,
        description: editingService.description.trim()
      },
      token
    );

    if (!updatedService) {
      alert("Não foi possível editar o serviço. Verifique o console do navegador.");
      return;
    }

    setLocalServices((prev) =>
      prev.map((service) =>
        String(service.id) === String(editingService.id)
          ? updatedService
          : service
      )
    );

    setEditingService(null);

    alert("Serviço atualizado com sucesso.");
  };

  return (
    <div className={styles.sectionContent}>
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h3 className={styles.tableCardTitle}>Serviços Cadastrados</h3>

          <div className={styles.tableFilters}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar serviço..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select className={styles.filterSelect}>
              <option value="todas">Todas as categorias</option>
            </select>
          </div>
        </div>

        {editingService && (
          <div className={styles.editBox}>
            <h4 className={styles.editTitle}>Editar serviço</h4>

            <input
              className={styles.searchInput}
              type="text"
              placeholder="Nome do serviço"
              value={editingService.name}
              onChange={(event) =>
                setEditingService((prev) =>
                  prev ? { ...prev, name: event.target.value } : prev
                )
              }
            />

            <input
              className={styles.searchInput}
              type="text"
              placeholder="Categoria"
              value={editingService.category}
              onChange={(event) =>
                setEditingService((prev) =>
                  prev ? { ...prev, category: event.target.value } : prev
                )
              }
            />

            <input
              className={styles.searchInput}
              type="text"
              placeholder="Preço"
              value={editingService.price}
              onChange={(event) =>
                setEditingService((prev) =>
                  prev ? { ...prev, price: event.target.value } : prev
                )
              }
            />

            <textarea
              className={styles.textArea}
              placeholder="Descrição"
              value={editingService.description}
              onChange={(event) =>
                setEditingService((prev) =>
                  prev ? { ...prev, description: event.target.value } : prev
                )
              }
            />

            <div className={styles.prodActions}>
              <button
                className={styles.smallBtn}
                type="button"
                onClick={handleSaveEdit}
              >
                Salvar
              </button>

              <button
                className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                type="button"
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className={styles.prodGrid}>
          {filteredServices.length === 0 ? (
            <p className={styles.emptyText}>Nenhum serviço cadastrado.</p>
          ) : (
            filteredServices.map((s) => (
              <div key={s.id} className={styles.prodCard}>
                <div className={styles.prodCardTop}>
                  <div className={styles.prodAvatar}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>

                  <div className={styles.prodInfo}>
                    <span className={styles.prodName}>{s.name}</span>
                    <span className={styles.prodCategory}>{s.category}</span>
                  </div>
                </div>

                <div className={styles.prodPrice}>
                  R$ {Number(s.price).toFixed(2).replace(".", ",")}
                </div>

                <div className={styles.prodActions}>
                  <button
                    className={styles.smallBtn}
                    type="button"
                    onClick={() => handleOpenEdit(s)}
                  >
                    Editar
                  </button>

                  <button
                    className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                    type="button"
                    onClick={() => handleDelete(s.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}