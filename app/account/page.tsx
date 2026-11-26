import Header from "@/components/Header";
import AccountContent from "./components/AccountContent";
export default function Account() {
  return (
    <div className="interior-page">
      <Header>
        <p className="eyebrow">MAKE YOURSELF AT HOME</p>
        <h1>
          Your listening <em>space.</em>
        </h1>
        <p className="page-description">
          A few details. A collection that is entirely yours.
        </p>
      </Header>
      <AccountContent />
    </div>
  );
}
