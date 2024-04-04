import { Router } from "express";
import cancel from "./cancel.controller";
import { authorizeAdmin } from "../../middleware/authorize";

export default () => {
  const router: Router = Router();
  router.get("/", authorizeAdmin, cancel.getAllCancel);
  router.get(
    "/schedule/filter?",
    authorizeAdmin,
    cancel.getAllCancelByScheduleId
  ); //query:scheduleId
  return router;
};
