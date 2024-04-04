import { Router } from "express";
import dashboard from "./dashboard.controller";
import { authorizeAdmin } from "../../middleware/authorize";

export default () => {
  const router: Router = Router();
  router.get("/user", authorizeAdmin, dashboard.getAllUserDashboardController);
  router.get(
    "/:department",
    authorizeAdmin,
    dashboard.getAllStudentByBatchIdController
  );
  router.get(
    "/:department/:batch",
    authorizeAdmin,
    dashboard.getAllStudentByDepartmentNameAndBatchController
  );
  return router;
};
