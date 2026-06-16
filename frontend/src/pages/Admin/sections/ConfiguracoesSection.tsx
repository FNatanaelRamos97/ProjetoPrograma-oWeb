import { useState } from 'react'
import styles from './Sections.module.css'

export default function ConfiguracoesSection() {
  const [configTab, setConfigTab] = useState('pagamentos')

  return (
    <div className={styles.sectionContent}>
      <div className={styles.configLayout}>
        <div className={styles.configSidebar}>
          {['pagamentos', 'notificacoes', 'seguranca', 'integracoes', 'geral'].map(tab => (
            <button key={tab} className={`${styles.configTab} ${configTab === tab ? styles.configTabActive : ''}`}
              onClick={() => setConfigTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.configContent}>
          {configTab === 'pagamentos' && (
            <div className={styles.tableCard}>
              <h3 className={styles.tableCardTitle}>Configurações de Pagamento</h3>
              <div className={styles.configItems}>
                <div className={styles.configItem}><span>PIX</span><span className={styles.badgeApproved}>Ativo</span></div>
                <div className={styles.configItem}><span>Cartão de Crédito</span><span className={styles.badgePending}>Em breve</span></div>
                <div className={styles.configItem}><span>Boleto</span><span className={styles.badgePending}>Em breve</span></div>
              </div>
            </div>
          )}
          {configTab === 'notificacoes' && (
            <div className={styles.tableCard}>
              <h3 className={styles.tableCardTitle}>Notificações</h3>
              <p className={styles.emptyText}>Configurações de notificações em desenvolvimento.</p>
            </div>
          )}
          {configTab === 'seguranca' && (
            <div className={styles.tableCard}>
              <h3 className={styles.tableCardTitle}>Segurança</h3>
              <p className={styles.emptyText}>Configurações de segurança em desenvolvimento.</p>
            </div>
          )}
          {configTab === 'integracoes' && (
            <div className={styles.tableCard}>
              <h3 className={styles.tableCardTitle}>Integrações</h3>
              <p className={styles.emptyText}>Integrações em desenvolvimento.</p>
            </div>
          )}
          {configTab === 'geral' && (
            <div className={styles.tableCard}>
              <h3 className={styles.tableCardTitle}>Geral</h3>
              <p className={styles.emptyText}>Configurações gerais em desenvolvimento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
