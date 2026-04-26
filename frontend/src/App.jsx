import { useEffect, useMemo, useState } from "react";
import * as Label from "@radix-ui/react-label";
import * as Separator from "@radix-ui/react-separator";

const API_URL =
  typeof import.meta.env.VITE_API_URL === "string"
    ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
    : "";

const ORDER_ITEMS = [
  { id: 1, name: "Cold Pressed Groundnut Oil", qty: 1, price: 600 },
  { id: 2, name: "Virgin Coconut Oil", qty: 1, price: 400 },
];

const ORDER_AMOUNT = ORDER_ITEMS.reduce((total, item) => total + item.qty * item.price, 0);

const statusStyles = {
  idle: "border-emerald-200 bg-emerald-50 text-emerald-900",
  validating: "border-amber-200 bg-amber-50 text-amber-900",
  validation_failed: "border-red-200 bg-red-50 text-red-900",
  redirecting: "border-sky-200 bg-sky-50 text-sky-900",
  payment_success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  payment_failure: "border-red-200 bg-red-50 text-red-900",
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function App() {
  const [flowState, setFlowState] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("Ready to validate your order before payment.");
  const [errorMessage, setErrorMessage] = useState("");
  const [validatedAmount, setValidatedAmount] = useState(null);
  const [orderId, setOrderId] = useState("");

  const requestPayload = useMemo(
    () => ({
      items: ORDER_ITEMS.map((item) => ({ id: item.id, qty: item.qty })),
      amount: ORDER_AMOUNT,
    }),
    []
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const paymentMessage = params.get("message");

    if (paymentStatus === "success") {
      setFlowState("payment_success");
      setStatusMessage(paymentMessage || "Payment successful.");
      setErrorMessage("");
    }

    if (paymentStatus === "failure") {
      setFlowState("payment_failure");
      setStatusMessage("Payment failed.");
      setErrorMessage(paymentMessage || "Your payment did not complete.");
    }
  }, []);

  async function handlePayNow() {
    if (!API_URL) {
      setFlowState("validation_failed");
      setStatusMessage("Validation failed.");
      setErrorMessage("VITE_API_URL is not configured.");
      return;
    }

    setFlowState("validating");
    setStatusMessage("Validating order...");
    setErrorMessage("");
    setValidatedAmount(null);
    setOrderId("");

    try {
      const response = await fetch(`${API_URL}/validate-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid response from server.");
      }

      if (!response.ok) {
        throw new Error(typeof data?.message === "string" ? data.message : "Backend validation failed.");
      }

      const hasValidShape =
        typeof data?.valid === "boolean" &&
        typeof data?.message === "string" &&
        typeof data?.validated_amount === "number" &&
        typeof data?.order_id === "string";

      if (!hasValidShape) {
        throw new Error("Invalid response from server.");
      }

      setValidatedAmount(data.validated_amount);
      setOrderId(data.order_id);

      if (!data.valid) {
        setFlowState("validation_failed");
        setStatusMessage("Validation failed.");
        setErrorMessage(data.message);
        return;
      }

      setFlowState("redirecting");
      setStatusMessage("Order valid, proceeding to payment");
      setErrorMessage("");
    } catch (error) {
      setFlowState("validation_failed");
      setStatusMessage("Validation failed.");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  const isLoading = flowState === "validating";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_40%),linear-gradient(180deg,_#1c1917_0%,_#0c0a09_100%)] px-4 py-10 text-stone-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-orange-300">Srtha Oils</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Srtha Oils Checkout</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300 sm:text-base">
            Validate every order with the backend before starting payment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-white/10 bg-white/95 p-6 shadow-card backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600">Product Summary</p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-950">Ready for secure checkout</h2>
              </div>
              <div className="rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-900">
                Total {formatCurrency(ORDER_AMOUNT)}
              </div>
            </div>

            <Separator.Root className="my-6 h-px bg-stone-200" />

            <div className="space-y-4">
              {ORDER_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4"
                >
                  <div>
                    <p className="text-base font-semibold text-stone-950">{item.name}</p>
                    <p className="mt-1 text-sm text-stone-500">Quantity: {item.qty}</p>
                  </div>
                  <p className="text-base font-semibold text-stone-900">{formatCurrency(item.qty * item.price)}</p>
                </div>
              ))}
            </div>

            <Separator.Root className="my-6 h-px bg-stone-200" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-stone-100 px-4 py-4">
                <Label.Root className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
                  Frontend Amount
                </Label.Root>
                <p className="mt-3 text-2xl font-semibold text-stone-950">{formatCurrency(ORDER_AMOUNT)}</p>
              </div>
              <div className="rounded-2xl bg-stone-100 px-4 py-4">
                <Label.Root className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
                  Validated Amount
                </Label.Root>
                <p className="mt-3 text-2xl font-semibold text-stone-950">
                  {validatedAmount === null ? "Pending" : formatCurrency(validatedAmount)}
                </p>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/95 p-6 shadow-card backdrop-blur">
            <div className={`rounded-2xl border px-4 py-4 ${statusStyles[flowState]}`}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">Status</p>
              <p className="mt-2 text-lg font-semibold">{statusMessage}</p>
              {errorMessage ? <p className="mt-2 text-sm leading-6">{errorMessage}</p> : null}
            </div>

            <div className="mt-6 space-y-4 rounded-2xl bg-stone-100 p-4">
              <div>
                <Label.Root className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
                  API URL
                </Label.Root>
                <p className="mt-2 break-all text-sm text-stone-700">{API_URL || "Not configured"}</p>
              </div>
              <div>
                <Label.Root className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
                  Order ID
                </Label.Root>
                <p className="mt-2 text-sm text-stone-700">{orderId || "Will be generated by backend"}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayNow}
              disabled={isLoading}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-brand-600 px-5 py-4 text-base font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-300"
            >
              {isLoading ? "Validating order..." : "Pay Now"}
            </button>

            <p className="mt-4 text-sm leading-6 text-stone-500">
              The frontend always waits for the backend&apos;s validated amount before moving into the payment flow.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
