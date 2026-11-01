# xjournal

## Summary
X Journal is a visual arts publication at Knox College.
This repository is the journal's website, which hosts all the artwork and essays published in the journal.

## Technical Information
The site uses Vue for its structure, routing, and seamless page rendering.
I used scoped CSS and CSS Grid for responsive layout.
I had no need for a full backend. So the site and images are hosted through Vercel, and the data is generated as JSON from a Google spreadsheet.

## Adding a new volume
1. Put the volume's images in `public/images/compressed/1200/`, at any size. Full-size originals are fine.
2. Update `src/data.json` as usual (it can be regenerated from the spreadsheet; the scripts never edit it).
3. Start the site (`npm run dev`) or deploy. Images are compressed automatically before both: anything wider than 1200px, over 1 MB, in print (CMYK) color, or a photo saved as PNG is resized to 1200px wide and saved as a web JPEG, and the 768px and 400px copies are created. Run `npm run images` to do it on demand.

Originals are backed up locally to `image-originals/` (not deployed or committed). When a PNG photo is converted to JPEG, the new file name is recorded in `src/image-manifest.json`, and the site reads image URLs through `src/images.js`.

## History
I developed this site as a side project from 2018-21.
It was an awesome opportunity to help me learn about responsive design, UI, web-typography, all in general and in regards to accessibiliy, and Vue.

## More Information at my [website](https://patricksteppan.com/x-journal)
