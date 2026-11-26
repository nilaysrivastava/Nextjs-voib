import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={twMerge("input", className)} {...props} />
  ),
);
Input.displayName = "Input";
export default Input;
