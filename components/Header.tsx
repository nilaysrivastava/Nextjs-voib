import { twMerge } from "tailwind-merge";
export default function Header({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={twMerge("page-heading", className)}>{children}</header>
  );
}
