

const Video = {
    run_video_camera: function () {
        let video = document.querySelector("#video");
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video: true})
                .then(function (stream) {
                    video.srcObject = stream;
                })
                .catch(function (err0r) {
                    console.log("Something went wrong!");
                });
        }
        return video
    },

    capture_video: function (video) {
        let canvas = document.querySelector("#canvas");
        canvas.getContext('2d').drawImage(video, 0, 0, 200, 150);
        let image_data_url = canvas.toDataURL('image/jpeg');
        return image_data_url
    }
};

export default Video;