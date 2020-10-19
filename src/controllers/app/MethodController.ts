import { Request, Response } from "express";
import validate = require("validate.js");
import { errRes, okRes } from "../../helpers/tools";
import Validation from "../../helpers/validation";
import { Method } from "../../entity/Method";

export default class MethodController {
  //get all active methods
  static async getMethods(req: Request, res: Response) {
    try {
      const methods = await Method.find({
        where: {
          active: true,
        },
      });
      console.table(methods);
      return okRes(res, methods);
    } catch (err) {
      //something unexpected
      return errRes(res, err);
    }
  }

  //add new payment method
  static async addMethod(req: Request, res: Response) {
    //validate method object before save it to DB
    const isNotValid = validate(req.body, Validation.method());
    if (isNotValid) {
      return errRes(res, isNotValid);
    }

    try {
      // save product to db
      const method = await Method.save(req.body);
      return okRes(res, method);
    } catch (err) {
      //something unexpected
      return errRes(res, err);
    }
  }
}
