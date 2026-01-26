import { createContext, useContext, useState, type ReactNode, useMemo } from "react";
import Popup from "reactjs-popup";
import { Backdrop, Box, Button, Stack, CircularProgress } from "@mui/material";
import { createPortal } from "react-dom";
import type { CssSize, PopUpDetail, PopUpMethod } from "../../dto/componentObj";
import { PopupSize } from "../../enum/component";

const sizeOption: { [key: string]: CssSize } = {
    S: { height: '200px', width: '300px' },
    M: { height: '400px', width: '600px' },
};

const PopUpContext = createContext<PopUpDetail | undefined>(undefined);

export const usePopUp = (): PopUpMethod => {
    const context = useContext(PopUpContext);
    if (!context) throw new Error("usePopUp must be used within a PopUpProvider");

    const openPopUp = (msg: string, focus: boolean, size?: PopupSize, actionAfterClose?: () => void) => {
        context.setOpen(true);
        context.setMessage(msg);
        context.setFocus(focus);
        context.setWindowSize(sizeOption[size ?? PopupSize.S]);
        context.setActionAfterClose(actionAfterClose ?? (() => {}));
    };

    const loading = (openMask: boolean, loadingFlag: boolean = false) => {
        context.setOpenMask(openMask);
        context.setLoading(loadingFlag);
    };
    return { openPopUp, loading };
};

export const PopUpProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [mustFocus, setFocus] = useState(false);
    const [openMask, setOpenMask] = useState(false);
    const [loading, setLoading] = useState(false);
    const [windowSize, setWindowSize] = useState<CssSize>(sizeOption.S);
    const [actionAfterClose, setActionAfterClose] = useState<() => void>(() => {});

    const closePopup = () => {
        setLoading(false);
        setOpenMask(false);
        setOpen(false);
        setMessage('');
        actionAfterClose?.();
    };

    const context: PopUpDetail = useMemo(() => ({
        message,
        isOpen,
        mustFocus,
        loading,
        setOpen,
        setFocus,
        setMessage,
        setLoading,
        actionAfterClose,
        setActionAfterClose,
        openMask,
        setOpenMask,
        setWindowSize,
    }), [message, isOpen, mustFocus, loading, openMask, windowSize, actionAfterClose]);

    return createPortal(
        <PopUpContext.Provider value={context}>
            <Backdrop sx={{ color: '#fff', zIndex: 6000 }} open={openMask}>
                {loading && <CircularProgress color="inherit" />}
            </Backdrop>
            <Popup
                open={isOpen}
                onClose={closePopup}
                closeOnDocumentClick={!mustFocus}
                overlayStyle={mustFocus ? { zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.3)' } : {}}
                contentStyle={{ textAlign: 'center' }}
            >
                <Stack alignItems={'center'} sx={windowSize}>
                    <Box>{message}</Box>
                    <Button onClick={() => setOpen(false)} variant="contained">關閉</Button>
                </Stack>
            </Popup>
            {children}
        </PopUpContext.Provider>,
        document.body
    );
};
