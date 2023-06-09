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
const Cart = require("./models/cart");
const Order = require("./models/order");
const Product = require("./models/product");

const User = require("./models/user");
const { generateVPN } = require("./utils/v2ray");

var url = require("url");

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

const sizpayConfig = {
  username: "ifMUHma6ofHLstbahr6nH3MqhGjCzVnzwuecXGwWQEA=",
  password: "oXia//RRuffpChmhae2ed7FuOSwu7agndprF0piy8r0=",
  back_url: "http://freew3.ml/payment",
  merchant_id: "500118010900011",
  terminal_id: "18001451",
  base_url: "https://rt.sizpay.ir/api/PaymentSimple",
};
app.post("/pay", async (req, res) => {
  if (!req.body.OrderID) {
    return res.status(400).json({ message: "orderId not found" });
  }

  const cart = await Cart.findOne({ _id: req.body.OrderID });

  if (!cart) {
    return res.status(400).json({ message: "orderId not found" });
  }

  let varGetTokenContent = {
    Username: sizpayConfig.username,
    Password: sizpayConfig.password,
    MerchantID: sizpayConfig.merchant_id,
    TerminalID: sizpayConfig.terminal_id,
    DocDate: "",
    ReturnURL: sizpayConfig.back_url + "?cartId=" + req.body.OrderID,
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
  varGetTokenContent["Amount"] = parseInt(cart.totalCost);
  varGetTokenContent["OrderID"] = req.body.OrderID;
  varGetTokenContent["InvoiceNo"] = req.body.OrderID;

  console.log(varGetTokenContent, "varGetTokenContent");
  var options = {
    method: "POST",
    baseURL: sizpayConfig.base_url + "/GetTokenSimple",
    headers: {
      "Content-Type": "application/json",
    },
    data: varGetTokenContent,
  };
  axios(options)
    .then((wres) => {
      console.log(wres.data, "wres");
      let response = wres.data;

      varPayment = {
        MerchantID: sizpayConfig.merchant_id,
        TerminalID: sizpayConfig.terminal_id,
        Token: response.Token,
      };

      if (
        response.ResCod == 0 ||
        response.ResCod == "0" ||
        response.ResCod == "00"
      ) {
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

app.post("/payment", async (req, res) => {
  var q = url.parse(req.url, true);
  var filename = q.pathname;
  var hostname = q.host;
  var querySearch = q.search;
  var qData = q.query;
  var varConfirmDt = {};
  let flagPayment = false;

  if (
    querySearch != undefined &&
    querySearch != null &&
    querySearch.langth > 5
  ) {
    let varStatus = qData.st;
    let varMessage = qData.msg;
    return res.status(200).json({
      p1: varStatus,
      p2: varMessage,
    });
  } else {
    if (req.method == "POST") {
      var post = req.body;

      if (
        post["ResCod"] == "0" ||
        post["ResCod"] == 0 ||
        post["ResCod"] == "00"
      ) {
        console.log("Payment success.");
        flagPayment = true;

        varConfirmDt["UserName"] = sizpayConfig.username;
        varConfirmDt["Password"] = sizpayConfig.password;
        varConfirmDt["MerchantID"] = post["MerchantID"];
        varConfirmDt["TerminalID"] = post["TerminalID"];
        varConfirmDt["Token"] = post["Token"];
        varConfirmDt["SignData"] = "";

        axios({
          method: "POST",
          baseURL: "https://rt.sizpay.ir/api/PaymentSimple" + "/ConfirmSimple",
          headers: {
            "Content-Type": "application/json",
          },
          data: varConfirmDt,
        }).then(async (wres) => {
          let response = wres.data;

          if (
            response.ResCod == "0" ||
            response.ResCod === 0 ||
            response.ResCod == "00"
          ) {
            const cardId = req.params.cartId || req.query.cartId;
            const card = await Cart.findOne({ _id: cardId });

            const user = await User.findOne({ _id: card.user });

            const mapPromises = card.items.map((item, index) => {
              return new Promise(async (resolve) => {
                console.log(index, "index");
                const product = await Product.findOne({ _id: item.productId });
                const v2ray = await generateVPN({
                  fullName: user.username + index,
                  amountInGB: product.amount,
                });
                resolve({
                  productId: item.productId,
                  qty: item.qty,
                  price: item.price,
                  title: item.title,
                  productCode: item.productCode,
                  v2ray: {
                    total: v2ray.total,
                    remark: v2ray.remark,
                    url: v2ray.url,
                    port: v2ray.port,
                    id: JSON.parse(v2ray.settings).clients[0].id,
                  },
                });
              });
            });
            console.log(mapPromises, "mapPromises");
            const items = await Promise.all(mapPromises);
            console.log(items, "items");
            const order = new Order({
              user: card.user,
              cart: {
                totalQty: card.totalQty,
                totalCost: card.totalCost,
                items: items,
              },
              paymentId: {
                RefNo: response.RefNo,
                Amount: response.Amount,
                ResCod: response.ResCod,
              },
            });
            order.save(async (err, newOrder) => {
              if (err) {
                console.log(err);
                return res.redirect("/profile");
              }
              await card.save();
              await Cart.findByIdAndDelete(card._id);
              req.flash("success", "Successfully purchased");
              req.session.cart = null;
              res.redirect("/user/profile");
            });
          } else {
            return res.status(200).json({
              message: response.Message,
              code: response.ResCod,
            });
          }
        });
      } else {
        return res.status(200).json({
          message: post["ResCod"],
          code: post["Message"],
          date: new Date().getTime(),
        });
      }
    } else {
      return res.status(200).json({
        message: "bad method",
      });
    }
  }
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

var port = 80
app.set("port", port);
app.listen(port, () => {
  console.log("Server running at port " + port);
});

module.exports = app;
