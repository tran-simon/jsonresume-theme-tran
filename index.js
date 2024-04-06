let fs = require("fs");
let Handlebars = require("handlebars");
let moment = require("moment");
let marked = require("marked");
let _ = require("underscore");

// From http://stackoverflow.com/a/16315366/3353747
Handlebars.registerHelper("ifCond", function (cond1, operator, cond2, options) {
  switch (operator) {
    case "==":
      return cond1 === cond2 ? options.fn(this) : options.inverse(this);

    case "&&":
      return cond1 && cond2 ? options.fn(this) : options.inverse(this);

    case "||":
      return cond1 || cond2 ? options.fn(this) : options.inverse(this);
  }
});

Handlebars.registerHelper("formatLink", (url) => {
  return url.replace("https://", "").replace("www.", "");
});

Handlebars.registerHelper({
  concat: function () {
    let res = "";

    for (let arg in arguments) {
      if (typeof arguments[arg] !== "object") {
        res += arguments[arg];
      }
    }

    return res;
  },
});

Handlebars.registerHelper("markdown", function (content) {
  return marked.parse(content);
});

function render(resume) {
  const css = fs.readFileSync(__dirname + "/style.css", "utf-8");
  const tpl = fs.readFileSync(__dirname + "/resume.hbs", "utf-8");

  const getTime = (info, format = "MMM YYYY") => {
    const [startFormat, endFormat] = Array.isArray(format)
      ? format
      : [format, format];

    const startDate = info.startDate && new Date(info.startDate);
    const endDate = info.endDate && new Date(info.endDate);

    let time = "";

    if (startDate) {
      time = moment(startDate).format(startFormat);
    }

    if (endDate) {
      time += " – " + moment(endDate).format(endFormat);
    }

    if (startDate && !endDate) {
      time += " – Current";
    }

    return time;
  };

  _.each(resume.work, function (work_info) {
    work_info.time = getTime(work_info);
  });

  _.each(resume.education, function (education_info) {
    education_info.time = getTime(education_info, "MMMM YYYY");
  });

  _.each(resume.projects, function (project_info) {
    project_info.time = getTime(project_info, ["MMM", "MMM YYYY"]);
  });

  _.each(resume.awards, function (award_info) {
    const date = award_info.date && new Date(award_info.date);

    award_info.awarded = moment(date).format("YYYY");
  });

  return Handlebars.compile(tpl)({
    css: css,
    resume: resume,
  });
}

module.exports = {
  render: render,
  pdfRenderOptions: {
    format: "legal",
  },
};
