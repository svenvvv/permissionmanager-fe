import "@nosferatu500/react-sortable-tree/style.css";
import { Component } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  SortableTreeWithoutDndContext as SortableTree,
  getTreeFromFlatData,
} from "@nosferatu500/react-sortable-tree";
import axios from "axios";

import BasePermissionDragNode, { nodeType } from "./BasePermissionDragNode";

export default class PermissionsManagerView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      treeData: [],
      permissions: [],
    };
  }

  componentDidMount() {
    axios
      .get("/api/permissions/available")
      .then(({ data: permissions }) => {
        const permissionsObj = permissions.reduce(
          (prev, curr) => Object.assign(prev, { [curr.id]: curr }),
          {}
        );
        this.setState({ permissions: permissionsObj });
      })
      .then(() => axios.get("/api/permissions/nodes"))
      .then(({ data }) => {
        const pickPermissions = ({ title, subtitle }) => ({
          title,
          subtitle,
        });
        this.setState({
          treeData: getTreeFromFlatData({
            flatData: data.map((node) => ({
              ...node,
              ...pickPermissions(this.state.permissions[node.permissionId]),
            })),
            getKey: (node) => node.id,
            getParentKey: (node) => {
              // getParentKey() may not return undefined so coalesce the undefined into a null
              return node.parent?.id ?? null;
            },
            rootKey: null,
          }),
        });
      })
      .catch((err) => {
        console.log("TODO handle");
      });
  }

  render() {
    const isDuplicate = (permissionId, parent) => {
      if (!parent) {
        return false;
      }
      if (parent.permissionId === permissionId) {
        return true;
      }

      if (!parent.children) {
        return false;
      }

      for (let i = 0; i < parent.children.length; ++i) {
        const child = parent.children[i];
        if (isDuplicate(permissionId, child)) {
          return true;
        }
      }
      return false;
    };
    const canDrop = ({ node, nextParent /* prevPath, nextPath */ }) => {
      // Note that the node is without a permissionId value here as we've yet to hit the BE
      if (isDuplicate(node.id, nextParent)) {
        return false;
      }
      return true;
    };
    /*
     * TODO: Should also traverse the tree on node movements, as currently it's possible to
     * create a node branch A->B and then create a circular dependency by creating a new top
     * level node B and making the first branch its child (so it becomes B->A->B).
     * Not sure what behavior to add to it:
     *  *) Automatically delete the conflicting child (as the permission is already provided
     *     in the parent). Would have to auto-adopt the children of the deleted node.
     *  *) Block creating such relationships. Might be a lot less user-friendly though ;).
     */
    return (
      <DndProvider backend={HTML5Backend}>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1 }}>
            {Object.entries(this.state.permissions).map(([_, p]) => {
              return <BasePermissionDragNode key={p.title} node={p} />;
            })}
          </div>
          <div style={{ flex: 3, height: "100vh" }}>
            <SortableTree
              treeData={this.state.treeData}
              canDrop={canDrop}
              onChange={(treeData) => this.setState({ treeData })}
              onMoveNode={({ treeData, node, parent }) => {
                console.log(treeData, node, parent);
                node.permissionId = node.id;
              }}
              dndType={nodeType}
              maxDepth={3}
            />
          </div>
        </div>
      </DndProvider>
    );
  }
}
