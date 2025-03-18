أنا

let mediaRecorder;

let audioChunks = [];

let audioBlob;

let audioUrl;

let recordedAudio = null;

let isRecording = false; // منع تكرار التسجيل

let isSaving = false; // منع حفظ الفيديو أكثر من مرة



// ⏺️ **بدء التسجيل**

document.getElementById('start-recording').addEventListener('click', async () => {

    try {

        if (isRecording) return; // منع تكرار التسجيل أثناء تسجيل آخر

        isRecording = true;



        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);

        audioChunks = [];


        mediaRecorder.start();
        document.getElementById('start-recording').disabled = true;
        document.getElementById('stop-recording').disabled = false;

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioUrl = URL.createObjectURL(audioBlob);

            const audioElement = document.getElementById('audio');
            audioElement.src = audioUrl;
            audioElement.style.display = 'block';
            audioElement.controls = true;

            recordedAudio = new Audio(audioUrl);
            isRecording = false;
            document.getElementById('save-to-camera-roll').style.display = 'block'; // Show save button
        };
    } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Please allow access to the microphone.");
        isRecording = false;
    }
});

// Stop Recording
document.getElementById('stop-recording').addEventListener('click', () => {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
    }
    document.getElementById('start-recording').disabled = false;
    document.getElementById('stop-recording').disabled = true;
});

// Upload Image
document.getElementById('upload-image').addEventListener('click', () => {
    const imageInput = document.getElementById('image-upload');
    const previewImage = document.getElementById('preview-image');
    const saveButton = document.getElementById('save-to-camera-roll');

    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            previewImage.src = event.target.result;
            previewImage.style.display = 'block';
            saveButton.style.display = 'block';
        };

        reader.readAsDataURL(file);
    } else {
        alert("Please upload an image.");
    }
});

// Save Video with Audio
document.getElementById('save-to-camera-roll').addEventListener('click', async () => {
    if (!audioBlob || !document.getElementById('preview-image').src) {
        alert("Please record audio and upload an image first.");
        return;
    }

    if (isSaving) return; // Prevent saving multiple times
    isSaving = true;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = new Image();

    image.src = document.getElementById('preview-image').src;
    image.onload = async () => {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);

        const stream = canvas.captureStream(30);
        const videoRecorder = new MediaRecorder(stream);
        const videoChunks = [];

        videoRecorder.ondataavailable = event => {
            videoChunks.push(event.data);
        };

        videoRecorder.onstop = async () => {
            const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
            const finalVideoUrl = URL.createObjectURL(videoBlob);

            // Download the video
            const a = document.createElement('a');
            a.href = finalVideoUrl;
            a.download = 'eid_greeting_card.webm';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            alert("Video saved successfully!");
            isSaving = false;
        };

        if (!isAudioPlaying) {
            isAudioPlaying = true;
            recordedAudio.currentTime = 0;
            recordedAudio.play();

            recordedAudio.onended = () => {
                videoRecorder.stop();
                isAudioPlaying = false;
            };
        }

        videoRecorder.start();
    };
});