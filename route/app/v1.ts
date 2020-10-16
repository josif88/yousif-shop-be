import * as express from "express";
import UserController from "../../controllers/app/UserController";
import { auth } from "../../middleware";

const router = express.Router();

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
export default router;
