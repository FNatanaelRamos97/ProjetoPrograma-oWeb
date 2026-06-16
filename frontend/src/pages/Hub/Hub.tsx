import NavBar from '../../components/NavBar/NavBar'
import HeroSection from './components/HeroSection'
import CategoriesSection from './components/CategoriesSection'
import ProfessionalsSection from './components/ProfessionalsSection'
import CTASection from './components/CTASection'
import FooterBenefits from './components/FooterBenefits'
import styles from './Hub.module.css'

export default function Hub() {
  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <NavBar />
      <div className={styles.container}>
        <HeroSection />
        <CategoriesSection />
        <div className={styles.section}>
          <ProfessionalsSection />
          <CTASection />
        </div>
      </div>
      <FooterBenefits />
    </div>
  )
}
