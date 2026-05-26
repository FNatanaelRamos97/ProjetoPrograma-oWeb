import NavBar from '../../components/NavBar/NavBar'
import styles from './QuemSomos.module.css'

export default function QuemSomos() {
  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <h1 className={styles.logoName}>ConectServ</h1>
        </div>
        <div className={styles.headerSection}>
          <h1 className={styles.headerTitle}>Nossa História</h1>
        </div>
        <div className={styles.timeline}>
          <div className={styles.block}>
            <div className={styles.indicator}><span className={styles.indicatorNumber}>01</span></div>
            <div className={styles.textContent}>
              <p className={styles.paragraph}>
                O ConectServ nasceu da ideia de conectar pessoas que precisam de serviços
                com profissionais qualificados de diversas áreas. Sabemos como pode ser
                difícil encontrar um profissional de confiança para serviços domésticos,
                consultorias, aulas, reformas e muito mais. Foi pensando nisso que criamos
                uma plataforma simples, segura e eficiente.
              </p>
              <p className={styles.paragraph}>
                Hoje, somos um hub completo de prestação de serviços, onde profissionais
                autônomos, microempreendedores e pequenas empresas podem oferecer seu
                trabalho e alcançar novos clientes. Valorizamos a qualidade, a
                transparência e a experiência positiva em cada contratação.
              </p>
            </div>
          </div>
          <div className={styles.block}>
            <div className={styles.indicator}><span className={styles.indicatorNumber}>02</span></div>
            <div className={styles.textContent}>
              <p className={styles.paragraph}>
                Acreditamos que cada profissional tem um talento único e merece ser
                reconhecido. Por isso, selecionamos cuidadosamente os prestadores que
                fazem parte da nossa plataforma, garantindo excelência em cada serviço
                prestado. Do eletricista ao consultor financeiro, passando por professores
                particulares e diaristas, oferecemos uma variedade de categorias para
                atender todas as necessidades do dia a dia.
              </p>
              <p className={styles.paragraph}>
                Nossa missão é democratizar o acesso a serviços de qualidade, conectando
                pessoas que valorizam o bom trabalho com profissionais talentosos e
                dedicados. Acreditamos que todos merecem serviços excelentes a preços
                justos, e trabalhamos todos os dias para tornar isso uma realidade.
              </p>
            </div>
          </div>
          <div className={styles.block}>
            <div className={styles.indicator}><span className={styles.indicatorNumber}>03</span></div>
            <div className={styles.textContent}>
              <p className={styles.paragraph}>
                Transparência, qualidade e respeito são os pilares que guiam cada interação
                em nossa plataforma. Desde o primeiro contato até a finalização do serviço,
                buscamos proporcionar uma experiência segura, prática e agradável para
                clientes e profissionais. Junte-se a nós e faça parte desta comunidade que
                valoriza o trabalho bem feito e a confiança entre pessoas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
