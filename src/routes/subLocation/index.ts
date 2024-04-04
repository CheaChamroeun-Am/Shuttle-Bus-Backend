import { Router } from "express";
import subLocation from "./subLocation.controller";
import { authorizeAdmin } from "../../middleware/authorize";
export default () => {
  const router: Router = Router();
  router.get("/", subLocation.getAllSubLocationController);
  router.get(
    "/mainLocation/filter",
    subLocation.getAllSubLocationFilterByMainLocIdController
  );
  router.get("/:id", subLocation.getSubLocationByIdController);
  router.post("/", authorizeAdmin, subLocation.createSubLocationController);
  router.put("/:id", authorizeAdmin, subLocation.updateSubLocationController);
  router.delete(
    "/:id",
    authorizeAdmin,
    subLocation.deleteSubLocationController
  );
  return router;
};
