import { Box, FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import { useFormContext, Controller } from "react-hook-form";
import type {ComponentOption, FormInputProps} from "../../../dto/componentObj";
import React from "react";

// 定義新的介面，讓CustomFormDropdown同時有FormInputProps以及自訂的屬性
interface CustomFormDropdownProps extends FormInputProps {
    extraAction?: (value: string | number | boolean) => void; // 新增的屬性
    options: ComponentOption[]; // 下拉選單的選項
}

const CustomFormDropdown: React.FC<CustomFormDropdownProps> = ({
                                                                   name,
                                                                   label,
                                                                   showLabel = true,
                                                                   defaultValue,
                                                                   className,
                                                                   extraAction,
                                                                   errorSpace = false,
                                                                   options,
                                                                   disabled = false,
                                                               }) => {
    const { control, formState: { errors } } = useFormContext();

    return (
        <Box className={className}>
            <FormControl error={!!errors[name]} className="w-full">
                {showLabel && <InputLabel shrink>{label}</InputLabel>}
                <Controller
                    name={name}
                    control={control}
                    defaultValue={defaultValue}
                    render={({ field }) => (
                        <Select
                            {...field}
                            // 將 field.value 轉換為字串以匹配 MenuItem 的 value
                            value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
                            size="small"
                            label={showLabel?label:""} // Material-UI Select 需要 label prop 才能正確顯示
                            disabled={disabled}
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                // 尋找對應的 option
                                const selectedOption = options.find(
                                    (option) => String(option.value) === selectedValue
                                );

                                const originalValue = selectedOption ? selectedOption.value : selectedValue;

                                // 使用原始 value 更新表單狀態
                                field.onChange(originalValue);

                                if (extraAction) {
                                    // 將原始 value 傳遞給 extraAction
                                    extraAction(originalValue);
                                }
                            }}
                            MenuProps={{
                                slotProps: {
                                    paper: {
                                        sx: {
                                            maxHeight: 200 // 設定最大高度為 200px
                                        }
                                    }
                                }
                            }}
                        >
                            {options.map((option) => (
                                <MenuItem
                                    key={String(option.value)}
                                    // 將所有 value 轉換為字串
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                />
                {!errorSpace && errors[name] && <FormHelperText>{errors[name]?.message as string}</FormHelperText>}
                {errorSpace && <FormHelperText className="h-[10px]">{errors[name]?.message as string}</FormHelperText>}
            </FormControl>
        </Box>
    );
};

export default CustomFormDropdown;