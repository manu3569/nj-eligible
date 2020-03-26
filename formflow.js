var requirements = {
  eag: {
    required_yes: [1, 2, 16, 17, 20, 21, 22],
    required_no: [3, 14],
    eval: {
      8: function (fte) {
        return Number(fte) >= 2 && Number(fte) <= 10;
      },
      12: function (naics_code) {
        naics_code = String(naics_code).trim();
        var valid_starts = ["42", "43", "72", "71", "811", "812"];
        for (var v = 0; v < valid_starts.length; v++) {
          if (naics_code.indexOf(valid_starts[v]) === 0) {
            return true;
          }
        }
        return false;
      },
      // 11: yes or not a non-profit
      // 18: yes or not sure
    }
  },
  eawcl: {
    required_yes: [1, 2, 7, 16, 17, 20, 21, 22],
    required_no: [3, 14],
    eval: {
      9: function (revenue) {
        return Number(revenue) < 5000000;
      }
      // 11: yes or not a non-profit
      // 18: yes or not sure
      // 19: yes or IS a non-profit

    }
  },
  guarantee: {
    required_yes: [1, 2, 7, 16, 17, 20, 21, 22],
    required_no: [3, 14],
    eval: {
      9: function (revenue) {
        return Number(revenue) < 5000000;
      }
      // 11: yes or not a non-profit
      // 18: yes or not sure
      // 19: yes or IS a non-profit

    }
  },
  egp: {
    required_yes: [1, 4, 5, 6, 13, 17],
    required_no: [314],
    eval: {
      8: function (fte) {
        return fte < 25;
      },
      10: function (revenue) {
        return Number(revenue) < 5000000;
      }
    }
  },
  eidl: {
    required_yes: [6, 7],
    required_no: [3, 15]
  },
  frelief: {
    required_yes: [0]
  },
  // cdfi: {
  //
  // },
  // bank: {
  //
  // }
};
var programs = Object.keys(requirements);

var answers = [];

function nextQuestion(currentQuestion) {
  var currentDiv = $(".question")[currentQuestion];
  $(currentDiv).find(".btn, div, p, li").css({opacity: 0.4});
  // $(currentDiv).find('.btn').prop('disabled', true);

  var nextDiv = $(".question")[currentQuestion + 1];
  $(nextDiv).find(".btn, div, p, li").css({opacity: 1});
  $(nextDiv).find('.btn').prop('disabled', false);
  $(nextDiv).find('.answered').css({ display: "block" });

  programs.forEach(function(pcode) {
    var muteProgram = false,
        program = requirements[pcode];

    (program.required_yes || []).forEach(function(answerToCheck) {
      if (answers[answerToCheck] === false) {
        console.log(pcode + " checks " + answerToCheck + " and sees false instead of true");
        muteProgram = true;
      }
    });

    (program.required_no || []).forEach(function(answerToCheck) {
      if (answers[answerToCheck] === true) {
        console.log(pcode + " checks " + answerToCheck + " and sees true instead of false");
        muteProgram = true;
      }
    });

    var answersToEval = Object.keys(program.eval || {}  );
    answersToEval.forEach(function(answerToCheck) {
      if ((typeof answers[answerToCheck] !== "undefined")
        && (!program.eval[answerToCheck](answers[answerToCheck]))) {
        muteProgram = true;
        console.log(pcode + " checks " + answerToCheck + " and sees " + answers[answerToCheck] + " instead of eval");
      }
    });

    if (muteProgram) {
      $("#" + pcode).css({ opacity: 0.4 });
    } else {
      $("#" + pcode).css({ opacity: 1 });
    }
  });
}

function hardPass() {
  $(".modal").modal({ show: true });
  return false;
}

$(".question").each(function(index) {
  var q = this;
  if (index) {
    $(q).find('.btn, div, p, li').css({opacity: 0.4});
    $(q).find('.btn').prop('disabled', true);
  } else {
    $(q).find('.answered').css({ display: "block" });
  }
  $(q).find('.answered').click(function (e) {
    $(q).find('.btn, div, p, li').css({opacity: 1});
  });

  var sheet_original_index = q.id.match(/\d+/)[0] * 1;

  $(q).find('.btn-primary').click(function(e) {
    e.preventDefault();
    answers[sheet_original_index] = true;

    if (sheet_original_index === 14) {
      hardPass();
    }

    $(q).find(".answered").css({ color: "#888" });
    $(q).find(".btn").css({ border: "none" });
    $(e.target).css({ border: "3px solid #000" });

    nextQuestion(index);
    return false;
  });
  $(q).find('.btn-dark').click(function(e) {
    e.preventDefault();
    answers[sheet_original_index] = false;

    if (sheet_original_index === 1) {
      hardPass();
    }

    $(q).find(".answered").css({ color: "#888" });
    $(q).find(".btn").css({ border: "none" });
    $(e.target).css({ border: "3px solid #000" });

    nextQuestion(index);
    return false;
  });
});
