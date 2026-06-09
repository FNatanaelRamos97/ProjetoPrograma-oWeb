import { useEffect, useMemo, useState } from "react";
import NavBar from "../../components/NavBar/NavBar";
import {
  listMyUnavailableDates,
  toggleMyUnavailableDate,
  getMyProviderAppointments,
  type ProviderAppointment,
} from "../../../../database/database";
import styles from "../Agenda/Agenda.module.css";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const YEARS = [2026, 2027, 2028, 2029, 2030];

function getCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const prevMonth = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    prevMonth.push({ day: daysInPrev - i, type: "prev" as const });
  }

  const currentMonth = [];

  for (let i = 1; i <= daysInMonth; i++) {
    currentMonth.push({ day: i, type: "current" as const });
  }

  const totalCells =
    Math.ceil((prevMonth.length + currentMonth.length) / 7) * 7;
  const remaining = totalCells - prevMonth.length - currentMonth.length;

  const nextMonth = [];

  for (let i = 1; i <= remaining; i++) {
    nextMonth.push({ day: i, type: "next" as const });
  }

  return [...prevMonth, ...currentMonth, ...nextMonth];
}

function getDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isWeekend(year: number, month: number, day: number) {
  const date = new Date(year, month, day);
  const weekDay = date.getDay();

  return weekDay === 0 || weekDay === 6;
}

export default function AgendaPrestador() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("conectserv_token");

  const grid = useMemo(() => getCalendarGrid(year, month), [year, month]);

  const [providerAppointments, setProviderAppointments] = useState<
    ProviderAppointment[]
  >([]);

  async function loadAgendaData() {
    if (!token) return;

    const [unavailableData, appointmentsData] = await Promise.all([
      listMyUnavailableDates(year, month + 1, token),
      getMyProviderAppointments(token),
    ]);

    setUnavailableDates(unavailableData.map((item) => item.unavailableDate));

    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;

    setProviderAppointments(
      appointmentsData.filter(
        (item) =>
          item.appointmentDate.startsWith(monthPrefix) &&
          item.status !== "cancelado",
      ),
    );
  }

  useEffect(() => {
    loadAgendaData();
  }, [year, month, token]);

  const prevMonth = () => {
    if (month === 0) {
      setYear((current) => current - 1);
      setMonth(11);
      return;
    }

    setMonth((current) => current - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear((current) => current + 1);
      setMonth(0);
      return;
    }

    setMonth((current) => current + 1);
  };

  const handleToggleDate = async (day: number) => {
    setMessage("");

    if (!token) {
      setMessage("Faça login novamente.");
      return;
    }

    if (isWeekend(year, month, day)) {
      setMessage("Finais de semana já ficam indisponíveis automaticamente.");
      return;
    }

    const date = getDateString(year, month, day);

    const result = await toggleMyUnavailableDate(date, token);

    if (!result) {
      setMessage("Não foi possível atualizar a agenda.");
      return;
    }

    await loadAgendaData();

    setMessage(
      result.unavailable
        ? "Data marcada como indisponível."
        : "Data liberada para agendamento.",
    );
  };

  return (
    <div className={styles.page}>
      <NavBar />

      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.serviceInfo}>
            <h1>Minha agenda</h1>
            <p>
              Marque os dias em que não poderá atender. Sábados e domingos ficam
              bloqueados automaticamente.
            </p>
          </div>

          {message && <div className={styles.errorAlert}>{message}</div>}

          <div className={styles.header}>
            <button className={styles.navBtn} type="button" onClick={prevMonth}>
              &lt;
            </button>

            <span className={styles.headerTitle}>
              {MONTHS[month]} {year}
            </span>

            <button className={styles.navBtn} type="button" onClick={nextMonth}>
              &gt;
            </button>
          </div>

          <div className={styles.dropdownRow}>
            <div className={styles.dropdownWrapper}>
              <button
                className={styles.dropdownToggle}
                type="button"
                onClick={() => {
                  setOpenMonth(!openMonth);
                  setOpenYear(false);
                }}
              >
                {MONTHS[month]} <span className={styles.arrow}>&#9662;</span>
              </button>

              {openMonth && (
                <div className={styles.dropdownMenu}>
                  {MONTHS.map((monthName, index) => (
                    <button
                      key={monthName}
                      className={`${styles.dropdownItem} ${index === month ? styles.dropdownItemActive : ""}`}
                      type="button"
                      onClick={() => {
                        setMonth(index);
                        setOpenMonth(false);
                      }}
                    >
                      {monthName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.dropdownWrapper}>
              <button
                className={styles.dropdownToggle}
                type="button"
                onClick={() => {
                  setOpenYear(!openYear);
                  setOpenMonth(false);
                }}
              >
                {year} <span className={styles.arrow}>&#9662;</span>
              </button>

              {openYear && (
                <div className={styles.yearGrid}>
                  {YEARS.map((yearOption) => (
                    <button
                      key={yearOption}
                      className={`${styles.yearItem} ${yearOption === year ? styles.yearItemActive : ""}`}
                      type="button"
                      onClick={() => {
                        setYear(yearOption);
                        setOpenYear(false);
                      }}
                    >
                      {yearOption}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <span key={day} className={styles.weekday}>
                {day}
              </span>
            ))}
          </div>

          <div className={styles.grid}>
            {grid.map((cell, index) => {
              const isCurrent = cell.type === "current";
              const dateString = isCurrent
                ? getDateString(year, month, cell.day)
                : "";
              const weekend = isCurrent
                ? isWeekend(year, month, cell.day)
                : false;
              const unavailable = unavailableDates.includes(dateString);

              const bookedAppointment = providerAppointments.find(
                (item) => item.appointmentDate === dateString,
              );

              const booked = Boolean(bookedAppointment);

              return (
                <button
                  key={index}
                  type="button"
                  className={`
                      ${styles.day}
                      ${!isCurrent ? styles.dayFaded : ""}
                      ${weekend ? styles.dayUnavailable : ""}
                      ${unavailable ? styles.dayUnavailable : ""}
                      ${booked ? styles.dayUnavailable : ""}
                    `}
                  disabled={!isCurrent}
                  onClick={() => {
                    if (!isCurrent) return;

                    if (booked) {
                      setMessage(
                        "Esta data possui serviço contratado e não pode ser liberada manualmente.",
                      );
                      return;
                    }

                    handleToggleDate(cell.day);
                  }}
                  title={
                    booked
                      ? `Serviço contratado: ${bookedAppointment?.serviceName ?? "Serviço"}`
                      : weekend
                        ? "Fim de semana indisponível"
                        : unavailable
                          ? "Prestador indisponível"
                          : "Clique para bloquear esta data"
                  }
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <button
            className={styles.confirmBtn}
            type="button"
            onClick={loadAgendaData}
          >
            Atualizar agenda
          </button>
        </div>
      </div>
      <div className={styles.legend}>
        <span>
          <b className={styles.legendAvailable}></b> Disponível
        </span>
        <span>
          <b className={styles.legendUnavailable}></b> Indisponível
        </span>
      </div>

      <div className={styles.serviceInfo}>
        <h2>Serviços contratados no mês</h2>

        {providerAppointments.length === 0 ? (
          <p>Nenhum serviço contratado neste mês.</p>
        ) : (
          <div>
            {providerAppointments.map((item) => (
              <div key={item.id} className={styles.errorAlert}>
                <strong>{item.appointmentDate}</strong> — {item.serviceName}
                <br />
                Cliente: {item.clientName}
                <br />
                Status: {item.status}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
