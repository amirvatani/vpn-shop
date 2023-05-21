var pjson = require("./package.json");

module.exports.getToken = (prmContent, callBack) => {
  console.log("getToken start ");

  var req = require("request");

  var options = {
    method: "POST",
    url: pjson.sizpay_config.base_url + "/GetTokenSimple",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(prmContent),
  };
  console.log(options, "options");

  req(options, function (error, response) {
    if (error) throw new Error(error);
    callBack(response.body);
  });
};

module.exports.sizpayConfirm = (prmContent, callBack) => {
  console.log("sizpayConfirm start ");

  var req = require("request");

  var options = {
    method: "POST",
    url: pjson.sizpay_config.base_url + "/ConfirmSimple",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(prmContent),
  };

  req(options, function (error, response) {
    if (error) throw new Error(error);
    callBack(response.body);
  });
};
