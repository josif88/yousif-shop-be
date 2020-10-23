import * as express from "express";
import CategoryController from "../../controllers/app/CategoryController";
import MethodController from "../../controllers/app/MethodController";
import UserController from "../../controllers/app/UserController";
import ProductController from "../../controllers/app/ProductController";
import { auth } from "../../middleware";
import InvoiceController from "../../controllers/app/InvoiceController";

const router = express.Router();

router.get("/", (req, res) => {
  res.end("Hello world");
});

//user routes
router.post(
  "/register",
  async (req, res): Promise<object> => {
    return UserController.register(req, res);
  }
);

router.post(
  "/otp",
  auth,
  async (req, res): Promise<object> => {
    return UserController.checkOtp(req, res);
  }
);

router.post(
  "/login",
  async (req, res): Promise<object> => {
    return UserController.login(req, res);
  }
);

router.post(
  "/password",
  auth,
  async (req, res): Promise<object> => {
    return UserController.changePassword(req, res);
  }
);

router.post(
  "/forget",
  async (req, res): Promise<object> => {
    return UserController.forgetPassword(req, res);
  }
);

router.post(
  "/otp_submit/:reference",
  async (req, res): Promise<object> => {
    return UserController.otpSubmit(req, res);
  }
);
//category routes
router.post(
  "/category",
  auth,
  async (req, res): Promise<object> => {
    return CategoryController.addCategory(req, res);
  }
);

router.get(
  "/categories",
  async (req, res): Promise<object> => {
    return CategoryController.getCategories(req, res);
  }
);

//payments methods routes
router.get(
  "/methods",
  async (req, res): Promise<object> => {
    return MethodController.getMethods(req, res);
  }
);

router.post(
  "/method",
  auth,
  async (req, res): Promise<object> => {
    return MethodController.addMethod(req, res);
  }
);

//get products by category id routes
router.get(
  "/products/:id",
  async (req, res): Promise<object> => {
    return ProductController.getProductsById(req, res);
  }
);

router.post(
  "/product",
  auth,
  async (req, res): Promise<object> => {
    return ProductController.addProduct(req, res);
  }
);

//invoice routes

router.post(
  "/invoice",
  auth,
  async (req, res): Promise<object> => {
    return InvoiceController.addInvoice(req, res);
  }
);

router.get(
  "/invoice/:id",
  auth,
  async (req, res): Promise<object> => {
    return InvoiceController.getInvoiceByID(req, res);
  }
);

router.get(
  "/invoices",
  auth,
  async (req, res): Promise<object> => {
    return InvoiceController.getAllUserInvoices(req, res);
  }
);

router.get(
  "/payment_status",
  auth,
  async (req, res): Promise<object> => {
    return InvoiceController.invoicePayment(req, res);
  }
);

export default router;
