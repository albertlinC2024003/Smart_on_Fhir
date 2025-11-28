import {Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, type SxProps} from "@mui/material"
import CloseIcon from '@mui/icons-material/Close'

interface SimplePopupProps {
    className?: string
    containerCss?: SxProps// If you use width, set maxWidth to false.
    openPopup: boolean
    title: string
    disable?: boolean
    cornerCloseButton?: boolean
    handleClose?: () => void
    onMouseLeave?: () => void
    children: React.ReactNode
    button?: React.ReactNode
}

//僅提供基本的popup功能，內容與按鈕可自行設定
const SimplePopup = ({
    className,
    containerCss,
    openPopup,
    handleClose = () => {
     openPopup = !openPopup
    },
    title,
    cornerCloseButton = false,
    children,
    button,
    onMouseLeave,
}: SimplePopupProps) => {

    return (
        // 要把maxWidth設為false才能在containerCss中使用width控制大小
        <Dialog open={openPopup} maxWidth={false}>
            <Box sx={containerCss} className={className} onMouseLeave={onMouseLeave}>
                <DialogTitle className="py-2 text-center bg-emr-500 font-inter relative flex items-center justify-between">
                    <div className="w-full">{title}</div>
                    {cornerCloseButton && (
                        <IconButton
                            aria-label="close"
                            onClick={handleClose}
                            className="text-black"
                            size="small"
                        >
                            <CloseIcon/>
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent className="font-inter justify-items-center">{children}</DialogContent>
                {button && <DialogActions className="justify-self-center">{button}</DialogActions>}
            </Box>
        </Dialog>
    )
}
export default SimplePopup
