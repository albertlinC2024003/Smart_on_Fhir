import {RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Box, FormHelperText} from "@mui/material"
import { Controller, useFormContext } from "react-hook-form";
import React from "react";
import type {ComponentOption, FormInputProps} from "../../../dto/componentObj.ts";

interface CustomFormRadioProps extends FormInputProps {
    // 只給這個元件用的屬性
    vertical?: boolean;
    options: ComponentOption[]; // 下拉選單的選項
}

const CustomFormRadio: React.FC<CustomFormRadioProps> = ({
    name,
    label = '',
    options,
    className,
    required = false,
    errorSpace = false,
    validateRule,
    vertical = false,
}) => {
    const { control, formState: { errors } } = useFormContext();

    return (
        <Box className={className}>
            <FormControl component="fieldset" error={!!errors[name]} className="w-full">
                <FormLabel component="legend">{label}</FormLabel>
                <Controller
                    name={name}
                    control={control}
                    rules={{
                        required: required ? '未選擇' : false,
                        ...validateRule,
                    }}
                    render={({ field }) => (
                        <RadioGroup {...field} row={!vertical}>
                            {options.map((option) => (
                                <FormControlLabel
                                    key={option.value as string}
                                    value={option.value}
                                    control={<Radio />}
                                    label={option.label}
                                />
                            ))}
                        </RadioGroup>
                    )}
                />
                {/*為了能更細部的控制畫面 可以設定元件是否要保留錯誤提示的空間*/}
                {!errorSpace && errors[name] && <FormHelperText>{errors[name]?.message as string}</FormHelperText>}
                {errorSpace && <FormHelperText className="h-[10px]">{errors[name]?.message as string}</FormHelperText>}
            </FormControl>
        </Box>
    );
};

export default CustomFormRadio