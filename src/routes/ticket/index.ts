import { Router } from "express";
import ticket from "./ticket.controller";
import { authorizeAdmin } from "../../middleware/authorize";

export default () => {
  const router: Router = Router();
  router.post(
    "/refill/all/user",
    authorizeAdmin,
    ticket.refillAllUserController
  );
  // -----
  router.post("/refill", authorizeAdmin, ticket.refillTicketAllUserController);
  router.post(
    "/refill/role/filter",
    authorizeAdmin,
    ticket.refillAllFilterByRoleController
  );
  router.post(
    "/refill/department/filter",
    authorizeAdmin,
    ticket.refillTicketAllUserFilterByDepartmentController
  );
  router.post(
    "/refill/department/batch/filter",
    authorizeAdmin,
    ticket.refillTicketAllUserFilterByDepartmentAndBatchController
  );
  router.post(
    "/refill/particular/user",
    authorizeAdmin,
    ticket.refillParticularUserController
  );

  return router;
};
