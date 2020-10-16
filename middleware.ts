import { Request, Response } from "express";
import { errRes } from "./helpers/tools";
import * as jwt from "jsonwebtoken";

export const notFound = (req: Request, res: Response, next) => {
  res.statusCode = 404;
  return res.json({
    status: false,
    message: "page not found",
    statusCode: 404,
  });
};

export const auth = (req: Request, res: Response, next) => {
  let token = req.headers.token;

  if (!token) return errRes(res, "token not found");

  try {
    let payload = jwt.verify(token.toString(), "password");
    next();
    
  } catch (err) {
    errRes(res, "Token no valid");
  }
};
