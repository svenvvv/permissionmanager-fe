import "@nosferatu500/react-sortable-tree/style.css";
import { Component } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import {
  SortableTreeWithoutDndContext as SortableTree,
  getTreeFromFlatData,
  removeNodeAtPath,
  changeNodeAtPath,
} from "@nosferatu500/react-sortable-tree";
import axios from "axios";

import BasePermissionDragNode, { nodeType } from "./BasePermissionDragNode";
import PermissionModal from "./PermissionModal";

const isTouch = !!("ontouchstart" in window || navigator.maxTouchPoints);
const dndBackend = isTouch ? TouchBackend : HTML5Backend;

console.log(`Using ${isTouch ? "touch" : "html5"} backend`);

export default class PermissionsManagerView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      treeData: [],
      permissions: [],
      editMode: false,
      createModalIsOpen: false,
      createModalError: null,
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

  nodeIsDuplicate(permissionId, parent) {
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
      if (this.nodeIsDuplicate(permissionId, child)) {
        return true;
      }
    }
    return false;
  }

  nodeCanDrop({ node, nextParent }) {
    // Note that the node is without a permissionId value here as we've yet to hit the BE
    if (this.nodeIsDuplicate(node.id, nextParent)) {
      return false;
    }
    return true;
  }

  onMoveNode({ node, nextParentNode, nextPath, treeData }) {
    const parent = nextParentNode && { id: nextParentNode.id };
    /*
     * If the node does not have the property permissionId, then it's a newly created
     * node and we should let the BE know that we want a new node.
     * If it has the property, then let's tell BE that we want to move a node.
     */
    if (node.hasOwnProperty("permissionId")) {
      axios.put(`/api/permissions/nodes/${node.id}/parent`, parent ?? { id: null }).catch((err) => {
        // TODO: should revert the movement back on failure
        console.error(`TODO handle: ${err}`);
      });
    } else {
      axios
        .post("/api/permissions/nodes", {
          permissionId: node.id,
          parent,
        })
        .then(({ data }) => {
          // Switch out id and permissionId
          const newNode = {
            ...node,
            permissionId: node.id,
            id: data.id,
          };
          const newTree = changeNodeAtPath({
            treeData,
            path: nextPath,
            newNode,
            getNodeKey: this.getNodeKey,
          });
          if (newTree === "RESULT_MISS") {
            // Not much we can do here, lets just hit the server up for the ID ;)
            window.location.reload();
          }
          this.setState({ treeData: newTree });
        })
        .catch((err) => {
          // TODO: should delete the (only on FE) added node
          console.error(`TODO handle: ${err}`);
        });
    }
  }

  generateNodeProps({ node, path }) {
    return {
      buttons: [
        <button
          className="buttonCancel"
          onClick={() => {
            if (window.confirm(`Permanently delete node "${node.title}" and all child nodes?`)) {
              axios.delete(`/api/permissions/nodes/${node.id}`).then(() => {
                this.setState((state) => ({
                  treeData: removeNodeAtPath({
                    treeData: state.treeData,
                    path,
                    getNodeKey: this.getNodeKey,
                  }),
                }));
              });
            }
          }}
        >
          Delete
        </button>,
      ],
    };
  }

  getNodeKey({ node }) {
    return node.id;
  }

  render() {
    /*
     * TODO: Should also traverse the tree on node movements, as currently it's possible to
     * create a node branch A->B and then create a circular dependency by creating a new top
     * level node B and making the first branch its child (so it becomes B->A->B).
     * Not sure what behavior to add to it:
     *  *) Automatically delete the conflicting child (as the permission is already provided
     *     in the parent). Would have to auto-adopt the children of the deleted node.
     *  *) Block creating such relationships. Might be a lot less user-friendly though ;).
     *  *) Do nothing. After a bit of thinking about it, then that might be the most user-friendly
     *     of them all, given that reordering might introduce circular deps, but moving the
     *     parents and (duped) siblings out from under the parent and having missing
     *     siblings might be the most confusing thing to do.
     */
    return (
      <div>
        <PermissionModal
          title={"Create new permission"}
          error={this.state.createModalError}
          isOpen={this.state.createModalIsOpen}
          onConfirm={({ title, subtitle }) => {
            axios
              .post("/api/permissions", { title, subtitle })
              .then(({ data }) => {
                this.setState({
                  permissions: { ...this.state.permissions, [data.id]: data },
                  createModalIsOpen: false,
                });
              })
              .catch((e) => {
                const msg = e.response ? e.response.data.error : "Unknown error";
                this.setState({
                  createModalError: msg,
                });
              });
          }}
          onCancel={() => {
            this.setState({ createModalIsOpen: false });
          }}
        />
        <DndProvider backend={dndBackend}>
          <div className="areaContainer">
            <div className="area rst__Node">
              <div className="areaTitle">Available permissions</div>
              <div className="areaAvailablePermissions">
                {Object.entries(this.state.permissions).map(([_, p]) => {
                  return <BasePermissionDragNode key={p.title} node={p} />;
                })}
              </div>
              <div className="permissionEditBox">
                {/* TODO remove width after edit mode */}
                <button
                  style={{ width: "100%" }}
                  onClick={() => {
                    this.setState({ createModalIsOpen: true });
                  }}
                >
                  Create new
                </button>
                {/*
                <button
                  onClick={() => {
                    this.setState({ editMode: !this.state.editMode });
                  }}
                >
                  {!this.state.editMode ? "Edit mode" : "Exit edit mode"}
                </button>
                */}
              </div>
            </div>
            <div className="area areaPermissionTree">
              <div className="areaTitle">Permission tree</div>
              <SortableTree
                canDrop={this.nodeCanDrop.bind(this)}
                dndType={nodeType}
                maxDepth={3}
                onChange={(treeData) => this.setState({ treeData })}
                onMoveNode={this.onMoveNode.bind(this)}
                generateNodeProps={this.generateNodeProps.bind(this)}
                getNodeKey={this.getNodeKey}
                treeData={this.state.treeData}
              />
            </div>
          </div>
        </DndProvider>
      </div>
    );
  }
}
