process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const axios = require("axios");
axios({
  method: "POST",
  baseURL: "https://a.freew3.ml:313/login",
  data: {
    username: "admin",
    password: "admin",
  },
}).then((response) => {
  const session = response.headers["set-cookie"]
    .find((cookie) => cookie.includes("session"))
    ?.match(new RegExp(`^${"session"}=(.+?);`))?.[1];

  fetch("https://a.freew3.ml:313/xui/inbound/add", {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language":
        "en-GB,en;q=0.9,fa-IR;q=0.8,fa;q=0.7,de-DE;q=0.6,de;q=0.5,en-US;q=0.4",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
      cookie: "session=" + session,
      Referer: "https://a.freew3.ml:313/xui/inbounds",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: "up=0&down=0&total=21474836480&remark=10&enable=true&expiryTime=0&listen=&port=33582&protocol=vmess&settings=%7B%0A%20%20%22clients%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22id%22%3A%20%223f7105c2-8b57-413b-f14b-59004387bcc4%22%2C%0A%20%20%20%20%20%20%22alterId%22%3A%200%0A%20%20%20%20%7D%0A%20%20%5D%2C%0A%20%20%22disableInsecureEncryption%22%3A%20false%0A%7D&streamSettings=%7B%0A%20%20%22network%22%3A%20%22ws%22%2C%0A%20%20%22security%22%3A%20%22tls%22%2C%0A%20%20%22tlsSettings%22%3A%20%7B%0A%20%20%20%20%22serverName%22%3A%20%22a.freew3.ml%22%2C%0A%20%20%20%20%22certificates%22%3A%20%5B%0A%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22certificateFile%22%3A%20%22%2Fetc%2Fletsencrypt%2Flive%2Fa.freew3.ml%2Ffullchain.pem%22%2C%0A%20%20%20%20%20%20%20%20%22keyFile%22%3A%20%22%2Fetc%2Fletsencrypt%2Flive%2Fa.freew3.ml%2Fprivkey.pem%22%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%5D%0A%20%20%7D%2C%0A%20%20%22wsSettings%22%3A%20%7B%0A%20%20%20%20%22path%22%3A%20%22%2F%22%2C%0A%20%20%20%20%22headers%22%3A%20%7B%7D%0A%20%20%7D%0A%7D&sniffing=%7B%0A%20%20%22enabled%22%3A%20true%2C%0A%20%20%22destOverride%22%3A%20%5B%0A%20%20%20%20%22http%22%2C%0A%20%20%20%20%22tls%22%0A%20%20%5D%0A%7D",
    method: "POST",
  })
    .then((response) => response.json())
    .then((result) => {
      fetch("https://a.freew3.ml:313/xui/inbound/list", {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language":
            "en-GB,en;q=0.9,fa-IR;q=0.8,fa;q=0.7,de-DE;q=0.6,de;q=0.5,en-US;q=0.4",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "x-requested-with": "XMLHttpRequest",
          cookie: "session=" + session,
          Referer: "https://a.freew3.ml:313/xui/inbounds",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: "",
        method: "POST",
      })
        .then((response) => response.json())
        .then((result) => {
          result.obj.forEach((element) => {
            console.log(
              url(
                element.port,
                element.protocol,
                JSON.parse(element.settings).clients[0].id,
                element.remark,
                JSON.parse(element.streamSettings).network
              ),
              element.enable,
              element.enabled
            );
          });
        });
    });
});

function url(port, protocol = "", uid = "", remark = "", transmission = "") {
  protocol = protocol;
  uid = uid;
  console.log(uid);
  remark = remark;
  transmission = transmission;
  const path = transmission === "ws" ? "/" : "";

  return (
    "vmess://" +
    base64Encode(
      JSON.stringify({
        v: "2",
        ps: remark,
        add: "a.freew3.ml",
        port: port,
        id: uid,
        aid: 0,
        net: "ws",
        type: "none",
        host: "",
        path: "/",
        tls: "tls",
      })
    )
  );
}

function base64Encode(str) {
  // Check if the btoa() function can handle the string directly
  if (btoa) {
    return btoa(str);
  } else {
    // For non-ASCII characters, use a fallback method
    var base64Chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var base64Encoded = "";

    for (var i = 0; i < str.length; i += 3) {
      var char1 = str.charCodeAt(i);
      var char2 = str.charCodeAt(i + 1);
      var char3 = str.charCodeAt(i + 2);

      var enc1 = char1 >> 2;
      var enc2 = ((char1 & 3) << 4) | (char2 >> 4);
      var enc3 = ((char2 & 15) << 2) | (char3 >> 6);
      var enc4 = char3 & 63;

      if (isNaN(char2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(char3)) {
        enc4 = 64;
      }

      base64Encoded +=
        base64Chars.charAt(enc1) +
        base64Chars.charAt(enc2) +
        base64Chars.charAt(enc3) +
        base64Chars.charAt(enc4);
    }

    return base64Encoded;
  }
}
