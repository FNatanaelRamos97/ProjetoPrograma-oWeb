import bcrypt from "bcryptjs";
import { db } from "./index";
import { appointments, cancellationRequests, payments, providerAvailability, providerAvailabilityOverrides, providerRequests, providerUnavailableDates, providerUnavailableSlots, reviews, salesLogs, serviceImages, services, transactions, users, withdrawalRequests } from "./schema";

async function seed() {
  console.log("Limpando dados existentes...");

  await db.delete(cancellationRequests);
  await db.delete(payments);
  await db.delete(salesLogs);
  await db.delete(reviews);
  await db.delete(transactions);
  await db.delete(withdrawalRequests);
  await db.delete(appointments);
  await db.delete(providerAvailability);
  await db.delete(providerAvailabilityOverrides);
  await db.delete(providerUnavailableSlots);
  await db.delete(providerUnavailableDates);
  await db.delete(serviceImages);
  await db.delete(services);
  await db.delete(providerRequests);
  await db.delete(users);

  console.log("Dados antigos removidos.");

  const passwordHash = await bcrypt.hash("123456", 10);
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  const createdUsers = await db
    .insert(users)
    .values([
      { name: "Admin", email: "admin@conectserv.com", passwordHash: adminPasswordHash, role: "admin" },
      { name: "Maria Cliente", email: "maria@teste.com", passwordHash, role: "cliente", phone: "(61) 99999-0000", identity: "1234567" },
      { name: "João Prestador", email: "joao@teste.com", passwordHash, role: "prestador", phone: "(61) 98888-0000", identity: "7654321" },
      { name: "David", email: "david.user@user.com", passwordHash, role: "prestador", phone: "61985310239", identity: "321011", profileImageUrl: "/uploads/profiles/1781023875362-842942549.webp" },
      { name: "david", email: "davidtest@test.com", passwordHash, role: "cliente", phone: "11111111", identity: "221551" },
      { name: "Bery Ornitorrinco", email: "beryespiao@email.com", passwordHash, role: "prestador", phone: "1145899999", identity: "9999999", profileImageUrl: "/uploads/profiles/1781454324097-608234257.webp" },
      { name: "Ronaldo Fenomeno", email: "Ronaldo.F@gmail.com", passwordHash, role: "prestador", phone: "61984991492", identity: "03660003140", profileImageUrl: "/uploads/profiles/1781489317644-768071803.webp", balance: -430 },
      { name: "Maria Eduarda", email: "Maria.E@gmail.com", passwordHash, role: "prestador", phone: "6199999999", identity: "9289009270" },
      { name: "Ana", email: "Ana.0909@gmail.com", passwordHash, role: "prestador", phone: "61987990123", identity: "98778895436" },
      { name: "Banguela", email: "banguela@email.com", passwordHash, role: "cliente", phone: "51651364651", identity: "516164513212", profileImageUrl: "/uploads/profiles/1781470862961-473102040.webp" },
      { name: "Máximo Vespa", email: "MaximoVespa@email.com", passwordHash, role: "cliente", phone: "515615618965", identity: "659323294133", profileImageUrl: "/uploads/profiles/1781472830016-769432594.webp" },
      { name: "Enzo", email: "Enzo.v@gmail.com", passwordHash, role: "cliente", phone: "61976451209", identity: "09867856435" },
    ])
    .returning();

  const admin = createdUsers.find((u) => u.role === "admin")!;
  const maria = createdUsers.find((u) => u.email === "maria@teste.com")!;
  const joao = createdUsers.find((u) => u.email === "joao@teste.com")!;
  const davidP = createdUsers.find((u) => u.email === "david.user@user.com")!;
  const davidC = createdUsers.find((u) => u.email === "davidtest@test.com")!;
  const bery = createdUsers.find((u) => u.email === "beryespiao@email.com")!;
  const ronaldo = createdUsers.find((u) => u.email === "Ronaldo.F@gmail.com")!;
  const mariaE = createdUsers.find((u) => u.email === "Maria.E@gmail.com")!;
  const banguela = createdUsers.find((u) => u.email === "banguela@email.com")!;
  const maximo = createdUsers.find((u) => u.email === "MaximoVespa@email.com")!;
  const enzo = createdUsers.find((u) => u.email === "Enzo.v@gmail.com")!;

  if (!joao || !maria) throw new Error("Usuários base não criados.");

  const createdServices = await db.insert(services).values([
    { name: "Instalação de chuveiro", description: "Serviço de instalação de chuveiro residencial.", price: 120, category: "Manutenção e Reparos", subcategory: "Elétrica", estimatedTime: "2 horas", location: "Brasília, DF", providerId: joao.id },
    { name: "Limpeza residencial", description: "Serviço de limpeza para apartamentos e casas.", price: 180, category: "Limpeza e Organização", subcategory: "Residencial", estimatedTime: "4 horas", location: "Brasília, DF", providerId: joao.id },
    { name: "das", description: "asds", price: 150, category: "Aulas e Cursos", subcategory: "Idiomas", estimatedTime: "dsd", location: "dsd", imageUrl: "/uploads/services/1781045651010-207948471.webp", providerId: davidP.id },
    { name: "Pesquisa avançada", description: "Preço a combinar ao fazer o orçamento", price: 1, category: "Outra", subcategory: "Geral", estimatedTime: "Meses", location: "Todo Brasil", providerId: bery.id },
    { name: "Chama +1", description: "Precisa de um jogador para fechar o time e garantir uma partida mais divertida? Ronaldo Fenômeno participa de jogos amadores por até 2 horas, atuando como jogador convidado para completar equipes que estejam com falta de atletas.\r\n\r\nDurante o período contratado, Ronaldo participa ativamente da partida, colaborando com o time, realizando jogadas ofensivas, auxiliando na criação de oportunidades de gol e contribuindo para a dinâmica do jogo. O serviço inclui sua presença em campo durante todo o tempo contratado, proporcionando uma experiência única para os participantes.\r\n\r\nDuração: 2 horas\r\nValor: R$ 200,00", price: 200, category: "Outra", subcategory: "Geral", estimatedTime: "2 horas", location: "DF", imageUrl: "/uploads/services/1781489635565-241237711.webp", providerId: ronaldo.id },
    { name: "Consultoria Jurídica", description: "Prestação de serviços de consultoria jurídica especializada, com duração de até 2 (duas) horas, destinada à análise, orientação e esclarecimento de questões legais relacionadas às demandas apresentadas pelo contratante. O serviço poderá incluir:\r\n\r\nAnálise de documentos e informações fornecidas pelo contratante;\r\nEsclarecimento de dúvidas jurídicas;\r\nOrientação sobre direitos, deveres e procedimentos legais aplicáveis ao caso;\r\nAvaliação preliminar de riscos jurídicos;\r\nIndicação de medidas administrativas ou judiciais cabíveis;\r\nEmissão de parecer ou recomendações verbais durante a consulta;\r\nApoio técnico na interpretação de leis, normas, regulamentos e contratos.\r\n\r\nValor do serviço: R$ 500,00 por até 2 (duas) horas de atendimento.", price: 500, category: "Advocacia e Jurídico", subcategory: "Criminal", estimatedTime: "2 horas", location: "RJ", imageUrl: "/uploads/services/1781531720324-959726558.webp", providerId: mariaE.id },
  ]).returning();

  const servLimpeza = createdServices.find((s) => s.name === "Limpeza residencial")!;
  const servDas = createdServices.find((s) => s.name === "das")!;
  const servPesquisa = createdServices.find((s) => s.name === "Pesquisa avançada")!;
  const servChama = createdServices.find((s) => s.name === "Chama +1")!;

  await db.insert(providerAvailability).values([
    { providerId: joao.id, dayOfWeek: 1, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: joao.id, dayOfWeek: 2, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: joao.id, dayOfWeek: 3, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: joao.id, dayOfWeek: 4, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: joao.id, dayOfWeek: 5, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: davidP.id, dayOfWeek: 0, startTime: "11:00", endTime: "18:00", slotDuration: 60 },
    { providerId: davidP.id, dayOfWeek: 1, startTime: "14:00", endTime: "18:00", slotDuration: 60 },
    { providerId: bery.id, dayOfWeek: 1, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: bery.id, dayOfWeek: 2, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: bery.id, dayOfWeek: 3, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: bery.id, dayOfWeek: 4, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: bery.id, dayOfWeek: 5, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: bery.id, dayOfWeek: 6, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: bery.id, dayOfWeek: 0, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: ronaldo.id, dayOfWeek: 0, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: ronaldo.id, dayOfWeek: 1, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: ronaldo.id, dayOfWeek: 2, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: ronaldo.id, dayOfWeek: 3, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    { providerId: ronaldo.id, dayOfWeek: 4, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
  ]);

  const createdAppointments = await db.insert(appointments).values([
    { serviceId: servLimpeza.id, providerId: joao.id, clientId: davidP.id, appointmentDate: "2026-06-10", appointmentTime: "00:00", status: "pendente_pagamento" },
    { serviceId: servLimpeza.id, providerId: joao.id, clientId: davidP.id, appointmentDate: "2026-06-11", appointmentTime: "00:00", status: "pendente_pagamento" },
    { serviceId: servLimpeza.id, providerId: joao.id, clientId: davidP.id, appointmentDate: "2026-06-09", appointmentTime: "16:00", status: "pendente_pagamento" },
    { serviceId: servLimpeza.id, providerId: joao.id, clientId: davidP.id, appointmentDate: "2026-06-09", appointmentTime: "17:00", status: "confirmado" },
    { serviceId: servLimpeza.id, providerId: joao.id, clientId: admin.id, appointmentDate: "2026-06-09", appointmentTime: "08:00", status: "cancelado", cancellationReason: "smdsmd" },
    { serviceId: servLimpeza.id, providerId: joao.id, clientId: davidP.id, appointmentDate: "2026-06-08", appointmentTime: "09:00", status: "confirmado" },
    { serviceId: servDas.id, providerId: davidP.id, clientId: davidC.id, appointmentDate: "2026-06-01", appointmentTime: "14:00", status: "pendente_pagamento" },
    { serviceId: servPesquisa.id, providerId: bery.id, clientId: admin.id, appointmentDate: "2026-06-16", appointmentTime: "12:00", status: "pendente_pagamento" },
    { serviceId: servPesquisa.id, providerId: bery.id, clientId: maximo.id, appointmentDate: "2026-06-01", appointmentTime: "08:00", status: "pendente_pagamento" },
    { serviceId: servDas.id, providerId: davidP.id, clientId: maximo.id, appointmentDate: "2026-06-15", appointmentTime: "16:00", status: "pendente_pagamento" },
    { serviceId: servPesquisa.id, providerId: bery.id, clientId: banguela.id, appointmentDate: "2026-06-30", appointmentTime: "11:00", status: "pendente_pagamento" },
    { serviceId: servPesquisa.id, providerId: bery.id, clientId: banguela.id, appointmentDate: "2026-06-27", appointmentTime: "08:00", status: "pendente_pagamento" },
    { serviceId: servPesquisa.id, providerId: bery.id, clientId: banguela.id, appointmentDate: "2026-06-07", appointmentTime: "09:00", status: "concluido", completedAt: "2026-06-15T00:27:20.600Z" },
    { serviceId: servPesquisa.id, providerId: bery.id, clientId: maximo.id, appointmentDate: "2026-06-22", appointmentTime: "17:00", status: "pendente_pagamento" },
    { serviceId: servPesquisa.id, providerId: bery.id, clientId: admin.id, appointmentDate: "2026-06-24", appointmentTime: "13:00", status: "pendente_pagamento" },
    { serviceId: servChama.id, providerId: ronaldo.id, clientId: enzo.id, appointmentDate: "2026-06-15", appointmentTime: "08:00", status: "pendente_pagamento" },
    { serviceId: servChama.id, providerId: ronaldo.id, clientId: enzo.id, appointmentDate: "2026-06-15", appointmentTime: "09:00", status: "concluido", completedAt: "2026-06-16T01:21:57.180Z" },
    { serviceId: servChama.id, providerId: ronaldo.id, clientId: enzo.id, appointmentDate: "2026-06-01", appointmentTime: "08:00", status: "concluido", completedAt: "2026-06-16T01:29:54.376Z" },
    { serviceId: servChama.id, providerId: ronaldo.id, clientId: enzo.id, appointmentDate: "2026-06-01", appointmentTime: "10:00", status: "concluido", completedAt: "2026-06-16T01:30:06.847Z" },
    { serviceId: servChama.id, providerId: ronaldo.id, clientId: enzo.id, appointmentDate: "2026-06-22", appointmentTime: "08:00", status: "concluido", completedAt: "2026-06-16T01:31:59.584Z" },
    { serviceId: servChama.id, providerId: ronaldo.id, clientId: enzo.id, appointmentDate: "2026-06-01", appointmentTime: "12:00", status: "confirmado" },
    { serviceId: servChama.id, providerId: ronaldo.id, clientId: enzo.id, appointmentDate: "2026-06-01", appointmentTime: "13:00", status: "confirmado" },
  ]).returning();

  const aptPago1 = createdAppointments.find((a) => a.appointmentDate === "2026-06-09" && a.appointmentTime === "17:00")!;
  const aptCancelado = createdAppointments.find((a) => a.appointmentDate === "2026-06-09" && a.appointmentTime === "08:00")!;
  const aptConfirmado = createdAppointments.find((a) => a.appointmentDate === "2026-06-08" && a.appointmentTime === "09:00")!;
  const aptConcluido1 = createdAppointments.find((a) => a.appointmentDate === "2026-06-07" && a.appointmentTime === "09:00")!;
  const aptConcluido2 = createdAppointments.find((a) => a.appointmentDate === "2026-06-15" && a.appointmentTime === "09:00")!;
  const aptConcluido3 = createdAppointments.find((a) => a.appointmentDate === "2026-06-01" && a.appointmentTime === "08:00")!;
  const aptConcluido4 = createdAppointments.find((a) => a.appointmentDate === "2026-06-01" && a.appointmentTime === "10:00")!;
  const aptConcluido5 = createdAppointments.find((a) => a.appointmentDate === "2026-06-22" && a.appointmentTime === "08:00")!;

  await db.insert(reviews).values([
    { appointmentId: aptConcluido1!.id, serviceId: servPesquisa.id, clientId: banguela.id, providerId: bery.id, rating: 5, comment: "oioi" },
    { appointmentId: aptConcluido2!.id, serviceId: servChama.id, clientId: enzo.id, providerId: ronaldo.id, rating: 5, comment: "ganhamos a partida" },
    { appointmentId: aptConcluido4!.id, serviceId: servChama.id, clientId: enzo.id, providerId: ronaldo.id, rating: 5, comment: "Ganhamos a partida" },
  ]);

  await db.insert(salesLogs).values([
    { appointmentId: aptPago1!.id, serviceId: servLimpeza.id, clientId: davidP.id, providerId: joao.id, amount: 180, paymentMethod: "Stripe Checkout", status: "pago" },
    { appointmentId: aptCancelado!.id, serviceId: servLimpeza.id, clientId: admin.id, providerId: joao.id, amount: 180, paymentMethod: "Stripe Checkout", status: "pago" },
    { appointmentId: aptConfirmado!.id, serviceId: servLimpeza.id, clientId: davidP.id, providerId: joao.id, amount: 180, paymentMethod: "Stripe Checkout", status: "pago" },
    { appointmentId: aptConcluido1!.id, serviceId: servPesquisa.id, clientId: banguela.id, providerId: bery.id, amount: 1, paymentMethod: "Stripe Checkout", status: "pago" },
    { appointmentId: aptConcluido2!.id, serviceId: servChama.id, clientId: enzo.id, providerId: ronaldo.id, amount: 200, paymentMethod: "Stripe Checkout", status: "pago" },
    { appointmentId: aptConcluido3!.id, serviceId: servChama.id, clientId: enzo.id, providerId: ronaldo.id, amount: 200, paymentMethod: "Stripe Checkout", status: "pago" },
    { appointmentId: aptConcluido4!.id, serviceId: servChama.id, clientId: enzo.id, providerId: ronaldo.id, amount: 200, paymentMethod: "Stripe Checkout", status: "pago" },
    { appointmentId: aptConcluido5!.id, serviceId: servChama.id, clientId: enzo.id, providerId: ronaldo.id, amount: 200, paymentMethod: "Stripe Checkout", status: "pago" },
  ]);

  console.log("Dados de teste inseridos com sucesso.");
}

seed();
