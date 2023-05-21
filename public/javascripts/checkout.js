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

$form.submit(function (event) {
  console.log("OMAD");
  event.preventDefault();
  $form.find("button").prop("disabled", true);
  Amount = parseInt($("#amount").val());
  OrderID = $("#cardId").val();
  InvoiceNo = $("#cardId").val();
  axios
    .post("http://localhost:3000", {
      Amount,
      OrderID,
      InvoiceNo,
    })
    .then(function (response) {
      console.log(response, "response");
    })
    .catch(function (error) {
      console.log(error, "error");
    });
});
