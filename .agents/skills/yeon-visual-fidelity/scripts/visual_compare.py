#!/usr/bin/env python3
"""Simple side-by-side and overlay comparison for YEON screenshots. Requires Pillow.
Usage: python visual_compare.py REFERENCE.png CURRENT.png OUTPUT.png
Diagnostic only: large diff doesn't automatically mean design failure."""
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance, ImageDraw
if len(sys.argv)!=4:
    raise SystemExit("Usage: visual_compare.py reference.png screenshot.png output.png")
a=Image.open(sys.argv[1]).convert("RGB")
b=Image.open(sys.argv[2]).convert("RGB").resize(a.size,Image.Resampling.LANCZOS)
frames=[a,b,Image.blend(a,b,.5),ImageEnhance.Contrast(ImageChops.difference(a,b)).enhance(2)]
labels=["LOCKED REFERENCE","CURRENT PAGE","50/50 OVERLAY","DIFFERENCE (DIAGNOSTIC)"]
scale=min(1.0,900/a.width)
w,h=round(a.width*scale),round(a.height*scale)
out=Image.new("RGB",(w*2,(h+38)*2),"#f5f7fb")
d=ImageDraw.Draw(out)
for i,(im,label) in enumerate(zip(frames,labels)):
    x=(i%2)*w;y=(i//2)*(h+38)
    out.paste(im.resize((w,h),Image.Resampling.LANCZOS),(x,y+38))
    d.text((x+10,y+12),label,fill="#142839")
dest=Path(sys.argv[3]);dest.parent.mkdir(parents=True,exist_ok=True)
out.save(dest);print("Comparison written:",dest)
