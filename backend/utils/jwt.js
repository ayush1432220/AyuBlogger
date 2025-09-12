import jwt from "jsonwebtoken";

export const generateJWT = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );
};
