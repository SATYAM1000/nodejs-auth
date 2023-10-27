/** @format */

import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

class UserController {
	static userRegistration = async (req, res) => {
		const { name, email, password, password_confimation, tc } = req.body;
		const user = await UserModel.findOne({ email: email });
		if (user) {
			res.send({ status: "failed", message: "email already exists" });
		} else {
			if (name && email && password && password_confimation && tc) {
				if (password === password_confimation) {
					try {
						const doc = new UserModel({
							name: name,
							email: email,
							password: password,
							tc: tc,
						});

						await doc.save();
						const saved_user = await UserModel.find({ email: email });
						//-----------generate JWT-----------------------
						const token = jwt.sign(
							{ userID: saved_user._id },
							process.env.SECRET_KEY,
							{ expiresIn: "5d" }
						);
						res.status(200).json({
							message: "User registered successfully...",
							token: token,
						});
					} catch (error) {
						console.log(error);
						res.send({
							status: "failed",
							message: "Registration failed...",
						});
					}
				} else {
					res.send({
						status: "failed",
						message: "Password and Confirm Password does not match...",
					});
				}
			} else {
				res.send({ status: "failed", message: "All fields are required..." });
			}
		}
	};

	static userLogin = async (req, res) => {
		try {
			const { email, password } = req.body;
			if (email && password) {
				const user = await UserModel.findOne({ email: email });
				if (user) {
					const isMatch = await bcrypt.compare(password, user.password);
					if (user.email === email && isMatch) {
						const token = jwt.sign(
							{ userID: user._id },
							process.env.SECRET_KEY,
							{ expiresIn: "5d" }
						);
						res.status(200).send({
							status: "success",
							message: "login successfull",
							token: token,
						});
					} else {
						res.send({ status: "failed", message: "Login failed" });
					}
				} else {
					res.send({
						status: "failed",
						message: "You are not registered user...",
					});
				}
			} else {
				res.send({ status: "failed", message: "All fields are required..." });
			}
		} catch (error) {
			console.log(error);
			res.send({ status: "failed", message: "login failed" });
		}
	};

	static changeUserPassword = async (req, res) => {
		const { password, password_confimation } = req.body;
		if (password && password_confimation) {
			if (password !== password_confimation || password.length < 8) {
				res.send({
					status: "failed",
					message: "Issue in this password",
				});
			} else {
				const salt = await bcrypt.genSalt(10);
				const newHashPassword = await bcrypt.hash(password, salt);
				await UserModel.findByIdAndUpdate(req.user._id, {
					$set: { password: newHashPassword },
				});
				res.send({ message: "Password changed successfully..." });
			}
		} else {
			res.send({ status: "failed", message: "All fields are required..." });
		}
	};

	static loggedUser = async (req, res) => {
		res.send({ user: req.user });
	};

	static sendUserPasswordResetEmail = async (req, res) => {
		const { email } = req.body;
		if (email) {
			const user = await UserModel.findOne({ email: email });

			if (user) {
				const secret = user._id + process.env.SECRET_KEY;
				const token = jwt.sign({ userID: user._id }, secret, {
					expiresIn: "15m",
				});
				const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
				console.log(link);
				//send email ---------------------------------

				let info = await transporter.sendMail({
					from: process.env.EMAIL_FROM,
					to: user.email,
					subject: "Password reset link",
					html: `<a href=${link}>Click Here</a> to reset your password`,
				});
				res.send({
					status: "success",
					message: "Email sent... Please check your Email",
				});
			} else {
				res.send({ status: "failed", message: "Email does not exist..." });
			}
		} else {
			res.send({ status: "failed", message: "Email field is required" });
		}
	};

	static userPasswordReset = async (req, res) => {
		const { password, password_confimation } = req.body;
		const { id, token } = req.params;
		const user = await UserModel.findById(id);
		const new_secret = user._id + process.env.SECRET_KEY;
		try {
			jwt.verify(token, new_secret);
			if (password && password_confimation) {
				if (password === password_confimation) {
					if (password.length < 8) {
						res.send({ status: "failed", message: "Password is too short..." });
					} else {
						const salt = await bcrypt.genSalt(10);
						const newHashPassword = await bcrypt.hash(password, salt);
						await UserModel.findByIdAndUpdate(user._id, {
							$set: { password: newHashPassword },
						});
						res.send({
							status: "success",
							message: "password reset successfully...",
						});
					}
				} else {
					res.send({
						status: "failed",
						message: "Password and confirmation passworrd does not match...",
					});
				}
			} else {
				res.send({ status: "failed", message: "All fields are required" });
			}
		} catch (error) {
			console.log(error);
			res.send({ status: "failed", message: "Invalid Token" });
		}
	};
}

export default UserController;
