Drop ESRB rating images into this folder. The game detail page (src/pages/games/[id].astro)
will display the image whose filename matches the rating code (case-insensitive).

Expected filenames (any of these extensions work: .png, .svg, .webp, .jpg):
  rp.png      -> Rating Pending
  ec.png      -> Early Childhood
  e.png       -> Everyone
  e10.png     -> Everyone 10+   (note: "+" stripped, so E10+ -> e10)
  t.png       -> Teen
  m.png       -> Mature 17+
  ao.png      -> Adults Only 18+

Currently wired to .png — if you use another extension, update the `ageImage`
mapping in src/pages/games/[id].astro.
