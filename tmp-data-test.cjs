const { allCourses, courseSoftwareTabs, softwareLabels } = require("./tmp-tc/data.js");
const { imageFor } = require("./tmp-tc/images.js");

let failed = 0;
const check = (label, ok) => {
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
};

const blender = allCourses.filter((course) => course.software.includes("blender"));
const sketchup = allCourses.filter((course) => course.software.includes("sketchup"));

check("total courses = 16", allCourses.length === 16);
check("unique course ids", new Set(allCourses.map((c) => c.id)).size === allCourses.length);
check("blender tab exists", courseSoftwareTabs.some((tab) => tab.id === "blender"));
check("sketchup tab exists", courseSoftwareTabs.some((tab) => tab.id === "sketchup"));
check("softwareLabels.blender", softwareLabels.blender === "Blender");
check("softwareLabels.sketchup", softwareLabels.sketchup === "SketchUp");
check("exactly one blender course", blender.length === 1);
check("exactly one sketchup course", sketchup.length === 1);

const blenderCourse = blender[0];
const sketchupCourse = sketchup[0];

check("blender course id c-15", blenderCourse && blenderCourse.id === "c-15");
check("blender title", Boolean(blenderCourse) && blenderCourse.title.includes("بلندر"));
check("blender instructor", Boolean(blenderCourse) && blenderCourse.instructor === "تیم تخصصی لومنز");
check("blender has 5 lessons", Boolean(blenderCourse) && blenderCourse.lessons.length === 5);
check(
  "blender lessons are embed urls",
  Boolean(blenderCourse) &&
    blenderCourse.lessons.every((lesson) => /youtube\.com\/embed\//.test(lesson.embedUrl)),
);
check(
  "blender lesson titles cover all 5 topics",
  Boolean(blenderCourse) &&
    ["شورتکات", "مودیفایر", "PBR", "Cycles", "هوش مصنوعی"].every((kw) =>
      blenderCourse.lessons.some((lesson) => lesson.title.includes(kw)),
    ),
);
check("blender cover mapped", imageFor["c-15"] === "/covers/course-15.svg");

check("sketchup course id c-16", sketchupCourse && sketchupCourse.id === "c-16");
check("sketchup title", Boolean(sketchupCourse) && sketchupCourse.title.includes("SketchUp Masterclass"));
check("sketchup instructor", Boolean(sketchupCourse) && sketchupCourse.instructor === "تیم تخصصی لومنز");
check("sketchup is free", Boolean(sketchupCourse) && sketchupCourse.isFree && sketchupCourse.price === 0);
check("sketchup has 5 lessons", Boolean(sketchupCourse) && sketchupCourse.lessons.length === 5);
check(
  "sketchup lessons are embed urls",
  Boolean(sketchupCourse) &&
    sketchupCourse.lessons.every((lesson) => /youtube\.com\/embed\//.test(lesson.embedUrl)),
);
check(
  "sketchup lesson titles cover all 5 topics",
  Boolean(sketchupCourse) &&
    ["کامپوننت", "پله", "متریال", "Tags", "هوش مصنوعی"].every((kw) =>
      sketchupCourse.lessons.some((lesson) => lesson.title.includes(kw)),
    ),
);
check("sketchup cover mapped", imageFor["c-16"] === "/covers/course-16.svg");

console.log(failed === 0 ? "DATA_CHECKS_PASSED" : `${failed} DATA CHECK(S) FAILED`);
