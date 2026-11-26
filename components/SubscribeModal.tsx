"use client";
import { useState } from "react";
import { FiArrowUpRight, FiCheck } from "react-icons/fi";
import { ProductWithPrice, Price } from "@/types";
import { useUser } from "@/hooks/useUser";
import { toast } from "react-hot-toast";
import { postData } from "@/libs/helpers";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import Modal from "./Modal";
import Button from "./Button";
export default function SubscribeModal({
  products,
}: {
  products: ProductWithPrice[];
}) {
  const modal = useSubscribeModal(),
    { user, isLoading, subscription } = useUser(),
    [busy, setBusy] = useState("");
  async function checkout(price: Price) {
    if (!user) return toast.error("Sign in to continue.");
    if (subscription) return toast("You already have a membership.");
    setBusy(price.id);
    try {
      const { url } = await postData({
        url: "/api/create-checkout-session",
        data: { price },
      });
      window.location.assign(url);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <Modal
      title="A little more room."
      description="Voib Premium gives your own records a home."
      isOpen={modal.isOpen}
      onChange={(open) => {
        if (!open) modal.onClose();
      }}
    >
      <div className="membership-benefits">
        <p>
          <FiCheck /> Upload your own music and artwork
        </p>
        <p>
          <FiCheck /> Keep a personal listening library
        </p>
        <p>
          <FiCheck /> Save the records you return to
        </p>
      </div>
      {subscription ? (
        <p className="form-notice">Your membership is already active.</p>
      ) : (
        products.flatMap((p) =>
          (p.prices || []).map((price) => (
            <div className="plan-option" key={price.id}>
              <p className="eyebrow">VOIB PREMIUM / TEST MEMBERSHIP</p>
              <div className="plan-price">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: price.currency,
                  maximumFractionDigits: 0,
                }).format((price.unit_amount || 0) / 100)}
                <span> / {price.interval}</span>
              </div>
              <Button
                className="button-full"
                disabled={isLoading || !!busy}
                onClick={() => checkout(price)}
              >
                {busy === price.id
                  ? "Opening checkout…"
                  : "Try the test membership"}
                <FiArrowUpRight />
              </Button>
            </div>
          )),
        )
      )}
      {!products.length && (
        <p className="form-notice">
          Membership is temporarily unavailable. Please return shortly.
        </p>
      )}
      <div className="test-payment-note">
        <span className="eyebrow">A PORTFOLIO DEMONSTRATION</span>
        <p>Stripe is in test mode. No real money is charged.</p>
        <p>
          Test card <code>4242 4242 4242 4242</code>
          <br />
          Any future expiry and any CVC.
        </p>
      </div>
    </Modal>
  );
}
