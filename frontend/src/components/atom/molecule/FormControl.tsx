import {
  ComponentProps,
  ElementType,
  ReactNode,
} from "react";
import { Input, Label } from "../form";

type FormControlRowProps = {
  label?: ReactNode;
  labelProps?: ComponentProps<"label">;
  inputProps?: ComponentProps<"input" | "textarea" | "select">;
  InputComponent?: ElementType;
} & ComponentProps<"div">;

export const FormControlRow = ({
  label,
  labelProps,
  inputProps,
  InputComponent = Input,
  ...props
}: FormControlRowProps) => (
  <div {...props}>
    <Label {...labelProps}>{label}</Label>
    <InputComponent {...inputProps} />
  </div>
);
