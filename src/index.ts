import express from "express";
import { NextFunction, Request, Response } from "express";
import loaders from "./loaders";
import config from "./config/config";
import path from "path";
import { CustomError } from "./handler/customError";
function app() {
  const app = express();
  const port = config.PORT || 6000;
  loaders(app);
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  //config error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // Custom error handling logic
    if (err instanceof CustomError) {
      // Handle specific error type
      res.status(err.statusCode).json({ error: err.message });
    } else {
      // Handle other types of errors
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.set("views", path.join(__dirname + "/views"));
  app.use("/static", express.static("src/views"));
  app.listen(port, () => console.log(`Server is listening on port ${port}!`));
}
app();
