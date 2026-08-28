import type { V8JobPriority, V8WorkflowItem, V8WorkflowStatus } from './v8-foundation';

export function createWorkflowItem(input: Omit<V8WorkflowItem, 'id'> & { id?: string }): V8WorkflowItem {
  return {
    ...input,
    id: input.id ?? `WF-${Date.now()}`,
  };
}

export function assignWorkflowItem(item: V8WorkflowItem, teamId: string): V8WorkflowItem {
  return { ...item, teamId };
}

export function transitionWorkflow(item: V8WorkflowItem, status: V8WorkflowStatus): V8WorkflowItem {
  return { ...item, status };
}

export function prioritizeWorkflow(item: V8WorkflowItem, priority: V8JobPriority): V8WorkflowItem {
  return { ...item, priority };
}
