import { createPlugin, CalendarApi } from '@fullcalendar/core';

export interface ResourceAutoHideOptions {
  /**
   * Enable or disable the auto-hide functionality
   * @default true
   */
  enabled?: boolean;

  /**
   * Number of days to add as buffer before and after the visible date range
   * This helps ensure resources with events just outside the view remain visible
   * @default 0
   */
  bufferDays?: number;

  /**
   * Resource IDs that should always remain visible, regardless of events
   * Useful for special resources like "Unassigned" or "Positions to be filled"
   * @default []
   */
  alwaysVisibleResourceIds?: string[] | ((resourceId: string) => boolean);

  /**
   * Custom function to determine if a resource should always be visible
   * Return true to always show the resource, false otherwise
   */
  shouldAlwaysShowResource?: (resourceId: string, resource: any) => boolean;

  /**
   * Debounce delay in milliseconds for filtering operations
   * Helps improve performance during rapid view changes
   * @default 300
   */
  debounceMs?: number;

  /**
   * Whether to check background events when determining visibility
   * @default false
   */
  includeBackgroundEvents?: boolean;

  /**
   * Custom filter function for events
   * Return true to include the event in visibility calculation, false to exclude
   */
  eventFilter?: (event: any) => boolean;
}

interface PluginState {
  calendar: CalendarApi;
  originalResources: Map<string, any>;
  isFiltering: boolean;
  filterTimeout: ReturnType<typeof setTimeout> | null;
  handlers: {
    updateResourceVisibility: () => void;
    restoreAllResources: () => void;
  } | null;
}

const DEFAULT_OPTIONS: Required<Omit<ResourceAutoHideOptions, 'alwaysVisibleResourceIds' | 'shouldAlwaysShowResource' | 'eventFilter'>> = {
  enabled: true,
  bufferDays: 0,
  debounceMs: 300,
  includeBackgroundEvents: false,
};

const pluginStates = new WeakMap<CalendarApi, PluginState>();

function getPluginState(calendar: CalendarApi): PluginState | undefined {
  return pluginStates.get(calendar);
}

function updateResourceVisibility(calendar: CalendarApi, options: ResourceAutoHideOptions) {
  const state = getPluginState(calendar);
  if (!state) return;

  if (state.isFiltering) return;
  
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (state.filterTimeout !== null) {
    clearTimeout(state.filterTimeout);
  }

  state.filterTimeout = setTimeout(() => {
    if (state.isFiltering) return;
    state.isFiltering = true;

    try {
      const view = calendar.view;
      if (!view) {
        state.isFiltering = false;
        return;
      }

      if (state.originalResources.size === 0) {
        try {
          const resources = (calendar as any).getResources();
          if (resources && resources.length > 0) {
            resources.forEach((resource: any) => {
              if (!state.originalResources.has(resource.id)) {
                state.originalResources.set(resource.id, {
                  id: resource.id,
                  title: resource.title,
                  extendedProps: resource.extendedProps || {},
                  ...(resource as any),
                });
              }
            });
          }
        } catch (e) {
          state.isFiltering = false;
          return;
        }
      }

      const start = new Date(view.activeStart);
      const end = new Date(view.activeEnd);

      if (opts.bufferDays > 0) {
        start.setDate(start.getDate() - opts.bufferDays);
        end.setDate(end.getDate() + opts.bufferDays);
      }

      const allEvents = calendar.getEvents();
      
      const relevantEvents = allEvents.filter((event: any) => {
        if (!opts.includeBackgroundEvents && event.display === 'background') {
          return false;
        }

        if (opts.eventFilter && !opts.eventFilter(event)) {
          return false;
        }

        return true;
      });

      const visibleResourceIds = new Set<string>();

      relevantEvents.forEach((event: any) => {
        const eventStart = event.start ? new Date(event.start) : null;
        const eventEnd = event.end ? new Date(event.end) : eventStart;

        if (!eventStart || !eventEnd) return;

        const overlaps = eventStart < end && eventEnd > start;

        if (overlaps) {
          let resourceIdFound = false;
          
          if (typeof event.getResources === 'function') {
            try {
              const resources = event.getResources();
              if (resources && resources.length > 0) {
                resources.forEach((resource: any) => {
                  if (resource && resource.id) {
                    visibleResourceIds.add(resource.id);
                    resourceIdFound = true;
                  }
                });
              }
             } catch (e) {
             }
          }
          
          if (!resourceIdFound && event.resourceId) {
            if (Array.isArray(event.resourceId)) {
              event.resourceId.forEach((id: string) => {
                visibleResourceIds.add(id);
              });
            } else {
              visibleResourceIds.add(event.resourceId);
            }
            resourceIdFound = true;
          }
          
          if (!resourceIdFound && event.resourceIds && Array.isArray(event.resourceIds)) {
            event.resourceIds.forEach((id: string) => {
              visibleResourceIds.add(id);
            });
            resourceIdFound = true;
          }
          
          if (!resourceIdFound) {
            const eventAny = event as any;
            const def = eventAny._def || eventAny.def;
            const instance = eventAny._instance;
            
            if (def) {
              if (def.resourceIds && Array.isArray(def.resourceIds) && def.resourceIds.length > 0) {
                def.resourceIds.forEach((id: string) => {
                  visibleResourceIds.add(id);
                });
                resourceIdFound = true;
              } else if (def.resourceId) {
                visibleResourceIds.add(def.resourceId);
                resourceIdFound = true;
              } else if (instance?.resourceIds && Array.isArray(instance.resourceIds) && instance.resourceIds.length > 0) {
                instance.resourceIds.forEach((id: string) => {
                  visibleResourceIds.add(id);
                });
                resourceIdFound = true;
              } else if (instance?.resourceId) {
                visibleResourceIds.add(instance.resourceId);
                resourceIdFound = true;
              }
            }
          }
        }
      });

      const allOriginalResources = Array.from(state.originalResources.values());
      const currentResources = (calendar as any).getResources();
      const currentResourceIds = currentResources.map((res: any) => res.id).sort();
      
      const shouldShowResource = (resourceId: string, resource: any): boolean => {
        if (opts.shouldAlwaysShowResource && resource) {
          if (opts.shouldAlwaysShowResource(resourceId, resource)) {
            return true;
          }
        }

        if (opts.alwaysVisibleResourceIds) {
          if (typeof opts.alwaysVisibleResourceIds === 'function') {
            if (opts.alwaysVisibleResourceIds(resourceId)) {
              return true;
            }
          } else if (Array.isArray(opts.alwaysVisibleResourceIds)) {
            if (opts.alwaysVisibleResourceIds.includes(resourceId)) {
              return true;
            }
          }
        }

        return visibleResourceIds.has(resourceId);
      };

      const filteredResources = allOriginalResources.filter(resource => {
        return shouldShowResource(resource.id, resource);
      });
      const filteredResourceIds = filteredResources.map((r: any) => r.id).sort();

      const hasChanged = JSON.stringify(currentResourceIds) !== JSON.stringify(filteredResourceIds);
      
      if (!hasChanged) {
        state.isFiltering = false;
        return;
      }

      (calendar as any).batchRendering(() => {
        const resources = (calendar as any).getResources();
        for (let i = resources.length - 1; i >= 0; i--) {
          resources[i].remove();
        }

        filteredResources.forEach(resource => {
          (calendar as any).addResource(resource);
        });
      });
    } catch (error) {
      console.error('Error updating resource visibility:', error);
    } finally {
      state.isFiltering = false;
    }
  }, opts.debounceMs);
}

function restoreAllResources(calendar: CalendarApi) {
  const state = getPluginState(calendar);
  if (!state) return;

  (calendar as any).batchRendering(() => {
    state.originalResources.forEach(originalData => {
      const existing = (calendar as any).getResourceById(originalData.id);
      if (!existing) {
        (calendar as any).addResource(originalData);
      }
    });
  });
}

class ResourceAutoHideViewPropsTransformer {
  transform(viewProps: any, calendarState: any) {
    const options = calendarState?.options?.resourceAutoHide as ResourceAutoHideOptions | undefined;
    
    if (!options || options.enabled === false) {
      return {};
    }

    const calendar = viewProps?.calendar || calendarState?.calendarApi;
    if (!calendar) {
      return {};
    }

    const state = getPluginState(calendar);
    if (!state || !state.handlers) {
      return {};
    }

    const originalDatesSet = viewProps.datesSet;
    viewProps.datesSet = function(info: any) {
      state.handlers?.updateResourceVisibility();
      if (originalDatesSet) {
        originalDatesSet.call(this, info);
      }
    };

    const originalEventsSet = viewProps.eventsSet;
    viewProps.eventsSet = function(info: any) {
      state.handlers?.updateResourceVisibility();
      if (originalEventsSet) {
        originalEventsSet.call(this, info);
      }
    };

    const originalEventChange = viewProps.eventChange;
    viewProps.eventChange = function(info: any) {
      state.handlers?.updateResourceVisibility();
      if (originalEventChange) {
        originalEventChange.call(this, info);
      }
    };

    return viewProps;
  }
}

const pluginDefinition = {
  name: 'resourceAutoHide',
  
  optionRefiners: {
    resourceAutoHide: (val: any) => val || {},
  },

  contextInit: [
    (function(context: any) {
      const calendar = context.calendarApi;
      const opts = (context.options && context.options.resourceAutoHide) || {};
      
      if (!opts || opts.enabled === false) {
        return;
      }
      
      const state: PluginState = {
        calendar: calendar,
        originalResources: new Map(),
        isFiltering: false,
        filterTimeout: null,
        handlers: null,
      };

      state.handlers = {
        updateResourceVisibility: () => {
          const currentOpts = (calendar as any).getOption?.('resourceAutoHide') || opts;
          updateResourceVisibility(calendar, currentOpts);
        },
        restoreAllResources: () => restoreAllResources(calendar),
      };

      pluginStates.set(calendar, state);

      const onDatesSet = (info: any) => {
        const currentOpts = (calendar as any).getOption?.('resourceAutoHide') || opts;
        if (currentOpts?.enabled !== false && state.handlers) {
          state.handlers.updateResourceVisibility();
        }
      };

      const onEventsSet = () => {
        const currentOpts = (calendar as any).getOption?.('resourceAutoHide') || opts;
        if (currentOpts?.enabled !== false && state.handlers) {
          state.handlers.updateResourceVisibility();
        }
      };

      const onEventChange = () => {
        const currentOpts = (calendar as any).getOption?.('resourceAutoHide') || opts;
        if (currentOpts?.enabled !== false && state.handlers) {
          state.handlers.updateResourceVisibility();
        }
      };

      try {
        if (typeof (calendar as any).on === 'function') {
          calendar.on('datesSet', onDatesSet);
          calendar.on('eventsSet', onEventsSet);
          calendar.on('eventChange', onEventChange);
          calendar.on('eventAdd', onEventChange);
          calendar.on('eventRemove', onEventChange);
        }
       } catch (e) {
       }

      (state as any).eventHandlers = {
        datesSet: onDatesSet,
        eventsSet: onEventsSet,
        eventChange: onEventChange,
      };

      setTimeout(() => {
        try {
          const resources = (calendar as any).getResources();
          if (resources && resources.length > 0) {
            resources.forEach((resource: any) => {
              state.originalResources.set(resource.id, {
                id: resource.id,
                title: resource.title,
                extendedProps: resource.extendedProps || {},
                ...(resource as any),
              });
            });
          }

          const currentOpts = (calendar as any).getOption?.('resourceAutoHide') || opts;
          if (currentOpts?.enabled !== false) {
            updateResourceVisibility(calendar, currentOpts);
          }
        } catch (e) {
          setTimeout(() => {
            try {
              const resources = (calendar as any).getResources();
              if (resources && resources.length > 0) {
                resources.forEach((resource: any) => {
                  state.originalResources.set(resource.id, {
                    id: resource.id,
                    title: resource.title,
                    extendedProps: resource.extendedProps || {},
                    ...(resource as any),
                  });
                });
              }
              if (opts.enabled !== false) {
                updateResourceVisibility(calendar, opts);
              }
            } catch (e2) {
            }
          }, 500);
        }
      }, 200);

      setTimeout(() => {
        try {
          const originalAddResource = (calendar as any).addResource?.bind(calendar);
          if (originalAddResource) {
            (calendar as any).addResource = function(...args: any[]) {
              const result = originalAddResource(...args);
              try {
                const resource = (calendar as any).getResourceById?.(args[0]?.id || args[0]);
                if (resource) {
                  const state = getPluginState(calendar);
                  if (state) {
                    state.originalResources.set(resource.id, {
                      id: resource.id,
                      title: resource.title,
                      extendedProps: resource.extendedProps || {},
                      ...(resource as any),
                    });
                  }
                }
              } catch (e) {
              }
              return result;
            };
          }
        } catch (e) {
        }
      }, 300);
    }) as any,
  ] as any,

  optionChangeHandlers: {
    resourceAutoHide: function(newOptions: any, data: any) {
      const calendar = data?.calendarApi;
      if (!calendar) return;
      
      const state = getPluginState(calendar);
      if (!state) return;

      const opts = newOptions || {};
      
      if (opts.enabled === false) {
        restoreAllResources(calendar);
      } else {
        updateResourceVisibility(calendar, opts);
      }
    },
  },

  viewPropsTransformers: [ResourceAutoHideViewPropsTransformer],
};

export default createPlugin(pluginDefinition);
