import { loggerWarn } from "../config/logger/customeLogger";

//create custom error class
class CustomError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
export { CustomError };
