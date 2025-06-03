import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const { genSaltSync, hashSync, compareSync } = bcrypt;
const { sign, verify } = jwt;

export const generateHashedPassword = (password) => {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
};

export const comparePassword = (password, hashedPassword) => {
  return compareSync(password, hashedPassword);
}

export const createAccessToken = (id) => {
	const token = sign({ id }, JWT_SECRET, { expiresIn: '4h' });
	return token;

};
export const isTokenValid = (token) => {
	try {
		const decoded = verify(token, JWT_SECRET);
		return decoded;
	} catch (error) {
		return null;
	}
}
