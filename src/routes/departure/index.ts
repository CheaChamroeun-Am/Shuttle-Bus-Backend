import { Router } from "express";
import departure from "./departure.controller";
import { authorizeAdmin } from "../../middleware/authorize";

export default () => {
  const router: Router = Router();
  router.get("/", departure.getAllDepartureController);
  router.get("/:id", departure.getDepartureByIdController);
  router.post("/", authorizeAdmin, departure.createDepartureController);
  router.put("/:id", authorizeAdmin, departure.updateDepartureByIdController);
  router.delete("/:id", authorizeAdmin, departure.deleteDepartureController);
  return router;
};
