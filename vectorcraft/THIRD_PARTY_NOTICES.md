# Third-party notices

## Desktop runtime

This desktop distribution includes Electron 45.0.0 (MIT), Chromium and their third-party notices in LICENSE.electron.txt and LICENSES.chromium.html beside the application. The bundled React and React DOM 19.2.1 are MIT-licensed, copyright Meta Platforms, Inc. and affiliates. The MIT license text is included in LICENSE; the following additional React license applies to those bundled portions:

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

VectorCraft is a separate application by the ArtCraft contributors; this installer does not redistribute it.

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
