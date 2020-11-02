import * as path from "path";
import { I18n } from "i18n";

// language configuration
export const i18n = new I18n({
  locales: ["en", "ar"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "en",
});
