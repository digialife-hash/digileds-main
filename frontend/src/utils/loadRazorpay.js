let razorpayPromise = null;

const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";

/**
 * =========================================================
 * LOAD RAZORPAY CHECKOUT
 * ---------------------------------------------------------
 * Razorpay script dynamically load hoti hai.
 *
 * index.html me manually script add karne ki zarurat nahi.
 *
 * Multiple components ek saath call karein tab bhi
 * ek hi script request chalegi.
 * =========================================================
 */
export const loadRazorpay = () => {
  // Already loaded
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  // Already loading
  if (razorpayPromise) {
    return razorpayPromise;
  }

  razorpayPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT}"]`
    );

    // Script already exists but has not loaded yet
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        resolve(true);
      });

      existingScript.addEventListener("error", () => {
        razorpayPromise = null;

        reject(
          new Error(
            "Razorpay Checkout failed to load."
          )
        );
      });

      return;
    }

    const script = document.createElement("script");

    script.src = RAZORPAY_SCRIPT;
    script.async = true;

    script.onload = () => {
      if (window.Razorpay) {
        resolve(true);
      } else {
        razorpayPromise = null;

        reject(
          new Error(
            "Razorpay Checkout loaded but Razorpay is unavailable."
          )
        );
      }
    };

    script.onerror = () => {
      razorpayPromise = null;

      reject(
        new Error(
          "Unable to load Razorpay Checkout."
        )
      );
    };

    document.body.appendChild(script);
  });

  return razorpayPromise;
};