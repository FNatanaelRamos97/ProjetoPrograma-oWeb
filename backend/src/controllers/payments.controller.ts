import type { Request, Response } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { PaymentsRepository } from "../repositories/payments.repository";
import { createMercadoPagoCheckout, verifyMercadoPagoWebhook } from "../services/mercadopago.service";
import { createAbacatePayCheckout, verifyAbacatePayWebhook } from "../services/abacatepay.service";

type StripeEvent = any;
type StripeCheckoutSession = any;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const paymentsRepository = new PaymentsRepository();

const checkoutSchema = z.object({
  appointmentId: z.number().int().positive()
});

export class PaymentsController {
  async createCheckoutSession(request: Request, response: Response) {
    try {
      if (!request.user) {
        return response.status(401).json({ message: "Usuário não autenticado" });
      }

      const { appointmentId } = checkoutSchema.parse(request.body);

      const appointment = await paymentsRepository.getAppointmentForCheckout(
        appointmentId,
        request.user.id
      );

      if (!appointment) {
        return response.status(404).json({ message: "Agendamento não encontrado." });
      }

      if (!["pendente_pagamento"].includes(appointment.appointmentStatus)) {
        return response.status(400).json({
          message: "Este agendamento não está pendente de pagamento."
        });
      }

      const commissionPercent = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 10);
      const grossAmount = Number(appointment.servicePrice);
      const commissionAmount = Number((grossAmount * (commissionPercent / 100)).toFixed(2));
      const providerAmount = Number((grossAmount - commissionAmount).toFixed(2));

      const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "brl",
              unit_amount: Math.round(grossAmount * 100),
              product_data: {
                name: appointment.serviceName,
                description: `Agendamento #${appointment.appointmentId}`
              }
            }
          }
        ],
        metadata: {
          appointmentId: String(appointment.appointmentId),
          serviceId: String(appointment.serviceId),
          clientId: String(appointment.clientId),
          providerId: String(appointment.providerId),
          commissionAmount: String(commissionAmount),
          providerAmount: String(providerAmount)
        },
        success_url: `${frontendUrl}/pagamento-realizado?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/pagamento?appointmentId=${appointment.appointmentId}`
      });

      await paymentsRepository.createCheckoutRecord({
        appointmentId: appointment.appointmentId,
        serviceId: appointment.serviceId,
        clientId: appointment.clientId,
        providerId: appointment.providerId,
        grossAmount,
        commissionAmount,
        providerAmount,
        stripeCheckoutSessionId: session.id,
        gateway: "stripe"
      });

      return response.status(201).json({
        checkoutUrl: session.url,
        sessionId: session.id
      });
    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error);
      return response.status(500).json({
        message: "Erro ao processar pagamento. Verifique os dados e tente novamente."
      });
    }
  }

  async createMercadoPagoCheckoutSession(request: Request, response: Response) {
    try {
      if (!request.user) {
        return response.status(401).json({ message: "Usuário não autenticado" });
      }

      const { appointmentId } = checkoutSchema.parse(request.body);

      const appointment = await paymentsRepository.getAppointmentForCheckout(
        appointmentId,
        request.user.id
      );

      if (!appointment) {
        return response.status(404).json({ message: "Agendamento não encontrado." });
      }

      if (!["pendente_pagamento"].includes(appointment.appointmentStatus)) {
        return response.status(400).json({
          message: "Este agendamento não está pendente de pagamento."
        });
      }

      const commissionPercent = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 10);
      const grossAmount = Number(appointment.servicePrice);
      const commissionAmount = Number((grossAmount * (commissionPercent / 100)).toFixed(2));
      const providerAmount = Number((grossAmount - commissionAmount).toFixed(2));

      const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

      const mpCheckout = await createMercadoPagoCheckout({
        title: appointment.serviceName,
        description: `Agendamento #${appointment.appointmentId}`,
        amount: grossAmount,
        externalReference: String(appointment.appointmentId),
        successUrl: `${frontendUrl}/pagamento-realizado?session_id=mp_${appointment.appointmentId}`,
        failureUrl: `${frontendUrl}/pagamento?appointmentId=${appointment.appointmentId}`,
        pendingUrl: `${frontendUrl}/pagamento?appointmentId=${appointment.appointmentId}`,
        commissionAmount
      });

      await paymentsRepository.createCheckoutRecord({
        appointmentId: appointment.appointmentId,
        serviceId: appointment.serviceId,
        clientId: appointment.clientId,
        providerId: appointment.providerId,
        grossAmount,
        commissionAmount,
        providerAmount,
        stripeCheckoutSessionId: mpCheckout.preferenceId!,
        gateway: "mercadopago"
      });

      return response.status(201).json({
        checkoutUrl: mpCheckout.checkoutUrl,
        sessionId: mpCheckout.preferenceId
      });
    } catch (error) {
      console.error("Erro ao criar checkout Mercado Pago:", error);
      return response.status(500).json({
        message: "Erro ao processar pagamento com Mercado Pago."
      });
    }
  }

  async createAbacatePayCheckoutSession(request: Request, response: Response) {
    try {
      if (!request.user) {
        return response.status(401).json({ message: "Usuário não autenticado" });
      }

      const { appointmentId } = checkoutSchema.parse(request.body);

      const appointment = await paymentsRepository.getAppointmentForCheckout(
        appointmentId,
        request.user.id
      );

      if (!appointment) {
        return response.status(404).json({ message: "Agendamento não encontrado." });
      }

      if (!["pendente_pagamento"].includes(appointment.appointmentStatus)) {
        return response.status(400).json({
          message: "Este agendamento não está pendente de pagamento."
        });
      }

      const commissionPercent = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 10);
      const grossAmount = Number(appointment.servicePrice);
      const commissionAmount = Number((grossAmount * (commissionPercent / 100)).toFixed(2));
      const providerAmount = Number((grossAmount - commissionAmount).toFixed(2));

      const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

      const abacateCheckout = await createAbacatePayCheckout({
        externalReference: String(appointment.appointmentId),
        amount: grossAmount,
        title: appointment.serviceName,
        description: `Agendamento #${appointment.appointmentId}`,
        returnUrl: `${frontendUrl}/pagamento?appointmentId=${appointment.appointmentId}`,
        completionUrl: `${frontendUrl}/pagamento-realizado?session_id=abacate_${appointment.appointmentId}`
      });

      await paymentsRepository.createCheckoutRecord({
        appointmentId: appointment.appointmentId,
        serviceId: appointment.serviceId,
        clientId: appointment.clientId,
        providerId: appointment.providerId,
        grossAmount,
        commissionAmount,
        providerAmount,
        stripeCheckoutSessionId: abacateCheckout.checkoutId,
        gateway: "abacatepay"
      });

      return response.status(201).json({
        checkoutUrl: abacateCheckout.checkoutUrl,
        sessionId: abacateCheckout.checkoutId
      });
    } catch (error) {
      console.error("Erro ao criar checkout Abacate Pay:", error);
      return response.status(500).json({
        message: "Erro ao processar pagamento com Abacate Pay."
      });
    }
  }

  async getCheckoutSession(request: Request, response: Response) {
    const sessionId = request.params.sessionId as string;

    if (sessionId.startsWith("mp_") || sessionId.startsWith("abacate_")) {
      const payment = await paymentsRepository.findByAppointmentId(
        Number(sessionId.split("_").pop())
      );

      return response.json({
        stripeStatus: "complete",
        paymentStatus: payment?.status === "pago" ? "paid" : "unpaid",
        payment
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      await paymentsRepository.markPaymentAsPaid({
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null
      });
    }

    const payment = await paymentsRepository.findByGatewaySessionId(session.id);

    return response.json({
      stripeStatus: session.status,
      paymentStatus: session.payment_status,
      payment
    });
  }

  async webhook(request: Request, response: Response) {
    const signature = request.headers["stripe-signature"];

    if (!signature) {
      return response.status(400).send("Assinatura ausente.");
    }

    let event: StripeEvent;

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch {
      return response.status(400).send("Webhook inválido.");
    }

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as StripeCheckoutSession;

      await paymentsRepository.markPaymentAsPaid({
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null
      });
    }

    return response.json({ received: true });
  }

  async mercadopagoWebhook(request: Request, response: Response) {
    try {
      const signature = request.headers["x-signature"] as string | undefined;

      if (!verifyMercadoPagoWebhook(signature, request.body as Record<string, unknown>)) {
        return response.status(400).send("Webhook inválido.");
      }

      const body = request.body as Record<string, unknown>;
      const resourceUrl = body?.resource as string | undefined;

      if (resourceUrl) {
        const segments = resourceUrl.split("/");
        const paymentId = segments[segments.length - 1];

        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
            }
          }
        );

        if (mpResponse.ok) {
          const paymentData = await mpResponse.json() as {
            external_reference?: string;
            status?: string;
          };

          if (
            paymentData.external_reference &&
            (paymentData.status === "approved" || paymentData.status === "completed")
          ) {
            const existing = await paymentsRepository.findByAppointmentId(
              Number(paymentData.external_reference)
            );

            if (existing && existing.gateway === "mercadopago") {
              await paymentsRepository.markPaymentAsPaid({
                stripeCheckoutSessionId: existing.stripeCheckoutSessionId
              });
            }
          }
        }
      }

      return response.status(200).json({ received: true });
    } catch (error) {
      console.error("Erro no webhook Mercado Pago:", error);
      return response.status(500).send("Erro interno");
    }
  }

  async abacatepayWebhook(request: Request, response: Response) {
    try {
      const body = request.body;

      const result = verifyAbacatePayWebhook(body);

      if (!result.valid || !result.checkoutId) {
        return response.status(400).send("Webhook inválido.");
      }

      if (result.event === "checkout.completed" && result.checkoutId) {
        const existing = await paymentsRepository.findByGatewaySessionId(result.checkoutId);

        if (existing && existing.gateway === "abacatepay") {
          await paymentsRepository.markPaymentAsPaid({
            stripeCheckoutSessionId: existing.stripeCheckoutSessionId
          });
        }
      }

      return response.status(200).json({ received: true });
    } catch (error) {
      console.error("Erro no webhook Abacate Pay:", error);
      return response.status(500).send("Erro interno");
    }
  }
}
