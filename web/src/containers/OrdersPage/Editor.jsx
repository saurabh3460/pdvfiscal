import React, { Component } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import TaskDetail from "../TaskDetail";
// import styles from "./styles.css";

class TextEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      rawMessage: "",
    };
    this.onEditorStateChange = this.onEditorStateChange.bind(this);
    this.handleEditorStateToMessage = this.handleEditorStateToMessage.bind(this);
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
      rawMessage: draftToHtml(convertToRaw(editorState.getCurrentContent())),
    });
  };

  handleEditorStateToMessage() {
    this.setState({
      message: this.state.rawMessage,
    });
  }
  render() {
    const { editorState } = this.state;

    return (
      <>
        <div className="editor">
          <TaskDetail editorState={convertToRaw(editorState.getCurrentContent())} />
          <Editor
            initialEditorState={editorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            onEditorStateChange={this.onEditorStateChange}
          />
        </div>
      </>
    );
  }
}

export default TextEditor;
