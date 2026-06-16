import { useNavigate } from 'react-router-dom'
import styles from './CategoriesSection.module.css'

const categories = [
  { id: 1, name: 'Limpeza', icon: '🧹', startingPrice: 120 },
  { id: 2, name: 'Instalações', icon: '🔧', startingPrice: 180 },
  { id: 3, name: 'Manutenção', icon: '⚙', startingPrice: 150 },
  { id: 4, name: 'Reformas', icon: '🏗️', startingPrice: 500 },
  { id: 5, name: 'Jardinagem', icon: '🌿', startingPrice: 100 },
  { id: 6, name: 'Mudanças', icon: '📦', startingPrice: 250 },
]

export default function CategoriesSection() {
  const navigate = useNavigate()

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Categorias em destaque</h2>
        <button className={styles.viewAll} onClick={() => navigate('/explorar')}>
          Ver todas
        </button>
      </div>
      <div className={styles.grid}>
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            className={styles.card}
            style={{ animationDelay: `${i * 0.06}s` }}
            onClick={() => navigate(`/explorar?cat=${cat.name.toLowerCase()}`)}
          >
            <span className={styles.icon}>{cat.icon}</span>
            <div className={styles.info}>
              <span className={styles.name}>{cat.name}</span>
              <span className={styles.price}>a partir de R$ {cat.startingPrice}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
