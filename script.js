let mediaRecorder;

let audioChunks = [];

let audioBlob;

let audioUrl;



document.getElementById('start-recording').addEventListener('click', async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);

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
    } catch (error) {
        console.error("Error accessing media devices.", error);
        alert("Please allow access to the microphone.");
    }
});

document.getElementById('stop-recording').addEventListener('click', () => {
    if (mediaRecorder) {
        mediaRecorder.stop();
    }
    document.getElementById('start-recording').disabled = false;
    document.getElementById('stop-recording').disabled = true;
});

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

document.getElementById('save-to-camera-roll').addEventListener('click', () => {
    if (!audioBlob || !document.getElementById('preview-image').src) {
        alert("Please record audio and upload an image first.");
        return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = new Image();
    
    image.src = document.getElementById('preview-image').src;
    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);

        const stream = canvas.captureStream(30); // Capture the canvas stream
        const audio = new Audio(audioUrl);
        const audioContext = new AudioContext();
        const source = audioContext.createMediaElementSource(audio);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        source.connect(audioContext.destination); // Connect to speakers

        const mediaRecorder = new MediaRecorder(stream);
        const videoChunks = [];

        mediaRecorder.ondataavailable = event => {
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
            alert("Video saved successfully!");
        };

        mediaRecorder.start();
        audio.play();

        audio.onended = () => {
            mediaRecorder.stop();
        };
    };
});