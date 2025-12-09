import {Box, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";

import {flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import { DisplayTableProps } from "../dto/componentObj";
import TableRowSelector from "./input/TableRowSelector";

const defaultHeaderCss = {
    fontSize: '16px',
    fontWeight: "bold",
    border: "1px solid #9ca3af",
    textAlign: "center",
}

const defaultBodyCss = {
    border: "1px solid",
    borderColor: "divider", //使用MUI預設顏色
    textAlign: "center",
}

//直接傳入資料的table 不依賴API
function DisplayTable<T> ({ columnDef, headerCss, bodyCss, handleRowClick, onSelectionChange, selectable, tableData, }: DisplayTableProps<T>){
    const table = useReactTable({
        data: tableData ? tableData : [], // 輸入表格的資料
        columns: columnDef, // 輸入定義好的表頭
        // manualPagination: false, //由後端提供分頁機制
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true, //由後端提供分頁機制
        rowCount: tableData ? tableData.length : 0,
        pageCount: 0,
        onRowSelectionChange: () => {
            if (onSelectionChange) {
                const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
                onSelectionChange(selectedRows);
            }
        },
    });
    //有特別設定的屬性會覆蓋預設值
    const hCss = { ...defaultHeaderCss, ...headerCss };
    const bCss = { ...defaultBodyCss, ...bodyCss };
    return (
        <Box className="flex flex-col min-h-[200px] max-h-full">
            <Box className="overflow-auto ">{/* max-h-[calc(100vh-400px)] */}
                <Table>
                    <TableHead
                        sx={{
                            backgroundColor: "#f3f4f6", // 設定表頭背景色
                            // 巢狀選擇器，設定所有表頭 cell 樣式
                            "& .MuiTableCell-root": hCss
                        }}
                    >
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {/* 有selectable才有checkbox */}
                                {selectable && (
                                    <TableCell
                                        key={"AllSelector"}
                                        padding={"checkbox"}
                                    >
                                        <TableRowSelector
                                            {...{
                                                checked: table.getIsAllRowsSelected(),
                                                indeterminate: table.getIsSomeRowsSelected(),
                                                onChange: table.getToggleAllRowsSelectedHandler(),
                                            }}
                                        />
                                    </TableCell>
                                )}
                                {headerGroup.headers.map(header => (
                                    <TableCell
                                        key={header.id}
                                        sx={{
                                            width: `${header.getSize()}px`
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody
                        className="overflow-auto"
                        sx={{
                            // 巢狀選擇器，設定所有表身 cell 樣式
                            "& .MuiTableCell-root": bCss
                        }}
                    >
                        {table.getCoreRowModel().rows.length === 0 ? (
                            <TableRow key={'empty'}>
                                <TableCell
                                    colSpan={columnDef.length + (selectable ? 1 : 0)}
                                    sx={{ textAlign: 'center', height: 400 }}
                                >
                                    {"沒有資料"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getCoreRowModel().rows.map(row => (
                                <TableRow key={row.id} >
                                    {/* 有selectable才有checkbox */}
                                    {selectable && (
                                        // 用rowId當key
                                        <TableCell
                                            key={row.id}
                                            padding={"checkbox"}
                                        >
                                            <TableRowSelector
                                                {...{
                                                    checked: row.getIsSelected(),
                                                    disabled: !row.getCanSelect(),
                                                    indeterminate: row.getIsSomeSelected(),
                                                    onChange: row.getToggleSelectedHandler(),
                                                }}
                                            />
                                        </TableCell>
                                    )}
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell
                                            key={cell.id}
                                            onClick={(event) => {
                                                handleRowClick ? handleRowClick(row, cell.column.id, event): () => {}
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Box>
        </Box>
    )
}
export default DisplayTable;