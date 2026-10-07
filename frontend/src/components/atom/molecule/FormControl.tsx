import {
  ComponentProps,
  ElementType,
  ReactNode,
} from "react";
import { Input, Label } from "../form";
import { Caption } from "../typography";
import { Nullable } from "../../../util/UtilityComponents";

type FormControlRowProps = {
  label?: ReactNode;
  labelProps?: ComponentProps<"label">;
  inputProps?: Record<string, unknown>;
  InputComponent?: ElementType;
  hint?: ReactNode;
} & ComponentProps<"div">;

export const FormControlRow = ({
  label,
  labelProps,
  inputProps,
  InputComponent = Input,
  hint,
  children,
  ...props
}: FormControlRowProps) => (
  <div {...props}>
    <Label {...labelProps}>{label}</Label>
    <InputComponent {...inputProps}>{children}</InputComponent>
    <Nullable on={hint != null}>
      <div className="mt-1">
        <Caption>{hint}</Caption>
      </div>
    </Nullable>
  </div>
);
