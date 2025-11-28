import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Box, FormControl, FormGroup, FormControlLabel, Checkbox, FormHelperText } from '@mui/material';
import type {ComponentOption, FormInputProps} from '../../../dto/componentObj';
interface CustomFormCheckBoxProps extends FormInputProps {
    // 只給這個元件用的屬性
    vertical?: boolean;
    options: ComponentOption[]; // 選單的選項
}
const CustomFormCheckBox: React.FC<CustomFormCheckBoxProps> = ({
    name,
    label = '',
    options,
    required = false,
    vertical = false,
    className,
}) => {
    const { control, formState: { errors } } = useFormContext();

    return (
        <Box className={className}>
            <FormControl error={!!errors[name]} component="fieldset" className="w-full">
                {/*{label && <FormLabel component="legend">{label}</FormLabel>}*/}
                <Controller
                    name={name}
                    control={control}
                    rules={{
                        required: required ? `${label}為必選` : false,
                    }}
                    render={({ field }) => (
                        <FormGroup row={!vertical}>
                            {options.map((option) => {
                                return (
                                    <FormControlLabel
                                        key={option.value as string}
                                        label={option.label}
                                        control={
                                            <Checkbox
                                                checked={Array.isArray(field.value) ? field.value.includes(option.value) : false}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    let newValue = Array.isArray(field.value) ? [...field.value] : [];
                                                    if (checked) {
                                                        newValue.push(option.value);
                                                    } else {
                                                        newValue = newValue.filter((v) => v !== option.value);
                                                    }
                                                    // 確保永遠是陣列
                                                    field.onChange(newValue.length > 0 ? newValue : []);
                                                }}
                                            />
                                        }
                                    />
                                )
                            })}
                        </FormGroup>
                    )}
                />
                <FormHelperText>{errors[name]?.message as string}</FormHelperText>
            </FormControl>
        </Box>
    );
};

export default CustomFormCheckBox;