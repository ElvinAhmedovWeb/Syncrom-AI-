import { useState } from "react";
import SchalaFileIcon, { FolderClosedIcon, FolderOpenIcon } from "./SchalaFileIcon";
import { IconChevronRight, IconChevronDown } from "./schalaIcons";
import type { SchalaFileNode } from "../../lib/schala";

interface NodeProps {
  node: SchalaFileNode;
  activePath: string | null;
  onOpenFile: (path: string) => void;
  depth: number;
  gitStatus: Record<string, string>;
}

function TreeNode({ node, activePath, onOpenFile, depth, gitStatus }: NodeProps) {
  const [open, setOpen] = useState(depth < 1);

  if (node.type === "dir") {
    return (
      <div>
        <div
          className="schala-tree-row dir"
          style={{ paddingLeft: depth * 14 + 6 }}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="schala-tree-caret">
            {open ? <IconChevronDown size={11} /> : <IconChevronRight size={11} />}
          </span>
          <span className="schala-tree-foldericon">
            {open ? <FolderOpenIcon size={16} /> : <FolderClosedIcon size={16} />}
          </span>
          <span className="schala-tree-name">{node.name}</span>
        </div>
        {open &&
          node.children?.map((c) => (
            <TreeNode
              key={c.path}
              node={c}
              activePath={activePath}
              onOpenFile={onOpenFile}
              depth={depth + 1}
              gitStatus={gitStatus}
            />
          ))}
      </div>
    );
  }

  const status = gitStatus[node.path];

  return (
    <div
      className={`schala-tree-row file${node.path === activePath ? " active" : ""}`}
      style={{ paddingLeft: depth * 14 + 18 }}
      onClick={() => onOpenFile(node.path)}
    >
      <span className="schala-tree-fileicon">
        <SchalaFileIcon name={node.name} size={15} />
      </span>
      <span className="schala-tree-name">{node.name}</span>
      {status && <span className={`schala-git-dot ${status}`} title={status} />}
    </div>
  );
}

interface Props {
  nodes: SchalaFileNode[];
  activePath: string | null;
  onOpenFile: (path: string) => void;
  gitStatus: Record<string, string>;
}

export default function SchalaFileTree({ nodes, activePath, onOpenFile, gitStatus }: Props) {
  if (!nodes.length) {
    return <div className="schala-tree-empty">Qovluq boşdur</div>;
  }
  return (
    <div className="schala-tree">
      {nodes.map((n) => (
        <TreeNode key={n.path} node={n} activePath={activePath} onOpenFile={onOpenFile} depth={0} gitStatus={gitStatus} />
      ))}
    </div>
  );
}
