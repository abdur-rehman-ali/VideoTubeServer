import express from "express";
import userRoutes from "./routes/user.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";

const app = express();

app.use(express.json({ limit: "16kb" })); // raw json format data parser
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.get("/api/v1", (req, res) => {
  res.status(200).json({ message: "OK" });
});
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);

export default app;
