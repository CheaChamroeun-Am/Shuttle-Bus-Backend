import config from "../config/config";
import { CustomError } from "../handler/customError";
import jwt from "./jwt-generate";
import moment from "moment";

const nodemailer = require("nodemailer");
const Email = require("email-templates");

export const mail = async (sendTo: string, name: string, password: string) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: "gmail",
    auth: {
      user: config.MAILUSER,
      pass: config.MAILPASS,
    },
  });
  const email = new Email({
    views: { root: "./src/views", options: { extension: "ejs" } },
    message: {
      from: "",
    },
    iSsecure: true,
    preview: false,
    send: true,
    transport: transporter,
  });
  try {
    const mail = await email
      .send({
        template: "credential",
        message: {
          to: sendTo,
        },
        locals: {
          name: name,
          password: password,
          email: sendTo,
        },
      })
      .then(console.log(`Mail sent successfully to ${sendTo}`));
    return "mail";
  } catch (error) {
    throw new CustomError(500, "Error in sending mail");
  }
};

export const mailResetPassword = async (sendTo: string, name: string) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      service: "gmail",
      pool: true,
      auth: {
        user: config.MAILUSER,
        pass: config.MAILPASS,
      },
    });

    const token = jwt.forgetPasswordToken(sendTo);

    const url = `${config.BASE}/user/request/reset-password/${token.forgetPasswordToken}`;
    const email = new Email({
      views: { root: "./src/views", options: { extension: "ejs" } },
      message: {
        from: "",
      },
      iSsecure: true,
      preview: false,
      send: true,
      transport: transporter,
    });
    const send = await email
      .send({
        template: "resetpassword",
        message: {
          to: sendTo,
        },
        locals: {
          url: url,
          name: name,
        },
      })
      .then(console.log(`Mail sent successfully to ${sendTo}`))
      .catch();
    return send;
  } catch (error) {
    throw new CustomError(500, "Error in sending mail");
  }
};

export const mailConfirmSchedule = async (
  schedule: any,
  list_booking: any[]
) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      service: "gmail",
      pool: true,
      auth: {
        user: config.MAILUSER,
        pass: config.MAILPASS,
      },
      rateLimit: 100,
    });
    const email = new Email({
      views: { root: "./src/views", options: { extension: "ejs" } },
      message: {
        from: config.MAILUSER,
      },
      ISsecure: true,
      preview: false,
      send: true,
      transport: transporter,
    });
    const emailPromises = list_booking.map(async (book) => {
      try {
        email.send({
          template: "confirm_booking",
          message: {
            to: book.user.email,
          },
          locals: {
            booking_date: moment(book.createdAt).format("YYYY/MMMM/DD"),
            from: schedule.departure.from.mainLocationName,
            to: schedule.departure.destination.mainLocationName,
            departure: moment(schedule.date).format("YYYY/MMMM/DD"),
            name: book.user.username,
          },
        });

        console.log(`Mail sent successfully to ${book.user.email}`);
      } catch (error: any) {
        console.error(
          `Error sending mail to ${book.user.email}: ${error.message}`
        );
      }
    });

    // Wait for all email sending promises to complete
    await Promise.all(emailPromises);

    return "Mail sending process completed";
  } catch (error: any) {
    throw new CustomError(500, "Error in sending mail");
  }
};
