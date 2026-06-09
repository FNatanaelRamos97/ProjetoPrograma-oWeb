import type { Request, Response } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { PaymentsRepository } from "../repositories/payments.repository";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const paymentsRepository = new PaymentsRepository();

const checkoutSchema = z.object({
  appointmentId: z.number().int().positive()
});

export class PaymentsController {
  async createCheckoutSession(request: Request, response: Response) {
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
      stripeCheckoutSessionId: session.id
    });

    return response.status(201).json({
      checkoutUrl: session.url,
      sessionId: session.id
    });
  }

  async getCheckoutSession(request: Request, response: Response) {
    const sessionId = request.params.sessionId;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      await paymentsRepository.markStripePaymentAsPaid({
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null
      });
    }

    const payment = await paymentsRepository.findByStripeSessionId(session.id);

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

    let event: Stripe.Event;

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
      const session = event.data.object as Stripe.Checkout.Session;

      await paymentsRepository.markStripePaymentAsPaid({
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null
      });
    }

    return response.json({ received: true });
  }
}