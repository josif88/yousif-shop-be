import { Request, Response } from "express";
import validate = require("validate.js");
import { errRes, okRes } from "../../helpers/tools";
import Validation from "../../helpers/validation";
import { Category } from "../../src/entity/Category";

export default class CategoryController {
  static async addCategory(req: Request, res: Response) {
    let isValid = validate(req.body, Validation.category());

    //check wether request body has correct felids
    if (isValid) return errRes(res, isValid);

    //save category info to db
    try {
      const category = await Category.save(req.body);
      okRes(res, { message: "new category added", ...category });
    } catch (err) {
      //something unexpected
      return errRes(res, err);
    }
  }

  //get all active categories
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await Category.find({
        where: {
          active: true,
        },
        relations: ["products"],
      });

      return okRes(res, categories);
    } catch (err) {
      //something unexpected
      return errRes(res, err);
    }
  }
}
