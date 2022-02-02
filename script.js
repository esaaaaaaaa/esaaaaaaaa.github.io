window.onload = function () {
  const Snow = (canvas, count, options) => {
    const ctx = canvas.getContext('2d');
    const snowflakes = [];

    const add = item => snowflakes.push(item(canvas));

    const update = () => _.forEach(snowflakes, el => el.update());

    const resize = () => {
      ctx.canvas.width = canvas.offsetWidth;
      ctx.canvas.height = canvas.offsetHeight;

      _.forEach(snowflakes, el => el.resized());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      _.forEach(snowflakes, el => el.draw());
    };

    const events = () => {
      window.addEventListener('resize', resize);
    };

    const loop = () => {
      draw();
      update();
      animFrame(loop);
    };

    const init = () => {
      _.times(count, () => add(canvas => SnowItem(canvas, null, options)));
      events();
      loop();
    };

    init(count);
    resize();

    return { add, resize };
  };

  const defaultOptions = {
    color: 'orange',
    radius: [0.5, 3.0],
    speed: [1, 3],
    wind: [-0.5, 3.0] };


  const SnowItem = (canvas, drawFn = null, opts) => {
    const options = { ...defaultOptions, ...opts };
    const { radius, speed, wind, color } = options;
    const params = {
      color,
      x: _.random(0, canvas.offsetWidth),
      y: _.random(-canvas.offsetHeight, 0),
      radius: _.random(...radius),
      speed: _.random(...speed),
      wind: _.random(...wind),
      isResized: false };

    const ctx = canvas.getContext('2d');

    const updateData = () => {
      params.x = _.random(0, canvas.offsetWidth);
      params.y = _.random(-canvas.offsetHeight, 0);
    };

    const resized = () => params.isResized = true;

    const drawDefault = () => {
      ctx.beginPath();
      ctx.arc(params.x, params.y, params.radius, 0, 2 * Math.PI);
      ctx.fillStyle = params.color;
      ctx.fill();
      ctx.closePath();
    };

    const draw = drawFn ?
    () => drawFn(ctx, params) :
    drawDefault;

    const translate = () => {
      params.y += params.speed;
      params.x += params.wind;
    };

    const onDown = () => {
      if (params.y < canvas.offsetHeight) return;

      if (params.isResized) {
        updateData();
        params.isResized = false;
      } else {
        params.y = 0;
        params.x = _.random(0, canvas.offsetWidth);
      }
    };

    const update = () => {
      translate();
      onDown();
    };

    return {
      update,
      resized,
      draw };

  };

  const el = document.querySelector('.container');
  const wrapper = document.querySelector('body');
  const canvas = document.getElementById('snow');

  const animFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

  Snow(canvas, 150, { color: 'white' });

  setInterval(() => {
    var currentdate = new Date(); 
    var minute = '0' + currentdate.getMinutes()
    var hour = '0' + currentdate.getHours()
    var month  = '0' + (currentdate.getMonth()+1)
    var date = '0' + currentdate.getDate()
    if (minute < 10) {
      minute = '0' + currentdate.getMinutes()
    } else {
      minute = currentdate.getMinutes()
    }

    if (hour < 10) {
      hour = '0' + currentdate.getHours()
    } else {
      hour = currentdate.getHours()
    }

    if (month < 10) {
      month = '0' + (currentdate.getMonth()+1)
    } else {
      month = (currentdate.getMonth()+1)
    }

    if (date < 10) {
      date = '0' + currentdate.getDate()
    } else {
      date = currentdate.getDate()
    }
    var datetime = date + "/" + month + "/"  + currentdate.getFullYear() + " @ "   + hour + ":"   + minute;
    console.log(datetime)
    $('.time').text(datetime);
  }, 1000);

  fetch('https://api.openweathermap.org/data/2.5/weather?q=Istanbul&units=metric&appid=cb73766baef14a4d2bf9e254babe70c5').then(function (response) {
  return response.json();
  }).then(function (data) {
  $(".weather").html(`It's currently ${data.main.temp.toFixed()} °C <span style="font-size: .75rem; line-height: 1rem;">(${data.weather[0].description})</span> in <a class="canimsin" href="https://weather.com/en-GB/weather/today/l/33d1e415eb66f3e1ab35c3add45fccf4512715d329edbd91c806a6957e123b49" target="_blank">${data.name}.</a>`)
  }).catch(function (err) {
  console.warn('Something went wrong.', err);
  });

  let ws = new WebSocket('wss://api.lanyard.rest/socket');
  let Interval;
  ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: 2,
          d: {
            subscribe_to_id: "878694140525809714",
          },
        })
      );
    
      Interval = setInterval(() => {
        ws.send(
          JSON.stringify({
            op: 3,
          })
        );
      }, 3000);
  };
  ws.onmessage = (msg) => {
   msg = JSON.parse(msg.data);
   if (!['INIT_STATE', 'PRESENCE_UPDATE'].includes(msg.t)) return;
      let user = msg.d;

      if (user.listening_to_spotify) {
        // timebar icin
        $(".music-name").text(user.spotify.song)
        $(".artist-name").text(user.spotify.artist)
        $(".efewipedinannesi").attr("src", `${user.spotify.album_art_url}`);
        $('.hreff').attr("href", `https://open.spotify.com/track/${user.spotify.track_id}`);
        let spotifyElapsedDurationUpdateInterval;
        async function refreshPresence() {
          const presence = (await fetch("https://api.lanyard.rest/v1/users/878694140525809714").then(_res => _res.json()).catch(() => null))?.data;
          if (!presence) return;
          const spotifyPresence = presence.activities.find(_activity => _activity.name === "Spotify");    
          const totalDuration = spotifyPresence.timestamps.end - spotifyPresence.timestamps.start;
          const getElapsedDuration = () => {
            const elapsedDuration = Date.now() - spotifyPresence.timestamps.start - 1000;
            return elapsedDuration > totalDuration ? totalDuration : elapsedDuration;
          };
          const updateElapsedDuration = () => {
            document.getElementById("spotify-bar").style.width = `${getElapsedDuration() / totalDuration * 100}%`;
          };
          updateElapsedDuration();
          clearInterval(spotifyElapsedDurationUpdateInterval);
          spotifyElapsedDurationUpdateInterval = setInterval(updateElapsedDuration, 1);
  
          if (!user.listening_to_spotify) {
            clearInterval(spotifyElapsedDurationUpdateInterval);
            updateElapsedDuration();
          }
        };
        
        refreshPresence();
        setInterval(refreshPresence, 500);
      } else {
        document.getElementById("spotify-bar").style.width = `0%`;
        $(".music-name").text('Not listening to anything.')
        $(".artist-name").text('Nobody')
        $(".efewipedinannesi").attr("src", `https://ven.earth/_next/image?url=%2F_next%2Fstatic%2Fimage%2Fpublic%2Fimg%2Fsong.3cd77729c14cc9f0c6548e9aacfcf913.webp&w=48&q=75`);
        $('.hreff').attr("href", `#`);
      }
  };


}


