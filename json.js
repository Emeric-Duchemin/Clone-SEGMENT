/**
* json.js
*
* Functions for interpreting the 'segment.game' JSON file
*/

'use strict'; // Turns on "strict mode", preventing use of non-declared variables

// ========================================================================================
//                               ***Memos TODO (unused)***
// ========================================================================================

// --------------------------------------- Clément ----------------------------------------

// ---------------------------------------- Hind ------------------------------------------

// --------------------------------------- Pierre -----------------------------------------

// -------------------------------------- Eleonore ----------------------------------------

// --------------------------------------- Emeric -----------------------------------------

// -------------------------------------- Corentin ----------------------------------------

  // getTransitionByID can be optimized (no need for transitions)

  // Add commentaries for a lot of functions + return value

  // Video json ? Que intro ? Intro.mp4 ? Vidéo scène finale ?

// ---------------------------------------- Jean ------------------------------------------

// ========================================================================================
//                              *** Global variables***
// ========================================================================================

/**
* contains the path of the json file
*/
const GameURL = "../Game/game.segment"

/**
* Holds the information of click zones in the game
*/
class ClickZone {
  constructor(x1, y1, x2, y2, id, clickzoneId) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.id = id;
    this.clickzoneId = clickzoneId;
  }
}

class BackClickZone {
  constructor(x1, y1, x2, y2, bckclickId) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.bckclickId = bckclickId;
  }
}

/**
* Global variable for containing game JSON
*/
var GameJson;

/**
* Loads the json in variable at start
*/
window.onload = initialise();

// ========================================================================================
//                                ***Function at start***
// ========================================================================================

/**
* Retrieves the game JSON from session storage
*/
function initialise() {
  var str = window.sessionStorage.getItem("json");
  GameJson = JSON.parse(str);
}

/**
* Loads 'segment.game' from file
*/
function loadJson() {
  //GameURL = "./Game/game.segment";
  //GameJson = jsonTest;
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: 'GET',
      url: "../Game/game.segment",
      async: true,
      dataType: 'json',
      success: function (data) {
        GameJson = data;
        window.sessionStorage.setItem("json", JSON.stringify(data));
      }
    });
  });
}

// ========================================================================================
//                                      ***Getters***
// ========================================================================================

// ------------------------------------ Basic Getters -------------------------------------

/**
* Returns the part of the game JSON that holds the game's scenes
*/
function getScenes() {
  var json = GameJson;
  return json.Document.Process.Scenes;
}

/**
* Returns path of the background image from the scene object specified
*
* @param {Scene object} scene
*/
function getSceneImage(scene) {
  return "../Game/" + scene.Image;
}


/**
* Returns the id of the specified scene
* @param {Scene object} scene
*/
function getSceneId(scene) {
  return scene.id;
}

/**
* Note : may replace getSceneId
* Returns the id of an element
* @param {object} element
*/
function getElementId(element) {
  return element.id;
}

/**
* Returns an array containing the current width and height of the scene
*
* @param {Scene object} scene
*/
function getImageSize(scene) {
  let image_size = [];
  image_size.push({
    'width': scene.ImageSize[0],
    'height': scene.ImageSize[1]
  });
  return image_size;
}

/**
* Returns the intial scene object from the game JSON
*
* NOTE : different from get_scene_by_id because there is a special type if
* a scene is an initial scene (i.e. SceneType = 1; Final = 2; Other = 0)
*/
function getInitialScene() {
  const scenes = getScenes();
  const length = Object.keys(scenes).length;
  for (var i = 0; i < length; i++) {
    if (scenes[i].SceneType == 1) {
      return scenes[i];
    }
  }
}

/**
* Returns the click areas described in the game JSON for the scene object 'scene'
*
* @param {Scene object} scene
*/
function getClickAreas(scene) {
  return scene.ClickAreas;
}

/**
* Returns the back click areas described in the game JSON for the scene object 'scene'
*
* @param {Scene object} scene
*/
function getBackClickAreas(scene) {
  return scene.BackClickAreas;
}

/**
* Returns the FIRST back click areas described in the game JSON for the scene object 'scene'
*
* @param {Scene object} scene
*/
function getBackClickArea(scene){
  return scene.BackClickAreas[0];
}

/**
* Returns the gifs described in the game JSON for the scene object 'scene'
*
* @param {Scene object} scene
*/
function getGifs(scene) {
  return scene.Gifs;
}

/**
* Returns the objects described in the game JSON for the scene object 'scene'
*
* @param {Scene object} scene
*/
function getObjects(scene) {
  return scene.Objects;
}

/**
* Returns the textAreas described in the game JSON for the scene object 'scene'
*
* @param {Scene object} scene
*/
function getTexts(scene) {
  return scene.TextAreas;
}

/**
* Returns all the transitions
*
* @param {Scene object} scene
*/
function getTransitions() {
  var json = GameJson;
  return json.Document.Process.Transitions;
}

/**
* Plays the sound described in the parsed part of JSON element
*
* @param {JSON object} element
*/
function getSoundPath(element) {
  return element.Sound.Path;
}

/**
* Searches for the ClickArea (in game JSON) whose path matches 'path'
* and returns the scene id to which it points
*
* @param {string} clickAreaPath
*/
function getPointedScene(clickAreaPath) {
  let scene = GameJson.Document.Process;
  let len = scene.Transitions.length;
  for (let i = 0; i < len; i++) {
    if (scene.Transitions[i].Transition.Which == "ClickAreaToScene") {
      let elem = scene.Transitions[i].Transition;
      len = elem.ClickAreaToScene.To.length;
      if (elem.ClickAreaToScene.From == clickAreaPath) {
        while (elem.ClickAreaToScene.To[len]!=".") {
          len--;
        }
        return parseInt(elem.ClickAreaToScene.To.substring(len+1, elem.ClickAreaToScene.To.length));
      }
    }
  }
  return -1
}

function getPuzzlepieces(id){
  const scene = getSceneByID(id);
  let tab = [];
  for(let i = 0; i < scene.Objects.length; i++){
    if(scene.Objects[i].PuzzlePiece){
      tab.push(scene.Objects[i]);
    }
  }
  return tab;
}

function getGifPointedScene(id){
  const scene = getSceneByID(id);
  let transitions = getTransitions();
  const len = transitions.length;
  for(let i =0 ; i<len; i++){
    let sceneto = transitions[i].Transition.SceneToScene;
    if(!(sceneto === undefined)){
      if(!(sceneto.Riddle === undefined)){
        if(sceneto.Riddle.Which=="Gif" && getLastNumberTransition(sceneto.From) == id){
          return getLastNumberTransition(sceneto.To);
        }
      }
    }
  }
  return 2000000;
}

/**
* Return the type of the puzzle present in the given scene
* @param {Scene object} id
*/
function whatPuzzleItIs(id){
  const scene = getSceneByID(id);
  if (!(scene.Gifs.length == 0)){
    return ["Gif",id];
  }
  let transitions = getTransitions();
  const len = transitions.length;
  for(let i =0 ; i<len; i++){
    if(!(transitions[i].Transition.SceneToScene === undefined)){
      let comp_id = getLastNumberTransition(transitions[i].Transition.SceneToScene.From);
      if(comp_id == id){
        if(!(transitions[i].Transition.SceneToScene.Riddle === undefined)){
          return [transitions[i].Transition.SceneToScene.Riddle.Which,transitions[i].id];
        }
      }
    }
  }
  return "";
}

/**
* Given a path (ex : "Game/Scene.14") return the last number (in the example 14)
*
* @param {String} str
*/
function getLastNumberTransition(str){
  let len = str.length;
  while(str[len] !="."){
    len--;
  }
  return parseInt(str.substring(len+1,str.length));
}

function getSceneIdFromPath(path){
  let len = path.length;
  let len2 = len;
  let len3 = len;
  while(len >= 0){
    if(path[len] == "."){
      len3 = len2;
      len2 = len;
      len--;
    }
    if(path[len] == "/"){
      if(path.substring(len+1,len2) == "Scene"){
        return path.substring(len2+1,len3);
      }
      len3 = len2;
      len2 = len;
      len--;
    }
    len--;
  }
  return -1;
}

// ------------------------------------ Get <...> By Id -------------------------------------

/**
* Returns the path to the background image of the scene whose id is 'id'
* @param {number} id
*/
function getSceneBackgroundById(id) {
  return getSceneImage(getSceneByID(id));
}

/**
* Returns the scene object whose identifier in the game JSON is 'id'
* Throws an error if no scene matches the given id
* Note : scene identifiers start at 0
*
* @param {number} id
*/
function getSceneByID(id) {
  var json = GameJson;
  const scenes = getScenes(json);
  const length = Object.keys(scenes).length;
  for (var i = 0; i < length; i++) {
    if (scenes[i].id == id) {
      return scenes[i];
    }
  }
  console.error("Error : Scene " + id + " not found");
}

/**
* Returns the scene object whose identifier in the game JSON is 'id'
*
* @param {number} id
*/
function getImageSizeByID(id) {
  return getImageSize(getSceneByID(id));
}

/**
* Returns array where each element contains the four positions of the
* four edges of the click zone and the id pointed by the click zone,
* relatively to the image size.
*
* @param {number} id,
* @param {bool} back
*/
function getClickZonesByScenesId(id,back) {
  const scene = getSceneByID(id);
  let areas;
  if(back){
    areas = scene.BackClickAreas;
    if(areas === null){
      areas = [];
    }
  }
  else{
    areas = scene.ClickAreas;
  }
  /*Commentaires:
  La position de l'image est bien relative par rapport à la taille de l'image.
  Le size est calculé proportionnellement par rapport à la longueur de l'image.
  */
  let array = [];
  for(var i = 0; i < areas.length; i++){
    let currentArea = areas[i];
    let heightPourcentage = currentArea.Size[1] * scene.ImageSize[0] / scene.ImageSize[1];
    let clickzone = 0;
    let id;
    if(back){
      clickzone = new BackClickZone(currentArea.Pos[0],currentArea.Pos[1],currentArea.Size[0] + currentArea.Pos[0],heightPourcentage + currentArea.Pos[1], getElementId(currentArea));
    }else{
      clickzone = new ClickZone(currentArea.Pos[0],currentArea.Pos[1],currentArea.Size[0] + currentArea.Pos[0],heightPourcentage + currentArea.Pos[1],getPointedScene(currentArea.Path), getElementId(currentArea));
      id = getPointedScene(currentArea.Path);
    }
    array.push(clickzone);
  }
  return array;
}

/**
* Returns the ClickArea whose id is 'id'
* Throws an error if not found
*
* @param {number} clickArea
* @param {number} id
*/
function getClickAreaByID(clickArea, id) {
  for (var i = 0; i < clickArea.length; i++) {
    if (clickArea[i].id == id) {
      return clickArea[i];
    }
  }
  throw "clickArea " + id + " not found";
}

/**
* Returns the BackClickArea whose id is 'id'
* Throws an error if not found
*
* @param {number} backClickArea
* @param {number} id
*/
function getBackClickAreaByID(backClickArea, id) {
  for (var i = 0; i < backClickArea.length; i++) {
    if (backClickArea[i].id == id) {
      return backClickArea[i];
    }
  }
  throw "BackClickArea " + id + " not found";
}

/**
* Returns the gif whose id is 'id'
* Throws an error if not found
*
* @param {number} gifs
* @param {number} id
*/
function getGifByID(gifs, id) {
  for (var i = 0; i < gifs.length; i++) {
    if (gifs[i].id == id) {
      return gifs[i];
    }
  }
  throw "Gif " + id + " not found";
}

/**
* Returns the object whose id is 'id'
* Throws an error if not found
*
* @param {number} objects
* @param {number} id
*/
function getObjectByID(objects, id) {
  for (var i = 0; i < objects.length; i++) {
    if (objects[i].id == id) {
      return objects[i];
    }
  }
  throw "Object " + id + " not found";
}

/**
* Returns the text whose id is 'id'
* Throws an error if not found
*
* @param {number} texts
* @param {number} id
*/
function getTextByID(texts, id) {
  for (var i = 0; i < texts.length; i++) {
    if (texts[i].id == id) {
      return texts[i];
    }
  }
  throw "Text " + id + " not found";
}

/**
* Returns the transitions whose id is 'id'
* Throws an error if not found
*
* @param {number} transitions
* @param {number} id
*/
function getTransitionByID(transitions, id) {
  for (var i = 0; i < transitions.length; i++) {
    if (transitions[i].id == id) {
      return transitions[i];
    }
  }
  throw "Transition " + id + " not found";
}

/**
* Find if we have a fade transition for the transition between source and
* destination
*
* @param {object} transitions
* @param {number} source
* @param {number} destination
*/
function findTransition(transitions, source, destination) {
  for (var i = 0; i < transitions.length; i++) {
    if((getSceneIdFromPath(transitions[i].Transition[transitions[i].Transition.Which].To) == destination) && (getSceneIdFromPath(transitions[i].Transition[transitions[i].Transition.Which].From) == source)){
      return transitions[i].Fade == 1;
    }
  }
  return false
  throw "Transition from " + source + " to " + destination + " not found";
}

/**
* Returns the start text that has to be displayed at the
* begining of the scene whose id is 'scene_id'
*
* @param {number} sceneId
*/
function getSceneTextBySceneId(sceneId) {
  const scene = getSceneByID(sceneId);
  const text = scene.StartText;
  return text;
}

/**
* Returns the text in the text areas of the
* scene whose id is "sceneId"
*
* @param {number} sceneId
*/
function getSceneTextAreasBySceneId(sceneId) {
  const scene = getSceneByID(sceneId);
  const text_areas = [];
  for (var i = 0; i < scene.TextAreas.length; i++) {
    text_areas[i] = scene.TextAreas[i].Text;
  }
  return text_areas;
}

/**
* Returns Question, Success answer or Failure answer of a digicode
* in the scene whose id is 'sceneId'
*
* @param {number} sceneId
* @param {number} text
*/
function getDigicodeQSF(sceneId,text){
  var transitions = getTransitions();
  var sceneToScene;
  var len = transitions.length;
  var riddleText;
  for (var i = 0; i < len; i++) {
    if(transitions[i].Transition.Which == "SceneToScene"){
      sceneToScene = transitions[i].Transition.SceneToScene;
      var startSceneId = getLastNumberTransition(sceneToScene.From);
      if (startSceneId == sceneId) {
        riddleText = sceneToScene.Riddle.Text;
      }
    }
  }
  switch (text) {
    case "QUESTION":
    return riddleText.Question;
    break;
    case "SUCCESS":
    return riddleText.IfCorrect;
    break;
    case "FAILURE":
    return riddleText.IfWrong;
    break;
    default:
    return"";
  }
}

// ========================================================================================
//                                      ***Sounds***
// ========================================================================================

/**
* Plays a sound
*
* @param {string} soundPath the path of the sound to play
* @param {bool} loop wether to loop the sound or not
* @param {float} volume the volume at which the sound should be played
*/
function playSound(SoundPath,loop=false,volume=1.0){
  if(SoundPath == ""){
    console.log("Sound not defined !");
  }
  else{
    var audio = new Audio('Game/' + SoundPath);
    audio.loop = loop;
    audio.volume = volume;
    audio.play();
  }
}

/**
* Plays the sound of the current scene
*
*/
function playSoundScene(){
  let scene = getSceneByID(scene_number);
  let SoundPath = scene.Ambience.Path;
  let loop = scene.Ambience.Repeat;
  let volume = scene.Ambience.Volume;
  playSound(SoundPath,loop,volume);
}

/**
* Play sound associated with clickZoneId
* @param {*} clickZoneId
*/
function playSoundClickZone(clickZoneId){
  var Scene = getSceneByID(scene_number);
  var clickAreas = getClickAreas(Scene);
  var clickArea = getClickAreaByID(clickAreas,clickZoneId);
  var SoundPath = getSoundPath(clickArea);
  playSound(SoundPath);
}

/**
* Play sound associated with backClickAreaId
* @param {*} backClickAreaId
*/
function playSoundBackClickArea(backClickAreaId){
  var Scene = getSceneByID(scene_number);
  var backClickAreas = getBackClickAreas(Scene);
  var backClickArea = getBackClickAreaByID(backClickAreas,backClickAreaId);
  var SoundPath = getSoundPath(backClickArea);
  playSound(SoundPath);
}

/**
* Play sound associated with gifId
* @param {*} gifId
*/
function playSoundGif(gifId){
  var Scene = getSceneByID(scene_number);
  var gifs = getGifs(Scene);
  var gif = getGifByID(gifs, gifId);
  var SoundPath = getSoundPath(gif);
  playSound(SoundPath);
}

/**
* Play sound associated with objectId
* @param {*} objectId
*/
function playSoundObject(objectId){
  var Scene = getSceneByID(scene_number);
  var objects = getObjects(Scene);
  var object = getObjectByID(objects, objectId);
  var SoundPath = getSoundPath(object);
  playSound(SoundPath);
}

/**
* Play sound associated with textId
* @param {*} textId
*/
function playSoundText(textId){
  var Scene = getSceneByID(scene_number);
  var texts = getTexts(Scene);
  var text = getTextByID(texts, textId);
  var SoundPath = getSoundPath(text);
  playSound(SoundPath);
}

/**
* Play sound associated with transitionId
* @param {*} transitionId
*/
function playSoundTransition(transitionId){
  var transitions = getTransitions();
  var transition = getTransitionByID(transitions, transitionId);
  var SoundPath = getSoundPath(transition);
  playSound(SoundPath);
}

// ========================================================================================
//                                      ***Transitions***
// ========================================================================================

/**
* Returns true if the transition id is Unique
* @param {*} transitionId
*
* @returns true id the transition id is unique, false otherwise
*/
function isTransitionUnique(transition){
  return transition.Unique;
}

// ========================================================================================
//                                      ***Video***
// ========================================================================================
/**
* plays the video vidName with type "type" (video/mp4, video/ogg, etc.)
* @param {vidName} path of the video (ex. "Intro.mp4")
* @param {type} type of the video (ex. "video/mp4")
*
* @returns false if the video does not exist. Nothing otherwise
*/
function playVideo(vidName, type)
{
  if(fileExists(vidName)){
    var video = document.getElementById("video");
    video.innerHTML = "";
    video.width = parseInt(window.innerWidth);
    video.height = parseInt(window.innerHeight);
    video.zIndex = 30;
    var source = document.createElement("source");
    source.src = vidName;
    source.type = type;
    video.appendChild(source);
    video.play();
  }
  else{
    throw "fileError";
  }
}

// ========================================================================================
//                                      ***Other***
// ========================================================================================
/**
* Checks if a file exists
* @param {url} url where the file should be
*
* @returns true if the file exists, false otherwise
*/
function fileExists(url)
{
  var http = new XMLHttpRequest();
  http.open('HEAD', url, false);
  http.send();
  return http.status!=404;
}

function isSceneFinal(scene){
  return scene.SceneType == 2;
}
