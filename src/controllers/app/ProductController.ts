import { Request, Response } from "express";
import validate = require("validate.js");
import { errRes, okRes } from "../../helpers/tools";
import Validation from "../../helpers/validation";
import { Category } from "../../entity/Category";
import { Product } from "../../entity/Product";
import config from "../../../config";
import * as imgbbUploader from "imgbb-uploader";
import * as fs from "fs";

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
        relations: ["category"],
      });

      return okRes(res, products);
    } catch (err) {
      //something unexpected
      return errRes(res, err);
    }
  }

  static async addProduct(req: Request, res: Response) {
    //validate product object before save it to DB
    const isNotValid = validate(req.body, Validation.product());
    if (isNotValid) {
      return errRes(res, isNotValid);
    }

    //handle category id availability in front end
    try {
      // save product to db
      const product = await Product.save(req.body);
      return okRes(res, product);
    } catch (err) {
      //something unexpected happened
      return errRes(res, err);
    }
  }

  //TODO: for testing propose
  static async upload(req: any, res: Response) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return errRes(res, "No files were uploaded.");
    }

    let uploadedFile = req.files.sampleFile;
    let randomString = require("randomstring");
    let temporaryPath = `uploads/${randomString.generate(5)}.jpg`;

    // Use the mv() method to place the file somewhere on your server
    try {
      uploadedFile.mv(temporaryPath);

      let imageUrl = await imgbbUploader(config.IMAGEBB, temporaryPath);

      okRes(res, imageUrl);
      await fs.unlinkSync(temporaryPath);
      return;
    } catch (err) {
      return errRes(res, err);
    }
  }
}
