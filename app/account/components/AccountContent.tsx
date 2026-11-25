"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserAlt } from "react-icons/fa";
import { useUser } from "@/hooks/useUser";
import Button from "@/components/Button";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import { postData } from "@/libs/helpers";

const AccountContent = () => {
  const router = useRouter();
  const subscribeModal = useSubscribeModal();
  const { isLoading, user, subscription } = useUser();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  const redirectToCustomerPortal = async () => {
    setLoading(true);
    try {
      const { url, error } = await postData({
        url: "/api/create-portal-link",
      });
      window.location.assign(url);
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
    setLoading(false);
  };

  if(user?.app_metadata.demo)return <div className="mb-7 px-6 text-white"><p className="text-xl font-bold">Demo Premium included</p><p className="mt-2 text-neutral-300">Play music, save likes and upload sample tracks. This shared demo account has no billing account. Sign up with your own email to try Stripe test checkout.</p></div>;
  return (
    <div className="mb-7 px-6">
      {!subscription && (
        <div className="flex flex-col gap-y-4">
          <p>No active plan. Stripe is in test mode; no real money is charged.</p>
          <Button onClick={subscribeModal.onOpen} className="w-[300px]">
            Subscribe
          </Button>
        </div>
      )}
      {subscription && (
        <div className="flex flex-col gap-y-4">
          <p>
            You are currently on the{" "}
            <b>{subscription?.prices?.products?.name}</b> plan
          </p>
          <Button
            disabled={loading || isLoading}
            onClick={redirectToCustomerPortal}
            className="w-[300px]"
          >
            Open customer portal
          </Button>
        </div>
      )}
    </div>
  );
};

export default AccountContent;
