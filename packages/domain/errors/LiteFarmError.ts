export abstract class LiteFarmError extends Error {
  constructor(private readonly __tag: string, message?: string) {
    super(message);
  }

  public getTag() {
    return this.__tag;
  }
}
