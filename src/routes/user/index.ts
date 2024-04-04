import { Router } from "express";
import user from "./user.controller";
import { authForget } from "../../middleware/forgetauth";
import { authMiddleware } from "../../middleware/auth";
import { authorizeAdmin, authorizeUser } from "../../middleware/authorize";
const uploadFile = require("multer")();

export default () => {
  const router: Router = Router();
  router.get("/excel?", authorizeAdmin, user.exportAllUser);
  router.get(
    "/excel/student/department/filter",
    authMiddleware,
    authorizeAdmin,
    user.exportStudentByDepartmentController
  );
  router.get(
    "/excel/student/department/batch/filter",
    authMiddleware,
    authorizeAdmin,
    user.exportStudentByDepartmentAndBatchController
  );

  router.post("/login/vkclub", user.loginVKclubController);
  router.post("/login/user", user.loginController);
  router.post("/login/admin", user.loginAdminController);

  router.put(
    "/update/enableStatus/role/filter?",
    authMiddleware,
    authorizeAdmin,
    user.handleEnableAllUserByRoleController
  );
  router.put(
    "/update/enableStatus/batchId/filter?",
    authMiddleware,
    authorizeAdmin,
    user.handleEnableStudentOfDeptAndBatchByBatchIdController
  );

  router.delete(
    "/:id",
    authMiddleware,
    authorizeAdmin,
    user.deleteUserController
  );
  router.post("/login/vk_club", user.loginAdminController);
  router.get("/:id", authMiddleware, user.getUserByIdController);
  router.put("/:id", authMiddleware, user.updateUserController);

  router.post("/request/reset-password", user.requestResetPasswordController);
  router.post(
    "/request/reset-password/admin",
    user.requestResetPasswordAdminController
  );
  router.get(
    "/request/reset-password/:token",
    authForget,
    user.getTemplateResetPasswordWithTokenController
  );
  router.post(
    "/request/reset-password/:token",
    authForget,
    user.confirmResetPasswordWithTokenController
  );

  router.post("/", authMiddleware, authorizeAdmin, user.createUserController);
  router.post("/register", user.registerController);
  router.post(
    "/change-password",
    authMiddleware,
    user.changePasswordController
  );

  router.get("/", authMiddleware, authorizeAdmin, user.getAllUserController);
  router.post(
    "/import",
    authMiddleware,
    uploadFile.single("file"),
    authorizeAdmin,
    user.importUser
  );
  return router;
};
