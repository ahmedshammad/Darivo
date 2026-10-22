# Mobile evidence reading — first capture

Eight EN/AR × light/dark × 375/390px cases record initial selected evidence, multiline editing and a resized 500px layout viewport. The initial pane has roughly493px reading height versus449px while editing. All eight records report no page errors or horizontal overflow.

This capture discovered an inherited short-viewport defect: the root minimum height550px placed the reading pane's bottom at550px in a500px viewport. Some immediate-resize screenshots also contain stale compositor content; settled recaptures in `/tmp/darivo-reading-settled` confirmed the geometry. Do not treat this set as a short-viewport pass. Subsequent captures preserve the repair separately. These resized desktop browser views do not emulate a physical phone keyboard.
