import { Request, Response } from "express";
import {
  errRes,
  okRes,
  generate4DigitCode,
  hashMyPassword,
  comparePasswords,
} from "../../helpers/tools";
import * as jwt from "jsonwebtoken";
import Validation from "../../helpers/validation";
import validate = require("validate.js");
import * as PhoneFormat from "@solocreativestudio/phoneformatter";
import { User } from "../../entity/User";

import config from "../../../config";

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
      user.token = jwt.sign({ id: user.id }, config.jwtSecret);

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
      let payload: any = jwt.verify(
        req.headers.token.toString(),
        config.jwtSecret
      );

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

        //delete security fields
        delete user.otp, user.complete, user.password;

        return okRes(res, user);
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

  static async login(req: Request, res: Response) {
    //check user inputs
    let isNotValid = validate(req.body, Validation.login());

    if (isNotValid) return errRes(res, isNotValid);

    //get inputs
    let phone = req.body.phone;
    let password = req.body.password;

    //get user info from db
    try {
      const user = await User.findOne({
        where: {
          phone,
        },
      });

      //check if user not active or his phone number not confirmed
      if (user) {
        if (!user.active) {
          return errRes(res, "your account has been disabled");
        } else if (!user.complete)
          return errRes(res, "phone number not confirmed");

        //compare two the passwords if true give user a token
        const result = await comparePasswords(password, user.password);

        if (result) {
          //remove sensitive information
          delete user.password;
          delete user.otp;

          // assign new token
          const token = jwt.sign({ id: user.id }, "password");

          return okRes(res, { ...user, token });
        }
        //login failed
        else return errRes(res, "password not matched");
      }

      // if phone number not match any user on the db
      return errRes(res, "Not registered yet");
    } catch (err) {
      //something unexpected happened
      return errRes(res, err);
    }
  }

  static async changePassword(req: any, res: Response) {
    //check user inputs
    let validation = validate(req.body, Validation.changePassword());

    if (validation) return errRes(res, validation);

    //matching  passwords then hash
    if (req.body.newPassword !== req.body.confirmPassword)
      return errRes(res, "passwords not matched");
    else if (
      !(await comparePasswords(req.body.currentPassword, req.user.password))
    )
      return errRes(res, "current password not matched");
    else {
      req.body.newPassword = await hashMyPassword(req.body.newPassword);
    }

    try {
      //update user password
      User.update(req.user, { password: req.body.currentPassword });
      return okRes(res, req.user);
    } catch (err) {
      return errRes(res, "server error");
    }
  }
}
