# Tour de France Fictif — Test dataset (English)

This folder contains a fictional dataset intended for testing the Travel Book generator.

Structure
- `trip.json` — trip metadata (dates, steps, cover photo)
- `locations.json` — mapping of place ids to names/countries
- `<slug>_<id>/photos/` — photos for each step (1.jpg .. 7.jpg)
- `cover.jpg` — cover image at the root of the trip folder

Placeholders and photo source
- The dataset uses seeded placeholders from picsum.photos for reproducible tests. Each photo file is generated with a seed so the same image can be reproduced later.

How to replace placeholders with real photos
- Put your photos inside `docs/input/tour-de-france-fictif/<slug>_<id>/photos/` and name them `1.jpg`, `2.jpg`, etc. The generator reads files in alphabetical order.
- Optionally add a `cover.jpg` at the trip root to override the default cover.
- If you use images from Unsplash/Pexels/Pixabay, add an attribution string into `trip.json` under the step's `photos[]` entries (the `attribution` field).

Picsum seeds used (per step)

The dataset contains 7 placeholder photos per step. Seeds are recorded in `trip.json` under each step description/photo attribution. For convenience, here is the list:

- Paris (paris_1)
	- seeds: paris1, paris1b, paris1c, paris1d, paris1e, paris1f, paris1g
- Rouen (rouen_2)
	- seeds: rouen2, rouen2b, rouen2c, rouen2d, rouen2e, rouen2f, rouen2g
- Le Havre (le-havre_3)
	- seeds: le-havre3, le-havre3b, le-havre3c, le-havre3d, le-havre3e, le-havre3f, le-havre3g
- Caen (caen_4)
	- seeds: caen4, caen4b, caen4c, caen4d, caen4e, caen4f, caen4g
- Roubaix (roubaix_5)
	- seeds: roubaix5, roubaix5b, roubaix5c, roubaix5d, roubaix5e, roubaix5f, roubaix5g
- Reims (reims_6)
	- seeds: reims6, reims6b, reims6c, reims6d, reims6e, reims6f, reims6g
- Lyon (lyon_7)
	- seeds: lyon7, lyon7b, lyon7c, lyon7d, lyon7e, lyon7f, lyon7g
- Grenoble (grenoble_8)
	- seeds: grenoble8, grenoble8b, grenoble8c, grenoble8d, grenoble8e, grenoble8f, grenoble8g
- Nice (nice_9)
	- seeds: nice9, nice9b, nice9c, nice9d, nice9e, nice9f, nice9g
- Marseille (marseille_10)
	- seeds: marseille10, marseille10b, marseille10c, marseille10d, marseille10e, marseille10f, marseille10g

Cover photo
- The cover image is `cover.jpg` (seed: `cover-tour-de-france`). It is recorded in `trip.json` under `cover_photo.attribution`.

Credits & license notes
- Picsum.photos provides placeholder images for testing. These are not intended for publication. Replace them with properly licensed images before distributing.
- If you use images from Unsplash/Pexels/Pixabay, consult their respective licenses and add appropriate attribution in `trip.json`.

Quick checklist
- [ ] Replace placeholder images with real photos if you plan to publish the travel book
- [ ] Add attribution strings to `trip.json` photos if required by the image license

If you want, I can also:
- Rename seed-based files to simple numeric names (`3.jpg`..`7.jpg`) for neatness (currently some files use the seed in the filename).
- Generate a preview HTML using the generator to verify layout.
