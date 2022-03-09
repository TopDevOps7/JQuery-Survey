let survey_Id = 101;
let qu_an_obj = {};

function question_init() {
  for (const key in qu_an_obj) {
    if (Object.hasOwnProperty.call(qu_an_obj, key)) {
      delete qu_an_obj[key];
    }
  }
  qu_an_obj.answers = {};
  $(".container_questions").html("");
  $.ajax({
    type: "get",
    url: `https://plumapi.cnctdwifi.com/api/survey/${survey_Id}/questions`,
    dataType: "json",
    async: false,
    success: function (response) {
      let str_question = "";
      let questions = JSON.parse(response.data);
      questions.map((question) => {
        if (question.enabled) {
          qu_an_obj[question.id] = {};
          qu_an_obj[question.id].text = question.question_Text;
          qu_an_obj[question.id].choices = {};
          qu_an_obj.answers[question.id] = {};

          let enabled_choices = 0;
          let str_choice = "";
          if (question.choices) {
            question.choices.map((choice) => {
              if (choice.enabled) {
                enabled_choices++;
                qu_an_obj[question.id].choices[choice.id] = choice.choice_Text;
                if (question.question_Type == 0) {
                  str_choice += `<div class="form-group">
                                  <label class="customcheck"
                                    ><span id="choice_text_${question.id}_${choice.id}">${choice.choice_Text}</span>
                                    <input type="checkbox" class="check_choice" id="check_${question.id}_${choice.id}"/>
                                    <span class="checkmark"></span>
                                  </label>
                                </div>`;
                } else {
                  str_choice += `<div class="form-group">
                                  <label class="customradio">
                                    <input type="radio" class="radio_choice" name="question_${question.id}" value="${choice.choice_Text}"  id="check_${question.id}_${choice.id}"/>${choice.choice_Text}
                                  </label>
                                </div>`;
                }
              }
            });
          }
          let str_input = "";
          if (question.question_Type == 4)
            str_input = `<input type="text" class="answer_for_question" id="text_answer_${question.id}" /> `;
          if (!(enabled_choices == 0 && question.question_Type != 4)) {
            str_question += `<div class="question_item_container question_${question.id}" id="question_${question.id}">
                            <div class="wichof" id="container_question_text_${question.id}">${question.question_Text}</div>
                          ${str_choice}${str_input}</div>`;
          } else delete qu_an_obj.answers[question.id];
        }
      });
      $(".container_questions").html(str_question);
      $(".radio_choice").on("change", (e) => {
        let question_id = e.target.id.split("_")[1];
        let choice_id = e.target.id.split("_")[2];
        if (e.target.checked) {
          for (const key in qu_an_obj.answers[question_id]) {
            if (key != "input_text") {
              delete qu_an_obj.answers[question_id][key];
            }
          }

          qu_an_obj.answers[question_id][choice_id] = e.target.value;
        }
      });

      $(".check_choice").on("change", (e) => {
        let question_id = e.target.id.split("_")[1];
        let choice_id = e.target.id.split("_")[2];
        if (e.target.checked) {
          qu_an_obj.answers[question_id][choice_id] =
            qu_an_obj[question_id].choices[choice_id];
        } else {
          if (qu_an_obj.answers[question_id].hasOwnProperty(choice_id)) {
            delete qu_an_obj.answers[question_id][choice_id];
          }
        }
      });

      $(".answer_for_question").on("keyup", (e) => {
        let question_id = e.target.id.split("_")[2];
        let answer_text = e.target.value;
        if (
          answer_text == "" &&
          qu_an_obj.answers[question_id].hasOwnProperty("input_text")
        ) {
          delete qu_an_obj.answers[question_id].input_text;
        } else qu_an_obj.answers[question_id].input_text = answer_text;
      });
    },
  });
}

$(function () {
  question_init();
  $("#submit_answers").click(function () {
    let current_time = new Date().toISOString();
    let answer_obj = {
      survey_Id,
      enterprise_Patron_Id: 108,
      responseDate: current_time,
      surveyFeedback: "string",
      answers: [],
    };
    for (const qu_id in qu_an_obj.answers) {
      let str_answer_text = "";
      if (Object.hasOwnProperty.call(qu_an_obj.answers, qu_id)) {
        const question = qu_an_obj.answers[qu_id];
        for (const choice in question) {
          if (Object.hasOwnProperty.call(question, choice)) {
            if (str_answer_text == "") {
              str_answer_text = question[choice];
            } else str_answer_text += `|${question[choice]}`;
          }
        }
      }
      answer_obj.answers.push({
        surveyQuestion_Id: qu_id,
        questionText: qu_an_obj[qu_id].text,
        answerDate: current_time,
        answerText: str_answer_text,
      });
    }
    // console.log("answer_obj", answer_obj);
    $.ajax({
      type: "post",
      url: `https://plumapi.cnctdwifi.com/api/survey/response/${survey_Id}`,
      dataType: "json",
      data: answer_obj,
      async: false,
      success: function (response) {
        // console.log("success", response);
        question_init();
      },
      error: function (e) {
        console.log("submit survey response error: ", e);
      },
    });
  });
});
