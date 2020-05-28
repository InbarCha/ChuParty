import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { MDBBadge, MDBBtn } from "mdbreact";

export class LecturerQuestionsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeExamsName: localStorage["activeExamName"],
      activeExamsID: localStorage["activeExamID"],
      loading: false,
      fileSelector: <input id="fileInput" />,
      fileChosen: null,
      examName: localStorage["activeExamName"],
      examDate: localStorage["activeExamDate"],
      activeExamsID: localStorage["activeExamID"],
      activeCourse: localStorage["activeCourse"],
    };
  }

  toQuestions = () => {
    this.props.parentClickHandler("QUESTIONS");
  };

  fromFile = (e) => {
    e.preventDefault();
    this.state.fileSelector.click();
  };

  triggerInputFile = () => this.fileInput.click();

  render() {
    let res =
      this.state.activeExamsID !== undefined &&
      this.state.activeExamsID !== null ? (
        <Container fluid className="model_items_container">
          <div className="page_title" dir="RTL">
            {" "}
            עריכת/יצירת מבחן - למרצה{" "}
          </div>
          {this.state.activeExamsID !== "" && (
            <React.Fragment>
              <div className="active_model_title" dir="RTL">
                <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                  קורס:
                </span>
                <span className="active_model"> {this.state.activeCourse}</span>
              </div>
              <div className="active_model_title">
                <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                  מבחן:
                </span>
                <span className="active_model">
                  {" " + this.state.examName + " " + this.state.examDate}
                </span>
              </div>
            </React.Fragment>
          )}
          <Row>
            <Col md={6} sm={12} xs={12} style={{ textAlign: "center" }}>
              <span
                className="material-icons question_lecturer_icon"
                onClick={this.triggerInputFile}
              >
                insert_drive_file
              </span>
              <h1>
                <MDBBadge
                  color="info"
                  style={{ cursor: "pointer" }}
                  onClick={this.triggerInputFile}
                >
                  Create From File
                </MDBBadge>
                <input
                  hidden={true}
                  ref={(fileInput) => (this.fileInput = fileInput)}
                  type="file"
                  onChange={(e) =>
                    this.setState({ fileChosen: e.target.files[0] })
                  }
                />
                <br />
                {this.state.fileChosen !== null && (
                  <label className="grey-text" style={{ fontSize: "20px" }}>
                    <hr style={{ width: "100%" }} />
                    {this.state.fileChosen.name}
                  </label>
                )}
                <br />
                <MDBBtn
                  color="info"
                  hidden={!(this.state.fileChosen !== null)}
                  onClick={this.uploadFile}
                >
                  Upload
                </MDBBtn>
              </h1>
            </Col>
            <Col md={6} sm={12} xs={12} style={{ textAlign: "center" }}>
              <span
                className="material-icons question_lecturer_icon"
                onClick={this.toQuestions}
              >
                create
              </span>
              <h1>
                <MDBBadge
                  color="info"
                  style={{ cursor: "pointer" }}
                  onClick={this.toQuestions}
                >
                  Create / Edit From Template
                </MDBBadge>
              </h1>
            </Col>
          </Row>
        </Container>
      ) : (
        <div dir="RTL">
          <div className="page_title"> עריכת/יצירת מבחן - למרצה </div>
          <div className="active_model_title">
            <span
              style={{ fontStyle: "italic", fontSize: "x-large", color: "red" }}
            >
              לא נבחר אף מבחן
            </span>
          </div>
        </div>
      );
    return res;
  }
}

export default LecturerQuestionsPage;
