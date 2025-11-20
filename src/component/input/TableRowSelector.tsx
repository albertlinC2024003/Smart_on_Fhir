import Checkbox, {type CheckboxProps } from "@mui/material/Checkbox";
import { useEffect, useRef } from "react";

interface RowSelectorProps extends CheckboxProps {
  indeterminate?: boolean;
}
//用於表中最左側可勾選的表格行
const RowSelector = ({ indeterminate, ...props }: RowSelectorProps) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = Boolean(indeterminate && !props.checked);
    }
  }, [indeterminate, props.checked]);

  return (
    <Checkbox
      className="m-15 p-15"
      inputRef={ref}
      {...props}
    />
  );
};
export default RowSelector;

