let canvas;
let video;
let status = false;
let inputBox;
let model;
let results = []; 
let objectMentioned = ""; 

function setup() {
  canvas = createCanvas(640, 480);
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  inputBox = createInput();
  inputBox.position(10, 10);

  start();
}

function start() {
  console.log("Status: Detecting Objects");

  objectMentioned = inputBox.value(); // Store the value from the input box in a variable

  model = ml5.objectDetector('cocossd', modelLoaded);
}

function modelLoaded() {
  console.log("Model loaded");
  status = true;
  model.detect(video, gotResult); // Start detecting objects
}

function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }

  console.log(results);
  // Store the results array in the global results variable
  this.results = results;

  // Continue detecting objects
  model.detect(video, gotResult);
}

function draw() {
  image(video, 0, 0, width, height);

  if (status) {
    let objectFound = false;

    for (let i = 0; i < results.length; i++) {
      let object = results[i];
      let label = object.label;
      let confidence = nf(object.confidence * 100, 2, 1) + "%"; // Convert confidence to percentage

      let x = object.x;
      let y = object.y;
      let w = object.width;
      let h = object.height;

      // Place label and confidence near the object
      fill(255);
      textSize(16);
      text(label + ": " + confidence, x + 10, y + 20);

      // Draw a rectangle near the object
      noFill();
      strokeWeight(2);
      stroke(0, 255, 0);
      rect(x, y, w, h);

      // Check if the object mentioned is detected
      if (label === objectMentioned) {
        console.log("Object mentioned is detected");
        video.stop(); // Stop the webcam live view
        model.detect(video, gotResult); // Stop the execution of the cocossd model

        objectFound = true;
        break; // Exit the loop
      }
    }

    if (objectFound) {
      // Update the HTML element for object status
      document.getElementById("object-status").innerHTML = "Object mentioned found";

      // Speech synthesis
      let synth = window.speechSynthesis;
      let utterThis = new SpeechSynthesisUtterance("Object mentioned found");
      synth.speak(utterThis);
    } else {
      // Update the HTML element for object status
      document.getElementById("object-status").innerHTML = "Object mentioned not found";
    }
  }
}