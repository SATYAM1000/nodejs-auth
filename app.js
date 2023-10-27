/** @format */

import dotenv from "dotenv";
dotenv.config(); // will read the .env file and will store the variables in process.env object
import express from "express";
import cors from "cors";
import connectDB from "./config/connectdb.js";
import router from "./routes/userRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

connectDB(DATABASE_URL);
app.use("/api/user",router);

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`);
});
