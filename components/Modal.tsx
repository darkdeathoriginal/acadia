import React, { useEffect } from "react";
import Modal from "react-modal";

const CustomModal = ({ isOpen, onRequestClose, children }) => {
  useEffect(() => {
    // safe because useEffect only runs client-side
    if (typeof window !== "undefined") {
      Modal.setAppElement(document.body); // always exists
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      ariaHideApp={true}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 100,
          margin: "0",
          padding: "0",
        },
        content: {
          width: "fit-content",
          height: "fit-content",
          margin: "auto",
          border: "none",
          padding: "0",
          backgroundColor: "rgba(0, 0, 0, 0)",
        },
      }}
    >
      {children}
    </Modal>
  );
};

export default CustomModal;
