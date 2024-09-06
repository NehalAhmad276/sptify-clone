console.log('Java Script');
let songs;
let currentfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

let currentsong = new Audio();
async function getsong(folder) {
    currentfolder = folder;
    let a = await fetch(`http://127.0.01:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
                            <div>
                                <img class="invert" src="img/music.svg" alt="">
                                <div>
                                    <div class="songname">${song.replaceAll("%20", " ")}</div>
                                    <div class="artist">artist</div>
                                </div>
                            </div>
                            <div>
                                <span>Play Now</span>
                                <img class="invert" src="img/songlistplay.svg" alt="">
                            </div>
                        </li>`;
    }

    // attach an event llistner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".songname").innerHTML);
        })
    })
    return songs
}


function playmusic(track, pause = false) {
    currentsong.src = `/${currentfolder}/` + track;
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ").replaceAll(".mp3", " ");
    document.querySelector(".time").innerHTML = "00:00/00:00";

}

async function displayalbnums() {
    let a = await fetch(`http://127.0.01:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchor = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchor)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/".slice(-2))[4];
            // get metadata od folder
            let a = await fetch(`http://127.0.01:3000/songs/${folder}/info.json`)
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card radius">
                        <img src="songs/${folder}/cover.png" alt="">
                        <h2>${response.title}</h2>
                        <h3>${response.description} </h3>
                        <div class="playbutton">
                            <img src="img/play.svg" alt="">
                        </div>
                    </div>`
        }
    }

    // load play list after clicking the card    
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsong(`songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0]);
            document.querySelector(".left").style.left = "0"
        })
    })

}

async function main() {

    await getsong("songs/English");
    playmusic(songs[0], true)

    // display all albums on display
    displayalbnums();

    // add event listner to play button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause();
            play.src = "img/play.svg"
        }
    })

    // add time update enevt
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".time").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    // add event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    })

    // add event listner to hamburger
    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0"
    })

    // add event listner to close button
    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-130%"
    })

    // add event listner to next button
    next.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
        console.log(index);

    })

    // add event listner to previous button
    previous.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
        console.log(index);

    })

    // add event listner to volume
    document.querySelector(".range").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
        if (currentsong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg")
        }
    })
    // add event listner to volume and mute icon
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentsong.volume = .30;
            document.querySelector(".range").value = 30;
        }

    })

}
main()