
export type ActionContext = {
    config: Record<string, unknown>;
    previousOutput?: unknown;
  };
  
  export type ActionHandler = (
    context: ActionContext
  ) => Promise<unknown>;
  
  export const actionRegistry = new Map<string, ActionHandler>();
  
  export function registerAction(
    name: string,
    handler: ActionHandler
  ) {
    if (actionRegistry.has(name)) {
      throw new Error(`Action "${name}" is already registered.`);
    }
  
    actionRegistry.set(name, handler);
  }
  
  export function getAction(
    name: string
  ): ActionHandler {
    const handler = actionRegistry.get(name);
  
    if (!handler) {
      throw new Error(`Action "${name}" is not registered.`);
    }
  
    return handler;
  }
  
  export function getRegisteredActions(): string[] {
    return Array.from(actionRegistry.keys());
  }
  