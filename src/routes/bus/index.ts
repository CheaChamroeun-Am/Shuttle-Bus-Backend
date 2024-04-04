import { Router } from "express";
import bus from "./bus.controller";
import { authorizeAdmin } from "../../middleware/authorize";

export default () => {
  const router: Router = Router();
  router.post("/", authorizeAdmin, bus.createBusController);
  router.get("/", bus.getAllBusController);
  router.get("/:id", bus.getBusByIdController);
  router.put("/:id", authorizeAdmin, bus.updateBusController);
  router.delete("/:id", authorizeAdmin, bus.deleteBusController);
  return router;
};
