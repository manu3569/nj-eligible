var nonprofit_q = 11,
    requirements = {
  eag: {
    required_yes: [1, 2, 16, 17, 20],
    required_no: [3, 14],
    eval: {
      8: function (fte) {
        fte = Number(fte.replace(/\,|\$/g, ''));
        return fte >= 2 && fte <= 10;
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
      11: function (val) {
        return (val === true) || (answers[nonprofit_q] === false);
      },
      18: function (val) {
        return (val === true) || (val === -1); // yes or not sure
      }
    }
  },
  eawcl: {
    required_yes: [1, 2, 7, 16, 17, 20],
    required_no: [3, 14],
    eval: {
      9: function (revenue) {
        revenue = Number(revenue.replace(/\,|\$/g, ''));
        return revenue < 5000000;
      },
      11: function (val) {
        return (val === true) || (answers[nonprofit_q] === false);
      },
      18: function (val) {
        return (val === true) || (val === -1); // yes or not sure
      },
      19: function (val) {
        return (val === true) || (answers[nonprofit_q] === true);
      }
    }
  },
  guarantee: {
    required_yes: [1, 2, 7, 16, 17, 20],
    required_no: [3, 14],
    eval: {
      9: function (revenue) {
        revenue = Number(revenue.replace(/\,|\$/g, ''));
        return revenue < 5000000;
      },
      11: function (val) {
        return (val === true) || (answers[nonprofit_q] === false);
      },
      18: function (val) {
        return (val === true) || (val === -1); // yes or not sure
      },
      19: function (val) {
        return (val === true) || (answers[nonprofit_q] === true);
      }
    }
  },
  egp: {
    required_yes: [1, 4, 5, 6, 13, 17],
    required_no: [314],
    eval: {
      8: function (fte) {
        fte = Number(fte.replace(/\,|\$/g, ''));
        return fte < 25;
      },
      10: function (revenue) {
        revenue = Number(revenue.replace(/\,|\$/g, ''));
        return revenue < 5000000;
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
  // $(currentDiv).find(".btn, div, p, li").css({opacity: 0.4});
  // $(currentDiv).find('.btn, input').prop('disabled', true);

  var nextDiv = $(".question")[currentQuestion + 1];
  while($(nextDiv).parent().css("display") === "none") {
    currentQuestion++;
    nextDiv = $(".question")[currentQuestion + 1];
  }

  $(nextDiv).find(".btn, div, p, li").css({opacity: 1});
  $(nextDiv).find('.btn, input').prop('disabled', false);
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
      $("." + pcode).css({ opacity: 0.4 }).addClass("no-print");
    } else {
      $("." + pcode).css({ opacity: 1 }).removeClass("no-print");
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
    $(q).find('.btn, input').prop('disabled', true);
  } else {
    $(q).find('.answered').css({ display: "block" });
  }
  $(q).find('.answered').click(function (e) {
    $(q).find('.btn, div, p, li').css({opacity: 1});
  });

  var sheet_original_index = q.id.match(/\d+/)[0] * 1;

  // YES / ENTER button
  $(q).find('.btn-primary').click(function(e) {
    e.preventDefault();
    answers[sheet_original_index] = true;

    if (sheet_original_index === 2) { // physically in NJ
      $('.physical_nj').show();
      $('.not_in_nj').hide();
    }
    if (sheet_original_index === 8) { // how many FTE
      answers[sheet_original_index] = 1 * $("input[name='fte']").val();
    }
    if (sheet_original_index === 9) { // 2019 revenue
      answers[sheet_original_index] = 1 * $("input[name='2019_revenue']").val();
    }
    if (sheet_original_index === 10) { // YTD 12-month revenue
      answers[sheet_original_index] = 1 * $("input[name='12mo_revenue']").val();
    }
    if (sheet_original_index === 11) { // nonprofit
      $('.for-profit').hide();
      $('.non-profit').show();
    }
    if (sheet_original_index === 12) { // NAICS
      answers[sheet_original_index] = $("input[name='12mo_revenue']").val();
    }
    if (sheet_original_index === 14) { // NJ illegal business
      hardPass();
    }

    $(q).find(".answered").css({ color: "#888" });
    $(q).find(".btn").css({ border: "none" });
    $(e.target).css({ border: "3px solid orange" });

    nextQuestion(index);
    return false;
  });

  // NOT SURE / SKIP button (pre-emptive YES)
  $(q).find('.btn.not-sure').click(function(e) {
    e.preventDefault();
    answers[sheet_original_index] = -1;

    // numeric answers going back to not sure / skip
    if ([8, 9, 10, 12].includes(sheet_original_index)) {
      answers[sheet_original_index] = undefined;
    }

    $(q).find(".answered").css({ color: "#888" });
    $(q).find(".btn").css({ border: "none" });
    $(e.target).css({ border: "3px solid orange" });

    nextQuestion(index);
    return false;
  });

  // NO button
  $(q).find('.btn-dark').click(function(e) {
    e.preventDefault();
    answers[sheet_original_index] = false;

    if (sheet_original_index === 1) {
      hardPass();
    }
    if (sheet_original_index === 11) { // for-profit
      $('.for-profit').show();
      $('.non-profit').hide();
    }
    if (sheet_original_index === 2) { // not physically in NJ
      $('.physical_nj').hide();
      $('.not_in_nj').show();
    }

    $(q).find(".answered").css({ color: "#888" });
    $(q).find(".btn").css({ border: "none" });
    $(e.target).css({ border: "3px solid orange" });

    nextQuestion(index);
    return false;
  });
});

if (window.location.href.includes("scroll")) {
  function scrolledStuff() {
    if ((window.pageYOffset || window.scrollY) > $(".fixed_marker").offset().top) {
      $('.my_options, .hidden_options').addClass('scrollme');
    } else {
      $('.my_options, .hidden_options').removeClass('scrollme');
    }
  }
  $(window).scroll(scrolledStuff);
  scrolledStuff(); // on page load
}
