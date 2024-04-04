import { Router } from "express";
import waiting from "./waiting.controller";
import { authorizeAdmin, authorizeUser } from "../../middleware/authorize";

export default () => {
  const router: Router = Router();
  router.get("/", authorizeAdmin, waiting.getAllWaitingController);
  router.get(
    "/user/filter?",
    authorizeUser,
    waiting.getAllWaitingOfUserController
  ); //query: userId
  router.get("/schedule/filter?", waiting.getWaitingByScheduleIdController); //query: scheduleId
  router.delete(
    "/schedule/filter?",
    authorizeAdmin,
    waiting.deleteAllWaitingsByScheduleIdController
  );
  router.delete("/", authorizeAdmin, waiting.deleteAllWaitingsController);
  return router;
};
