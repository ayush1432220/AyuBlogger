import ErrorHandler from "../middlewares/error.js";
import { AsyncError } from "../middlewares/AsyncError.js";
import { User } from "../models/user.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import { generateJWT } from "../utils/jwt.js";
import crypto from "crypto";
import bcrypt from "bcrypt";


export const register = AsyncError(async (req, res, next) => {
  console.log(`register route is called`);
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new ErrorHandler("All Fields are required", 400));
    }

    // const existingUser = await User.findOne({
    //   email,
    //   accountVerified: true,
    // });
    // if (existingUser) {
    //   return next(new ErrorHandler("Email is registered", 400));
    // }
    // const registrationAttemptsByUser = await User.find({
    //   email,
    //   accountVerified: false,
    // });
    // if (registrationAttemptsByUser.length > 3) {
    //   return next(
    //     new ErrorHandler(
    //       "You have exceeded the maximum login attempts , Try again after some time",
    //       400
    //     )
    //   );
    // }

    // const user = new User({ name, email, password });
    // const verificationCode = await user.generateVerificationCode();
    // await user.save();
    // sendVerificationCode(verificationCode, email, res);
    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });

    let verificationCode;

    if (user && user.accountVerified) {
      return next(new ErrorHandler("Email is registered", 400));
    }

    if (user && !user.accountVerified) {
      verificationCode = await user.generateVerificationCode();
    } else {
      user = new User({ name, email: normalizedEmail, password });
      verificationCode = await user.generateVerificationCode();
    }

    await user.save();
    sendVerificationCode(verificationCode, normalizedEmail, res);
    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (err) {
    console.log(`Received this error ${err}`);
  }
});

async function sendVerificationCode(verificationCode, email, res) {
  try {
    const message = generateEmailTemplate(verificationCode);
    await sendEmail({ email, subject: "Your Verification Code", message });
  } catch (err) {
    console.error("Error sending email:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification email",
    });
  }
}

function generateEmailTemplate(verificationCode) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verification Code</title>
      <style>
        /* Tailwind-like utility styles for email compatibility */
        .bg-white { background-color: #ffffff; }
        .bg-gray-100 { background-color: #f7fafc; }
        .text-center { text-align: center; }
        .text-gray-800 { color: #2d3748; }
        .text-sm { font-size: 0.875rem; }
        .text-lg { font-size: 1.125rem; }
        .font-bold { font-weight: 700; }
        .rounded-md { border-radius: 0.375rem; }
        .shadow-md { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .my-6 { margin-top: 1.5rem; margin-bottom: 1.5rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .max-w-md { max-width: 28rem; }
        .text-blue-600 { color: #2563eb; }
        .tracking-widest { letter-spacing: 0.1em; }
        .border { border-width: 1px; border-style: solid; border-color: #e2e8f0; }
      </style>
    </head>
    <body class="bg-gray-100">
      <div class="max-w-md mx-auto my-6 bg-white p-6 rounded-md shadow-md">
        <h1 class="text-center text-lg font-bold text-gray-800">Email Verification</h1>
        <p class="text-center text-sm text-gray-800 mt-4">
          Use the code below to verify your email address:
        </p>
        <div class="text-center my-6">
          <span class="text-blue-600 text-lg font-bold tracking-widest border p-4 rounded-md inline-block">
            ${verificationCode}
          </span>
        </div>
        <p class="text-sm text-gray-800 text-center">
          This code is valid for 10 minutes. Please do not share it with anyone.
        </p>
        <p class="text-sm text-gray-800 text-center mt-4">
          If you did not request this, please ignore this email.
        </p>
      </div>
    </body>
  </html>
  `;
}

export const verifyOTP = AsyncError(async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const userAllEntries = await User.find({
      email: normalizedEmail,
    }).sort({ createdAt: -1 });
    if (!userAllEntries.length) {
      return next(new ErrorHandler("User Not Found", 400));
    }
    let user;

    if (userAllEntries.length > 1) {
      user = userAllEntries[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        email: normalizedEmail,
        accountVerified: false,
      });
    } else {
      user = userAllEntries[0];
    }
    if (user.accountVerified) {
      return res.status(200).json({
        success: true,
        message: "Account already verified",
      });
    }

    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }
    const currentTime = Date.now();
    const verificationCodeExpire = new Date(
      user.verificationCodeExpire
    ).getTime();
    console.log(`Current time ${currentTime}`);
    console.log(`verification Expiry ${verificationCodeExpire}`);
    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler("OTP is expired", 400));
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;
    await user.save({ validateModifiedOnly: true });
    return sendToken(user, 200, "Verifying the OTP", res);
  } catch (err) {
    return next(new ErrorHandler("GOt error in this verifiaction" + err, 400));
  }
});
export const login = AsyncError(async (req, res, next) => {
   console.log(`Login is called`);
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Email and password is required", 400));
  }
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
    accountVerified: true,
  }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password"), 400);
  }
  const verifyPassword = await user.comparePassword(password);
  if (!verifyPassword) {
    return next(new ErrorHandler("Invalid email or password"), 400);
  }
  return sendToken(user, 200, "User Logged in successfully", res);
});
export const logout = AsyncError(async (req, res, next) => {
  // console.log(`Logout is called`);
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "User logged out successfully",
    });
});
export const getUser = AsyncError(async (req, res, next) => {
  const user = req.user;
  // console.log(`getting user from backend ${user}`);
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgetPassword = AsyncError(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });
  if (!user) {
    return next(new ErrorHandler("Email is not registered", 400));
  }
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset${resetToken}`;
  const message = `Your reset Password token is ${resetPasswordUrl}\n\n If you have not requested this email please ignore it.;`;
  try {
    const normalizedEmail = user.email.trim().toLowerCase();
    await sendEmail({
      email: normalizedEmail,
      subject: "Authentication OTP For reset password",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Verification email sent to ${user.email} successfully`,
    });
  } catch (err) {}
});
export const editUser = AsyncError(async (req, res, next) => {
  const { name, email, bio } = req.body;
  if (req.file) {
    let profile_image_url = req.file.path;
    let filename = req.file.filename;
  }
  const user = await User.findOne({
    email: email,
    accountVerified: true,
  });
  console.log(user)
  if (!user) {
    return next(new ErrorHandler("Email is not registered", 400));
  }

   if (name) user.name = name;
  if (bio) user.bio = bio;

  if (req.file) {
    user.profile_image_url = req.file.path     
    }
  await user.save();

  res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    user
  });
});
export const googleAuthLogin = AsyncError(async (req, res, next) => {
  console.log("google login");
  console.log(req.user);

  try {
    const { name, email } = req.user;

    if (!name || !email) {
      return next(new ErrorHandler("All Fields are required", 400));
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ 
      email: normalizedEmail,
    });
    if(user.accountVerified){
      user.accountVerified=true;
    }

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      console.log(`Trying to create the user `)
      user = new User({
        name,
        email: normalizedEmail,
        password: hashedPassword,
      });
      if(!user.accountVerified){
        user.accountVerified=true;
        console.log(`Account is set to verified`);
      }
      await user.save();
    }

    const token = generateJWT(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:5173/");
  } catch (err) {
    console.log(`Received this error ${err}`);
    return next(new ErrorHandler("Google Auth Failed", 500));
  }
});
