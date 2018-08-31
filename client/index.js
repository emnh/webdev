const $ = require('jquery');

const cm = require('codemirror');

import hotkeys from 'hotkeys-js';

import css from '../css/codemirror.css';

var cmInstance = [null];

var saveHotKey = 'ctrl+s';
var saveHotKeyCM = 'Ctrl-S';
var openHotKey = 'ctrl+o';
var openHotKeyCM = 'Ctrl-O';

var activeFile = [""];

function openFile(fname) {
  $("#openFileTitle").html("Editing: " + fname);
  activeFile[0] = fname;
  $.get("/api/read/" + fname, function(data) {
    cmInstance[0].getDoc().setValue(data);
  });
  cmInstance[0].focus();
}

function saveFile(fname, doc) {
  var payload = {
    doc: doc
  };
  $.post("/api/write/" + fname, payload, function(data) {
    console.log(data);
    $("#cmwrap").css("border", "2px solid blue");
    setTimeout(function() {
      $("#cmwrap").css("border", "0px");
    }, 1000);
  }).fail(function() {
    $("#cmwrap").css("border", "2px solid red");
    setTimeout(function() {
      $("#cmwrap").css("border", "0px");
    }, 1000);
  });
  console.log("save");
}

function clickOpenFile(evt) {
  var fname = $(evt.target).text();
  openFile(fname);
}

function save() {
  var fname = activeFile[0];
  var doc = cmInstance[0].getDoc().getValue();
  saveFile(fname, doc);
}

function selectFilter() {
  $("#fileFilter").focus();
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function listFiles() {
  $("#filelist").html("");
  $.get("/api/list/", function(data) {
    var list = JSON.parse(data);
    li = $("#filelist").append(li);
    for (var i = 0; i < list.length; i++) {
      var li = $("<a href='#'><li>" + list[i] + "</li></a>");
      li = $("#filelist").append(li);
      li.on("click", clickOpenFile);
    }
  });
};

function filterFiles(evt) {
  var search = $("#fileFilter").val();
  var searchTitle = toTitleCase(search) + ".re";
  var ul = $("#filelist");
  var count = 0;
  var matches = [];
  ul.children().each(function(i, it) {
    var txt = $(it).text();
    var vis = (txt.toLowerCase().indexOf(search.toLowerCase()) !== -1);
    if (vis === true) {
      count++;
      matches.push(txt);
    }
    $(it).toggle(vis);
  });
  $("#newFile").toggle(count === 0);
  if (count === 0) {
    $("#newFileName").html(searchTitle);
  }

  var ENTER = 13;
  if (evt.keyCode === ENTER && count <= 1) {
    if (count === 0) {
      saveFile(searchTitle, "// New file");
      listFiles();
      openFile(searchTitle);
    } else {
      openFile(matches[0]);
    }
  }
}

function rebind(key, f, opts) {
  hotkeys.unbind(key);
  if (opts !== undefined) {
    hotkeys(key, f);
  } else {
    hotkeys(key, opts, f);
  }
}

function regHotKeys() {
  rebind(saveHotKey, function(evt, handler) {
      evt.preventDefault();
      save();
  });
  rebind(openHotKey, function(evt, handler) {
      evt.preventDefault();
      selectFilter();
  });
  rebind("enter", function(evt, handler) {
    console.log("enter");
  }, {
    element: $("#fileFilter")
  });
}

function main() {
  $("body").html("");
  $("body").append('<p>File filter:</p><input id="fileFilter" type="text" value=""/>');
  $("#fileFilter").on("keyup", filterFiles);
  var newFile = $("<p id='newFile'>New file: <span id='newFileName'/></p>");
  newFile.appendTo("body").toggle();
  $("body").append('<ul id="filelist"/>');
  listFiles();
  $("body").append('<h3 id="openFileTitle">No file open</h3>');
  $("body").append('<div id="cmwrap"><textarea id="cm"/></div>');
  var ta = $("#cm")[0];
  cmInstance[0] = cm.fromTextArea(ta);
  var opts = {};
  opts[saveHotKeyCM] = function(cm) { save(); };
  opts[openHotKeyCM] = function(cm) { selectFilter(); };
  cmInstance[0].setOption("extraKeys", opts);
  regHotKeys();
  selectFilter();
}

function entry() {
  main();

  if (module.hot) {
    module.hot.accept(() => {
      main();
    });
  }
}

entry();
