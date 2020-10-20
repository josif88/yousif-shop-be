import { Request, Response } from "express";
import validate = require("validate.js");
import { errRes, okRes } from "../../helpers/tools";
import Validation from "../../helpers/validation";
import { Invoice } from "../../entity/Invoice";
import { Product } from "../../entity/Product";
import { InvoiceItem } from "../../entity/InvoiceItem";
import * as jwt from "jsonwebtoken";
import * as ZC from "zaincash";
import config from "../../../config";

export default class InvoiceController {
  //add invoice to db
  static async addInvoice(req, res: Response) {
    //invoice req validations
    let validation = validate(req.body, Validation.invoice());
    if (validation) return errRes(res, validation);

    //validate and get item info by id and save it to items array;
    let itemsId = [];
    let items: any;

    for (let i = 0; i < req.body.invoiceItems.length; i++) {
      let itemValidation = validate(
        req.body.invoiceItems[i],
        Validation.invoiceItem()
      );
      if (itemValidation) return errRes(res, itemValidation);
      else {
        itemsId.push(req.body.invoiceItems[i].product);
      }
    }

    items = await Product.findByIds(itemsId);

    //prepare invoice items array and calculate subtotals

    let invoiceItems = [];
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let invoiceItem = new InvoiceItem();
      invoiceItem.product = item.id;
      invoiceItem.quantity = req.body.invoiceItems[i].quantity;
      invoiceItem.subTotal = invoiceItem.quantity * item.price;
      total += invoiceItem.subTotal;
      invoiceItems.push(invoiceItem);
    }

    try {
      //create new invoice object and save it to db
      let invoice = new Invoice();
      invoice.user = req.user.id;
      invoice.address = req.body.address;
      invoice.lat = req.body.lat;
      invoice.long = req.body.long;
      invoice.invoiceItems = invoiceItems;
      invoice.method = req.body.method;
      invoice.total = total;

      invoice = await Invoice.save(invoice);

      //save invoice items to db
      invoiceItems.forEach(async (el: any) => {
        el.invoice = invoice.id;
        await InvoiceItem.save(el);
      });

      // init payment and add payment url of selected payment method to response body

      // TODO: prepare payments data based on user selection

      const paymentData = {
        amount: invoice.total,
        orderId: invoice.id.toString(),
        serviceType: "Yousif Shop",
        redirectUrl: "http://localhost:5000/v1/payment_status",
        production: false,
        msisdn: "9647835077880",
        merchantId: "5dac4a31c98a8254092da3d8",
        secret: config.ZC_SECRET,
        lang: "ar",
      };

      //init ZC for testing propose
      let zc = new ZC(paymentData);
      //save transaction id to invoice as reference

      invoice.transactionId = await zc.init();
      await invoice.save();

      //response with full invoice detail
      return okRes(res, {
        paymentUrl: `https://test.zaincash.iq/transaction/pay?id=${invoice.transactionId}`,
        invoice,
      });
    } catch (err) {
      //something unexpected
      return errRes(res, { message: "Server error", err }, 500);
    }
  }

  //get user invoice by id
  static async getInvoiceByID(req, res) {
    let invoiceId = req.params.id;

    let invoice: Invoice;
    try {
      //get invoice from db
      invoice = await Invoice.findOne({
        where: { id: invoiceId },
        join: {
          alias: "invoice",
          leftJoinAndSelect: {
            user: "invoice.user",
            invoiceItems: "invoice.invoiceItems",
            product: "invoiceItems.product",
          },
        },
      });

      //check if this invoice belongs to user or not
      if (invoice.user.id != req.user.id)
        return errRes(
          res,
          "you don't have sufficient permission to view this invoice"
        );

      return okRes(res, invoice);
    } catch (err) {
      //server error
      errRes(res, "server error", 500);
    }
  }

  //get all user invoices
  static async getAllUserInvoices(req, res) {
    let invoices: Invoice[];
    try {
      //get invoice from db
      invoices = await Invoice.find({
        where: {
          user: req.user.id,
        },
        join: {
          alias: "invoice",
          leftJoinAndSelect: {
            user: "invoice.user",
            invoiceItems: "invoice.invoiceItems",
            product: "invoiceItems.product",
          },
        },
      });

      if (!invoices.length) return errRes(res, "No invoices found");

      return okRes(res, invoices);
    } catch (err) {
      //server error
      return errRes(res, "server error", 500);
    }
  }

  //handle invoice payments
  static async invoicePayment(req, res) {
    //get token from url
    const token = req.query.token;

    if (!token) return errRes(res, "token not found");

    // describe token and extract data
    try {
      var decoded: any = jwt.verify(token, config.ZC_SECRET);

      if (decoded.status == "success") {
        var invoice = await Invoice.findOne({
          where: {
            transactionId: decoded.id,
            status: "pending",
          },
          relations: ["user"],
        });

        //if (!invoice) return errRes(res, "Invoice already payed");

        //change invoice status
        invoice.status = "payed";
        await invoice.save();

        return okRes(res, {
          message: `thanks ${invoice.user.name} invoice payed successfully`,
          transactionId: decoded.id,
          invoice,
        });
      } else {
        return errRes(res, { message: decoded.msg, transactionId: decoded.id });
      }
    } catch (err) {
      return errRes(res, "invalid token");
    }
  }
}
