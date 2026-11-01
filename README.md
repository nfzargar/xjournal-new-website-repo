# xjournal

X Journal is the annual undergraduate visual arts publication of Knox College, created in 2017. This repository is the journal's website, which hosts the artwork and essays from each issue.

## Tech

- Vue 3 and Vue Router, built with Vite
- Plain scoped CSS
- WebGL for the landing gradient, the yellow page transition and the artwork dissolve
- No backend: the site is static and hosted on Vercel
- All content lives in `src/data.json`

## Run it locally

Requires Node.js.

```bash
npm install
npm run dev
```

The site runs at http://localhost:8080.

| Command | What it does |
|---|---|
| `npm run dev` | Compresses any new images, then starts the local site |
| `npm run build` | Compresses any new images, then builds the site into `dist/` |
| `npm run images` | Compresses images only |
| `npm run lint` | Checks the code |

## Where things are

| Path | What it is |
|---|---|
| `src/data.json` | Artworks, artists, issues, staff and essays |
| `src/volumes.js` | Latest-volume logic and same-title grouping |
| `src/images.js` | Builds every artwork image URL |
| `src/image-manifest.json` | Generated list of renamed and compressed images |
| `src/views/` | The pages |
| `src/views/SubmissionPage.vue` | Submission form link and timeline text |
| `src/components/SiteShell.vue` | Top bar and explore menu |
| `src/components/MorphViewer.vue` | Artwork dissolve |
| `src/components/GrainGradient.vue` | Landing and page-transition gradient |
| `scripts/compress-images.cjs` | Image compressor |
| `public/images/compressed/` | Artwork at 1200, 768 and 400 pixels wide |
| `vercel.json` | Vercel build, routing and image caching settings |

`src/data.json` was originally generated from a Google Sheet. Volumes 6, 7 and 8 were added by editing it directly.

## Adding a new volume

Credits matter most here: every artwork must be matched to the person who made it. If a credit isn't certain, leave that artwork out until it's confirmed.

### 1. Get the final PDF

Use the final PDF, not a draft. Compare it against the printed book if you can, because drafts can contain wrong credits and placeholder text. Keep the PDF and design files outside this repo.

### 2. Extract the images

Pull the original images out of the PDF rather than taking screenshots of pages, so printed captions and page numbers don't end up on the artwork. For example, with PyMuPDF:

```bash
python3 -m venv venv
venv/bin/pip install pymupdf
```

```python
import pymupdf

doc = pymupdf.open("volume.pdf")
for page_number, page in enumerate(doc, start=1):
    for n, info in enumerate(page.get_image_info(xrefs=True), start=1):
        pix = pymupdf.Pixmap(doc, info["xref"])
        if pix.alpha or pix.colorspace.n != 3:
            pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
        pix.save(f"p{page_number}-{n}.png")
```

Then check each image against its page, because some need extra work:

- **Rotated images:** rotate them to match the page. The image's `transform` value shows the rotation.
- **Spreads across two pages:** join the two halves into one image.
- **Bleed:** crop anything that runs past the page edge.
- **Vector artwork:** this won't extract as an image, so render that part of the page at 300 dpi.
- **Transparent images:** flatten them onto white.

### 3. Match every image to its credit

Read each page's caption for the title, artist, medium, size and year, and compare names with the contributor list in the book.

- If a caption is missing, only credit the work when there's clear evidence of who made it, and have someone check it against the book.
- Don't fix printed details without checking. Note typos, impossible years and placeholder sizes such as `0" x 0"`, then decide on each one.

### 4. Add the images

Name files by volume and printed page, then put them in `public/images/compressed/1200/`:

- One image: `v9-p14.jpg`
- Several images in one artwork: `v9-p14-1.jpg`, `v9-p14-2.jpg`
- Several artworks on one page: `v9-p36.jpg`, `v9-p36-1.jpg`

Full-size files are fine, because the next build compresses them. Originals that get compressed are backed up to `image-originals/`, which isn't committed.

### 5. Update `src/data.json`

Add the volume to `issues`. The highest number automatically becomes the latest volume on the site.

```json
"9": { "essayId": "essay-id", "spotColor": "riso-red" }
```

Add each artwork to `artworks` under a new unique ID. Keep them in book order.

```json
"aB3dE5gH7j": {
  "title": "Artwork title",
  "yearMade": "2027",
  "size": "8\" x 10\"",
  "description": "Oil on canvas",
  "artistId": "artist-id",
  "imageNames": ["v9-p14.jpg"],
  "issueId": "9",
  "pageNumber": "14"
}
```

`pageNumber` is the printed page. When several artworks share a page, use decimals such as `"36"`, `"36.1"` and `"36.2"`.

Add new artists to `artists`. For someone already listed, reuse their entry and add the new volume to their `issueIds`.

```json
"artist-id": {
  "artistID": "artist-id",
  "name": "Name As Printed",
  "artworks": null,
  "graduationYear": "2027",
  "issueIds": ["9"]
}
```

Add the essay to `essays`. If a paragraph contains a line break, its second line displays as a bold subheading.

```json
"essay-id": {
  "issueId": 9,
  "title": "Essay Title",
  "author": "Author Name",
  "graduationYear": "27",
  "paragraphs": ["First paragraph.", "Second paragraph."]
}
```

Add the designers to `staff`. The about page creates a tab for each year automatically.

```json
"2027": {
  "year": "2027",
  "staff": [
    { "name": "Name", "role": "Designer" },
    { "name": "Tim Stedman", "role": "Faculty advisor / mentor" }
  ]
}
```

### 6. Compress and check

```bash
npm run images
npm run dev
```

The images command should report `0 missing, 0 failed`. Then check:

- Every artwork and credit in the viewer against the book
- The artists page and essay for the new volume
- The new staff tab on the about page
- The volume in the explore menu

### 7. Update the submit page

Update the form link and timeline text in `src/views/SubmissionPage.vue` if they've changed.

### 8. Publish

Commit and push to `main`. See [Deployment](#deployment).

## How artworks are displayed

- Artworks with the same title by the same artist appear one after the other as separate frames, even if the book prints them apart. This is automatic.
- This only applies to matching titles, so an artist's differently titled works stay in book order.
- Works titled "Untitled" are never grouped.
- Every frame keeps its title caption.
- The artists page lists a repeated title once and links to its first image.

## Performance

The gradient and dissolve lower their quality automatically on slower machines. The dissolve is skipped for visitors whose system has reduced motion turned on.

Artwork images are cached in browsers for a week, so if you replace an image, give the new file a new name.

## Deployment

The site is hosted on Vercel and deployed from this GitHub repository.

### First-time setup

1. Create a GitHub repository and push this project to it.
2. On vercel.com, sign in with GitHub and choose **Add New → Project**.
3. Import the repository and click **Deploy**. `vercel.json` already contains the build settings.
4. Test the `.vercel.app` link.
5. To use a custom domain, add it in Vercel under **Settings → Domains**, then enter the DNS records it shows at your domain registrar.

### Publishing changes

Every push to `main` automatically rebuilds and publishes the site, usually within a few minutes.

In GitHub Desktop: check that the branch is `main`, write a summary, click **Commit to main**, then click **Push origin**.

Or in Terminal:

```bash
git add -A
git commit -m "Describe your change"
git push
```

Always check changes on localhost first, because everything pushed to `main` goes live.

Don't commit design files, PDFs, `dist/`, `node_modules/` or `image-originals/`.

## History

Patrick Steppan developed the original site as a side project from 2018 to 2021, using Vue with responsive design and web typography at its core. Read more on [his website](https://patricksteppan.com/x-journal).

Nairran Farooq redesigned the site in 2026 and added volumes 6, 7 and 8. The earlier work and its contributors remain in the commit history.
