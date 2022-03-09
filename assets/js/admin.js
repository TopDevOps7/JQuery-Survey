let survey_id = 101;
let temp_text = "";
let temp_id = "";
let temp_item = "";
let temp_index = "";
let temp_checked = "";
let temp_qu_id = "";
let edit_flag = "none";
let questions = {};
questions.choices = {};

function check_item() {
  if (temp_text != "" && edit_flag != "none") {
    let item_text = $(`#input_${temp_id}`).val().trim();
    if (item_text == "") {
      $(`#note_question_${temp_qu_id}`).html(`Empty ${temp_item} text.`);
      $(`#note_question_${temp_qu_id}`).addClass("danger");
      $(`#input_${temp_id}`).addClass("danger");
      $(`#input_${temp_id}`).focus();
      return;
    }

    $(`#${temp_id}`).html(item_text);
    $(`#note_question_${temp_qu_id}`).html(`Updating your ${temp_item} text.`);
    $(`#check_${temp_item}_${temp_index}`).addClass("hidden");
    $(`#undo_${temp_item}_${temp_index}`).addClass("hidden");
    $(
      `#edit_${temp_item}_${temp_index}${
        temp_item == "choice" ? "_" + temp_qu_id : ""
      }`
    ).removeClass("hidden");
    $(
      `#remove_${temp_item}_${temp_index}${
        temp_item == "choice" ? "_" + temp_qu_id : ""
      }`
    ).removeClass("hidden");

    if (temp_item == "question") {
      $.ajax({
        type: "post",
        url: `https://plumapi.cnctdwifi.com/api/survey/question/${temp_index}`,
        dataType: "json",
        data: {
          survey_id,
          question_Text: item_text,
          question_Help: item_text,
          question_Num: 0,
          question_Type: questions[temp_index].question_type,
          question_Format: "string",
          max_Length: 0,
          enabled: temp_checked,
        },
        async: false,
        success: function (response) {
          if (response.success) {
            questions[temp_index].question_text = item_text;
            $(`#note_question_${temp_qu_id}`).html(
              `Your ${temp_item} text is updated successfully!`
            );
            temp_text = "";
            temp_id = "";
            temp_index = "";
            temp_checked = "";
            temp_qu_id = "";
            temp_item = "";
            edit_flag = "none";
            $(".change_status").attr("disabled", false);
            $(".sel_qu_type").attr("disabled", false);
          }
        },
      });
    } else {
      $.ajax({
        type: "post",
        url: `https://plumapi.cnctdwifi.com/api/survey/question/choice/${temp_index}`,
        dataType: "json",
        data: {
          id: temp_index,
          survey_Question_Id: temp_qu_id,
          choice_Text: item_text,
          choice_Help: item_text,
          choice_Num: 0,
          enabled: temp_checked,
        },
        async: false,
        success: function (response) {
          $(`#note_question_${temp_qu_id}`).html(
            `Your ${temp_item} text is updated successfully!`
          );
          temp_text = "";
          temp_id = "";
          temp_index = "";
          temp_checked = "";
          temp_item = "";
          temp_qu_id = "";
          edit_flag = "none";
          $(".change_status").attr("disabled", false);
          $(".sel_qu_type").attr("disabled", false);
        },
      });
    }
    setTimeout(() => {
      $(".note_question").html("");
    }, 2500);
  }
}

function edit_item(item, item_id, qu_id) {
  if (temp_text != "" && edit_flag != "none") {
    check_item();
  } else {
    if (edit_flag == "none") {
      setTimeout(() => {
        edit_flag = "edit";
      }, 200);
      temp_id = `text_${item}_${item_id}${item == "choice" ? "_" + qu_id : ""}`;

      temp_text = $(`#${temp_id}`).html().trim();
      temp_item = temp_id.split("_")[1];
      temp_index = temp_id.split("_")[2];
      temp_qu_id = qu_id;
      temp_checked =
        $(`#status_${temp_item}_${temp_index}`).attr("checked") == "checked"
          ? true
          : false;
      $(`#${temp_id}`).html(
        `<input type="text" class="option_name input_${temp_item}" id="input_${temp_id}" value="${temp_text}}"/>`
      );
      $(`#input_${temp_id}`).val("");
      $(`#input_${temp_id}`).focus();
      $(`#check_${temp_item}_${temp_index}`).removeClass("hidden");
      $(`#undo_${temp_item}_${temp_index}`).removeClass("hidden");
      $(
        `#edit_${temp_item}_${temp_index}${
          temp_item == "choice" ? "_" + qu_id : ""
        }`
      ).addClass("hidden");
      $(
        `#remove_${temp_item}_${temp_index}${
          temp_item == "choice" ? "_" + qu_id : ""
        }`
      ).addClass("hidden");

      $(".sel_qu_type").attr("disabled", true);
      $(".change_status").attr("disabled", true);
      $(`#input_${temp_id}`).on("keydown", (e) => {
        if (e.keyCode == 13) {
          check_item();
        } else {
          $(`#input_${temp_id}`).removeClass("danger");
          $(".note_question").removeClass("danger");
          $(".note_question").html("");
        }
      });
    }
  }
}

function undo_item() {
  $(`#${temp_id}`).html(temp_text);
  $(`#check_${temp_item}_${temp_index}`).addClass("hidden");
  $(`#undo_${temp_item}_${temp_index}`).addClass("hidden");
  $(
    `#edit_${temp_item}_${temp_index}${
      temp_item == "choice" ? "_" + temp_qu_id : ""
    }`
  ).removeClass("hidden");
  $(
    `#remove_${temp_item}_${temp_index}${
      temp_item == "choice" ? "_" + temp_qu_id : ""
    }`
  ).removeClass("hidden");
  $(".note_question").html("");
  $(".change_status").attr("disabled", false);
  $(".sel_qu_type").attr("disabled", false);
  temp_checked = "";
  temp_item = "";
  temp_index = "";
  temp_id = "";
  temp_text = "";
  temp_qu_id = "";
  edit_flag = "none";
}

function change_type(question_id, type) {
  questions[question_id].question_type = type;
  $(`#note_question_${question_id}`).html("Updating your question type!");
  let type_text = `"Multiple"`;
  if (type == 1) {
    type_text = `"Single"`;
  } else if (type == 4) type_text = `"Text"`;
  $.ajax({
    type: "post",
    url: `https://plumapi.cnctdwifi.com/api/survey/question/${question_id}`,
    dataType: "json",
    data: {
      survey_id,
      question_Text: questions[question_id].question_text,
      question_Help: questions[question_id].question_text,
      question_Num: 0,
      question_Type: type,
      question_Format: "string",
      max_Length: 0,
      enabled: questions[question_id].enabled,
    },
    async: false,
    success: function (response) {
      $(`#note_question_${question_id}`).html(
        `Updated your question type as ${type_text}!`
      );
      setTimeout(() => {
        $(".note_question").html("");
      }, 2500);
    },
  });
}

function change_sel_qu_type(e) {
  if (edit_flag == "none" && temp_text == "") {
    let question_id = e.id.split("_")[2];
    let selected_type = $(`#${e.id}`).val();
    if (selected_type == 4) {
      if (questions.choices.hasOwnProperty(question_id)) {
        $.confirm({
          title: "You have some choices of this question.",
          titleClass: "f-red",
          smoothContent: true,
          content: "Are you sure to delete these?",
          buttons: {
            Yes: {
              btnClass: "btn-blue",
              action: function () {
                questions.choices[question_id].map((choice_id) => {
                  delete_option("choice", choice_id, question_id);
                });
                delete questions.choices[question_id];
                change_type(question_id, selected_type);
                $(`#add_choice_to_${question_id}`).addClass("hidden");
              },
            },
            No: {
              btnClass: "btn-warning",
              action: function () {
                $(`#${e.id} option`).attr("selected", false);
                $(`#${e.id}`).val(questions[question_id].question_type);
                $(
                  `#opt_${question_id}_${questions[question_id].question_type}`
                ).attr("selected", true);
              },
            },
          },
        });
      } else {
        change_type(question_id, selected_type);
        $(`#add_choice_to_${question_id}`).addClass("hidden");
      }
    } else {
      $(`#add_choice_to_${question_id}`).removeClass("hidden");
      change_type(question_id, selected_type);
    }
  }
}

function add_choice_text(e) {
  if (temp_text == "" && edit_flag == "none") {
    setTimeout(() => {
      edit_flag = "add_choice";
    }, 200);
    temp_qu_id = e.id.split("_")[3];
    let choice_item = `<li id="choice_new">
                              <div class="container_choice" id="choice_content_new">
                                <input type="text" class="option_name input_choice" id="input_new" value=""/>
                                <div class="opt_container">                           
                                  <div class="check_choice opt_choice" id="check_choice_new" onclick="check_new_choice(${temp_qu_id})">
                                    <i class="fas fa-check"></i>
                                  </div>                               
                                  <div class="cancel_remove opt_choice" id="remove_choice_new" onclick="remove_new_choice">
                                    <i class="fas fa-times" id="remove_icon_choice"></i>
                                  </div>
                                </div>
                              </div>
                            </li>`;

    $(`#question_${temp_qu_id} ul`).append(choice_item);
    $("#input_new").focus();
    $("#input_new").on("keydown", (e) => {
      if (e.keyCode == 13) {
        check_new_choice();
      } else {
        $("#input_new").removeClass("danger");
        $(`#note_question_${temp_qu_id}`).html("");
        $(`#note_question_${temp_qu_id}`).removeClass("danger");
      }
    });
    $(".question_list").animate({
      scrollTop: $(".question_list").scrollTop() + 60,
    });
  }
}

function remove_new_choice() {
  $("#choice_new").remove();
  edit_flag = "none";
}

function check_new_choice() {
  let new_text = $("#input_new").val().trim();
  if (new_text == "") {
    $(`#note_question_${temp_qu_id}`).addClass("danger");
    $(`#note_question_${temp_qu_id}`).html("Empty new choice text!");
    $("#input_new").addClass("danger");
    return;
  }
  edit_flag = "none";

  $.ajax({
    type: "post",
    url: `https://plumapi.cnctdwifi.com/api/survey/question/${temp_qu_id}/choice`,
    dataType: "json",
    data: {
      choice_Text: new_text,
      choice_Help: new_text,
      choice_Num: 0,
      enabled: false,
    },
    async: false,
    success: function (response) {
      if (response.success) {
        if (!questions.choices.hasOwnProperty(temp_qu_id)) {
          questions.choices[temp_qu_id] = [];
        }
        questions.choices[temp_qu_id].push(response.data);
        $("#choice_new").remove();
        let choice_item = `<li id="choice_${response.data}">
                            <div class="container_choice" id="choice_content_${response.data}">
                              <label class="switch">
                              <input type="checkbox" class="change_status" onchange="change_status(this)" id="status_choice_${response.data}_${temp_qu_id}" />
                              <span class="slider round"></span>
                              </label>
                              <div class="container_text choice_text" id="text_choice_${response.data}_${temp_qu_id}" ondblclick="edit_item('choice', ${response.data},${temp_qu_id})">${new_text}
                              </div>
                              <div class="opt_container">
                                <div class="edit_choice opt_choice" id="edit_choice_${response.data}_${temp_qu_id}" onclick="edit_item('choice', ${response.data}, ${temp_qu_id})">
                                  <i class="fas fa-edit"></i>
                                </div>
                                <div class="check_choice opt_choice hidden" id="check_choice_${response.data}" onclick="check_item">
                                  <i class="fas fa-check"></i>
                                </div>
                                <div class="undo_choice opt_choice hidden" id="undo_choice_${response.data}" onclick="undo_item">
                                  <i class="fas fa-undo" id="undo_img_${response.data}"></i>
                                </div>
                                <div class="cancel_remove opt_choice" id="remove_choice_${response.data}_${temp_qu_id}" onclick="remove_item(this)">
                                  <i class="fas fa-times"></i>
                                </div>
                              </div>
                            </div>
                          </li>`;

        $(`#note_question_${temp_qu_id}`).html("Added a new choice!");
        $(`#question_${temp_qu_id} ul`).append(choice_item);
        temp_qu_id = "";
        setTimeout(() => {
          $(".note_question").html("");
        }, 2500);
      }
    },
    error: function (e) {
      console.log("add question error: ", e);
    },
  });
}

function add_question_text() {
  if (temp_text == "" && edit_flag == "none") {
    setTimeout(() => {
      edit_flag = "add_question";
    }, 200);
    let question_item = `<div class="question_item_container question_new" id="question_new">
                            <div class="question_title">                        
                              <strong>
                                <input type="text" class="option_name input_question" id="input_new" value=""/>  
                              </strong>
                              <select class="sel_qu_type" id="sel_qu_new">
                                <option value="0" selected>Multiple</option>
                                <option value="1">Single</option>
                                <option value="4">Text</option>
                              </select>
                              <div class="opt_container">
                                <div class="check_question opt_question" id="check_question_new" onclick="check_new_question">
                                  <i class="fas fa-check"></i>
                                </div>                               
                                <div class="cancel_remove opt_question" id="remove_question_new" onclick="remove_new_question">
                                  <i class="fas fa-times" id="remove_icon_question"></i>
                                </div>
                              </div>
                            </div>
                            <p class="note_question" id="note_question_new">Please input your question text.</p>
                          </div>`;

    $(".question_list").append(question_item);
    $("#input_new").focus();
    $("#input_new").on("keydown", (e) => {
      if (e.keyCode == 13) {
        check_new_question();
      } else {
        $("#input_new").removeClass("danger");
        $("#note_question_new").html("");
        $("#note_question_new").removeClass("danger");
      }
    });
    $(".question_list").animate({
      scrollTop:
        $(".question_list").scrollTop() +
        $(".question_list").offset().top +
        1500,
    });
  }
}

function remove_new_question() {
  edit_flag = "none";
  $("#question_new").remove();
}

function check_new_question() {
  let new_text = $("#input_new").val().trim();
  if (new_text == "") {
    $("#note_question_new").addClass("danger");
    $("#note_question_new").html("Empty question text!");
    $("#input_new").addClass("danger");
    return;
  }
  let new_type = $("#sel_qu_new").val();
  edit_flag = "none";
  $.ajax({
    type: "post",
    url: `https://plumapi.cnctdwifi.com/api/survey/${survey_id}/question`,
    dataType: "json",
    data: {
      survey_id,
      question_Text: new_text,
      question_Help: new_text,
      question_Num: 2,
      question_Type: new_type,
      question_Format: "string",
      max_Length: 0,
      enabled: true,
    },
    async: false,
    success: function (response) {
      $("#question_new").remove();
      questions[response.question_id] = {};
      questions[response.question_id].id = response.question_id;
      questions[response.question_id].question_type = new_type;
      questions[response.question_id].question_text = new_text;
      questions[response.question_id].enabled = true;
      let question_item = `<div class="note_question note_delete" id="note_delete_${
        response.question_id
      }"></div>
                            <div class="question_item_container question_${
                              response.question_id
                            }" id="question_${response.question_id}">
                            <p class="selectOption">
                            Select which options someone can choose for the question:<br />
                            </p>
                            <div class="question_title">
                                <label class="switch question_switch">
                                    <input type="checkbox" checked="checked" class="change_status" onchange="change_status(this)" id="status_question_${
                                      response.question_id
                                    }"/>
                                    <span class="slider round"></span>
                                </label>
                                <strong>
                                <div class="container_text question_text" id="text_question_${
                                  response.question_id
                                }" ondblclick="edit_item('question', ${
        response.question_id
      },${response.question_id})">${new_text}
                                </div></strong>
                                <select class="sel_qu_type" id="sel_qu_${
                                  response.question_id
                                }" onchange="change_sel_qu_type(this)">
                                  <option id="opt_${
                                    response.question_id
                                  }_0" value="0" ${
        new_type == 0 ? "selected" : ""
      }>Multiple</option>
                                  <option id="opt_${
                                    response.question_id
                                  }_1" value="1" ${
        new_type == 1 ? "selected" : ""
      }>Single</option>
                                  <option id="opt_${
                                    response.question_id
                                  }_4" value="4" ${
        new_type == 4 ? "selected" : ""
      }>Text
                                </option>
                                </select>                    
                                <div class="edit_question opt_question" id="edit_question_${
                                  response.question_id
                                }" onclick="edit_item('question', ${
        response.question_id
      },${response.question_id}">
                                  <i class="fas fa-edit"></i>
                                </div>
                                <div class="opt_container">
                                  <div class="check_question opt_question hidden" id="check_question_${
                                    response.question_id
                                  }" onclick="check_item">
                                    <i class="fas fa-check"></i>
                                  </div>
                                  <div class="undo_question opt_question hidden" id="undo_question_${
                                    response.question_id
                                  }" onclick="undo_item">
                                    <i class="fas fa-undo" id="undo_img_${
                                      response.question_id
                                    }"></i>
                                  </div>
                                  <div class="cancel_remove opt_question" id="remove_question_${
                                    response.question_id
                                  }" onclick="remove_item(this)"><i class="fas fa-times"></i></div>
                              </div>
                            </div>
                            <p class="note_question" id="note_question_${
                              response.question_id
                            }">Added this new question!</p>
                            <ul class="popup_list"></ul>
                                        <div class="addoption_btn ${
                                          new_type == 4 ? "hidden" : ""
                                        }" id="add_choice_to_${
        response.question_id
      }" onclick="add_choice_text(this)">
                                        <img src="./images/plus.png"  id="imgadd_choice_to_${
                                          response.question_id
                                        }" /> Add Option
                                        </div>
                                    </div>`;
      $(".question_list").append(question_item);
      setTimeout(() => {
        $(".note_question").html("");
      }, 2500);
      $(".question_list").animate({
        scrollTop: $(".question_list").scrollTop() + 100,
      });
    },
    error: function (e) {
      console.log("add question error: ", e);
    },
  });
}

function change_status(e) {
  if (temp_text == "" && edit_flag == "none") {
    let item = e.id.split("_")[1];
    let item_id = e.id.split("_")[2];
    let qu_id = item == "question" ? item_id : e.id.split("_")[3];
    $.ajax({
      type: "post",
      url: `https://plumapi.cnctdwifi.com/api/survey/question${
        item == "choice" ? "/choice" : ""
      }/status/${item_id}/${e.checked}`,
      dataType: "json",
      async: false,
      success: function (response) {
        if (item == "question") {
          questions[item_id].enabled = e.checked;
        }
        $(`#note_question_${qu_id}`).html(
          `Your ${item} status is changed as ${e.checked}!`
        );
        setTimeout(() => {
          $(".note_question").html("");
        }, 2500);
      },
    });
  }
}

function delete_option(item, item_id, qu_id) {
  $.ajax({
    type: "post",
    url: `https://plumapi.cnctdwifi.com/api/survey/question${
      item == "choice" ? "/choice" : ""
    }/delete/${item_id}`,
    dataType: "json",
    async: false,
    success: function (response) {
      if (response.success) {
        $(`#${item}_${item_id}`).remove();
        if (item == "question") {
          delete questions[item_id];
          $(`#note_delete_${qu_id}`).html(
            "Your question is deleted successfully!"
          );
          setTimeout(() => {
            $(`#note_delete_${qu_id}`).remove();
          }, 2500);
        } else {
          $(`#note_question_${qu_id}`).html(
            "Your choice is deleted successfully!"
          );
          setTimeout(() => {
            $(`#note_question_${qu_id}`).html("");
          }, 2500);
          questions.choices[qu_id] = jQuery.grep(
            questions.choices[qu_id],
            (ch_id) => {
              return ch_id != item_id;
            }
          );
        }
      }
    },
  });
}
function remove_item(e) {
  if (temp_text == "" && edit_flag == "none") {
    let item = e.id.split("_")[1];
    let item_id = e.id.split("_")[2];
    let qu_id = item_id;
    if (item == "choice") {
      qu_id = e.id.split("_")[3];
    }
    delete_option(item, item_id, qu_id);
  }
}
$(function () {
  $(".create_survey").click(function () {
    $(".create_survey_popup_wrapper").show();
    $(".question_list").html("");
    for (const key in questions.choices) {
      if (Object.hasOwnProperty.call(questions.choices, key)) {
        delete questions.choices[key];
      }
    }
    $.ajax({
      type: "get",
      url: `https://plumapi.cnctdwifi.com/api/survey/${survey_id}/questions`,
      dataType: "json",
      async: false,
      success: function (response) {
        let str_question_item = "";
        let res_questions = JSON.parse(response.data);
        res_questions.map((question) => {
          questions[question.id] = {};
          questions[question.id].id = question.id;
          questions[question.id].question_type = question.question_Type;
          questions[question.id].question_text = question.question_Text;
          questions[question.id].enabled = question.enabled;

          str_question_item += `<div class="note_question note_delete" id="note_delete_${
            question.id
          }"></div>
                                  <div class="question_item_container question_${
                                    question.id
                                  }" id="question_${question.id}">
                                    <p class="selectOption">
                                    Select which options someone can choose for the question:<br />
                                    </p>
                                    <div class="question_title">
                                        <label class="switch question_switch">
                                            <input type="checkbox" ${
                                              question.enabled
                                                ? (checked = "checked")
                                                : (checked = "")
                                            } class="change_status" onchange="change_status(this)" id="status_question_${
            question.id
          }"/>
                                            <span class="slider round"></span>
                                        </label>
                                        <strong>
                                        <div class="container_text question_text" id="text_question_${
                                          question.id
                                        }" ondblclick="edit_item('question', ${
            question.id
          }, ${question.id})">${question.question_Text}
                                        </div></strong>
                                        <select class="sel_qu_type" id="sel_qu_${
                                          question.id
                                        }" onchange="change_sel_qu_type(this)">
                                          <option id="opt_${
                                            question.id
                                          }_0" value="0" ${
            question.question_Type == 0 ? "selected" : ""
          }>Multiple</option>
                                          <option id="opt_${
                                            question.id
                                          }_1" value="1" ${
            question.question_Type == 1 ? "selected" : ""
          }>Single</option>
                                          <option id="opt_${
                                            question.id
                                          }_4" value="4" ${
            question.question_Type == 4 ? "selected" : ""
          }>Text
                                        </option>
                                        </select>
                                        <div class="opt_container">
                                          <div class="edit_question opt_question" id="edit_question_${
                                            question.id
                                          }" onclick="edit_item('question', ${
            question.id
          }, ${question.id})">
                                            <i class="fas fa-edit"></i>
                                          </div>
                                          <div class="check_question opt_question hidden" id="check_question_${
                                            question.id
                                          }" onclick="check_item">
                                            <i class="fas fa-check"></i>
                                          </div>
                                          <div class="undo_question opt_question hidden" id="undo_question_${
                                            question.id
                                          }" onclick="undo_item">
                                            <i class="fas fa-undo" id="undo_img_${
                                              question.id
                                            }"></i>
                                          </div>
                                          <div class="cancel_remove opt_question" id="remove_question_${
                                            question.id
                                          }" onclick="remove_item(this)"><i class="fas fa-times"></i></div>
                                        </div>
                                      </div>
                                      <p class="note_question" id="note_question_${
                                        question.id
                                      }"></p>
                                      <ul class="popup_list">`;
          if (question.choices) {
            questions.choices[question.id] = [];
            question.choices.map((choice) => {
              questions.choices[question.id].push(choice.id);
              str_question_item += `<li id="choice_${choice.id}">
                            <div class="container_choice" id="choice_content_${
                              choice.id
                            }">
                              <label class="switch">
                              <input type="checkbox" class="change_status" ${
                                choice.enabled
                                  ? (checked = "checked")
                                  : (checked = "")
                              } onchange="change_status(this)" id="status_choice_${
                choice.id
              }_${question.id}" />
                              <span class="slider round"></span>
                              </label>
                              <div class="container_text choice_text" id="text_choice_${
                                choice.id
                              }_${
                question.id
              }" ondblclick="edit_item('choice', ${choice.id}, ${
                question.id
              })">${choice.choice_Text}
                </div>
                <div class="opt_container">
                  <div class="edit_choice opt_choice" id="edit_choice_${
                    choice.id
                  }_${question.id}" onclick="edit_item('choice', ${
                choice.id
              }, ${question.id})">
                    <i class="fas fa-edit"></i>
                  </div>
                  <div class="check_choice opt_choice hidden" id="check_choice_${
                    choice.id
                  }" onclick="check_item">
                    <i class="fas fa-check"></i>
                  </div>
                  <div class="undo_choice opt_choice hidden" id="undo_choice_${
                    choice.id
                  }" onclick="undo_item">
                    <i class="fas fa-undo" id="undo_img_${choice.id}"></i>
                  </div>
                  <div class="cancel_remove opt_choice" id="remove_choice_${
                    choice.id
                  }_${question.id}" onclick="remove_item(this)">
                    <i class="fas fa-times"></i>
                    </div>
                  </div>
                </div>
              </li>`;
            });
          }

          str_question_item += `</ul>
                            <div class="addoption_btn ${
                              question.question_Type == 4 ? "hidden" : ""
                            }" id="add_choice_to_${
            question.id
          }" onclick="add_choice_text(this)">
                            <img src="./images/plus.png"  id="imgadd_choice_to_${
                              question.id
                            }" /> Add Option
                            </div>
                        </div>`;
        });
        $(".question_list").html(str_question_item);
      },
    });
  });

  $("button.close").click(function () {
    temp_text = "";
    temp_id = "";
    temp_item = "";
    temp_index = "";
    temp_checked = "";
    temp_qu_id = "";
    edit_flag = "none";
    $(".create_survey_popup_wrapper").hide();
  });
  $(".addquestion_btn").click(() => {
    add_question_text();
  });
  $(document).click((e) => {
    if (
      edit_flag != "none" &&
      temp_text != "" &&
      e.target.id != temp_id &&
      e.target.id != "input_" + temp_id
    ) {
      if (e.target.id.split("_")[0] == "undo") undo_item();
      else {
        if (edit_flag == "edit") check_item();
      }
    } else {
      if (edit_flag == "add_choice") {
        if (e.target.id.split("_")[0] == "remove") remove_new_choice();
        else check_new_choice();
      } else if (edit_flag == "add_question") {
        if (e.target.id.split("_")[0] == "remove") remove_new_question();
        else check_new_question();
      }
    }
  });

  $(document).dblclick((e) => {
    if (
      edit_flag != "none" &&
      temp_text != "" &&
      e.target.id != temp_id &&
      e.target.id != "input_" + temp_id
    ) {
      if (e.target.id.split("_")[0] == "undo") undo_item();
      else {
        if (edit_flag == "edit") check_item();
      }
    } else {
      if (edit_flag == "add_choice") {
        if (e.target.id.split("_")[0] == "remove") remove_new_choice();
        else check_new_choice();
      } else if (edit_flag == "add_question") {
        if (e.target.id.split("_")[0] == "remove") remove_new_question();
        else check_new_question();
      }
    }
  });
});
