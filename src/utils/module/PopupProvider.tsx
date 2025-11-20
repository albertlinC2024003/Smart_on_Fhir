
import { createContext, useContext, useState } from "react";
import Popup from "reactjs-popup";
import { Backdrop, Box, Button, Stack, CircularProgress } from "@mui/material";
import { createPortal } from "react-dom";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {CssSize, PopUpDetail, PopUpMethod} from "../../dto/componentObj";
import { PopupSize } from "../../enum/component";

const sizeOption: {[key: string]: CssSize}= {
  S: { height: '200px', width: '300px' },
  M: { height: '400px', width: '600px' },
};
interface Notification {
  notification: boolean
  message: string
  severity: string
  openNotification: (text?: string, severity?: string) => void
  closeNotification: () => void
}
const useNotificationStore = create<Notification>()(
  devtools((set) => ({
    notification: false,
    message: '',
    severity: 'warning',
    openNotification: (text = '', severity = 'warning') =>
      set(() => ({ notification: true, message: text, severity })),
    closeNotification: () =>
      set(() => ({ notification: false, message: '', severity: 'warning' }))
  }))
)

//因為Context中包含useState的方法 所以一開始先設置初始值 方法則是在Provider中設置
const PopUpContext = createContext<PopUpDetail>({
  message: '', isOpen: false, mustFocus: false, loading: false,
  setOpen: () => { }, setFocus: () => { }, setMessage: () => { }, setLoading: () => { }, openNotification: () => { },
  actionAfterClose: () => { },
  openMask: false,
  setOpenMask: () => { },
  setWindowSize: () => { },
});
export const usePopUp = ():PopUpMethod => {
  const context = useContext(PopUpContext);
  const openPopUp = (msg: string, focus: boolean, size?:PopupSize, actionAfterClose?: (() => void)) => {
    context.setOpen(true);
    context.setMessage(msg);
    context.setFocus(focus);
    context.setWindowSize(sizeOption[size?size:PopupSize.S]);
    if(actionAfterClose){
      context.actionAfterClose = actionAfterClose;
    }else{
      context.actionAfterClose = () => { };
    }
  }
  const loading = (openMask: boolean, loading?: boolean) => {
    context.setOpenMask(openMask);
    context.setLoading(loading?loading:false);
  }
  const openNotification = (msg: string, severity: string) => {
    context.openNotification(msg, severity);
  }
  if (!context) {
    throw new Error("usePopUp must be used within an PopUpProvider");
  }
  return { openPopUp, loading, openNotification };//只需要將有用到的方法回傳即可
};



const PopUpProvider = () => {
  //初始值
  const [isOpen, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [mustFocus, setFocus] = useState(false);
  const [openMask, setOpenMask] = useState(false);
  const [loading, setLoading] = useState(false);
  const [windowSize, setWindowSize] = useState<CssSize>(sizeOption.S);
  const { openNotification } = useNotificationStore()
  const context = useContext(PopUpContext);
  context.setOpen = setOpen;
  context.setMessage = setMessage;
  context.setFocus = setFocus;
  context.setOpenMask = setOpenMask;
  context.setLoading = setLoading;
  context.openNotification = openNotification;
  context.setWindowSize = setWindowSize;
  function closePopup() {
    setLoading(false);
    setOpenMask(false);
    setOpen(false);
    setMessage('');
    context.actionAfterClose();
  }
 


  return createPortal(
    <PopUpContext.Provider value={context}>
      <Backdrop
        //遮罩
        sx={{ color: '#fff', zIndex: 6000 }}
        open={openMask}
      >
        {loading&&
        //是否顯示轉圈圈的圖示
        <CircularProgress color="inherit"/>}
      </Backdrop>
      <Popup open={isOpen} onClose={closePopup} closeOnDocumentClick={!mustFocus}
        //彈出視窗的背景樣式
        overlayStyle={mustFocus?{
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }:{}}
        //彈出視窗的樣式
        contentStyle={{
          textAlign: 'center',
        }}
      >
        <Stack alignItems={'center'} className="errorPopup" sx={ windowSize }>
          <Box className="errorPopupText">{message}</Box>
          <Button onClick={()=>{setOpen(false)}} variant="contained">關閉</Button>
        </Stack>
      </Popup>
      
  </PopUpContext.Provider>, document.body);
};
export default PopUpProvider;