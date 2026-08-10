export interface Disposable {
  dispose(): void;
}

type DisposeAction = () => void;

export class ResourceTracker implements Disposable {
  private readonly disposeActions: DisposeAction[] = [];
  private disposed = false;

  public track<Resource extends Disposable>(resource: Resource): Resource {
    this.assertActive();
    this.disposeActions.push(() => {
      resource.dispose();
    });
    return resource;
  }

  public add(dispose: DisposeAction): DisposeAction {
    this.assertActive();
    this.disposeActions.push(dispose);
    return dispose;
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;

    const errors: unknown[] = [];
    for (let index = this.disposeActions.length - 1; index >= 0; index -= 1) {
      try {
        this.disposeActions[index]?.();
      } catch (error: unknown) {
        errors.push(error);
      }
    }
    this.disposeActions.length = 0;

    if (errors.length > 0) {
      throw new AggregateError(errors, "One or more resources failed to dispose.");
    }
  }

  private assertActive(): void {
    if (this.disposed) {
      throw new Error("Cannot track a resource after disposal.");
    }
  }
}
