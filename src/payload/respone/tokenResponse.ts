import { Response } from "express";
interface tokenResponse {
  data: any;
  message: string;
  accessToken: string;
  refreshToken: string;
}

export function tokenResponse(
  res: Response,
  data: any,
  accessToken: any,
  refreshToken: any,
  message: string,
  statusCode: number
) {
  const resData: tokenResponse = {
    data: data,
    accessToken: accessToken,
    refreshToken: refreshToken,
    message: message,
  };
  return res.status(statusCode).send(resData);
}
