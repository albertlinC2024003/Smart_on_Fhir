// HoverPopup.tsx
import React, { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

interface HoverPopupProps {
    trigger: React.ReactNode; // 觸發物件
    popup: React.ReactNode;   // 彈窗內容
}

const OFFSET = 10;

const HoverPopup: React.FC<HoverPopupProps> = ({ trigger, popup }) => {
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ left: 0, top: 0 });
    const triggerRef = useRef<HTMLSpanElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPos({ left: rect.left, top: rect.top });
            setVisible(true);
        }
    };

    useLayoutEffect(() => {
        if (visible && triggerRef.current && popupRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const popupRect = popupRef.current.getBoundingClientRect();
            const { innerWidth, innerHeight } = window;
            let left = triggerRect.left;
            let top = triggerRect.top - popupRect.height - OFFSET;
            if (top < OFFSET) top = triggerRect.bottom + OFFSET;
            if (left + popupRect.width > innerWidth - OFFSET) left = innerWidth - popupRect.width - OFFSET;
            if (left < OFFSET) left = OFFSET;
            if (top + popupRect.height > innerHeight - OFFSET) top = innerHeight - popupRect.height - OFFSET;
            setPos({ left, top });
        }
    }, [visible]);

    const handleMouseLeave = (e: React.MouseEvent) => {
        const related = e.relatedTarget as Node;
        if (
            triggerRef.current &&
            popupRef.current &&
            !triggerRef.current.contains(related) &&
            !popupRef.current.contains(related)
        ) {
            setVisible(false);
        }
    };

    return (
        <>
      <span
          ref={triggerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          // style={{ display: "inline-block" }}
      >
        {trigger}
      </span>
            {visible &&
                createPortal(
                    <div
                        ref={popupRef}
                        style={{
                            position: "fixed",
                            left: pos.left,
                            top: pos.top,
                            zIndex: 9999,
                            pointerEvents: "auto",
                            background: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            border: "1px solid #ddd",
                            // padding: 8,
                            borderRadius: 4,
                            // maxWidth: 300,
                            // maxHeight: 200,
                            overflow: "auto"
                        }}
                        onMouseLeave={handleMouseLeave}
                        onMouseEnter={() => setVisible(true)}
                    >
                        {popup}
                    </div>,
                    document.body
                )
            }
        </>
    );
};

export default HoverPopup;