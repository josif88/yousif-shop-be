import { Request, Response } from "express";
import { errRes, okRes } from "../../helpers/tools";
import { Method } from "../../src/entity/Method";

export default class MethodController {
  //get all active categories
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
}
