---
layout: default
title: Urbana-Champaign MTD Map
---

<div style="position: fixed; top: 10px; left: 10px; background: white; padding: 10px; z-index: 1000; border-radius: 5px; box-shadow: 0 0 5px rgba(0,0,0,0.3);">
  <label for="refreshRate">Refresh interval (seconds): <span id="intervalValue">15</span></label><br>
  <input type="range" id="refreshRate" min="1" max="30" value="15" />
</div>

<div id="map" style="height: 100vh;"></div>
