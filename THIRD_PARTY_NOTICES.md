# Third-party notices

HuePrint React includes or can display names from the following resources.

## NTC — Name That Color

- Creator: Chirag Mehta
- Project: https://chir.ag/projects/ntc/
- License: Creative Commons Attribution 2.5
- License text: https://creativecommons.org/licenses/by/2.5/

HuePrint bundles the official NTC color-name list and reproduces its matching behavior locally so NTC names remain available without an internet connection. `scripts/sync-react-data.mjs` generates the React data module from the attributed source retained at `inkscape/hueprint_ntc.js`.

## Colornames.org

- Project: https://colornames.org/
- Lookup endpoint: https://colornames.org/search/json/
- Website content license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0
- Downloadable data license: CC0 1.0 Universal

No Colornames.org dataset is redistributed with HuePrint. React host applications can optionally provide a same-origin community-name resolver; successful results are cached locally and unavailable requests are reported without blocking palette work.
