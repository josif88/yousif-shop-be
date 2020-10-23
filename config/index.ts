require("dotenv").config();

let config: any;
export default config = {
  jwtSecret: process.env.JWT_SECRET || "password",
  ZC_SECRET: process.env.ZC_SECRET,
  MSISD: process.env.MSISD,
  MERCHANT_ID: process.env.MERCHANT_ID,
  PAYMENT_REDIRECT_URL: process.env.PAYMENT_REDIRECT_URL,
  // twilio secrets
  ACCOUNT_SID: process.env.ACCOUNT_SID,
  AUTH_TOKEN: process.env.AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
};
