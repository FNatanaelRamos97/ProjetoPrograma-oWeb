import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import NavBar from '../../components/NavBar/NavBar'
import { createAppointment, getProviderAvailability, getServiceById } from '../../../../database/database.ts'
import { useAuth } from '../../contexts/AuthContext'
import type { AvailabilityDay } from '../../types'
import styles from './Agenda.module.css'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const YEARS = [2026, 2027, 2028, 2029, 2030]

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
  const location = useLocation()
  const params = useParams()
  const { token } = useAuth()

  const today = new Date()

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [openMonth, setOpenMonth] = useState(false)
  const [openYear, setOpenYear] = useState(false)
  const [availability, setAvailability] = useState<AvailabilityDay[]>([])
  const [providerId, setProviderId] = useState<number | null>(location.state?.providerId ?? null)
  const [serviceName, setServiceName] = useState<string>(location.state?.serviceName ?? '')
  const [providerName, setProviderName] = useState<string>(location.state?.providerName ?? '')
  const [error, setError] = useState('')

  const serviceId = Number(params.serviceId || location.state?.serviceId)

  useEffect(() => {
    async function loadService() {
      if (!serviceId) return

      const service = await getServiceById(serviceId)

      if (service) {
        setProviderId(service.provider_id)
        setServiceName(service.name)
        setProviderName(service.provider_name)
      }
    }

    loadService()
  }, [serviceId])

  useEffect(() => {
    async function loadAvailability() {
      if (!providerId) return

      const data = await getProviderAvailability(providerId, year, month + 1)
      setAvailability(data)
    }

    loadAvailability()
  }, [providerId, year, month])

  const grid = getCalendarGrid(year, month)

  const prevMonth = () => {
    if (month === 0) {
      setYear(y => y - 1)
      setMonth(11)
    } else {
      setMonth(m => m - 1)
    }

    setSelectedDate(null)
  }

  const nextMonth = () => {
    if (month === 11) {
      setYear(y => y + 1)
      setMonth(0)
    } else {
      setMonth(m => m + 1)
    }

    setSelectedDate(null)
  }

  const selectMonth = (m: number) => {
    setMonth(m)
    setOpenMonth(false)
    setSelectedDate(null)
  }

  const selectYear = (y: number) => {
    setYear(y)
    setOpenYear(false)
    setSelectedDate(null)
  }

  const getDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isAvailable = (day: number) => {
    const date = getDateString(day)
    return availability.find(item => item.date === date)?.available ?? false
  }

  const handleConfirm = async () => {
    setError('')

    if (!token) {
      setError('Faça login para agendar.')
      return
    }

    if (!selectedDate || !providerId || !serviceId) {
      setError('Selecione uma data disponível.')
      return
    }

    const appointment = await createAppointment(
      {
        serviceId,
        providerId,
        appointmentDate: selectedDate
      },
      token
    )

    if (!appointment) {
      setError('Essa data não está mais disponível.')
      return
    }

    navigate('/pagamento', {
      state: {
        serviceId,
        providerId,
        providerName,
        serviceName,
        appointmentDate: selectedDate,
        appointmentId: appointment.id
      }
    })
  }

  return (
    <div className={styles.page}>
      <NavBar />

      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.serviceInfo}>
            <h1>Agenda do prestador</h1>
            <p>{serviceName} — {providerName}</p>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

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
              const available = isCurrent ? isAvailable(cell.day) : false
              const dateString = isCurrent ? getDateString(cell.day) : ''
              const isSelected = isCurrent && selectedDate === dateString
              const isToday =
                isCurrent &&
                cell.day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()

              return (
                <div
                  key={i}
                  className={`
                    ${styles.day}
                    ${cell.type === 'prev' || cell.type === 'next' ? styles.dayFaded : ''}
                    ${isSelected ? styles.daySelected : ''}
                    ${isToday ? styles.dayToday : ''}
                    ${isCurrent && !available ? styles.dayUnavailable : ''}
                    ${isCurrent && available ? styles.dayAvailable : ''}
                  `}
                  onClick={() => {
                    if (isCurrent && available) {
                      setSelectedDate(selectedDate === dateString ? null : dateString)
                    }
                  }}
                >
                  {cell.day}
                </div>
              )
            })}
          </div>

          <div className={styles.legend}>
            <span><b className={styles.legendAvailable}></b> Disponível</span>
            <span><b className={styles.legendUnavailable}></b> Indisponível</span>
          </div>

          <button
            className={styles.confirmBtn}
            disabled={selectedDate === null}
            onClick={handleConfirm}
          >
            Confirmar Agendamento
          </button>
        </div>
      </div>
    </div>
  )
}