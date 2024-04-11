"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserAlt } from "react-icons/fa";
import { useUser } from "@/hooks/useUser";
// import Button from "@/components/Button";
// import useSubscribeModal from "@/hooks/useSubscribeModal";
// import { postData } from "@/libs/helpers";

const AccountContent = () => {
  const router = useRouter();
//   const subscribeModal = useSubscribeModal();
  const { isLoading, user } = useUser();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

//   const redirectToCustomerPortal = async () => {
//     setLoading(true);
//     try {
//       const { url, error } = await postData({
//         url: '/api/create-portal-link'
//       });
//       window.location.assign(url);
//     } catch (error) {
//       if (error) return alert((error as Error).message);
//     }
//     setLoading(false);
//   };

  return ( 
    <div className="mb-14 px-12 py-12" style={{fontWeight: 'bold', fontSize: '1.5rem'}}>
      Welcome User:
      <div className="flex items-center">
  <div className="flex" style={{ fontWeight: 'bold', fontSize: '3rem', color: '#E91E63'}}>
    <FaUserAlt/> &nbsp; Batman
  </div>
</div>
    </div>
  );
}
 
export default AccountContent;