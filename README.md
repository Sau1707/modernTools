# ModernTools

> Work in progress.

A collection of tools for Grepolis packed as a Chrome extension.

## Features

-   [ ] Units overview: Counts the units of all cities
-   [ ] Smilies: Extends the bbcode bar by a smiley box
-   [ ] Unit strength: Adds unit strength tables in various areas
-   [ ] Transport capacity: Shows the occupied and available transport capacity in the unit menu
-   [ ] Percentual trade: Extends the trade window by a percentual trade
-   [ ] Recruiting trade: Extends the trade window by a recruiting trade
-   [ ] Conquests: Counts the attacks/supports in the conquest window
-   [ ] Troop speed: Displays improved troop speed in the attack/support window
-   [ ] Simulator: Adaptation of the simulator layout & permanent display of the extended modifier box
-   [ ] Activity boxes: Improved display of trade and troop activity boxes (position memory)
-   [ ] Favor popup: Changes the favor popup
-   [ ] Taskbar: Increases the taskbar and minimizes the daily reward window on startup
-   [ ] Daily reward: Minimizes the daily reward window on startup
-   [ ] Defense form: Extends the bbcode bar by an automatic defense form
-   [ ] Unit Comparison: Adds unit comparison tables
-   [ ] Town icons: Each city receives an icon for the town type (automatic detection)
-   [ ] Town list: Adds the town icons to the town list
-   [ ] Map: Sets the town icons on the strategic map
-   [ ] Context menu: Swaps "Select town" and "City overview" in the context menu
-   [ ] Sent units: Shows sent units in the attack/support window
-   [ ] Town overview: Replaces the new town overview with the old window style
-   [ ] Mouse wheel: You can change the views with the mouse wheel
-   [ ] Town bbcode: Adds the town bbcode to the town tab
-   [ ] Statistics world: Adds a button to see the world stats
-   [ ] Culture overview: Adds a count for parties in the culture overview
-   [ ] Select unit helper: Improved a new tools on the attack and support window
-   [ ] Units beyond view: Improved a new tools on the agorà window
-   [ ] Scrollbar Style: Improved a new style for the scrollbar
-   [ ] Trade resources for festivals: Improved a new button to trade the resources
-   [ ] Calculator: Share the participation calculation
-   [ ] Keyboard shortcuts: It changes your life
-   [ ] Moding: Improved the picture of the goddes with your favorite characters
-   [ ] Send bug reports automatically: If you activate this option, you can help identify bugs
-   [ ] Thracian Conquest: Downsizing of the map of the Thracian conquest

## Add a new script

We want to make the script comatile with `tampermonkey` / `greasemonkey` / `violentmonkey`. Therefore add a script in `src/content/` with the name `<name>.user.js` suffix and use the following template:

```js
// ==UserScript==
// @name         <Script Name>
// @author       <Author Name>
// @description  <Description>
// @version      1.0.3
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @icon
// @updateURL    https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/<name>.user.js
// @downloadURL  https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/<name>.user.js
// ==/UserScript==

(function () {
	'use strict';
	const uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

	// Your code here...
})();
```

When are bundles into the extension, the comments are simply ignored.

##

Get current town

```javascript
ITowns.getTown(Game.townId);
```
