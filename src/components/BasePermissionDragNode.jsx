import PropTypes from "prop-types";
import { DragSource } from "react-dnd";

export const nodeType = "permissionNodeType";

const nodeSpec = {
  // This needs to return an object with a property `node` in it.
  // Object rest spread is recommended to avoid side effects of
  // referencing the same object in different trees.
  beginDrag: (componentProps) => ({ node: { ...componentProps.node } }),
};

const nodeCollect = (connect /* , monitor */) => ({
  connectDragSource: connect.dragSource(),
  // Add props via react-dnd APIs to enable more visual
  // customization of your component
  // isDragging: monitor.isDragging(),
  // didDrop: monitor.didDrop(),
});

const permissionNodeBaseComponent = (props) => {
  const { connectDragSource, node } = props;
  /*
   * The nice way to get constant styling would be to either patch react-sortable-tree
   * to export it's node renderer or to use a custom node renderer that exports.
   * But good enough for a proof-of-concept to keep similar styling ;).
   */
  const height = "32px";
  return connectDragSource(
    <div className="permissionNode" style={{ height }}>
      <div className="rst__row">
        <div className="rst__moveHandle" style={{ width: height }}></div>
        <div className="rst__rowContents">
          <div className="rst__rowLabel">
            <span className="rst__rowTitle">{node.title}</span>
          </div>
        </div>
      </div>
    </div>,
    { dropEffect: "copy" }
  );
};

permissionNodeBaseComponent.propTypes = {
  node: PropTypes.shape({ title: PropTypes.string }).isRequired,
  connectDragSource: PropTypes.func.isRequired,
};

export default DragSource(nodeType, nodeSpec, nodeCollect)(permissionNodeBaseComponent);
