export const sendToken = (user, statusCode, message, res) => {
  console.log("send token is called");
  
  const token = user.generateToken();

  const cookieExpireDays = Number(process.env.COOKIE_EXPIRE);
  const expireDays = isNaN(cookieExpireDays) ? 5 : cookieExpireDays;

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true on Render
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    })
    .json({
      success: true,
      message,
      token,
      user,
    });
};
