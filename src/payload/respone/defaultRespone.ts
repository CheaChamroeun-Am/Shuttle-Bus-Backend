import { Response } from "express";
interface defaultRespone {
  data: any;
  message: string;
}
export function respone(
  res: Response,
  data: any,
  message: string,
  statusCode: number
) {
  const resData: defaultRespone = {
    message: message,
    data: data,
  };
  return res.status(statusCode).send(resData);
}
