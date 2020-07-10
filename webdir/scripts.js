  const video = document.querySelector('.player');
  const canvas = document.querySelector('.photo');
  const ctx = canvas.getContext('2d');
  const strip = document.querySelector('.strip');
  const snap = document.querySelector('.snap');


  function getVideo() {
    
    //this gets the video from ur camera as a promise
    navigator.mediaDevices.getUserMedia({ video: true, audio: false})

      //localMediaStream = promise = video
      .then(localMediaStream => {

        //console.log(localMediaStream);
        //create a url with the video promise dump as video src
        //video.src = window.URL.createObjectURL(localMediaStream);
        //the code above didn't work so i will pass media directly and not as an URL
        video.srcObject = localMediaStream;

        video.play();
    })

      //incase of error
      .catch(err => {
        console.error('OH SHIT, DIDNT WORK', err);
      });

  };



  function paintToCanvas() {

    //make the video measurements same as canvases
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    //set interval where every 16ms, video will display on canvas
    return setInterval(() => {

      //draw video on canvas starting at 0 for width & 0 for height
      ctx.drawImage(video, 0, 0, width, height);
      



      //take the pixels out
      let pixels = ctx.getImageData(0, 0, width, height);

      // mess with the pixels (filters)
      //pixels = redEffect(pixels);
      pixels = rgbSplit(pixels);
      //pixels = greenScreen(pixels);


      //ghosting
      ctx.globalAlpha = 0.1;

      //put them back
      ctx.putImageData(pixels, 0, 0); 
      
     //interval 
    }, 16);
  }


  function takePhoto() {

    //play snap sound
    snap.currentTime = 0;

    snap.play();

    //create data which is an image captured from the canvas
    const data = canvas.toDataURL('image/jpeg');

    //create link on the page
    const link = document.createElement('a');

    //make link to be image captured
    link.href = data;

    //any click on link/image will download image and save as handsome
    link.setAttribute('download', 'handsome');

    ////link text content
    //link.textContent = 'Download Image';

    //instead of text content use image tag with image taken, where src = data = href
    link.innerHTML = `<img src="${data}" alt="Handsome man" />`;

    //dump our links/images on strip b4 prev 1st one
    strip.insertBefore(link, strip.firstChild);

  }


  function redEffect(pixels) {

    //pixels.data is the array
    for (let i = 0; i < pixels.data.length; i+=4) {

      //messing with r g b excluding alpha to create red effect
      pixels.data[i + 0] = pixels.data[i + 0] + 100; //r
      pixels.data[i + 1] = pixels.data[i + 1] - 50;  //g
      pixels.data[i + 2] = pixels.data[i + 2] * 0.5; //b
    }
    return pixels;
  }



  function rgbSplit(pixels) {
  
    for (let i = 0; i < pixels.data.length; i+=4) {

      pixels.data[i - 150] = pixels.data[i + 0]; //r
      pixels.data[i + 500] = pixels.data[i + 1]; //g
      pixels.data[i + 550] = pixels.data[i + 2]; //b
    }
    return pixels;
  }



  function greenScreen(pixels){

    //create empty object
    const levels = {};

    //select all the inputs on screen
    document.querySelectorAll('.rgb input').forEach((input) => {
      //equate them to their values
      levels[input.name] = input.value;
    });

   

    for (i = 0; i < pixels.data.length; i += 4) {

      red = pixels.data[i + 0];
      green = pixels.data[i + 1];
      blue = pixels.data[i + 2];
      alpha = pixels.data[i + 3];

      //if the colour falls within input ranges
      if(red >= levels.rmin
        && green >= levels.gmin
        && blue >= levels.bmin
        && red <= levels.rmax
        && green <= levels.gmax
        && blue <= levels.bmax) {

        //take alpha out. turn invisible
        pixels.data[i + 3] = 0;
      }

    }

    return pixels;
  }





  //call getVideo on page load
  getVideo();

  //when video plays add it to canvas
  video.addEventListener('canplay', paintToCanvas);

  //to fuck with RGB create const pixels in interval of paintToCanvas