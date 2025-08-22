// lib/data/mixcloud.ts
class MixcloudWidgetManager {
  private widgets: Map<string, any> = new Map();
  private listeners: Set<(url: string, widget: any, isPlaying: boolean) => void> = new Set();

  setWidget(url: string, widget: any) {
    this.widgets.set(url, widget);
    console.log('Widget registered for:', url);

    // Notify all listeners
    this.listeners.forEach((listener) => {
      try {
        listener(url, widget, false);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }

  getWidget(url: string) {
    return this.widgets.get(url);
  }

  removeWidget(url: string) {
    this.widgets.delete(url);
  }

  addListener(callback: (url: string, widget: any, isPlaying: boolean) => void) {
    this.listeners.add(callback);

    // Immediately notify about existing widgets
    this.widgets.forEach((widget, url) => {
      try {
        callback(url, widget, false);
      } catch (error) {
        console.error('Error in immediate callback:', error);
      }
    });
  }

  removeListener(callback: (url: string, widget: any, isPlaying: boolean) => void) {
    this.listeners.delete(callback);
  }

  broadcastPlayState(url: string, isPlaying: boolean) {
    const widget = this.widgets.get(url);
    if (widget) {
      this.listeners.forEach((listener) => {
        try {
          listener(url, widget, isPlaying);
        } catch (error) {
          console.error('Error broadcasting play state:', error);
        }
      });
    }
  }
}

// Create global instance
export const mixcloudManager = new MixcloudWidgetManager();
