import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/NavBar/NavBar'
import styles from './Agenda.module.css'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]

function getCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const prevMonth = []
  for (let i = firstDay - 1; i >= 0; i--) {
    prevMonth.push({ day: daysInPrev - i, type: 'prev' as const })
  }

  const currentMonth = []
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonth.push({ day: i, type: 'current' as const })
  }

  const totalCells = Math.ceil((prevMonth.length + currentMonth.length) / 7) * 7
  const nextMonth = []
  const remaining = totalCells - prevMonth.length - currentMonth.length
  for (let i = 1; i <= remaining; i++) {
    nextMonth.push({ day: i, type: 'next' as const })
  }

  return [...prevMonth, ...currentMonth, ...nextMonth]
}

export default function Agenda() {
  const navigate = useNavigate()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<number | null>(null)
  const [openMonth, setOpenMonth] = useState(false)
  const [openYear, setOpenYear] = useState(false)

  const grid = getCalendarGrid(year, month)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelected(null)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  const selectMonth = (m: number) => {
    setMonth(m)
    setOpenMonth(false)
    setSelected(null)
  }

  const selectYear = (y: number) => {
    setYear(y)
    setOpenYear(false)
    setSelected(null)
  }

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.header}>
            <button className={styles.navBtn} onClick={prevMonth}>&lt;</button>
            <span className={styles.headerTitle}>{MONTHS[month]} {year}</span>
            <button className={styles.navBtn} onClick={nextMonth}>&gt;</button>
          </div>

          <div className={styles.dropdownRow}>
            <div className={styles.dropdownWrapper}>
              <button className={styles.dropdownToggle} onClick={() => { setOpenMonth(!openMonth); setOpenYear(false) }}>
                {MONTHS[month]} <span className={styles.arrow}>&#9662;</span>
              </button>
              {openMonth && (
                <div className={styles.dropdownMenu}>
                  {MONTHS.map((m, i) => (
                    <button
                      key={i}
                      className={`${styles.dropdownItem} ${i === month ? styles.dropdownItemActive : ''}`}
                      onClick={() => selectMonth(i)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.dropdownWrapper}>
              <button className={styles.dropdownToggle} onClick={() => { setOpenYear(!openYear); setOpenMonth(false) }}>
                {year} <span className={styles.arrow}>&#9662;</span>
              </button>
              {openYear && (
                <div className={styles.yearGrid}>
                  {YEARS.map(y => (
                    <button
                      key={y}
                      className={`${styles.yearItem} ${y === year ? styles.yearItemActive : ''}`}
                      onClick={() => selectYear(y)}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.weekdayRow}>
            {WEEKDAYS.map(d => (
              <span key={d} className={styles.weekday}>{d}</span>
            ))}
          </div>

          <div className={styles.grid}>
            {grid.map((cell, i) => {
              const isCurrent = cell.type === 'current'
              const isSelected = isCurrent && selected === cell.day
              const isToday = isCurrent && cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              return (
                <div
                  key={i}
                  className={`${styles.day} ${cell.type === 'prev' || cell.type === 'next' ? styles.dayFaded : ''} ${isSelected ? styles.daySelected : ''} ${isToday ? styles.dayToday : ''}`}
                  onClick={() => isCurrent && setSelected(selected === cell.day ? null : cell.day)}
                >
                  {cell.day}
                </div>
              )
            })}
          </div>

          <button
            className={styles.confirmBtn}
            disabled={selected === null}
            onClick={() => navigate('/pagamento')}
          >
            Confirmar Agendamento
          </button>
        </div>
      </div>
    </div>
  )
}
