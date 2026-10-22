import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid) {
  throw new Error("TWILIO_ACCOUNT_SID is not configured.");
}

if (!authToken) {
  throw new Error("TWILIO_AUTH_TOKEN is not configured.");
}

if (!twilioPhoneNumber) {
  throw new Error("TWILIO_PHONE_NUMBER is not configured.");
}

const twilioClient = twilio(accountSid, authToken);

export async function sendOtpSms(
  mobileNumber: string,
//   otp: string
) {
  const message = await twilioClient.messages.create({
    // body: `Your verification code is ${otp}. It expires in 5 minutes. Do not share it. Test message from Twilio.`,
    body: "sms_2fa",
    from: twilioPhoneNumber,
    to: mobileNumber,
  });

  return {
    console: `OTP sent to ${mobileNumber}. SID: ${message.sid}, Status: ${message.status}`,
    sid: message.sid,
    status: message.status,
  };
}