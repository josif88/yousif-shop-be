import { Request, Response } from "express";
// import { errRes } from "../helpers/tools";
import { errRes } from "./helpers/tools";
import * as jwt from "jsonwebtoken";
import { User } from "./entity/User";
import config from "../config";
import { i18n } from "./helpers/language";

// language middleWare
export const language = (req: Request, res: Response, next) => {
  //check req query if has language preference if not set it back to english
  if (req.query.lang) {
    i18n.setLocale(req.query.lang);
  } else {
    i18n.setLocale("en");
  }
  next();
};

export const notFound = (req: Request, res: Response, next) => {
  res.statusCode = 404;
  return res.json({
    status: false,
    message: "page not found",
    statusCode: 404,
  });
};

export const auth = async (req, res, next): Promise<object> => {
  let token = req.headers.token;

  if (!token) return errRes(res, "token not found");

  let payload: any;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return errRes(res, "Token no valid");
  }

  let user = await User.findOne({
    where: {
      id: payload.id,
      active: true,
    },
  });

  if (!user) errRes(res, "please register");

  req.user = user;
  next();
};
