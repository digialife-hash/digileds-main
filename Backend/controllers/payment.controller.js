import crypto from "crypto";

import Payment from "../models/Payment.js";

import {
  createRazorpayOrder,
} from "../services/razorpay.service.js";

import Ad from "../models/Ad.js";


const parseProductPrice = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const rawValue =
    String(value).trim();

  if (!rawValue) {
    return null;
  }

  const match =
    rawValue.match(
      /\d[\d,]*(?:\.\d+)?/
    );

  if (!match) {
    return null;
  }

  const numericValue =
    match[0]
      .replace(/,/g, "")
      .trim();

  if (!numericValue) {
    return null;
  }

  const price =
    Number(
      numericValue
    );

  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return null;
  }

  return price;
};


const normalizeProductId = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(
    value
  ).trim();
};


const isSameValue = (
  first,
  second
) => {
  return (
    String(first ?? "").trim() ===
    String(second ?? "").trim()
  );
};


const rupeesToPaise = (
  amount
) => {
  return Math.round(
    Number(amount) * 100
  );
};


const createPaymentOrder = async (req,res) => {
  try {
    const userId = req?.user?.userId || null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User information not available. Please login.",
      });
    }

    const {
      adId,
      productId,
      productType = "product",
      quantity = 1,
    } = req.body;

    if (!adId) {
      return res.status(400).json({
        success: false,
        message:
          "Ad ID is required.",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message:
          "Product ID is required.",
      });
    }

    const parsedQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        parsedQuantity
      ) ||
      parsedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid quantity.",
      });
    }

    const requestedProductType =
      productType === "service"
        ? "service"
        : "product";

    const ad =
      await Ad.findById(
        adId
      ).lean();

    if (!ad) {
      return res.status(404).json({
        success: false,
        message:
          "Advertisement not found.",
      });
    }

    const products =
      Array.isArray(
        ad.products
      )
        ? ad.products
        : [];

    if (
      products.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "No products or services are available for this advertisement.",
      });
    }

    const normalizedProductId =
      normalizeProductId(
        productId
      );

    if (
      !normalizedProductId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID.",
      });
    }

    const product =
      products.find(
        (item) =>
          normalizeProductId(
            item?.id
          ) ===
          normalizedProductId
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product or service not found.",
        data: {
          adId:
            String(adId),
          productId:
            normalizedProductId,
        },
      });
    }

    const actualProductType =
      product?.type === "service"
        ? "service"
        : "product";

    if (
      actualProductType !==
      requestedProductType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product type does not match.",
        data: {
          requestedType:
            requestedProductType,
          actualType:
            actualProductType,
          productId:
            normalizedProductId,
        },
      });
    }

    const rawProductPrice =
      product?.price;

    const productPrice =
      parseProductPrice(
        rawProductPrice
      );

    if (
      productPrice === null
    ) {
      console.error(
        "INVALID PRODUCT PRICE:",
        {
          adId:
            String(adId),
          productId:
            normalizedProductId,
          productName:
            product?.name || "",
          receivedPrice:
            rawProductPrice,
          parsedPrice:
            productPrice,
        }
      );

      return res.status(400).json({
        success: false,
        message:
          "Invalid product price.",
        data: {
          productId:
            product?.id || null,
          productName:
            product?.name || null,
          receivedPrice:
            rawProductPrice ||
            null,
        },
      });
    }

    const totalAmount =
      productPrice *
      parsedQuantity;

    if (
      !Number.isFinite(
        totalAmount
      ) ||
      totalAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid total payment amount.",
      });
    }

    const razorpayAmount =
      rupeesToPaise(
        totalAmount
      );

    if (
      !Number.isSafeInteger(
        razorpayAmount
      ) ||
      razorpayAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Razorpay payment amount.",
      });
    }

    const receipt =
      `receipt_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    const razorpayOrder =
      await createRazorpayOrder({
        amount:
          totalAmount,
        currency:
          "INR",
        receipt,
        notes: {
          userId:
            String(userId),
          adId:
            String(adId),
          productId:
            normalizedProductId,
          productType:
            actualProductType,
          quantity:
            String(
              parsedQuantity
            ),
          productName:
            String(
              product?.name ||
              "Product"
            ),
        },
      });

    if (
      !razorpayOrder ||
      !razorpayOrder.id
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Razorpay order was not created.",
      });
    }

    const payment =
      await Payment.create({
        userId:
          String(userId),
        razorpayOrderId:
          razorpayOrder.id,
        amount:
          totalAmount,
        currency:
          razorpayOrder.currency ||
          "INR",
        status:
          "created",
        adId:
          adId,
        productId:
          normalizedProductId,
        productType:
          actualProductType,
        quantity:
          parsedQuantity,
        metadata: {
          productName:
            product?.name ||
            "Product",
          productDescription:
            product?.description ||
            "",
          productImage:
            product?.image ||
            "",
          productPrice:
            productPrice,
          rawProductPrice:
            rawProductPrice,
          razorpayAmount:
            razorpayAmount,
          receipt:
            receipt,
          adHeading:
            ad?.heading ||
            "",
        },
      });

    return res.status(201).json({
      success: true,
      message:
        "Razorpay order created successfully.",
      data: {
        keyId:
          process.env
            .RAZORPAY_API_KEY,
        orderId:
          razorpayOrder.id,
        amount:
          razorpayOrder.amount,
        currency:
          razorpayOrder.currency ||
          "INR",
        paymentId:
          payment._id,
      },
    });
  } catch (error) {
    console.error(
      "CREATE PAYMENT ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to create payment order.",
    });
  }
};


const verifyPayment = async (
  req,
  res
) => {
  try {
    const userId =
      req?.user?.userId || null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User information not available. Please login.",
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      adId,
      productId,
    } = req.body;

    if (
      !razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay order ID is required.",
      });
    }

    if (
      !razorpay_payment_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay payment ID is required.",
      });
    }

    if (
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay signature is required.",
      });
    }

    const payment =
      await Payment.findOne({
        razorpayOrderId:
          razorpay_order_id,
        userId:
          String(userId),
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment order not found for this user.",
      });
    }

    if (
      adId &&
      payment.adId &&
      !isSameValue(
        payment.adId,
        adId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment advertisement mismatch.",
      });
    }

    if (
      productId &&
      payment.productId &&
      !isSameValue(
        payment.productId,
        productId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment product mismatch.",
      });
    }

    if (
      payment.status === "paid"
    ) {
      return res.status(200).json({
        success: true,
        message:
          "Payment already verified.",
        data: {
          paymentId:
            payment._id,
          razorpayOrderId:
            payment.razorpayOrderId,
          razorpayPaymentId:
            payment.razorpayPaymentId,
          amount:
            payment.amount,
          currency:
            payment.currency,
          status:
            payment.status,
          productId:
            payment.productId,
          productType:
            payment.productType,
          productName:
            payment.metadata
              ?.productName ||
            "Product",
        },
      });
    }

    const razorpaySecret =
      process.env
        .RAZORPAY_SECRET;

    if (!razorpaySecret) {
      console.error(
        "RAZORPAY_SECRET is missing."
      );

      return res.status(500).json({
        success: false,
        message:
          "Payment verification configuration is missing.",
      });
    }

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          razorpaySecret
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    const signatureBuffer =
      Buffer.from(
        generatedSignature,
        "utf8"
      );

    const receivedSignatureBuffer =
      Buffer.from(
        razorpay_signature,
        "utf8"
      );

    if (
      signatureBuffer.length !==
      receivedSignatureBuffer.length
    ) {
      payment.status =
        "failed";

      payment.error = {
        message:
          "Invalid Razorpay signature.",
      };

      await payment.save();

      return res.status(400).json({
        success: false,
        message:
          "Payment signature verification failed.",
      });
    }

    const isValid =
      crypto.timingSafeEqual(
        signatureBuffer,
        receivedSignatureBuffer
      );

    if (!isValid) {
      payment.status =
        "failed";

      payment.error = {
        message:
          "Invalid Razorpay signature.",
      };

      await payment.save();

      return res.status(400).json({
        success: false,
        message:
          "Payment verification failed.",
      });
    }

    payment.razorpayPaymentId =
      razorpay_payment_id;

    payment.razorpaySignature =
      razorpay_signature;

    payment.status =
      "paid";

    payment.error =
      null;

    payment.metadata = {
      ...(payment.metadata || {}),
      verifiedUserId:
        String(userId),
      verifiedAdId:
        payment.adId
          ? String(
              payment.adId
            )
          : null,
      verifiedProductId:
        payment.productId
          ? String(
              payment.productId
            )
          : null,
      verifiedAt:
        new Date(),
    };

    await payment.save();

    return res.status(200).json({
      success: true,
      message:
        "Payment verified successfully.",
      data: {
        paymentId:
          payment._id,
        razorpayOrderId:
          razorpay_order_id,
        razorpayPaymentId:
          razorpay_payment_id,
        amount:
          payment.amount,
        currency:
          payment.currency,
        status:
          payment.status,
        productId:
          payment.productId,
        productType:
          payment.productType,
        productName:
          payment.metadata
            ?.productName ||
          "Product",
      },
    });
  } catch (error) {
    console.error(
      "VERIFY PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to verify payment.",
    });
  }
};


const getMyPurchases = async (
  req,
  res
) => {
  try {
    const userId =
      req?.user?.userId || null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User information not available.",
      });
    }

    const payments =
      await Payment.find({
        userId:
          String(userId),
        status:
          "paid",
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    const purchases =
      payments.map(
        (payment) => {
          const metadata =
            payment?.metadata ||
            {};

          return {
            _id:
              payment._id,
            userId:
              payment.userId,
            adId:
              payment.adId,
            productId:
              payment.productId,
            productType:
              payment.productType ||
              metadata.productType ||
              "product",
            productName:
              metadata.productName ||
              "Purchased item",
            productDescription:
              metadata.productDescription ||
              "",
            productImage:
              metadata.productImage ||
              "",
            productPrice:
              metadata.productPrice ??
              payment.amount,
            rawProductPrice:
              metadata.rawProductPrice ||
              "",
            quantity:
              payment.quantity ||
              1,
            amount:
              payment.amount,
            totalAmount:
              payment.amount,
            currency:
              payment.currency ||
              "INR",
            status:
              payment.status,
            razorpayOrderId:
              payment.razorpayOrderId,
            orderId:
              payment.razorpayOrderId,
            razorpayPaymentId:
              payment.razorpayPaymentId,
            paymentId:
              payment.razorpayPaymentId,
            razorpaySignature:
              payment.razorpaySignature,
            adHeading:
              metadata.adHeading ||
              "",
            createdAt:
              payment.createdAt,
            updatedAt:
              payment.updatedAt,
            paidAt:
              payment.updatedAt,
          };
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Purchases fetched successfully.",
      count:
        purchases.length,
      data:
        purchases,
    });
  } catch (error) {
    console.error(
      "GET MY PURCHASES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load your purchases.",
    });
  }
};


export {
  createPaymentOrder,
  verifyPayment,
  getMyPurchases,
};