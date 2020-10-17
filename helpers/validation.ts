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
}
