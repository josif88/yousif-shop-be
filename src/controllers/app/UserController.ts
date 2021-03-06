import { Request, Response } from "express";
import {
  errRes,
  okRes,
  generate4DigitCode,
  hashMyPassword,
  comparePasswords,
} from "../../helpers/tools";
import { sendOtp } from "../../helpers/sms";
import * as jwt from "jsonwebtoken";
import Validation from "../../helpers/validation";
import validate = require("validate.js");
import * as PhoneFormat from "@solocreativestudio/phoneformatter";
import { User } from "../../entity/User";
import config from "../../../config";
import { Password } from "../../entity/Password";
import { LessThan } from "typeorm";
import {i18n} from "../../helpers/language";

export default class UserController {
  static async register(req: Request, res: Response) {
    let isValid = validate(req.body, Validation.register(true));

    //check wether request body has correct felids
    if (isValid) return errRes(res, isValid);

    //get request body
    let userObj = req.body;

    //check user phone validation
    let phoneNumber = PhoneFormat.getAllFormats(req.body.phone, "iq");
    if (!phoneNumber.isNumber) return errRes(res, i18n.__("phone invalid",req.body.phone));

    let user: any;

    //set formatted phone number to user
    userObj.phone = phoneNumber.globalP;

    //check if user phone no is used before
    user = await User.findOne({ where: { phone: req.body.phone } });
    if (user) return errRes(res, `Phone ${userObj.phone} already exists`);

    // prepare OTP
    let otp = generate4DigitCode();

    //complete user object fields
    user = {
      ...userObj,
      otp,
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

      // send user an sms with otp
      let smsStatus = await sendOtp(phoneNumber.globalP, otp);

      //everything just ok show me the result
      return okRes(res, { user, smsStatus });
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
      else if (user.otpTries > 2) {
        await user.remove();
        return errRes(res, "please register again");
      }

      //checking his otp
      if (req.body.otp == user.otp) {
        //update his status on db
        await User.update(user, { complete: true, otp: 0 });

        //delete security fields
        delete user.otp, user.complete, user.password;

        return okRes(res, user);
      } else {
        //otp wrong increase tries by 1
        ++user.otpTries;
        await user.save();
        return errRes(res, `OTP not match, ${4 - user.otpTries} tries left`);
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
    let phoneNumber = PhoneFormat.getAllFormats(req.body.phone, "iq");
    let password = req.body.password;

    //get user info from db
    try {
      const user = await User.findOne({
        where: {
          phone: phoneNumber.globalP,
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
          const token = jwt.sign({ id: user.id }, config.jwtSecret);

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

    try {
      //update user password
      User.update(req.user.id, {
        password: await hashMyPassword(req.body.newPassword),
      });
      // remove sensitive data from user obj ;
      delete req.user.password;

      return okRes(res, req.user);
    } catch (err) {
      return errRes(res, "server error", 500);
    }
  }

  static async forgetPassword(req: Request, res: Response) {
    //check user phone validation

    let phoneNumber = PhoneFormat.getAllFormats(req.body.phone, "iq");

    !phoneNumber.isNumber && errRes(res, "please check your phone number");

    //check user inputs
    let validation = validate(req.body, Validation.forgetPassword());

    if (validation) return errRes(res, validation);

    //redirect user with a random generated string used as limited time reference and save it user passwords table
    let randomString = require("randomstring");

    try {
      // get user obj from db
      let user: any;
      user = await User.findOne({ where: { phone: phoneNumber.globalP } });
      console.log(user);

      // if no phone associated with users
      if (!user) return errRes(res, "User found");

      let otp = generate4DigitCode();
      let password = Password.create({
        user: user.id,
        otp,
        reference: randomString.generate(64),
      }).save();

      // send sms to user with new otp
      let smsStatus = await sendOtp(phoneNumber.globalP, otp);

      //email change password url with reference

      // return reference code to user and redirect him to otp submit page
      return okRes(res, {
        reference: (await password).reference,
        redirect: "/otp_submit",
        smsStatus,
      });
    } catch (err) {
      return errRes(res, "server error", 500);
    }
  }

  static async otpSubmit(req: Request, res: Response) {
    //get reference code from url
    let reference = req.params.reference;
    if (!reference) {
      return errRes(res, "Reference not found");
    }

    //check user inputs
    let validation = validate(req.body, Validation.changePasswordByOtp());
    if (validation) return errRes(res, validation);

    //matching  passwords then hash
    if (req.body.newPassword !== req.body.confirmPassword)
      return errRes(res, "passwords not matched");

    // find change password request reference in the db
    try {
      let password = await Password.findOne({
        where: {
          reference: req.params.reference,
          confirmed: false,
          tries: LessThan(3),
        },
      });

      //TODO: check if password reference expired
      if (!password) return errRes(res, "reference no valid");

      //compare opt`s then hash new password
      if (password.otp === req.body.otp) {
        let passwordHash = await hashMyPassword(req.body.newPassword);

        //change user password
        let user: any;
        user = await User.findOne(password.user);
        user.password = passwordHash;
        user.save();

        // finish password reference request
        password.otp = null;
        password.confirmed = true;
        password.changedAt = new Date();
        password.save();

        return okRes(res, {
          message: "password changed successfully",
          redirect: "/login",
        });
      } else {
        //increase  password tries counter by one if user enter false otp
        password.tries++;
        password.save();
        return errRes(res, "otp not correct");
      }
    } catch (err) {
      return errRes(res, "server error", 500);
    }
  }
}
