const style = {
  base: {
    color: "#32325d",
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: "antialiased",
    fontSize: "16px",
  },
  invalid: {
    color: "#fa755a",
    iconColor: "#fa755a",
  },
};

// Handle form submission.
const $form = $("#checkout-form");

var myRedirect = function (redirectUrl, MerchantID, TerminalID, Token) {
  var form = $(
    '<form action="' +
      redirectUrl +
      '" method="post">' +
      '<input type="hidden" name="MerchantID" value="' +
      MerchantID +
      '"></input>' +
      '<input type="hidden" name="TerminalID" value="' +
      TerminalID +
      '"></input>' +
      '<input type="hidden" name="Token" value="' +
      Token +
      '"></input>' +
      "</form>"
  );
  $("body").append(form);
  $(form).submit();
};

$form.submit(function (event) {
  console.log("OMAD");
  event.preventDefault();
  $form.find("button").prop("disabled", true);
  OrderID = $("#cardId").val();

  axios
    .post("http://freew3.ml:3000/pay", {
      OrderID,
    })
    .then(function (response) {
      const data = response.data.data;
      console.log(data, "data");
      myRedirect(
        "https://rt.sizpay.ir/Route/Payment",
        data.MerchantID,
        data.TerminalID,
        data.Token
      );
    })
    .catch(function (error) {
      console.log(error, "error");
    });
});
