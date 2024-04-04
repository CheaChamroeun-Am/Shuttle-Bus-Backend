import { Router } from "express";
import batch from "./batch.controller";
import { authorizeAdmin } from "../../middleware/authorize";

export default () => {
  const router: Router = Router();
  router.get("/", batch.getAllBatch);
  router.get(
    "/department/filter",
    // loggerInfo("Info message"),
    batch.getAllBatchFilterByDepartment
  );
  router.get("/:id", batch.getBatchById);
  router.post("/", authorizeAdmin, batch.createBatch);
  router.put("/:id", authorizeAdmin, batch.updateBatch);
  router.delete("/:id", authorizeAdmin, batch.deleteBatch);
  return router;
};
