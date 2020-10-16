export default class Validation {
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
}
