# Third-party notices

HuePrint includes or accesses the following color-naming resources.

## NTC — Name That Color

- Creator: Chirag Mehta
- Project: https://chir.ag/projects/ntc/
- Bundled file: `hueprint_ntc.js`
- License: Creative Commons Attribution 2.5
- License text: https://creativecommons.org/licenses/by/2.5/

HuePrint bundles the official NTC color-name list and reproduces its matching behavior locally so NTC names remain available without an internet connection. The original source header and attribution are retained in `hueprint_ntc.js`.

## Colornames.org

- Project: https://colornames.org/
- Lookup endpoint: https://colornames.org/search/json/
- Website content license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0
- Downloadable data license: CC0 1.0 Universal

HuePrint requests a community-provided name for the visible HEX colors in the background. Successful responses are cached locally. No Colornames.org dataset is redistributed with HuePrint, and the interface reports `No connection` when the service cannot be reached.
