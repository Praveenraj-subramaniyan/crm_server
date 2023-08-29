const User = require("../Models/User");
const { sendMail } = require("../Controller/SendMail");
const bcrypt = require("bcryptjs");

async function ForgetPassword(email) {
  try {
    const userDetails = await User.findOne({ email });
    if (userDetails) {
      userDetails.forgetPassword = {};
      const otp = generateOTP();
      const salt = await bcrypt.genSalt(10);
      const hashedOTP = await bcrypt.hash(otp, salt);
      userDetails.forgetPassword = {
        time: new Date(),
        otp: hashedOTP,
      };
      await userDetails.save();
      const content = `
        <h4>Hi there,</h4>
        <p>Your OTP is: ${otp}</p>
        <p><b>Regards</b>,</p>
        <P>CRM</p>
      `;
      sendMail(email, "Forget Password - OTP", content);
    }
    return true;
  } catch (error) {
    return "Server busy";
  }
}

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}
async function NewPassword(email, otp, newPassword) {
  const salt = await bcrypt.genSalt(10);
  try {
    const userDetails = await User.findOne({ email });
    if (userDetails) {
      const validOTP =  bcrypt.compare(
        otp,
        userDetails.forgetPassword.otp
      );
      if (validOTP) {
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        userDetails.forgetPassword = {};
        userDetails.password = hashedPassword;
        await userDetails.save();
        const content = `
        <h4>Hi there,</h4>
        <p>Password changed successfully</p>
        <p><b>Regards</b>,</p>
        <P>CRM</p>
      `;
        sendMail(email, "New Password", content);
        return true;
      } else {
        return "Invalid OTP";
      }
    } else {
      return "Invalid User";
    }
  } catch (error) {
    return "Invalid User";
  }
}
module.exports = { ForgetPassword, NewPassword,generateOTP };
