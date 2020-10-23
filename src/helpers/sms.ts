import config from "../../config";

const accountSid = config.ACCOUNT_SID;
const authToken = config.AUTH_TOKEN;
const senderPhone = config.TWILIO_PHONE_NUMBER;
const client = require("twilio")(accountSid, authToken);

export const sendOtp = async (to: string, otp: number, from = senderPhone) => {
  try {
    let message = await client.messages.create({
      body: `Yousif Shop OTP code is: ${otp}`,
      from,
      to,
    });

    return message;
  } catch (err) {
    return err;
  }
};
