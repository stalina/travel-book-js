---
id: decision-5
title: ADR — Client-side geographic calculations and SVG projection
date: '2025-11-10 22:57'
status: accepted
---
## Context
The project renders an SVG map showing the trip path and markers calculated from GPS coordinates. Calculations include bounding box, viewBox, and lat/lon to SVG conversions.

## Decision
Implement geographic calculations client-side: Haversine distance, bounding box computation, viewBox calculation and a lat/lon-to-SVG coordinate conversion utility. Ensure utilities document inputs/outputs and handle edge cases conservatively.

## Consequences

- Immediate map rendering without server-side processing.
- Need to handle numeric edge cases (antimeridian, poles) and provide tests for projections.
- Potential performance considerations for very large datasets; provide optimizations or batching if needed.

