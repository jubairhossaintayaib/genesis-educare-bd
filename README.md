# Genesis Educare

An interactive, responsive, multi-page study abroad website. All 44 generated HTML pages, editable source files and assets are saved directly in this project folder.

## Open and edit

- Homepage: `index.html`.
- Shared design: `styles.css`.
- Browser interactions: `app.js`.
- Company copy, contact details, country data, university directory: `content.mjs`.
- Page templates and full page content: `build.mjs`.
- Supplied and generated visuals: `assets/`.

The HTML pages can be opened directly. For the local HTTP preview, run `npm start`, then open `http://127.0.0.1:4173`. The server binds only to your computer.

After editing content or templates, run `npm run build`. It updates the pages at the project root and creates the publication copy in `dist/`. After changing styles or browser JavaScript, rebuild before publication. Do not edit only `dist/`.

Run `npm run check` to validate internal links, required content, assets and interaction behaviour. The project uses built-in Node.js APIs and needs no npm installation.

## Included pages

- Home; About Us; Our Story; CEO’s Message; Why Genesis; Mission; Vision.
- Countries overview and 18 individual destination pages.
- University directory with 15 independent institution research options; Kyungsung University intake page.
- Programme suitability; undergraduate, postgraduate and PhD pages.
- Services; study abroad, scholarship guidance and student visa support pages.
- Application process; success overview and two individual student success pages.
- Contact; frequently asked questions; privacy; 404.

## Interactions

- Mobile navigation and accessible disclosure menus.
- Destination filters and text search, including an empty state and reset.
- University destination filter and search.
- Contact form with input validation and destination/study-level preselection.
- All four phone numbers have direct call and WhatsApp links.
- Email links use genesiseducarebd@gmail.com.
- Enquiry submission prepares a WhatsApp message for the selected number. Visitors review and send it in WhatsApp. The site does not send messages or store enquiries.
- Original success and campaign posters can be enlarged in a keyboard-dismissable dialog.
- Kyungsung intake page changes its deadline notice after 11 October 2026, using Dhaka time.
- Reduced-motion preference is respected. Most content and navigation remain usable without JavaScript.

## Content and images

Business biography, contact numbers, campaign dates and student results come from the supplied copy and artwork. The two identical Arafat posters were deduplicated. University entries are independent research options, not agency partnership claims. See `SOURCES.md`.

The original supplied logo, programme suitability screenshot and success posters are retained. CSS frames the original logo and programme photograph without replacing them. The campus hero is AI-generated illustrative photography created with the built-in Imagegen tool; its prompt is in `ASSET-PROMPT.md`.

## Verification

- 44 pages generated; one primary heading per page.
- 2,752 internal link/asset references checked.
- 18 country pages, 15 university entries and all contact links checked.
- Actual interaction code tested with a small DOM fixture for filters, menu, WhatsApp message preparation, poster viewer and deadline expiry.
- JavaScript syntax checks passed.
- Local homepage returned HTTP 200.
- Browser preview access was denied by the permission check. Visual layout, mobile overflow and real-browser interaction checks remain unverified. Responsive breakpoints exist at 1,150, 900, 600 and 360 pixels.

## Publication

The Sites identity is stored in `.openai/hosting.json`. The build output is `dist/`. The hosted site starts private and is separate from the business’s existing domain. Do not create another Site identity for future updates.
