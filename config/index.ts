require("dotenv").config();

let config: any;
export default config = {
  jwtSecret: process.env.JWT_SECRET || "password",
  ZC_SECRET: process.env.ZC_SECRET || "$2y$10$xlGUesweJh93EosHlaqMFeHh2nTOGxnGKILKCQvlSgKfmhoHzF12G",
};
