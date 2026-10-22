# Deadline capture — first attempt

No validated checkpoints. The standalone harness used browser.newPage(), whose implicit context prevented axe from opening its analysis page. This is a capture configuration failure, not evidence of a product fault. The failed manifest is retained; the harness now creates an explicit context.
