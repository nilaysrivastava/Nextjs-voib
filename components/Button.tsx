import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "quiet" | "danger";
}
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => (
    <button
      type={type}
      ref={ref}
      className={twMerge("button button-" + variant, className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
export default Button;
