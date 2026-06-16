import { useState } from 'react'
import styles from './Sections.module.css'

export default function RelatoriosSection() {
  const [selectedReportType, setSelectedReportType] = useState('vendas')

  return (
    <div className={styles.sectionContent}>
      <div className={styles.reportTabs}>
        {['vendas', 'financeiro', 'clientes', 'agendamentos'].map(tab => (
          <button key={tab} className={`${styles.reportTab} ${selectedReportType === tab ? styles.reportTabActive : ''}`}
            onClick={() => setSelectedReportType(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h3 className={styles.tableCardTitle}>Configurar Relatório: {selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)}</h3>
          <button className={styles.exportBtn}>Exportar</button>
        </div>
        <div className={styles.reportBuilder}>
          <div className={styles.reportField}>
            <label>Período</label>
            <div className={styles.reportFieldRow}>
              <input type="date" className={styles.filterSelect} />
              <span>até</span>
              <input type="date" className={styles.filterSelect} />
            </div>
          </div>
          <div className={styles.reportField}>
            <label>Formato</label>
            <select className={styles.filterSelect}>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
            </select>
          </div>
          <button className={styles.approveBtn}>Gerar Relatório</button>
        </div>
      </div>
    </div>
  )
}
