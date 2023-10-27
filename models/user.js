/** @format */

import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		validate(value){
			if(value.length<2){
				throw new Error("User name not valid")
			}
		}
	},
	email: {
		type: String,
		required: true,
		trim: true,
		validate(value){
			if(!(validator.isEmail(value))){
				throw new Error("Invalid user email")
			}
		}
	},
	password: {
		type: String,
		required: true,
		trim: true,
		validate(value){
			if(value.length<8){
				throw new Error("Password length must be greater than 8")
			}
		}
	},
	tc: {
		type: Boolean,
		required: true,
	},
});

userSchema.pre('save', async function(next){
	if(this.isModified('password')){
        this.password=await bcrypt.hash(this.password, 10);
    }
    next()

})

const UserModel=mongoose.model('user', userSchema);

export default UserModel;
