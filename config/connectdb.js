/** @format */

import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
	try {
		const DB_OPTIONS = {
			dbName: "satyamdb",
		};
		await mongoose.connect(DATABASE_URL, DB_OPTIONS);
		console.log("Connection successfull...");
	} catch (error) {
		console.log(error);
	}
};

export default connectDB;
