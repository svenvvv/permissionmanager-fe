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
  return connectDragSource(
    <div
      style={{
        display: "inline-block",
        padding: "3px 5px",
        background: "blue",
        color: "white",
      }}
    >
      {node.title}
    </div>,
    { dropEffect: "copy" }
  );
};

permissionNodeBaseComponent.propTypes = {
  node: PropTypes.shape({ title: PropTypes.string }).isRequired,
  connectDragSource: PropTypes.func.isRequired,
};

export default DragSource(nodeType, nodeSpec, nodeCollect)(permissionNodeBaseComponent);
