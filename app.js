require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const Category = require("./models/category");
var MongoStore = require("connect-mongo")(session);
const connectDB = require("./config/db");

const app = express();

require("./config/passport");

// mongodb configuration
connectDB();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
    }),
    //session expires after 3 hours
    cookie: { maxAge: 60 * 1000 * 60 * 3 },
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.post("/pay", (req, res) => {
  const sizpayConfig = {
    username: "ifMUHma6ofHLstbahr6nH3MqhGjCzVnzwuecXGwWQEA=",
    password: "oXia//RRuffpChmhae2ed7FuOSwu7agndprF0piy8r0=",
    back_url: "http://localhost:8081/result.html",
    merchant_id: "500118010900011",
    terminal_id: "18001451",
    base_url: "https://rt.sizpay.ir/api/PaymentSimple",
  };
  let varGetTokenContent = {
    Username: sizpayConfig.username,
    Password: sizpayConfig.password,
    MerchantID: sizpayConfig.merchant_id,
    TerminalID: sizpayConfig.terminal_id,
    DocDate: "",
    ReturnURL: sizpayConfig.back_url,
    ExtraInf: "",
    Amount: "0",
    OrderID: "1",
    InvoiceNo: "1",
    AppExtraInf: {
      PayerNm: "",
      PayerMobile: "",
      PayerEmail: "",
      Descr: "",
      PayerIP: "",
      PayTitle: "",
    },
    SignData: "",
  };
  console.log(req.body, "req.body");
  varGetTokenContent["Amount"] = JSON.stringify(req.body.Amount);
  varGetTokenContent["OrderID"] = JSON.stringify(req.body.OrderID);
  varGetTokenContent["InvoiceNo"] = JSON.stringify(req.body.InvoiceNo);

  console.log(varGetTokenContent, "varGetTokenContent");

  var options = {
    method: "POST",
    url: sizpayConfig.base_url + "/GetTokenSimple",
    headers: {
      "Content-Type": "application/json",
    },
    body: varGetTokenContent,
  };
  axios(options)
    .then((wres) => {
      console.log(wres, "wres");
      let response = JSON.parse(wres);

      varPayment = {
        MerchantID: sizpayConfig.merchant_id,
        TerminalID: sizpayConfig.terminal_id,
        Token: response.Token,
      };

      if (response.ResCod == "0" || response.ResCod == "00") {
        return res.status(200).json({
          data: {
            method: "POST",
            url: "https://rt.sizpay.ir/Route/Payment",
            MerchantID: varPayment["MerchantID"],
            TerminalID: varPayment["TerminalID"],
            Token: varPayment["Token"],
          },
        });
      }
    })
    .catch((e) => {
      console.log(e.response, "E");
    });
});
// global variables across routes
app.use(async (req, res, next) => {
  try {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    res.locals.currentUser = req.user;
    const categories = await Category.find({}).sort({ title: 1 }).exec();
    res.locals.categories = categories;
    next();
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// add breadcrumbs
get_breadcrumbs = function (url) {
  var rtn = [{ name: "Home", url: "/" }],
    acc = "", // accumulative url
    arr = url.substring(1).split("/");

  for (i = 0; i < arr.length; i++) {
    acc = i != arr.length - 1 ? acc + "/" + arr[i] : null;
    rtn[i + 1] = {
      name: arr[i].charAt(0).toUpperCase() + arr[i].slice(1),
      url: acc,
    };
  }
  return rtn;
};
app.use(function (req, res, next) {
  req.breadcrumbs = get_breadcrumbs(req.originalUrl);
  next();
});

//routes config
const indexRouter = require("./routes/index");
const productsRouter = require("./routes/products");
const usersRouter = require("./routes/user");
const pagesRouter = require("./routes/pages");
app.use("/products", productsRouter);
app.use("/user", usersRouter);
app.use("/pages", pagesRouter);
app.use("/", indexRouter);

const adminRouter = require("./routes/admin");
const { default: axios } = require("axios");
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

var port = process.env.PORT || 3000;
app.set("port", port);
app.listen(port, () => {
  console.log("Server running at port " + port);
});

module.exports = app;
