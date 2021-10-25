import Modal from "react-modal";

const PermissionModal = (props) => (
  <Modal
    appElement={document.getElementById("root")}
    isOpen={props.isOpen}
    onRequestClose={() => {
      props.onCancel();
    }}
    contentLabel="Create permission modal"
    style={{
      content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
      },
    }}
  >
    <b>{props.title}</b>
    {props.error && <div className="modalError">{props.error}</div>}
    <form
      onSubmit={(e) => {
        const { title, subtitle } = e.target.elements;
        props.onConfirm({ title: title.value, subtitle: subtitle.value });
        e.preventDefault();
      }}
    >
      <ul className="formWrapper">
        <div className="formRow">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" minLength={3} type="text" required />
        </div>
        <div className="formRow">
          <label htmlFor="subtitle">Subtitle</label>
          <input id="subtitle" name="subtitle" type="text" placeholder="Optional" />
        </div>
        <div className="formRow">
          <button type="submit" className="buttonConfirm">
            Create
          </button>
          <button
            className="buttonCancel"
            onClick={() => {
              props.onCancel();
            }}
          >
            Close
          </button>
        </div>
      </ul>
    </form>
  </Modal>
);

export default PermissionModal;
