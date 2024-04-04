import { Router } from "express";
import booking from "./booking.controller";
import { authorizeUser, authorizeAdmin } from "../../middleware/authorize";

export default () => {
  const router: Router = Router();
  router.get("/", authorizeAdmin, booking.getAllBookingController);
  router.get("/:id", booking.getBookingByIdController);
  router.post("/", authorizeUser, booking.createBookingController);
  router.put("/:id", authorizeUser, booking.updateBookingController);
  router.get("/schedule/filter?", booking.getBookingByScheduleIdController);
  router.delete(
    "/cancel/:id",
    authorizeUser,
    booking.cancelBookingOrWaitingController
  );
  router.put("/swap/:id", authorizeAdmin, booking.swapBookingController);
  router.get(
    "/excel/schedule/filter?",
    authorizeAdmin,
    booking.exportExcelBookingByScheduleIdController
  );
  router.get(
    "/excel/date/filter?",
    authorizeAdmin,
    booking.exportExcelBookingByDateController
  );
  router.get(
    "/booking-waiting/date/filter?",
    booking.getAllBookingAndWaitingFilterByDateController
  );
  router.get(
    "/booking-waiting/department/date/filter?",
    authorizeAdmin,
    booking.getAllBookingAndWaitingFilterByDateAndDepartmentController
  );
  router.get(
    "/booking-waiting/department/batch/date/filter?",
    authorizeAdmin,
    booking.getAllBookingAndWaitingFilterByDateDepartmentAndBatchNumController
  );
  router.get(
    "/user/filter?",
    authorizeUser,
    booking.getAllBookingOfUserIdController
  ); //query: userId
  router.get(
    "/history/user/filter?",
    authorizeUser,
    booking.getAllBookingHistoryFilterByUserIdController
  ); //query: userId
  return router;
};
