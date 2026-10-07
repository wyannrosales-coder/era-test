# ERA Residence website

A static copy of the ERA Residence website, captured on 6 October 2026.

## Contents

- Homepage and contact page
- Apartment listing with filters
- 25 apartment detail pages
- Bundled images, video effects, styles, scripts, and floor-plan PDFs

## Preview locally

Run `python3 -m http.server 4173 --directory dist`, then open http://localhost:4173. No package installation or build step is required.

## Editing

Edit the HTML pages under `dist` and shared assets under `dist/assets`. Each page route has its own `index.html`. `asset-manifest.json` records source asset URLs.

## Enquiry forms

Forms are preview-only and do not transmit to the original website. Connect a receiving email or CRM before enabling submissions.

## External dependencies

Adobe Typekit and external map, social, and legal links retain their original destinations. The site is marked noindex, and original analytics were removed.

## Hosting

This repository can be served by any static web host using `dist` as the public directory. No hosting deployment was made as part of this GitHub upload.
