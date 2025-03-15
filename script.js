let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioUrl;

document.getElementById('start-recording').addEventListener('click', async () => {
    navigator.mediaDevices.getUserMedia({ audio: true })

    .then(stream => {

        console.log("تم تشغيل الميكروفون بنجاح!", stream);

        // يمكنك استخدام `stream` لتسجيل الصوت

    })

    .catch(error => {

        console.error("حدث خطأ أثناء تشغيل الميكروفون:", error);

    });
    
    mediaRecorder.start();
    document.getElementById('start-recording').disabled = true;
    document.getElementById('stop-recording').disabled = false;

    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        audioUrl = URL.createObjectURL(audioBlob);
        document.getElementById('audio').src = audioUrl;
        document.getElementById('audio').style.display = 'block';
        audioChunks = [];
    };
});

document.getElementById('stop-recording').addEventListener('click', () => {
    mediaRecorder.stop();
    document.getElementById('start-recording').disabled = false;
    document.getElementById('stop-recording').disabled = true;
});

document.getElementById('upload-image').addEventListener('click', () => {
    const imageInput = document.getElementById('image-upload');
    const previewImage = document.getElementById('preview-image');
    const previewAudio = document.getElementById('preview-audio');
    const saveButton = document.getElementById('save-to-camera-roll');

    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            previewImage.src = event.target.result;
            previewImage.style.display = 'block';
            previewAudio.src = audioUrl;
            previewAudio.style.display = 'block';
            saveButton.style.display = 'block';
        };

        reader.readAsDataURL(file);
    } else {
        alert("Please upload an image.");
    }
});

document.getElementById('save-to-camera-roll').addEventListener('click', () => {
    if (!audioBlob || !document.getElementById('preview-image').src) {
        alert("Please record audio and upload an image first.");
        return;
    }

    // Create a video from the image and audio
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = new Image();
    
    image.src = document.getElementById('preview-image').src;
    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
        
        // Create a video stream from the canvas
        const stream = canvas.captureStream(30); // 30 FPS
        const mediaRecorder = new MediaRecorder(stream);
        const videoChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            videoChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(videoBlob);
            const a = document.createElement('a');
            a.href = videoUrl;
            a.download = 'eid_greeting_card.webm';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        mediaRecorder.start();
        // Play the audio
        const audio = new Audio(audioUrl);
        audio.play();

        // Stop recording after the audio ends
        audio.onended = () => {
            mediaRecorder.stop();
        };
    };
});