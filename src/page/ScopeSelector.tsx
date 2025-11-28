import { useState } from "react";
import { Box, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import CustomButton from "../component/input/CustomButton.tsx";

const scopeOptions = [
    { label: "過敏史 (allergy.read)", value: "patient/AllergyIntolerance.read" },
    { label: "用藥紀錄 (medication.read)", value: "patient/MedicationStatement.read" },
    { label: "就診紀錄 (encounter.read)", value: "patient/Encounter.read" },
];

const ScopeSelector = ({ onConfirm }: { onConfirm: (scopes: string[]) => void }) => {
    const [selected, setSelected] = useState<string[]>([]);

    const handleChange = (value: string) => {
        setSelected(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    return (
        <Box className="flex flex-col items-center justify-center mt-8">
            <Box className="mb-2 text-lg">請選擇要授權的病歷資料 (scope)：</Box>
            <FormGroup>
                {scopeOptions.map(opt => (
                    <FormControlLabel
                        key={opt.value}
                        control={
                            <Checkbox
                                checked={selected.includes(opt.value)}
                                onChange={() => handleChange(opt.value)}
                            />
                        }
                        label={opt.label}
                    />
                ))}
            </FormGroup>
            <CustomButton
                text="確認授權"
                onClick={() => onConfirm(selected)}
                disabled={selected.length === 0}
                className="mt-4"
            />
        </Box>
    );
};

export default ScopeSelector;