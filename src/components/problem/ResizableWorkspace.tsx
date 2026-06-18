"use client";

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import { LayoutMode } from "./ProblemToolbar";
import { TestCaseState } from "./TestCasesPanel";
import { ReactNode, useRef, useEffect } from "react";

interface ResizableWorkspaceProps {
  layoutMode: LayoutMode;
  testCaseState: TestCaseState;
  problemPanel: ReactNode;
  editorPanel: ReactNode;
  testCasesPanel: ReactNode;
}

export function ResizableWorkspace({
  layoutMode,
  testCaseState,
  problemPanel,
  editorPanel,
  testCasesPanel,
}: ResizableWorkspaceProps) {
  const testPanelRef = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    const panel = testPanelRef.current;
    if (!panel) return;

    if (testCaseState === "hidden") {
      panel.collapse();
    } else if (panel.isCollapsed()) {
      panel.expand();
    }
  }, [testCaseState]);

  useEffect(() => {
    const handleCollapse = () => {
      testPanelRef.current?.collapse();
    };
    window.addEventListener("collapse-test-panel", handleCollapse);
    return () => window.removeEventListener("collapse-test-panel", handleCollapse);
  }, []);

  const showProblem = layoutMode !== "wide";
  const isVertical = layoutMode === "vertical";

  // ---------- Two-column (default) or wide-editor ----------
  if (!isVertical) {
    return (
      <div className="h-[calc(100vh-2.25rem)] w-full">
        <PanelGroup direction="horizontal" autoSaveId="recurse-h">
          {/* Left: Problem description */}
          {showProblem && (
            <>
              <Panel
                id="problem"
                order={1}
                defaultSize={40}
                minSize={20}
                maxSize={50}
              >
                <div className="h-full overflow-y-auto scrollbar-hide">{problemPanel}</div>
              </Panel>

              <PanelResizeHandle className="w-1.5 bg-gray-300 hover:bg-blue-500 active:bg-blue-600 transition-colors duration-100 cursor-col-resize" />
            </>
          )}

          {/* Right: Editor + TestCases stacked vertically */}
          <Panel id="editor-col" order={2} defaultSize={showProblem ? 60 : 100} minSize={30}>
            <PanelGroup direction="vertical" autoSaveId="recurse-v">
              <Panel id="editor" order={1} defaultSize={80} minSize={30}>
                <div className="h-full w-full min-h-0 min-w-0">{editorPanel}</div>
              </Panel>

              <PanelResizeHandle className="h-1.5 bg-gray-300 hover:bg-blue-500 active:bg-blue-600 transition-colors duration-100 cursor-row-resize" />

              <Panel
                id="testcases"
                order={2}
                ref={testPanelRef}
                defaultSize={20}
                minSize={0}
                maxSize={60}
                collapsible
                collapsedSize={0}
              >
                <div className="h-full overflow-y-auto scrollbar-hide">{testCasesPanel}</div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    );
  }

  // ---------- Vertical stack (mobile / focus) ----------
  return (
    <div className="h-[calc(100vh-2.25rem)] w-full">
      <PanelGroup direction="vertical" autoSaveId="recurse-vert-stack">
        <Panel id="problem-v" order={1} defaultSize={35} minSize={15} maxSize={60}>
          <div className="h-full overflow-y-auto scrollbar-hide">{problemPanel}</div>
        </Panel>

        <PanelResizeHandle className="h-1.5 bg-gray-300 hover:bg-blue-500 active:bg-blue-600 transition-colors duration-100 cursor-row-resize" />

        <Panel id="editor-v" order={2} defaultSize={50} minSize={25}>
          <div className="h-full w-full min-h-0 min-w-0">{editorPanel}</div>
        </Panel>

        <PanelResizeHandle className="h-1.5 bg-gray-300 hover:bg-blue-500 active:bg-blue-600 transition-colors duration-100 cursor-row-resize" />

        <Panel
          id="testcases-v"
          order={3}
          ref={testPanelRef}
          defaultSize={15}
          minSize={0}
          maxSize={50}
          collapsible
          collapsedSize={0}
        >
          <div className="h-full overflow-y-auto scrollbar-hide">{testCasesPanel}</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
