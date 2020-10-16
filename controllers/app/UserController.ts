import { Request, Response } from "express";
import {
  errRes,
  okRes,
  generate4DigitCode,
  hashMyPassword,
} from "../../helpers/tools";
import * as jwt from "jsonwebtoken";
import Validation from "../../helpers/validation";
import validate = require("validate.js");
import * as PhoneFormat from "@solocreativestudio/phoneformatter";
import { User } from "../../src/entity/User";

export default class UserController {
  static async register(req: Request, res: Response) {
    let isValid = validate(req.body, Validation.register(true));

    //check wether request body has correct felids
    if (isValid) return errRes(res, isValid);

    //get request body
    let userObj = req.body;

    //check user phone validation
    !PhoneFormat.getAllFormats(userObj.phone, "iq").isNumber &&
      errRes(res, "please check your phone number");

    let user: any;

    //check if user phone no is used before
    user = await User.findOne({ where: { phone: req.body.phone } });
    if (user) return errRes(res, `Phone ${userObj.phone} already exists`);

    //complete user object fields
    user = {
      ...userObj,
      otp: generate4DigitCode(),
      active: true,
      complete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      //hash user password
      user.password = await hashMyPassword(user.password);
      //save user info to DB
      user = await User.save(user);

      //generate encrypt token
      user.token = jwt.sign({ id: user.id }, "password");

      //hide his password hash
      delete user.password;

      //everything just ok show me the result
      return okRes(res, user);
    } catch (err) {
      errRes(res, err);
    }
  }

  static async checkOtp(req: Request, res: Response) {
    let isNotValid = validate(req.body, Validation.otp(true));

    //check wether request body has correct felids
    if (isNotValid) return errRes(res, isNotValid);

    try {
      //get payload from token
      let payload: any = jwt.verify(req.headers.token.toString(), "password");

      //find user based on his id from token payload
      let user = await User.findOne({ where: { id: payload.id } });

      //the user has valid token but he has no record in the database
      if (!user) return errRes(res, "ops..., somehow we deleted you!");
      // else, if he already verified then he should not be here
      else if (user.complete)
        return errRes(res, "User verification done before");

      //checking his otp
      if (req.body.otp == user.otp) {
        //update his status on db
        await User.update(user, { complete: true, otp: 0 });
        return okRes(res, user,);
      } else {
        
        //tell user what he have done and send him a new otp sms, it costs money!

        //TODO: don't forget to send him an sms with new otp
        User.update(user, { otp: generate4DigitCode() });
        return errRes(
          res,
          `password not match, new otp has been sent to ${user.phone}`
        );
      }
    } catch (err) {
      //something unexpected 
      return errRes(res, err);
    }
  }
}
