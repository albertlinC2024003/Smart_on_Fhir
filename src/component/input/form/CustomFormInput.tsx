import React from 'react';
import {useFormContext, Controller} from 'react-hook-form';
import {Box, FormControl, FormHelperText, TextField} from '@mui/material';
import type {FormInputProps} from '../../../dto/componentObj';

const CustomFormInput: React.FC<FormInputProps> = ({
    name,
    label = '',
    defaultValue,
    required = false,
    errorSpace = false,
    validateRule,
    className,
    size = 'small',
    ...rest
}:FormInputProps) => {
    const {control, formState: {errors}} = useFormContext();
    return (
        <Box className={className}>
            <FormControl error={!!errors[name]} className="w-full">
                <Controller
                    name={name}
                    control={control}
                    defaultValue={defaultValue}
                    rules={{
                        required: required ? `${label}為必填` : false,
                        ...validateRule
                    }}
                    render={({field}) => (
                        <>
                            <TextField
                                {...field}
                                {...rest}
                                size={size}
                                required={required}
                                label={label}
                                variant="outlined"
                                error={!!errors[name]}
                                value={field.value ?? ''}
                            />
                        </>
                    )}
                />
                {/*為了能更細部的控制畫面 可以設定元件是否要保留錯誤提示的空間*/}
                {!errorSpace && errors[name] && <FormHelperText>{errors[name]?.message as string}</FormHelperText>}
                {errorSpace && <FormHelperText className="h-[10px]">{errors[name]?.message as string}</FormHelperText>}
            </FormControl>
        </Box>
    );
};

export default CustomFormInput;