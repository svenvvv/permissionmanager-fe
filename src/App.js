import "./App.css";

import PermissionsManagerView from "./components/PermissionsManagerView";

function App() {
  return (
    <div className="App">
      <div className="title">Permission Manager</div>
      <p className="subtitle hideOnMobile">
        Drag elements from the left into the container on the right to start building permission
        trees.
      </p>
      <PermissionsManagerView />
    </div>
  );
}

export default App;
