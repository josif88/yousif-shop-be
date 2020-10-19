export default class Validation {
  /**
   *
   * @param must
   */
  static changePassword = (must = true) => ({
    currentPassword: {
      presence: must,
      type: "string",
    },
    newPassword: {
      presence: must,
      type: "string",
      length: { minimum: 6, maximum: 15 },
    },
    confirmPassword: {
      presence: must,
      type: "string",
      length: { minimum: 6, maximum: 15 },
    },
  });

  /**
   *
   * @param must
   */
  static forgetPassword = (must = true) => ({
    phone: {
      presence: must,
      type: "string",
      length: { maximum: 15, minimum: 10 },
    },
  });

  /**
   *
   * @param must
   */
  static changePasswordByOtp = (must = true) => ({
    otp: {
      presence: must,
      type: "number",
    },
    newPassword: {
      presence: must,
      type: "string",
      length: { minimum: 6, maximum: 15 },
    },
    confirmPassword: {
      presence: must,
      type: "string",
      length: { minimum: 6, maximum: 15 },
    },
  });

  /**
   *
   * @param must
   */
  static register = (must = true) => ({
    name: {
      presence: must,
      type: "string",
    },
    phone: {
      presence: must,
      type: "string",
      length: { maximum: 15, minimum: 10 },
    },
    password: {
      presence: must,
      type: "string",
      length: { minimum: 6, maximum: 15 },
    },
  });

  /**
   *
   * @param must
   */
  static otp = (must = true) => ({
    otp: {
      presence: must,
      length: { minimum: 4, maximum: 4 },
    },
  });

  /**
   *
   * @param must
   */
  static login = (must = true) => ({
    phone: {
      presence: must,
      length: { minimum: 10, maximum: 15 },
    },
    password: {
      presence: must,
      type: "string",
      length: { minimum: 6, maximum: 15 },
    },
  });

  /**
   *
   * @param must
   */
  static category = (must = true) => ({
    title: {
      presence: must,
      type: "string",
      length: { minimum: 1, maximum: 15 },
    },
    image: {
      presence: must,
      type: "string",
    },
  });

  /**
   *
   * @param must
   */
  static product = (must = true) => ({
    name: {
      presence: must,
      type: "string",
      length: { minimum: 1 },
    },
    price: {
      presence: must,
      type: "number",
    },
    image: {
      presence: must,
      type: "string",
    },
    description: {
      presence: must,
      type: "string",
    },
    category: {
      presence: must,
      type: "number",
    },
  });

  static method = (must = true) => ({
    title: {
      presence: must,
      type: "string",
      length: { minimum: 1 },
    },
    min: {
      presence: must,
      type: "number",
    },
    max: {
      presence: must,
      type: "number",
    },
    url: {
      presence: must,
      type: "string",
    },
    image: {
      presence: must,
      type: "string",
    },
  });
}
