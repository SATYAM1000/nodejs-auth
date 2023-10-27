/** @format */

import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";

var checkUserAuth = async (req, res, next) => {
	let token;
	const { authorization } = req.headers;
	if (authorization && authorization.startsWith("Bearer")) {
		try {
			token = authorization.split(" ")[1];

			//verify token ----
			const { userID } = jwt.verify(token, process.env.SECRET_KEY);
            console.log(userID)
			//get user from token------
			req.user = await UserModel.findById(userID).select('-password');
            console.log(req.user)
			next();
		} catch (error) {
            res.status(401).send({"status":"failed", "message":"Unauthorized User"})
        }
	}
    if(!token){
        res.status(401).send({"status":"failed", "message":"Unauthorized User, No Token"})
    }
};

export default checkUserAuth;
