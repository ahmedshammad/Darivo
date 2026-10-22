# Mobile evidence reading — stable pointer interaction

All eight EN/AR × light/dark ×375/390px cases explicitly assert that Sources opens after a pointer click from the focused composer. The open disclosure, multiline editor and reading pane fit within the500px viewport; the reading pane retains more than80px, with additional content scrollable. No page errors or horizontal overflow are recorded.

Visual inspection found a remaining short-viewport overlap: the map toolbar covers part of the sheet handle at500px. The next repair hides map tools while the short sheet is expanded and asserts that the handle receives pointer input; collapsing the sheet restores the controls. This set is retained as evidence of that finding. The retained helper includes the source-open and pane-size assertions used for this capture.

These are desktop Chrome viewport simulations, not physical virtual-keyboard validation.
