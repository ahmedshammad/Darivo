# Mobile evidence reading — viewport repair, pointer defect retained

Eight EN/AR × light/dark × 375/390px cases use the mobile minimum-height repair and a short-height source-note cap. The500px viewport now contains the pane's bottom. Focused keyboard tests pass for source scrolling, Tab escape and the final evidence action.

The captures named `short-sources` exposed a separate pointer defect: blur shrank the composer from96px to52px during mousedown, moving the Sources summary before click completed. Those images show a closed disclosure; they are **failed pointer evidence**, not open-source validation. The capture script initially measured only document overflow and page errors, so its zero-failure summary does not cover this lost click. The next revision adds an explicit open-state assertion and keeps editing height stable through pointer interactions.

Physical virtual-keyboard behavior remains unverified.
