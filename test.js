const axios = require("axios");
axios({
  method: "POST",
  baseURL: "http://193.105.234.23:54321/login",
  data: {
    username: "admin",
    password: "admin",
  },
}).then((response) => {
  const session = response.headers["set-cookie"]
    .find((cookie) => cookie.includes("session"))
    ?.match(new RegExp(`^${"session"}=(.+?);`))?.[1];

});
