# FullCalendar Resource Auto-Hide Plugin

Automatically hides resources without events in the visible date range, keeping your resource timeline clean and easy to navigate.

## Installation

```bash
npm install fullcalendar-resource-auto-hide
```

## Quick Start

```javascript
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import resourceAutoHidePlugin from 'fullcalendar-resource-auto-hide';

function App() {
  return (
    <FullCalendar
      plugins={[resourceTimelinePlugin, resourceAutoHidePlugin]}
      initialView="resourceTimelineMonth"
      resources={resources}
      events={events}
      resourceAutoHide={{
        enabled: true
      }}
    />
  );
}
```

## Usage

### Vanilla JavaScript

```html
<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6/index.global.min.js'></script>
<script src='https://cdn.jsdelivr.net/npm/@fullcalendar/resource-timeline@6/index.global.min.js'></script>
<script src='https://cdn.jsdelivr.net/npm/fullcalendar-resource-auto-hide@1/index.global.min.js'></script>
<script>
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: ['resourceTimeline', FullCalendarResourceAutoHide.default],
    resourceAutoHide: { enabled: true },
    // ... other options
  });
  calendar.render();
</script>
```

### Configuration Options

```javascript
<FullCalendar
  plugins={[resourceTimelinePlugin, resourceAutoHidePlugin]}
  initialView="resourceTimelineMonth"
  resources={resources}
  events={events}
  resourceAutoHide={{
    enabled: true,
    bufferDays: 7,
    alwaysVisibleResourceIds: ['unassigned', 'positions-to-fill'],
    debounceMs: 300,
    includeBackgroundEvents: false,
    shouldAlwaysShowResource: (resourceId, resource) => {
      return resource.title?.toLowerCase().includes('priority');
    },
    eventFilter: (event) => {
      return event.extendedProps?.type !== 'hidden';
    }
  }}
/>
```

## Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable or disable the auto-hide functionality |
| `bufferDays` | `number` | `0` | Number of days to add as buffer before and after the visible date range |
| `alwaysVisibleResourceIds` | `string[] \| function` | `[]` | Resource IDs that should always remain visible |
| `shouldAlwaysShowResource` | `function` | `undefined` | Custom function to determine if a resource should always be visible |
| `debounceMs` | `number` | `300` | Debounce delay in milliseconds for filtering operations |
| `includeBackgroundEvents` | `boolean` | `false` | Whether to check background events when determining visibility |
| `eventFilter` | `function` | `undefined` | Custom filter function for events to include in visibility calculation |

## Examples

### Always Show Specific Resources

Keep certain resources visible even when they have no events in the current view:

```javascript
resourceAutoHide={{
  alwaysVisibleResourceIds: ['unassigned', 'backlog', 'positions-to-fill']
}}
```

### Custom Visibility Rules

Use a function to determine which resources should always be visible:

```javascript
resourceAutoHide={{
  shouldAlwaysShowResource: (resourceId, resource) => {
    return resource.extendedProps?.department === 'Management';
  }
}}
```

### Filter Event Types

Only consider specific event types when determining visibility:

```javascript
resourceAutoHide={{
  eventFilter: (event) => {
    return event.extendedProps?.type === 'Work Assignment';
  }
}}
```

### Include Background Events

Count background events when determining resource visibility:

```javascript
resourceAutoHide={{
  includeBackgroundEvents: true,
  bufferDays: 14
}}
```

## How It Works

The plugin automatically updates resource visibility when you navigate dates or events change:

1. Monitors `datesSet`, `eventsSet`, and `eventChange` events
2. Calculates which events overlap with the current visible date range (plus buffer if configured)
3. Identifies resources associated with those events
4. Hides resources that have no events in the visible range
5. Always keeps resources visible if they're specified in `alwaysVisibleResourceIds` or `shouldAlwaysShowResource`

Updates are debounced to prevent performance issues during rapid navigation, and resource changes are batched for optimal rendering performance.

## Requirements

- FullCalendar v6.0.0 or higher
- `@fullcalendar/resource-timeline` plugin (required)

## Browser Support

Supports all browsers that FullCalendar supports: Chrome, Firefox, Safari, and Edge.

## License

MIT

## Contributing

Contributions are welcome! Open an issue or submit a pull request on [GitHub](https://github.com/afaqmnsr/fullcalendar-resource-auto-hide).

## Related Links

- [FullCalendar Documentation](https://fullcalendar.io/docs)
- [FullCalendar Timeline View](https://fullcalendar.io/docs/timeline-view)
- [Report an Issue](https://github.com/afaqmnsr/fullcalendar-resource-auto-hide/issues)