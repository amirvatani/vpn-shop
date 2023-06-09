const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  cart: {
    totalQty: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        qty: {
          type: Number,
          default: 0,
        },
        price: {
          type: Number,
          default: 0,
        },
        title: {
          type: String,
        },
        productCode: {
          type: String,
        },
        v2ray: {
          total: {
            type: Number,
            required: false,
          },
          remark: {
            type: String,
            required: false,
          },
          url: {
            type: String,
            required: false,
          },
          port: {
            type: String,
            required: false,
          },
          uid: {
            type: String,
            required: false,
          },
        },
      },
    ],
  },
  paymentId: {
    RefNo: { type: Number },
    Amount: { type: Number },
    ResCod: { type: Number },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
