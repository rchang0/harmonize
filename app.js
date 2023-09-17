
document
  .getElementById("startRecording")
  .addEventListener("click", initFunction);
let isRecording = document.getElementById("isRecording");
function initFunction() {
  // Display recording
  async function getUserMedia(constraints) {
    if (window.navigator.mediaDevices) {
      return window.navigator.mediaDevices.getUserMedia(constraints);
    }
    let legacyApi =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    if (legacyApi) {
      return new Promise(function (resolve, reject) {
        legacyApi.bind(window.navigator)(constraints, resolve, reject);
      });
    } else {
      alert("user api not supported");
    }
  }
  isRecording.textContent = "Recording...";
  //
  let audioChunks = [];
  let rec;
  function handlerFunction(stream) {
    rec = new MediaRecorder(stream);
    rec.start();
    rec.ondataavailable = (e) => {
      audioChunks.push(e.data);
      if (rec.state == "inactive") {
        let blob = new Blob(audioChunks, { type: "audio/mp3" }); // blob = audio file in mp3 format
        
        console.log(blob);
        document.getElementById("audioElement").src = URL.createObjectURL(blob); // html source for blob

        var data = new FormData();
        data.append('file', blob, "file");

        fetch('http://vision16.csail.mit.edu:8889/receive', {
            method: 'POST',
            body: data
        }).then(
          response => response.json()
        ).then(json => {
          console.log(json);
          window.location.assign(json);
        })

        // fetch('http://vision16.csail.mit.edu:8889/receive', {
        //     method: 'POST',
        //     body: data
        // }).then((response) => {
        //     console.log(response);
        //     return response.blob()
        // }).then((blob) => {
        //    let el = document.createElement("a"); 
        //     let filename = "test.mid";
        //    // creates anchor element but doesn't add it to the DOM
        //    el.setAttribute("download", f"{filename}") 
        //    // make the link downloadable on click
        //    let url = URL.createObjectUrl(blob); 
        //    // creates a url to the retrieved file
        //    el.href = url; // set the href attribute attribute
        //    el.click(); 
        // }).catch(err=>console.log(err));




          
      }
    };
  }
  function startusingBrowserMicrophone(boolean) {
    getUserMedia({ audio: boolean }).then((stream) => {
      handlerFunction(stream);
    });
  }
  startusingBrowserMicrophone(true);
  // Stopping handler
  document.getElementById("stopRecording").addEventListener("click", (e) => {
    rec.stop();
    isRecording.textContent = "Click play button to start listening";

    // const audioBlob = new Blob(audioChunks, { type: "audio/wav" })

    // var data = new FormData()
    // data.append('file', audioBlob, "file")

    // fetch('http://127.0.0.1:5000/receive', {
    //     method: 'POST',
    //     body: data
    // }).then(
    //   response => response.json()
    // ).then(json => {
    //   console.log('lalalala');
    //   console.log(json);
    // })
  });
}