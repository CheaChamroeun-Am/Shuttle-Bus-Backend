import { Router } from "express";
import mainLocation from "./mainLocation.controller";
import { authorizeAdmin } from "../../middleware/authorize";

export default () => {
  const router: Router = Router();
  router.get("/", mainLocation.getAllMainLocationController);
  router.get(
    "/location/filter",
    mainLocation.getAllMainLocationFilterByNameController
  );
  router.get("/:id", mainLocation.getMainLocationByIdController);
  router.post("/", authorizeAdmin, mainLocation.createMainLocationController);
  router.put("/:id", authorizeAdmin, mainLocation.updateMainLocationController);
  router.delete(
    "/:id",
    authorizeAdmin,
    mainLocation.deleteMainLocationController
  );

  return router;
};
