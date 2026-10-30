type EventHandler<Payload> = (payload: Payload) => void;

export class EventBus<Events extends object> {
  private readonly handlers = new Map<keyof Events, Set<EventHandler<unknown>>>();

  public on<Key extends keyof Events>(
    event: Key,
    handler: EventHandler<Events[Key]>,
  ): () => void {
    let eventHandlers = this.handlers.get(event);
    if (eventHandlers === undefined) {
      eventHandlers = new Set();
      this.handlers.set(event, eventHandlers);
    }

    const storedHandler = handler as EventHandler<unknown>;
    eventHandlers.add(storedHandler);
    return () => {
      eventHandlers.delete(storedHandler);
      if (eventHandlers.size === 0) {
        this.handlers.delete(event);
      }
    };
  }

  public emit<Key extends keyof Events>(event: Key, payload: Events[Key]): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers === undefined) {
      return;
    }

    for (const handler of [...eventHandlers]) {
      handler(payload);
    }
  }

  public clear(): void {
    this.handlers.clear();
  }
}

