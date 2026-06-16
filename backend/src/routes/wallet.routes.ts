import { Router } from "express";
import { WalletController } from "../controllers/wallet.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const walletRoutes = Router();
const controller = new WalletController();

walletRoutes.get("/balance", authMiddleware, controller.balance);
walletRoutes.post("/deposit", authMiddleware, controller.deposit);
walletRoutes.post("/withdraw", authMiddleware, controller.withdraw);
walletRoutes.get("/history", authMiddleware, controller.history);
walletRoutes.get("/escrow", authMiddleware, controller.escrowList);
walletRoutes.post("/hold", authMiddleware, controller.hold);
walletRoutes.post("/release", authMiddleware, controller.release);
walletRoutes.post("/cancel", authMiddleware, controller.cancel);
walletRoutes.get(
  "/transactions",
  authMiddleware,
  requireRole(["admin"]),
  controller.allTransactions,
);
walletRoutes.post(
  "/withdrawal-requests",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  controller.requestWithdrawal,
);

walletRoutes.get(
  "/withdrawal-requests/my",
  authMiddleware,
  requireRole(["prestador", "admin"]),
  controller.myWithdrawalRequests,
);

walletRoutes.get(
  "/withdrawal-requests",
  authMiddleware,
  requireRole(["admin"]),
  controller.allWithdrawalRequests,
);

walletRoutes.patch(
  "/withdrawal-requests/:id/approve",
  authMiddleware,
  requireRole(["admin"]),
  controller.approveWithdrawal,
);

walletRoutes.patch(
  "/withdrawal-requests/:id/reject",
  authMiddleware,
  requireRole(["admin"]),
  controller.rejectWithdrawal,
);

export { walletRoutes };
