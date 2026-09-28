import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";
import {
  getAccountsSummary,
  getTotalWorkAmountList,
  getPendingAmountList,
  getIncomeList,
  createIncome,
  deleteIncome,
  getExpenseList,
  getExpenseDetails,
  getExpenseAnalytics,
  createExpense,
  updateExpense,
  addExpensePayment,
  approveExpense,
  rejectExpense,
  deleteExpense,
  exportExpenses,
  getProfitLossSummary,
} from "../controllers/accountsController.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("super_admin", "admin"));

router.get("/summary", getAccountsSummary);
router.get("/work-amount", getTotalWorkAmountList);
router.get("/pending-amount", getPendingAmountList);

router.get("/income", getIncomeList);
router.post("/income", createIncome);
router.delete("/income/:id", deleteIncome);

router.get("/expenses", getExpenseList);
router.get("/expenses/export", exportExpenses);
router.get("/expenses/analytics", getExpenseAnalytics);
router.post("/expenses", upload.array("attachments", 10), createExpense);
router.get("/expenses/:id", getExpenseDetails);
router.put("/expenses/:id", upload.array("attachments", 10), updateExpense);
router.post("/expenses/:id/payments", addExpensePayment);
router.patch("/expenses/:id/approve", approveExpense);
router.patch("/expenses/:id/reject", rejectExpense);
router.delete("/expenses/:id", deleteExpense);

router.get("/profit-loss", getProfitLossSummary);

export default router;
