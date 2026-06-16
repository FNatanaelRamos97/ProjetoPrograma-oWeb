import { useEffect, useMemo, useState } from "react";
import NavBar from "../../components/NavBar/NavBar";
import {
  listMyUnavailableDates,
  toggleMyUnavailableDate,
  getMyProviderAppointments,
  getMyAvailabilitySchedule,
  updateMyAvailabilitySchedule,
  getMyAvailabilityOverrides,
  getMyBlockedSlots,
  blockTimeSlot,
  unblockTimeSlot,
  type ProviderAppointment,
  type AvailabilityScheduleEntry,
  type BlockedSlot,
} from "../../../../database/database";
import styles from "../Agenda/Agenda.module.css";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];


const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
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

  const totalCells = Math.ceil((prevMonth.length + currentMonth.length) / 7) * 7;
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

const DEFAULT_START = "08:00";
const DEFAULT_END = "18:00";

export default function AgendaPrestador() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const token = localStorage.getItem("conectserv_token");

  const grid = useMemo(() => getCalendarGrid(year, month), [year, month]);

  const [providerAppointments, setProviderAppointments] = useState<ProviderAppointment[]>([]);

  // Schedule management states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleEntries, setScheduleEntries] = useState<AvailabilityScheduleEntry[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Slot management states
  const [selectedSlotDate, setSelectedSlotDate] = useState<string | null>(null);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [overrides, setOverrides] = useState<Map<string, { startTime: string; endTime: string; slotDuration: number }>>(new Map());

  // Selection mode
  const [selectMode, setSelectMode] = useState<"day" | "week" | "month">("day");

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

  async function loadAvailabilityExtras() {
    if (!token) return;

    const [overridesData, blockedData] = await Promise.all([
      getMyAvailabilityOverrides(year, month + 1, token),
      getMyBlockedSlots(token),
    ]);

    const overridesMap = new Map<string, { startTime: string; endTime: string; slotDuration: number }>();
    for (const ov of overridesData) {
      overridesMap.set(ov.specificDate, { startTime: ov.startTime, endTime: ov.endTime, slotDuration: ov.slotDuration });
    }
    setOverrides(overridesMap);
    setBlockedSlots(blockedData);
  }

  async function loadScheduleEntries() {
    if (!token) return;
    setLoadingSchedule(true);

    const entries = await getMyAvailabilitySchedule(token);

    if (entries.length === 0) {
      setScheduleEntries(
        Array.from({ length: 7 }, (_, i) => ({
          dayOfWeek: i,
          startTime: DEFAULT_START,
          endTime: DEFAULT_END,
          slotDuration: 60,
        })),
      );
    } else {
      setScheduleEntries(entries);
    }

    setLoadingSchedule(false);
  }

  useEffect(() => {
    loadAgendaData();
    loadAvailabilityExtras();
    loadScheduleEntries();
  }, [year, month, token]);

  const handleOpenScheduleModal = () => {
    loadScheduleEntries();
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async () => {
    if (!token) return;

    const ok = await updateMyAvailabilitySchedule(scheduleEntries, token);

    if (ok) {
      setMessage("Horários salvos com sucesso!");
      setMessageType("success");
    } else {
      setMessage("Erro ao salvar horários.");
      setMessageType("error");
    }

    setShowScheduleModal(false);
    loadAvailabilityExtras();
    loadScheduleEntries();
  };

  const handleToggleDate = async (day: number) => {
    setMessage("");
    setMessageType("success");

    if (!token) {
      setMessage("Faça login novamente.");
      setMessageType("error");
      return;
    }

    const date = getDateString(year, month, day);

    const result = await toggleMyUnavailableDate(date, token);

    if (!result) {
      setMessage("Não foi possível atualizar a agenda.");
      setMessageType("error");
      return;
    }

    await loadAgendaData();

    setMessage(
      result.unavailable
        ? "Data marcada como indisponível."
        : "Data liberada para agendamento.",
    );
  };

  const handleDayClick = async (day: number, isCurrent: boolean, dateString: string) => {
    if (!isCurrent || !token) return;

    const bookedAppointment = providerAppointments.find(
      (item) => item.appointmentDate === dateString,
    );

    if (bookedAppointment) {
      setMessage("Esta data possui serviço contratado e não pode ser alterada.");
      setMessageType("error");
      return;
    }

    if (selectMode === "day") {
      const isUnavailable = unavailableDates.includes(dateString);

      if (isUnavailable) {
        await handleToggleDate(day);
      } else {
        if (selectedSlotDate === dateString) {
          setSelectedSlotDate(null);
        } else {
          setSelectedSlotDate(dateString);
        }
      }
    } else {
      const datesToToggle: string[] = [];
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      if (selectMode === "week") {
        const clickedDate = new Date(year, month, day);
        const weekStart = clickedDate.getDate() - clickedDate.getDay();
        for (let d = 0; d < 7; d++) {
          const dNum = weekStart + d;
          if (dNum >= 1 && dNum <= daysInMonth) {
            datesToToggle.push(getDateString(year, month, dNum));
          }
        }
      } else {
        for (let d = 1; d <= daysInMonth; d++) {
          datesToToggle.push(getDateString(year, month, d));
        }
      }

      let successCount = 0;
      for (const d of datesToToggle) {
        const isUnavailable = unavailableDates.includes(d);
        if (isUnavailable) {
          const r = await toggleMyUnavailableDate(d, token);
          if (r) successCount++;
        } else {
          const r = await toggleMyUnavailableDate(d, token);
          if (r) successCount++;
        }
      }

      await loadAgendaData();

      setMessage(
        `${successCount} datas atualizadas na semana/mês selecionado.`,
      );
      setMessageType("success");
    }
  };

  const handleBlockSlot = async (date: string, startTime: string, endTime: string) => {
    if (!token) return;

    const result = await blockTimeSlot({ unavailableDate: date, startTime, endTime }, token);

    if (result) {
      setBlockedSlots((prev) => [...prev, result]);
    }
  };

  const handleUnblockSlot = async (id: number) => {
    if (!token) return;

    const ok = await unblockTimeSlot(id, token);

    if (ok) {
      setBlockedSlots((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const isSlotBlocked = (date: string, time: string) => {
    return blockedSlots.some(
      (bs) => bs.unavailableDate === date && bs.startTime === time,
    );
  };

  const getSlotsForDate = (dateString: string) => {
    const [y, m, d] = dateString.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const weekDay = dateObj.getDay();

    const override = overrides.get(dateString);
    const entry = scheduleEntries.find((e) => e.dayOfWeek === weekDay);

    if (!entry && !override) return [];

    const { startTime, endTime, slotDuration } = override ?? entry!;

    const slots: { time: string; endTime: string; duration: number }[] = [];
    let current = parseTime(startTime);
    const end = parseTime(endTime);

    while (current + slotDuration <= end) {
      const startStr = `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`;
      current += slotDuration;
      const endStr = `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`;
      slots.push({ time: startStr, endTime: endStr, duration: slotDuration });
    }

    return slots;
  };

  const hasAvailableSlots = (dateString: string) => {
    const slots = getSlotsForDate(dateString);
    if (slots.length === 0) return false;

    const dateBlockedSlots = blockedSlots.filter(
      (bs) => bs.unavailableDate === dateString,
    );
    const dateAppointments = providerAppointments.filter(
      (apt) => apt.appointmentDate === dateString && apt.status !== "cancelado",
    );

    return slots.some((slot) => {
      const blocked = dateBlockedSlots.some((bs) => bs.startTime === slot.time);
      const booked = dateAppointments.some(
        (apt) => apt.appointmentTime === slot.time,
      );
      return !blocked && !booked;
    });
  };

  const handleEntryChange = (dayOfWeek: number, field: string, value: string | number) => {
    setScheduleEntries((prev) =>
      prev.map((e) =>
        e.dayOfWeek === dayOfWeek ? { ...e, [field]: value } : e,
      ),
    );
  };

  const toggleDayActive = (dayOfWeek: number) => {
    setScheduleEntries((prev) => {
      const exists = prev.find((e) => e.dayOfWeek === dayOfWeek);
      if (exists) {
        return prev.filter((e) => e.dayOfWeek !== dayOfWeek);
      }
      return [
        ...prev,
        { dayOfWeek, startTime: DEFAULT_START, endTime: DEFAULT_END, slotDuration: 60 },
      ];
    });
  };

  const isDayActive = (dayOfWeek: number) => {
    return scheduleEntries.some((e) => e.dayOfWeek === dayOfWeek);
  };

  const prevMonth = () => {
    if (month === 0) {
      setYear((current) => current - 1);
      setMonth(11);
    } else {
      setMonth((current) => current - 1);
    }
    setSelectedSlotDate(null);
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear((current) => current + 1);
      setMonth(0);
    } else {
      setMonth((current) => current + 1);
    }
    setSelectedSlotDate(null);
  };

  return (
    <div className={styles.page}>
      <NavBar />

      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.serviceInfo}>
            <h1>Minha agenda</h1>
            <p>
              Marque os dias em que não poderá atender. Configure seus horários disponíveis.
            </p>
          </div>

          {message && (
            <div className={`${styles.errorAlert} ${messageType === "success" ? styles.successAlert : ""}`}>
              {message}
            </div>
          )}

          <div className={styles.scheduleActions}>
            <button
              className={styles.scheduleBtn}
              type="button"
              onClick={handleOpenScheduleModal}
            >
              Gerenciar Horários
            </button>

            <div className={styles.selectModeRow}>
              <span className={styles.selectModeLabel}>Selecionar:</span>
              {(["day", "week", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`${styles.modeBtn} ${selectMode === mode ? styles.modeBtnActive : ""}`}
                  onClick={() => setSelectMode(mode)}
                >
                  {mode === "day" ? "Dia" : mode === "week" ? "Semana" : "Mês"}
                </button>
              ))}
            </div>
          </div>

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
              const dateString = isCurrent ? getDateString(year, month, cell.day) : "";
              const unavailable = isCurrent && unavailableDates.includes(dateString);
              const bookedAppointment = providerAppointments.find(
                (item) => item.appointmentDate === dateString,
              );
              const booked = Boolean(bookedAppointment);
              const hasOverride = isCurrent && overrides.has(dateString);
              const isSelectedForSlots = selectedSlotDate === dateString;
              const noSlots = isCurrent && !unavailable && !booked && !hasAvailableSlots(dateString);

              const isDisabled = !isCurrent || booked || noSlots;

              return (
                <button
                  key={index}
                  type="button"
                  className={`
                    ${styles.day}
                    ${!isCurrent ? styles.dayFaded : ""}
                    ${unavailable ? styles.dayUnavailable : ""}
                    ${booked ? styles.dayUnavailable : ""}
                    ${noSlots ? styles.dayUnavailable : ""}
                    ${isSelectedForSlots ? styles.daySelected : ""}
                    ${hasOverride ? styles.dayToday : ""}
                  `}
                  disabled={isDisabled}
                  onClick={() => handleDayClick(cell.day, isCurrent, dateString)}
                  title={
                    booked
                      ? `Serviço contratado: ${bookedAppointment?.serviceName ?? "Serviço"}`
                      : unavailable
                        ? "Indisponível (clique para liberar)"
                        : noSlots
                          ? "Todos os horários bloqueados"
                          : hasOverride
                            ? "Horário personalizado definido"
                            : "Clique para gerenciar"
                  }
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {selectedSlotDate && (
            <div className={styles.slotDropdown}>
              <p className={styles.slotTitle}>
                Slots para {selectedSlotDate}
                {overrides.has(selectedSlotDate) && (
                  <span className={styles.overrideBadge}> Horário personalizado</span>
                )}
              </p>
              <div className={styles.slotGrid}>
                {getSlotsForDate(selectedSlotDate).map((slot) => {
                  const blocked = isSlotBlocked(selectedSlotDate, slot.time);
                  const blockedId = blockedSlots.find(
                    (bs) =>
                      bs.unavailableDate === selectedSlotDate &&
                      bs.startTime === slot.time,
                  )?.id;

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      className={`${styles.slotItem} ${blocked ? styles.slotUnavailable : styles.slotAvailable}`}
                      onClick={() => {
                        if (blocked && blockedId) {
                          handleUnblockSlot(blockedId);
                        } else if (!blocked) {
                          handleBlockSlot(selectedSlotDate, slot.time, slot.endTime);
                        }
                      }}
                    >
                      {slot.time} - {slot.endTime}
                      {blocked ? " 🔒" : " ✓"}
                    </button>
                  );
                })}
                {getSlotsForDate(selectedSlotDate).length === 0 && (
                  <p className={styles.emptyMessage}>
                    Nenhum horário configurado para este dia.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className={styles.legend}>
            <span>
              <b className={styles.legendAvailable}></b> Disponível
            </span>
            <span>
              <b className={styles.legendUnavailable}></b> Indisponível
            </span>
          </div>

          <button
            className={styles.confirmBtn}
            type="button"
            onClick={loadAgendaData}
          >
            Atualizar agenda
          </button>

          <div className={styles.servicesSection}>
            <h2>Serviços contratados no mês</h2>

            {providerAppointments.length === 0 ? (
              <p className={styles.emptyMessage}>Nenhum serviço contratado neste mês.</p>
            ) : (
              <div className={styles.appointmentList}>
                {providerAppointments.map((item) => (
                  <div key={item.id} className={styles.appointmentCard}>
                    <div className={styles.appointmentHeader}>
                      <strong>{item.appointmentDate}</strong> {item.appointmentTime && <span>às {item.appointmentTime}</span>} — {item.serviceName}
                    </div>
                    <div className={styles.appointmentDetail}>
                      Cliente: {item.clientName}
                    </div>
                    <div className={styles.appointmentDetail}>
                      Status: {item.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showScheduleModal && (
        <div className={styles.modalOverlay} onClick={() => setShowScheduleModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Gerenciar Horários Semanais</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowScheduleModal(false)}
              >
                &times;
              </button>
            </div>

            <div className={styles.modalBody}>
              {loadingSchedule ? (
                <p>Carregando...</p>
              ) : (
                <div className={styles.scheduleTable}>
                  <div className={styles.scheduleHeader}>
                    <span className={styles.scheduleColActive}>Ativo</span>
                    <span className={styles.scheduleColDay}>Dia</span>
                    <span className={styles.scheduleColTime}>Início</span>
                    <span className={styles.scheduleColTime}>Fim</span>
                    <span className={styles.scheduleColDuration}>Duração</span>
                  </div>
                  {WEEKDAYS.map((dayName, dayIndex) => {
                    const active = isDayActive(dayIndex);
                    const entry = scheduleEntries.find((e) => e.dayOfWeek === dayIndex);

                    return (
                      <div key={dayIndex} className={`${styles.scheduleRow} ${active ? "" : styles.scheduleRowInactive}`}>
                        <span className={styles.scheduleColActive}>
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => toggleDayActive(dayIndex)}
                          />
                        </span>
                        <span className={styles.scheduleColDay}>{dayName}</span>
                        <span className={styles.scheduleColTime}>
                          <input
                            type="time"
                            className={styles.timeInput}
                            value={active && entry ? entry.startTime : DEFAULT_START}
                            disabled={!active}
                            onChange={(e) => handleEntryChange(dayIndex, "startTime", e.target.value)}
                          />
                        </span>
                        <span className={styles.scheduleColTime}>
                          <input
                            type="time"
                            className={styles.timeInput}
                            value={active && entry ? entry.endTime : DEFAULT_END}
                            disabled={!active}
                            onChange={(e) => handleEntryChange(dayIndex, "endTime", e.target.value)}
                          />
                        </span>
                        <span className={styles.scheduleColDuration}>
                          <select
                            className={styles.durationSelect}
                            value={active && entry ? entry.slotDuration : 60}
                            disabled={!active}
                            onChange={(e) => handleEntryChange(dayIndex, "slotDuration", Number(e.target.value))}
                          >
                            <option value={30}>30 min</option>
                            <option value={60}>60 min</option>
                          </select>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setShowScheduleModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.modalSaveBtn}
                onClick={handleSaveSchedule}
              >
                Salvar Horários
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function parseTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
