"use client";
import { Toaster } from "react-hot-toast";
export default function ToasterProvider() {
  return (
    <Toaster
      position="bottom-center"
      containerStyle={{ bottom: 126 }}
      toastOptions={{
        duration: 3500,
        style: {
          background: "#242722",
          color: "#f3efe6",
          border: "1px solid #55584c",
          borderRadius: "4px",
          fontSize: "13px",
          padding: "14px 20px",
        },
        success: { iconTheme: { primary: "#bea578", secondary: "#242722" } },
      }}
    />
  );
}
