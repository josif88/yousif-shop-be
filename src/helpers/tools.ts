import { Response } from "express";
import * as bcrypt from "bcrypt";

/**
 *
 * @param res
 * @param err
 * @param statusCode
 */
export const errRes = (res: Response, err, statusCode = 400) => {
  let response = { status: false, err };
  res.statusCode = statusCode;
  return res.json(response);
};

/**
 *
 * @param res
 * @param err
 * @param statusCode
 */
export const okRes = (res: Response, data, statusCode = 200) => {
  let response = { status: true, data };
  res.statusCode = statusCode;
  return res.json(response);
};

export const generate4DigitCode = () => {
  let code = Math.floor(1000 + Math.random() * 9000);
  return code;
};

export const hashMyPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(plainPassword, salt);
  return password;
};

export const comparePasswords = async (password: any, storedPassword: any) => {
  const result = await bcrypt.compare(password, storedPassword);
  return result;
};
