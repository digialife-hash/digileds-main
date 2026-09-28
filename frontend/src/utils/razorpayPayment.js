import { loadRazorpay } from "./loadRazorpay";

const API_BASE =
  import.meta.env.VITE_SITE_API_URL || "";

/**
 * =========================================================
 * CREATE PAYMENT ORDER
 * =========================================================
 */
const createPaymentOrder = async ({
  adId,
  productId,
  productType,
  quantity = 1,
}) => {
  const response = await fetch(
    `${API_BASE}/api/payments/create-order`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        adId,
        productId,
        productType,
        quantity,
      }),
    }
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid response received from payment server."
    );
  }

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        "Unable to create payment order."
    );
  }

  if (!result?.data) {
    throw new Error(
      "Payment order data is missing."
    );
  }

  return result.data;
};

/**
 * =========================================================
 * VERIFY PAYMENT
 * =========================================================
 */
const verifyPayment = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  adId,
  productId,
}) => {
  const response = await fetch(
    `${API_BASE}/api/payments/verify`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        razorpay_order_id:
          razorpayOrderId,

        razorpay_payment_id:
          razorpayPaymentId,

        razorpay_signature:
          razorpaySignature,

        adId,
        productId,
      }),
    }
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid verification response."
    );
  }

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        "Payment verification failed."
    );
  }

  return result;
};

/**
 * =========================================================
 * START RAZORPAY PAYMENT
 *
 * GLOBAL PAYMENT FUNCTION
 * =========================================================
 */
export const startRazorpayPayment = async ({
  adId,
  productId,
  productType = "product",
  quantity = 1,

  name = "Digital Alife",

  description = "Payment",

  image = "",

  prefill = {},

  onSuccess,

  onFailure,

  onDismiss,
}) => {
  try {
    if (!adId) {
      throw new Error(
        "Advertisement ID is required."
      );
    }

    if (!productId) {
      throw new Error(
        "Product ID is required."
      );
    }

    /**
     * -----------------------------------------------------
     * LOAD RAZORPAY
     * -----------------------------------------------------
     */
    await loadRazorpay();

    /**
     * -----------------------------------------------------
     * CREATE BACKEND ORDER
     *
     * IMPORTANT:
     *
     * Frontend price is NOT sent.
     *
     * Backend database se actual price nikalega.
     * -----------------------------------------------------
     */
    const order = await createPaymentOrder({
      adId,
      productId,
      productType,
      quantity,
    });

    if (!order?.orderId) {
      throw new Error(
        "Razorpay Order ID was not received."
      );
    }

    if (!order?.keyId) {
      throw new Error(
        "Razorpay Key ID was not received."
      );
    }

    /**
     * -----------------------------------------------------
     * RAZORPAY OPTIONS
     * -----------------------------------------------------
     */
    const options = {
      key: order.keyId,

      amount: order.amount,

      currency:
        order.currency || "INR",

      name,

      description,

      image: image || undefined,

      order_id: order.orderId,

      prefill: {
        name: prefill?.name || "",
        email: prefill?.email || "",
        contact: prefill?.contact || "",
      },

      notes: {
        adId,
        productId,
        productType,
        quantity: String(quantity),
      },

      theme: {
        color: "#2E9E6D",
      },

      modal: {
        escape: true,

        backdropclose: false,

        ondismiss: () => {
          if (onDismiss) {
            onDismiss();
          }

          if (onFailure) {
            onFailure({
              type: "dismissed",
              message:
                "Payment window was closed.",
            });
          }
        },
      },

      /**
       * ---------------------------------------------------
       * PAYMENT SUCCESS FROM RAZORPAY
       * ---------------------------------------------------
       */
      handler: async (response) => {
        try {
          const verification =
            await verifyPayment({
              razorpayOrderId:
                response.razorpay_order_id,

              razorpayPaymentId:
                response.razorpay_payment_id,

              razorpaySignature:
                response.razorpay_signature,

              adId,

              productId,
            });

          if (onSuccess) {
            await onSuccess({
              razorpay:
                response,

              verification,

              order,
            });
          }
        } catch (error) {
          console.error(
            "Razorpay verification error:",
            error
          );

          if (onFailure) {
            onFailure({
              type: "verification",

              message:
                error?.message ||
                "Payment verification failed.",
            });
          }
        }
      },
    };

    /**
     * -----------------------------------------------------
     * CREATE CHECKOUT INSTANCE
     * -----------------------------------------------------
     */
    const razorpay =
      new window.Razorpay(options);

    /**
     * -----------------------------------------------------
     * PAYMENT FAILED
     * -----------------------------------------------------
     */
    razorpay.on(
      "payment.failed",
      (response) => {
        console.error(
          "Razorpay payment failed:",
          response
        );

        if (onFailure) {
          onFailure({
            type: "payment_failed",

            message:
              response?.error?.description ||
              "Payment failed.",

            error: response?.error || null,
          });
        }
      }
    );

    /**
     * -----------------------------------------------------
     * OPEN CHECKOUT
     * -----------------------------------------------------
     */
    razorpay.open();

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error(
      "Razorpay start error:",
      error
    );

    if (onFailure) {
      onFailure({
        type: "error",

        message:
          error?.message ||
          "Unable to start payment.",
      });
    }

    return {
      success: false,

      error:
        error?.message ||
        "Unable to start payment.",
    };
  }
};