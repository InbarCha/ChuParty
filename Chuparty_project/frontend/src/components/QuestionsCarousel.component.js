import React, { Component } from "react";
import Carousel from 'react-elastic-carousel';

const defaultAnswerStyle = {
    color: "#000",
    backgroundColor: "#fff",
    transition: "color 200ms ease-in",
    transition: "background-color 200ms ease-in"
};
const checkedAnswerStyle = {
    color: "#fff",
    backgroundColor: "#5562eb"
};

export default class QuestionsCarousel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            questions: props.questions || [],
            items: []
        }
        this.goto = this.goto.bind(this);
    }

    componentDidMount() {
        console.log(this.state.questions);
        const items = this.state.questions.map(e => {
            return {
                question: Object.keys(e)[0],
                answers: e[Object.keys(e)[0]].answers,
                correctAnswer: e[Object.keys(e)[0]].correctAnswer - 1, //indexing from 0 and not from 1
                selectedAnswers: [],
                difficulty: e.difficulty,
                subject: e.subject
            }
        })
        this.setState({ items: items });
    }

    selectAnswer = (i, j) => {
        console.log("you selected:", i, j);
        let items = this.state.items;
        let index = items[i].selectedAnswers.indexOf(j);
        if (index !== -1) { // uncheck the box
            items[i].selectedAnswers.splice(index, 1);
        } else { // check the box
            items[i].selectedAnswers.push(j);
        }
        this.setState({ items: items })
    }

    checkChangeHandler = (i, j) => {
        // this.selectAnswer(i, j);
    }

    isSelected = (i, j) => {
        return this.state.items[i].selectedAnswers.indexOf(j) !== -1;
    }

    goto({ target }) {
        this.carousel.goTo(Math.max(Number(target.value) - 1, 0));
    }

    submitAnswers = (event) => {
        let items = this.state.items
        let foundIssue = false;
        for (let i = 0; i < items.length; i++) {
            if (!items[i].selectedAnswers || !items[i].selectedAnswers.length) {
                alert("Please make sure to answer question number: " + (Number(i) + 1));
                foundIssue = true;
                break;
            }
        }
        if (!foundIssue)
            this.props.parentAnswersSubmitHandler(this.state.items);
    }

    itemsToElements() {
        const { items } = this.state
        return items.map((item, i) =>
            <div className="carousel_container" key={i}>
                <p className="carousel_question">{item.question}</p>
                <div className="carousel_answers">
                    <div /*onSubmit={this.onSubmit}*/>
                        {item.answers.map((answer, j) => {
                            return <div
                                key={j}
                                className={this.isSelected(i, j) ? "carousel_option selected" : "carousel_option"}
                                onClick={this.selectAnswer.bind(this, i, j)} >
                                <input checked={this.state.items[i].selectedAnswers ? (this.isSelected(i, j)) : false}
                                    onChange={this.checkChangeHandler.bind(this, i, j)}
                                    id={answer}
                                    name={answer} type="checkbox" />
                                <label>{answer}</label>
                            </div>
                        })}
                    </div>
                </div>
            </div>)
    }

    render() {
        const { items } = this.state;
        return items.length > 0 ?
            <div>
                <div id="questionsCarousel">
                    <Carousel id="theCarousel" ref={ref => (this.carousel = ref)} isRTL={true} itemsToShow={1}>
                        {this.itemsToElements()}
                    </Carousel>
                </div>
                <div id="carouselNav">
                    <h3>עבור לשאלה</h3>
                    <input type="number" defaultValue={1} onChange={this.goto} />
                    {items.map((e, i) => <div key={i} onClick={e => this.goto({ target: { value: i + 1 } })}> <span key={i}>{"" + (i + 1) + ") " + e.question}</span> </div>)}
                </div>
                <div id="submitAnswersBtn" onClick={this.submitAnswers}>שלח תשובות</div>
            </div>
            : <div></div>
    }
}