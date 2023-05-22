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
      required: true,
    },
    totalCost: {
      type: Number,
      default: 0,
      required: true,
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
          id: {
            type: String,
            required: false,
          },
        },
      },
    ],
  },
  paymentId: {
    RefNo: { type: Number, required: true },
    Amount: { type: Number, required: true },
    ResCod: { type: Number, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
