# Interrupted production preflight

This run captured only the initial EN dark desktop before submission timed out. The preview at port3001 inherited AUTH_URL for port3000, so its expected origin rejected the POST. The corrected preview explicitly sets AUTH_URL=http://localhost:3001; the application origin check is unchanged.

Axe also found a serious aria-prohibited-attr issue on the empty conversation container: aria-label on a generic div. It now has the semantic log role with aria-live off because separate status controls already announce progress. A fresh production capture is required. No passing matrix or signature recording is claimed for this folder.
