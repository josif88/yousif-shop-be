import { Request, Response } from "express";
// import { errRes } from "../helpers/tools";
import { errRes } from "./helpers/tools";
import * as jwt from "jsonwebtoken";
import { User } from "./entity/User";

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
    payload = jwt.verify(token.toString(), "password");
  } catch (err) {
    errRes(res, "Token no valid");
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
