import "@nosferatu500/react-sortable-tree/style.css";
import { Component } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SortableTreeWithoutDndContext as SortableTree } from "@nosferatu500/react-sortable-tree";

import BasePermissionDragNode, { nodeType } from "./BasePermissionDragNode";

export default class PermissionsManagerView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      treeData: [
        { id: 3, title: "Mama Rabbit" },
        { id: 4, title: "Papa Rabbit" },
      ],
      permissions: [
        {
          id: 1,
          title: "Create users",
          subtitle: "Allows the user to create new user accounts",
        },
        { id: 2, title: "Delete users" },
        { id: 5, title: "Modify users" },
        { id: 6, title: "Block users" },
      ],
    };
  }

  render() {
    const isDuplicate = (id, parent) => {
      if (!parent) {
        return false;
      }
      if (parent.id === id) {
        return true;
      }

      if (!parent.children) {
        return false;
      }
      /*
       * The unplaced node is listed in the children list as soon as
       * the user is hovering over the spot.
       * To account for that we'll need to count the dupes,
       * as 1 dupe is allowed due to the above behavior.
       */
      let dupecount = 0;
      for (let i = 0; i < parent.children.length; ++i) {
        const child = parent.children[i];
        if (isDuplicate(id, child)) {
          dupecount += 1;
        }
        if (dupecount > 1) {
          return true;
        }
      }
      return false;
    };
    const canDrop = ({ node, nextParent /* prevPath, nextPath */ }) => {
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
            {this.state.permissions.map((p) => {
              return <BasePermissionDragNode key={p.title} node={p} />;
            })}
          </div>
          <div style={{ flex: 3, height: "100vh" }}>
            <SortableTree
              treeData={this.state.treeData}
              canDrop={canDrop}
              onChange={(treeData) => this.setState({ treeData })}
              dndType={nodeType}
              maxDepth={3}
            />
          </div>
        </div>
      </DndProvider>
    );
  }
}
