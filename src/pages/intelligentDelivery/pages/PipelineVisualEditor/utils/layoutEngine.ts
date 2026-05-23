import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;
const TRIGGER_WIDTH = 160;
const TRIGGER_HEIGHT = 60;

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR',
): { nodes: Node[]; edges: Edge[] } {
  const g = new (dagre.graphlib as any).Graph();
  (g as any).setDefaultEdgeLabel(() => ({}));
  (g as any).setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 100,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    const isTrigger = node.type === 'trigger';
    (g as any).setNode(node.id, {
      width: isTrigger ? TRIGGER_WIDTH : NODE_WIDTH,
      height: isTrigger ? TRIGGER_HEIGHT : NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => {
    (g as any).setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const isHorizontal = direction === 'LR';

  const layoutedNodes = nodes.map((node) => {
    const pos = (g as any).node(node.id);
    const isTrigger = node.type === 'trigger';
    const w = isTrigger ? TRIGGER_WIDTH : NODE_WIDTH;
    const h = isTrigger ? TRIGGER_HEIGHT : NODE_HEIGHT;
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: { x: pos.x - w / 2, y: pos.y - h / 2 },
    };
  });

  return { nodes: layoutedNodes, edges };
}
