# VR Campus Tour - PlantUML Diagrams

## Overview

The VR Campus Tour system uses two separate navigation interfaces to handle different types of navigation:

1. **Area System** - Traditional floor-based navigation with photo sequences
2. **Elevator System** - Dedicated multi-floor elevator navigation

## Diagram Files

### Area Navigation System
See: [area-plantuml.md](./area-plantuml.md)

Contains interfaces and relationships for:
- `Area` - Building floor areas with photo sequences
- `Photo` - Individual 360° photos with connections
- `NavigationHotspot` - 3D clickable positions for stairs/elevators
- `NearbyRoom` & `BuildingContext` - Contextual information

### Elevator Navigation System
See: [elevator-plantuml.md](./elevator-plantuml.md)

Contains interfaces and relationships for:
- `Elevator` - Dedicated elevator systems
- `ElevatorPhoto` - Single elevator interior photo
- `ElevatorHotspot` - Floor selection buttons
