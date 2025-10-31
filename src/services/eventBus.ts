/**
 * EventBus for synchronizing updates across components
 * 
 * Solves the problem of ChatDialog updates not reflecting in Schedule/Profile pages
 * 
 * Usage:
 * ```typescript
 * // Subscribe to events
 * useEffect(() => {
 *   const handler = (data) => console.log('Schedule updated!', data);
 *   eventBus.subscribe('schedule-updated', handler);
 *   return () => eventBus.unsubscribe('schedule-updated', handler);
 * }, []);
 * 
 * // Emit events
 * eventBus.emit('schedule-updated', { scheduleId: '123' });
 * ```
 */

export type EventType = 
  | 'schedule-updated'       // When workout schedule is created/modified
  | 'schedule-deleted'       // When workout schedule is deleted
  | 'profile-updated'        // When user profile/preferences are updated
  | 'credits-updated'        // When AI credits are consumed
  | 'chat-message-sent'      // When chat message is sent
  | 'workout-completed';     // When a workout is completed

export interface EventData {
  scheduleId?: string;
  userId?: string;
  service?: 'chat' | 'schedule' | 'profile';
  creditsRemaining?: number;
  timestamp?: number;
  [key: string]: any;
}

type EventCallback = (data?: EventData) => void;

class EventBus {
  private listeners: Map<EventType, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   * @param event The event type to listen for
   * @param callback Function to call when event is emitted
   */
  subscribe(event: EventType, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    if (import.meta.env.DEV) {
      console.log(`[EventBus] Subscribed to '${event}'`);
    }
  }

  /**
   * Unsubscribe from an event
   * @param event The event type to stop listening for
   * @param callback The callback function to remove
   */
  unsubscribe(event: EventType, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      
      // Clean up empty listener sets
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
      
      if (import.meta.env.DEV) {
        console.log(`[EventBus] Unsubscribed from '${event}'`);
      }
    }
  }

  /**
   * Emit an event to all subscribers
   * @param event The event type to emit
   * @param data Optional data to pass to subscribers
   */
  emit(event: EventType, data?: EventData): void {
    const callbacks = this.listeners.get(event);
    
    if (callbacks && callbacks.size > 0) {
      if (import.meta.env.DEV) {
        console.log(`[EventBus] Emitting '${event}' to ${callbacks.size} listener(s)`, data);
      }
      
      // Add timestamp if not provided
      const eventData: EventData = {
        ...data,
        timestamp: data?.timestamp ?? Date.now()
      };
      
      // Call all subscribers
      callbacks.forEach(callback => {
        try {
          callback(eventData);
        } catch (error) {
          console.error(`[EventBus] Error in '${event}' callback:`, error);
        }
      });
    } else {
      if (import.meta.env.DEV) {
        console.log(`[EventBus] No listeners for '${event}'`);
      }
    }
  }

  /**
   * Remove all listeners for a specific event (or all events)
   * @param event Optional event type to clear. If not provided, clears all listeners.
   */
  clear(event?: EventType): void {
    if (event) {
      this.listeners.delete(event);
      if (import.meta.env.DEV) {
        console.log(`[EventBus] Cleared all listeners for '${event}'`);
      }
    } else {
      this.listeners.clear();
      if (import.meta.env.DEV) {
        console.log(`[EventBus] Cleared all listeners`);
      }
    }
  }

  /**
   * Get the number of listeners for a specific event
   * @param event The event type to check
   * @returns Number of active listeners
   */
  listenerCount(event: EventType): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

// Export singleton instance
export const eventBus = new EventBus();

