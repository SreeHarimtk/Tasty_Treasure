const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'YOUR_EMAIL',
    pass: 'YOUR_PASSWORD',
  },
});




let otpStore = {};

app.post('/send-otp', (req, res) => {
  const email = req.body.email;
  const otp = randomstring.generate({ length: 6, charset: 'numeric' });

  otpStore[email] = otp;

  const mailOptions = {
    from: 'YOUR_EMAIL',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('Failed to send OTP.');
    } else {
      res.status(200).send('OTP sent successfully.');
    }
  });
});



module.exports ={
    nodemailer,
    randomstring
}