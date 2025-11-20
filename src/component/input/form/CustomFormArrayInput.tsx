import React, { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Box, TextField, Button, Chip, FormControl, InputLabel, FormHelperText } from '@mui/material';
import type {FormInputProps} from '../../../dto/componentObj.ts';

interface CustomFormArrayInputProps extends FormInputProps {
    // 只給這個元件用的屬性
    vertical?: boolean;
}

const CustomFormArrayInput: React.FC<CustomFormArrayInputProps> = ({
    name,
    label = '',
    showLabel = true,
    defaultValue,
    className,
    validateRule,
    required = false,
    errorSpace = false,
    vertical = false,
    size = 'small',
}) => {
    const { control, setValue, setError, clearErrors, formState: { errors } } = useFormContext();
    const [inputValue, setInputValue] = useState('');

    // 新增時即時驗證，錯誤訊息交給 RHF
    const handleAdd = (fieldValue: string[]) => {
        const value = inputValue.trim();
        if (!value) return;
        if ((fieldValue || []).includes(value)) return;
        if (validateRule) {
            const result = validateRule(value);
            if (result !== true) {
                setError(name, { type: 'manual', message: result as string });
                return;
            }
        }
        clearErrors(name);
        const newArr = [...(fieldValue || []), value].sort();
        setValue(name, newArr, { shouldValidate: true });
        setInputValue('');
    };

    const handleDelete = (idx: number, fieldValue: string[]) => {
        const arr = [...(fieldValue || [])];
        arr.splice(idx, 1);
        setValue(name, arr.sort(), { shouldValidate: true });
    };

    return (
        <Box className={className}>
            <Controller
                control={control}
                name={name}
                defaultValue={defaultValue}
                rules={{
                    required: required ? `${label}至少要有一項` : false,
                    validate: (arr: string[]) => {
                        if (!arr || arr.length === 0) return true;
                        for (let i = 0; i < arr.length; i++) {
                            // @ts-ignore
                            const result = validateRule ? validateRule(arr[i]) : true;
                            if (result !== true) {
                                return `第${i + 1}個：${typeof result === 'string' ? result : '格式錯誤'}`;
                            }
                        }
                        return true;
                    }
                }}
                render={({ field }) => (
                    <FormControl error={!!errors[name]} fullWidth>
                        <Box className={vertical ? 'flex flex-col' : 'flex flex-row'}>
                            {showLabel && <InputLabel shrink>{label}</InputLabel>}
                            <Box className="flex flex-col">
                                <Box className="flex items-center gap-2">
                                    <TextField
                                        value={inputValue}
                                        className={"w-full"}
                                        onChange={e => {
                                            setInputValue(e.target.value);
                                            if (validateRule) {
                                                const result = validateRule(e.target.value);
                                                if (result !== true) {
                                                    setError(name, { type: 'manual', message: result as string });
                                                } else {
                                                    clearErrors(name);
                                                }
                                            }
                                        }}
                                        label={label}
                                        size={size}
                                    />
                                    <Button variant="contained" onClick={() => handleAdd(field.value)}>新增</Button>
                                </Box>
                                {/* 錯誤訊息統一交給這兩行 */}
                                {!errorSpace && errors[name] && <FormHelperText>{errors[name]?.message as string}</FormHelperText>}
                                {errorSpace && <FormHelperText className="h-[10px]">{errors[name]?.message as string}</FormHelperText>}
                            </Box>
                            <Box className={vertical ? 'flex flex-col items-start gap-2' : 'flex flex-row items-start gap-2 ml-2'} flexWrap="wrap">
                                {(field.value || []).map((item: string, idx: number) => (
                                    <Chip
                                        key={item + idx}
                                        label={item}
                                        onDelete={() => handleDelete(idx, field.value)}
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Box>
                    </FormControl>
                )}
            />
        </Box>
    );
};

export default CustomFormArrayInput;