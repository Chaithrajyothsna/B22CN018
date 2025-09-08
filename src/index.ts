import express from "express";
import { requestLogger, errorReporter } from "./middleware/logging";
import { doSomething } from "./controllers/exampleController";

const app = express();
app.use(express.json());
app.use(requestLogger);

app.get("/do", doSomething);

// place the error reporter near the end
app.use(errorReporter);

app.listen(3000, () => console.log("server listening on 3000"));
