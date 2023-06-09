const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const Order = require("../models/order");
const generateVPN = require("./../utils/v2ray").generateVPN;
const nodemailer = require("nodemailer");
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

function generateRandomString() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

const smtpTrans = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    // company's email and password
    user: "shakewellagency@gmail.com",
    pass: "lmfrhaoxdrdvvoun",
  },
  requireTLS: true,
});

passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        if (req.body.refCode) {
          const user = await User.findOne({ email: email });
          if (user) {
            return done(null, false, { message: "Email already exists" });
          }
          if (password != req.body.password2) {
            return done(null, false, { message: "Passwords must match" });
          }
          const newUser = await new User();
          newUser.email = email;
          const ref = generateRandomString();
          newUser.refCode = ref;
          newUser.invitedFromCode = req.body.refCode || null;
          newUser.password = newUser.encryptPassword(password);
          newUser.username = req.body.name;
          await newUser.save();

          const mailOpts1 = {
            from: "shakewellagency@gmail.com",
            to: email,
            subject: `Enquiry from ${req.body.name}`,
            html: `
          <div>
          <h3 style="color: #478ba2;">your Referral code is :  (${ref})<h3>
          </br>
          <h3 style="color: #478ba2;">we will give you 5 Gig per invited user<h3>
          </div>
        
          `,
          };
          // send the email
          smtpTrans.sendMail(mailOpts1);

          return done(null, newUser);
        }
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: false,
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "User doesn't exist" });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: "Wrong password" });
        }
        return done(null, user);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);
