import { Request, Response } from "express";
import validate = require("validate.js");
import { errRes, okRes } from "../../helpers/tools";
import Validation from "../../helpers/validation";
import { Category } from "../../src/entity/Category";
import { Product } from "../../src/entity/Product";

export default class CategoryController {
  //get all active products
  static async getProductsById(req: Request, res: Response) {
    
    //check if category disabled or not found
    try {
      const category = await Category.findOne({
        where: {
          id: req.params.id,
          active: true,
        },
      });

      if (!category) {
        return errRes(res, "no such category");
      }

      // run product query
      const products = await Product.find({
        where: {
          active: true,
          category: req.params.id,
        },
      });

      return okRes(res, products);
    } catch (err) {
      //something unexpected
      return errRes(res, err);
    }
  }
}
