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
      treeData: [{ title: "Mama Rabbit" }, { title: "Papa Rabbit" }],
      permissions: [
        {
          title: "Create users",
          subtitle: "Allows the user to create new user accounts",
        },
        { title: "Delete users" },
      ],
    };
  }

  render() {
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
              onChange={(treeData) => this.setState({ treeData })}
              dndType={nodeType}
            />
          </div>
        </div>
      </DndProvider>
    );
  }
}
