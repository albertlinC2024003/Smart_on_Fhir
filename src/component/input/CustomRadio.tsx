import { RadioGroup, FormControlLabel, Radio, FormControl, FormHelperText, FormLabel } from "@mui/material"
import type {Key} from "react";

interface CustomRadioProps<T> {
  label?: string;
  value: T;
  options: { label: string; value: T }[];
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const CustomRadio = <T extends Key,>({ label, value, options, error, onChange }: CustomRadioProps<T>) => {
    return (
        <FormControl component="fieldset" error={!!error}>
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup value={value} onChange={onChange}>
                {options.map((option) => (
                <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                />
                ))}
            </RadioGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
    )
}
export default CustomRadio