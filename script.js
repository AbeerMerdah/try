let mediaRecorder;

let audioChunks = [];

let audioBlob;

let audioUrl;

let recordedAudio = null;

let isRecording = false;



// ⏺️ بدء التسجيل

document.getElementById('start-recording').addEventListener('click', async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);

        audioChunks = [];



        mediaRecorder.start();

        isRecording = true;

        document.getElementById('start-recording').disabled = true;

        document.getElementById('stop-recording').disabled = false;



        mediaRecorder.ondataavailable = event => {

            audioChunks.push(event.data);

        };



        mediaRecorder.onstop = () => {

            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            audioUrl = URL.createObjectURL(audioBlob);



            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';



            recordedAudio = new Audio(audioUrl);

            isRecording = false;

        };

    } catch (error) {

        alert("❌ يرجى السماح بالوصول إلى الميكروفون من إعدادات الجهاز.");

        console.error("حدث خطأ:", error);

    }

});



// ⏹️ إيقاف التسجيل

document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder && isRecording) {

        mediaRecorder.stop();

        document.getElementById('start-recording').disabled = false;

        document.getElementById('stop-recording').disabled = true;

    }

});



// 📷 تحميل الصورة

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

        alert("❌ يرجى تحميل صورة.");

    }

});



// 🎥 حفظ الفيديو مع الصوت

document.getElementById('save-to-camera-roll').addEventListener('click', async () => {

    if (!audioBlob || !document.getElementById('preview-image').src) {

        alert("❌ يرجى تسجيل الصوت وتحميل صورة أولًا.");

        return;

    }



    const canvas = document.createElement('canvas');

    const context = canvas.getContext('2d');

    const image = new Image();



    image.src = document.getElementById('preview-image').src;

    image.onload = async () => {

        canvas.width = image.width;

        canvas.height = image.height;

        context.drawImage(image, 0, 0);



        const stream = canvas.captureStream(30);

        const mediaRecorder = new MediaRecorder(stream);

        const videoChunks = [];



        mediaRecorder.ondataavailable = event => {

            videoChunks.push(event.data);

        };



        mediaRecorder.onstop = async () => {

            const videoBlob = new Blob(videoChunks, { type: 'video/webm' });

            const finalVideoUrl = URL.createObjectURL(videoBlob);



            // تحميل الفيديو

            const a = document.createElement('a');

            a.href = finalVideoUrl;

            a.download = 'eid_greeting_card.webm';

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            alert("✅ تم حفظ الفيديو بنجاح!");

        };



        mediaRecorder.start();

        recordedAudio.play();



        recordedAudio.onended = () => {

            mediaRecorder.stop();

        };

    };

});

