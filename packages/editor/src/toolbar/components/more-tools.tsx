import { useEffect, useRef, useState } from "react";
import { PopupWrapper } from "../../components/popup-presenter";
import { ToolButton } from "../components/tool-button";
import { useToolbarLocation } from "../stores/toolbar-store";
import { ToolProps } from "../types";
import { getToolbarElement } from "../utils/dom";
import { ToolId } from "../tools";
import { ToolbarGroup } from "./toolbar-group";

type MoreToolsProps = ToolProps & {
  popupId: string;
  tools: ToolId[];
  autoCloseOnUnmount?: boolean;
};
export function MoreTools(props: MoreToolsProps) {
  const { popupId, editor, tools, autoCloseOnUnmount } = props;
  const toolbarLocation = useToolbarLocation();
  const isBottom = toolbarLocation === "bottom";
  const buttonRef = useRef<HTMLButtonElement | null>();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ToolButton
        {...props}
        toggled={isOpen}
        buttonRef={buttonRef}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen((s) => !s)}
      />
      <PopupWrapper
        isOpen={isOpen}
        group={"toolbarGroup"}
        id={popupId}
        onClosed={() => setIsOpen(false)}
        position={{
          isTargetAbsolute: true,
          target: isBottom ? getToolbarElement() : buttonRef.current || "mouse",
          align: "center",
          location: isBottom ? "top" : "below",
          yOffset: isBottom ? 10 : 5,
        }}
        autoCloseOnUnmount={autoCloseOnUnmount}
        focusOnRender={false}
        blocking={false}
        renderPopup={() => (
          <ToolbarGroup
            tools={tools}
            editor={editor}
            sx={{
              flex: 1,
              p: 1,
              // TODO: we cannot put a fix height here
              // since it differs from platform to platform.
              // perhaps we can use a expose a custom css class
              // or extend the theme.
              // px: isBottom ? 0 : 1,
              // height: "50px",
              boxShadow: "menu",
              bg: "background",
              borderRadius: "default",
              overflowX: "auto",
              maxWidth: "95vw",
            }}
          />
        )}
      />
    </>
  );
}
