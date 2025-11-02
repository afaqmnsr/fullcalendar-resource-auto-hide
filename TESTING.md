# Testing Guide

## Quick Test Checklist

Before publishing, verify these scenarios work:

### 1. Basic Functionality
- [ ] Resources with events in visible range are shown
- [ ] Resources without events in visible range are hidden
- [ ] Navigation (prev/next) updates resource visibility
- [ ] Changing views updates resource visibility

### 2. Always Visible Resources
- [ ] Resources in `alwaysVisibleResourceIds` array stay visible
- [ ] Custom `shouldAlwaysShowResource` function works

### 3. Configuration Options
- [ ] `bufferDays` extends the visible range correctly
- [ ] `debounceMs` prevents excessive updates
- [ ] `includeBackgroundEvents` option works
- [ ] `eventFilter` function filters events correctly
- [ ] `enabled: false` disables the plugin

### 4. Edge Cases
- [ ] Events with `resourceId` (string) work
- [ ] Events with `resourceId` (array) work
- [ ] Events with `resourceIds` (array) work
- [ ] Events with `getResources()` method work
- [ ] Resources added after initialization are tracked
- [ ] No errors when all resources are hidden
- [ ] No errors when no events exist

## Manual Testing Steps

### Test 1: Basic Auto-Hide

```javascript
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import resourceAutoHidePlugin from 'fullcalendar-resource-auto-hide';

const resources = [
  { id: '1', title: 'Resource 1' },
  { id: '2', title: 'Resource 2' },
  { id: '3', title: 'Resource 3' },
];

const events = [
  { 
    id: '1', 
    resourceId: '1', 
    title: 'Event for Resource 1',
    start: '2024-01-15',
    end: '2024-01-20'
  },
  // No events for Resource 2 or 3
];

// Test: Only Resource 1 should be visible
<FullCalendar
  plugins={[resourceTimelinePlugin, resourceAutoHidePlugin]}
  initialView="resourceTimelineMonth"
  initialDate="2024-01-01"
  resources={resources}
  events={events}
  resourceAutoHide={{ enabled: true }}
/>
```

**Expected:** Only Resource 1 visible. Resources 2 and 3 hidden.

### Test 2: Navigation Updates Visibility

1. Set initial date to show Resource 1's event
2. Navigate to a date range where Resource 1 has no events
3. **Expected:** Resource 1 should be hidden
4. Navigate back
5. **Expected:** Resource 1 should reappear

### Test 3: Always Visible Resources

```javascript
resourceAutoHide={{
  enabled: true,
  alwaysVisibleResourceIds: ['special-resource']
}}
```

**Expected:** `special-resource` stays visible even without events.

### Test 4: Buffer Days

```javascript
resourceAutoHide={{
  enabled: true,
  bufferDays: 7
}}
```

Create events 5 days before visible range.
**Expected:** Resources with those events should be visible due to buffer.

### Test 5: Multiple Resource IDs

```javascript
const events = [
  {
    resourceId: ['1', '2'], // Multiple resources
    title: 'Shared Event',
    start: '2024-01-15',
    end: '2024-01-20'
  }
];
```

**Expected:** Both Resource 1 and Resource 2 should be visible.

## Browser Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Framework Testing

Test with:
- [ ] Vanilla JS (example.html)
- [ ] React
- [ ] Vue (if applicable)

## Performance Testing

1. **Large dataset:**
   - 100+ resources
   - 1000+ events
   - Verify debouncing works (check console for excessive calls)

2. **Rapid navigation:**
   - Quickly navigate dates
   - Verify no flickering
   - Check that debouncing prevents excessive updates

## Common Issues to Watch For

1. **Resources not hiding/showing:**
   - Check if `enabled: true` is set
   - Verify events have correct `resourceId`
   - Check date ranges overlap correctly

2. **Performance issues:**
   - Increase `debounceMs` if too many updates
   - Check if `hasChanged` optimization is working

3. **Resources not restoring:**
   - Verify `originalResources` map is populated
   - Check if resource data structure is preserved

## Debugging Tips

Add logging:

```typescript
// In updateResourceVisibility function
console.log('Visible resource IDs:', Array.from(visibleResourceIds));
console.log('Filtered resources:', filteredResources.map(r => r.id));
console.log('Current resources:', currentResources.map(r => r.id));
```

Check plugin state:

```javascript
// Access plugin state (for debugging only)
const calendar = calendarRef.current.getApi();
// Plugin state is stored internally, but you can check:
console.log('All resources:', calendar.getResources());
console.log('All events:', calendar.getEvents());
```

## Automated Testing (Future Enhancement)

Consider adding:
- Jest tests
- Playwright/Cypress E2E tests
- Test with various FullCalendar versions

## Report Issues

If you find bugs:
1. Create minimal reproduction
2. Document expected vs actual behavior
3. Include FullCalendar version
4. Include plugin version
5. Include browser/OS info
