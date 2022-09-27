/*
    1. Render songs
    2. Scroll top
    3. Play / pause / seek
    4. CD rotate
    5. Next / prev
    6. Random
    7. Next / repeat when ended
    8. Active song
    9. Scroll active song into view
    10. Play song when click
    ------------------------- Improve--------------------------------
    11. Nút volume / muted / playbackRate (additional)   DONE 3 FUNCTION
    12. Thumbnail background match with currentsong - done but not blur
    13. small navigation in bottom with control - NOT COMPATIBILE WITH MINI PLAYER
    14. Home page (nice for demo) - NOT COMPATIBILE WITH MINI PLAYER
*/

// khởi tạo các thành phần cần thiết từ trong DOM 
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'Soundcloud_Player'
const playlist = $('.playlist');
const heading = $(`header h2`);
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const repeatBtn = $('.btn-repeat');
const randomBtn = $('.btn-random');
const bodyBackground = $('body');
const background = $('.background-img');
const volumeBtn = $('.btn-volume');
const vlProgress = $('.slide-volume');
const progressVl = $('.volume-slidebar');
const mute = $('.vl-mute');
const vlUp = $('.vl-up');
const titleRender = $('.title-player');
const pbrButton = $('.slide-playback-rate')
const slidePbr = $('.playback-slidebar');
const dashboardMain = $('.dashboard');
const btnPbr =$('.btn-playback-rate')



// Khởi tạo app 
const app = {
    
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isMute: true,
    currentSpeedIdx: 0,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    // Danh sách playlis với chuỗi string (có thể thay thế api thực vào sau này nhưng sẽ fix code lại)
    songs: [ {
        name: 'Cứu Vãn Kịp Không',
        singer: 'Vương Anh Tú',
        path: 'assets/mp3/cvkk.mp3',
        image: 'assets/img/cvkk.jpg' 
    },
    {
        name: 'Em Lấy Chồng',
        singer: 'Khắc Việt, ACV',
        path: 'assets/mp3/elc.mp3',
        image: 'assets/img/elc.jpg'

    },
    {
        name: 'Một Ngàn Nỗi Đau',
        singer: 'Văn Mai Hương',
        path: 'assets/mp3/mnnd.mp3',
        image: 'assets/img/mnnd.jpg'

    },
    {
        name: 'Pháo Hồng',
        singer: 'Đạt Long Vinh',
        path: 'assets/mp3/ph.mp3',
        image: 'assets/img/ph.jfif'

    },
    {
        name: 'Vì Mẹ Anh Bắt Chia Tay',
        singer: 'Miu Lê, Karik, Châu Đăng Khoa',
        path: 'assets/mp3/vmabct.mp3',
        image: 'assets/img/vmabct.jpg'

    }, 
    ],
    setConfig: function(key, value){
       this.config[key] = value;
       //lưu repeat và random vào local_storage để khi refresh sẽ không mất active
       localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config)) 
    },
    render: function(){
        // dùng map để đọc qua từng array trong song
        const htmls = this.songs.map((song , index) => {
            // trong return này sẽ get các DOM Element và nạp vào HTML UI 
            return `
            <div class="song ${index === this.currentIndex ? 'active' :''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.image}') ;">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fa-solid fa-ellipsis"></i>
            </div>
          </div>
          `
        })
        // join cái return thành một HTML hoàn chỉnh
        playlist.innerHTML = htmls.join('');
    },

    // fn này sẽ trả về giá trị của bài hát hiện tại
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        })  
    },

    // fn này xử lý tất cả tác vụ player-onscreen
    handleEvents: function(){
        const _this = this
        const cdWidth = cd.offsetWidth;

        // xử lý cd quay / dừng 
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'},
        ],
            {duration: 5000,
            iterations: Infinity
            })
        cdThumbAnimate.pause()
    
        // xử lý phóng to và thu nhỏ cd
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth

        }
            // xử lý khi click play
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause();
            } else{
                audio.play();
            }
        }

        // when song is playing
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();

        }
        // when song is pause
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Checking timestamp song change and convert time to percent with Math.floor
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent;
            }
        }

        // handle skipping song 
        progress.onchange = function(e){
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        // Nextsong function
        nextBtn.onclick = function(){
            if (_this.isRandom){
                _this.randomSong()
            }
            else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
            
        }
        // Previous track fn
        prevBtn.onclick = function(){
            if (_this.isRandom){
                _this.randomSong()
            }
            else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
        }
        // xử lý công tắc random với toggle
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lý nextsong khi bài hát đã kết thúc (event ended)
        audio.onended = function() {
            if (_this.isRepeat){
                audio.play()
            } else{
                nextBtn.click()
            }
        }

        // Xử lý repeat bài hát hiện tại
        repeatBtn.onclick = function (e){
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)

        }

        // volume function
        audio.volume = 0.4;

        volumeBtn.onclick = function(){
            if(audio.muted){
                audio.muted = false;
                 volumeBtn.classList.remove('playing')
                
            }   else{
                audio.muted = true; 
                volumeBtn.classList.add('playing')
            }
        }
        audio.onvolumechange = function(){
            if(audio.volume >= 0.8){
                alert('Volume increasing almost reached to near loudest: "User considering alert"')
            }
        }

        progressVl.addEventListener('change', function(e){
            audio.volume = e.currentTarget.value / 10
            console.log(audio.volume);
        });
        
        volumeBtn.addEventListener("mouseover", function(){
                
                vlProgress.style.display = "block";
                setTimeout(() => {
                    vlProgress.style.display = "none";  
            }, 5000);
            pbrButton.style.display = "none";
        })

        cdThumb.addEventListener("click", function(){
            vlProgress.style.display = "none";  
            pbrButton.style.display = "none";

        })

        // Playback Rate button and funtion
          slidePbr.addEventListener('change', function(e){
            audio.playbackRate = e.currentTarget.value / 10;
            if(audio.playbackRate <= -.05){
                return audio.playbackRate = -.5;
            }
          })
        
        btnPbr.addEventListener("click", function(){
            pbrButton.style.display = "block";
            vlProgress.style.display = "none";  
            
        });

        // Xử lý click chuột vào các bài hát trong playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
            // xử lý option 
            if (e.target.closest('.song:not(.active)') || e.target.closest('.option'))
            {
                 // xử lý khi click vào song
                if (songNode){

                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    setTimeout(() =>{
                    audio.play()
                    }, 1000)
                }
                if (e.target.closest('option')){
                }
            }
        }
    },

    scrollToActiveSong: function(){
        setTimeout(() => {
        $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        })
        }, 300)
    },


    nextSong: function(){
        this.currentIndex++;
        console.log(Math.max(this.currentIndex))

        if (this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }   

        this.loadCurrentSong()
    },
    prevSong: function(){
        console.log(Math.max(this.currentIndex))
        this.currentIndex--;
        if (this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    },
    randomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length) 
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
        
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`,
        background.style.background = `url('${this.currentSong.image}')`
        background.style.backgroundSize = 'cover';
        titleRender.textContent = this.currentSong.name;
        audio.src = this.currentSong.path

        console.log(heading, cdThumb, audio);
    },



    start: function(){
        // Định nghĩa các thuộc tính cho object
        this.defineProperties();
        // render các playlist
        this.render();
        // lắng nghe và xử lý các sự kiện
        this.handleEvents();
        // tải thông tin bài hát vào UI khi chạy ứng dụng
        this.loadCurrentSong();
        // gán cấu hình từ config vào object (app)
        this.loadConfig();
        // hiển thị trạng thái repeat và random trong trạng thái có active không.        
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start();
