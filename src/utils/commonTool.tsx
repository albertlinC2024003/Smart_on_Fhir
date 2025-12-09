import { ComponentOption } from "../dto/componentObj";
import {Box, Button, ButtonGroup, Typography} from "@mui/material";
import {createColumnHelper} from "@tanstack/react-table";
import React, {ReactNode, useEffect, useMemo, useState} from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);


export const RuleRequire = (value:string, nullable = true) => {
    if (value === '' && nullable) return true;
    if (value === '' && !nullable) return '欄位不得為空';
    return true;
};
export const RuleNumber = (value:string, positive = true) => {
    if (!value) return "不可為空";
    if (!/^-?\d+$/.test(value)) return "必須為數字";
    if (positive && Number(value) < 0) return "不可為負數";
    return true;
};
export const RulePwd = value => {
    if (value.length < 8) return "密碼長度最少8字元";
    if (!/^[a-zA-Z0-9!@#$%^& ]+$/.test(value)) return "密碼僅限為數字、大小寫英文以及特殊符號!@#$%^&";
    return true;
};
export const RulePhone = (value:string, nullable = true) => {
    if (value === '' && nullable) return true;
    if (value === '' && !nullable) return '電話不得為空';
    if (value.length > 20) return '電話長度不得超過20';
    if (!/^[0-9()\-]+$/.test(value)) return '僅能輸入數字、括號、-';
    return true;
};
export const RuleOrgId = (value:string, nullable = true) => {
    if (value === '' && nullable) return true;
    if (value === '' && !nullable) return '機構代碼不得為空';
    if (value.length > 10) return "機構代碼長度不得超過10";
    if (!/^[0-9 ]+$/.test(value)) return "機構代碼為數字";
    return true;
};
export const RuleCompanyId = value => {
    if (value.length !== 8) return "統編長度為8";
    if (!/^[0-9 ]+$/.test(value)) return "統編為數字";
    return true;
};
export const RuleMail = (value:string, nullable = true) => {
    if (value === '' && nullable) return true;
    if (value === '' && !nullable) return '信箱不得為空';
    if (value.length > 50) return '信箱長度不得超過50';
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value)) return true;
    return '請輸入有效的信箱地址';
};
export const RuleIP = (value: string, nullable = true) => {
    if (value === '' && nullable) return true;
    if (value === '' && !nullable) return 'IP不得為空';
    if (value.length > 20) return 'IP長度不得超過20';
    if (!/^[0-9.]+$/.test(value)) return 'IP格式錯誤';
    return true;
};
export const RulePort = (value:string, nullable = true) => {
    if (value === '' && nullable) return true;
    if (value === '' && !nullable) return 'Port不得為空';
    if (value.length > 5) return 'Port長度不得超過5';
    if (!/^[0-9 ]+$/.test(value)) return 'Port為數字';
    return true;
};

export const CustomTabPanel = ({ children, value, index }) =>{
    return value === index ? children : null;
}

export function parseFromJson<T extends object>(content:string):T | undefined {
    try {
        return JSON.parse(content) as T;
    } catch (error) {
        console.error("JSON 解析失敗:", error, content);
        return null;
    }
}

export const columnTool = <T,>() => {
    // 创建一个columnHelper实例
    const columnHelper = createColumnHelper<T>();
    return {
        // 暴露columnHelper实例
        columnHelper,
        // 包装createTableCell方法
        createCell: (key: Extract<keyof T, string>, title: ReactNode, columnSize?: number) => {
            return columnHelper.accessor(
                (row: T) => row[key],
                {
                    id: key,
                    header: () => <div style={{ textAlign: 'center'}}>{title}</div>,
                    cell: info => {
                        const value = info.getValue();
                        return <div style={{ textAlign: 'center' }}>
                            {typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
                                ? String(value)
                                : (value as ReactNode) ?? ''}
                        </div>;
                    },
                    size: columnSize,
                }
            );
        }
    };
}