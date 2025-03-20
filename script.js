let mediaRecorder;

let audioBlob;

let audioUrl;

let imageFile;



// ⏺️ تسجيل الصوت

document.getElementById('start-recording').addEventListener('click', async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new RecordRTC(stream, {

            type: 'audio',

            mimeType: 'audio/webm', // استخدام webm لدعم أوسع

        });



        mediaRecorder.startRecording();

        document.getElementById('start-recording').disabled = true;

        document.getElementById('stop-recording').disabled = false;



    } catch (error) {

        console.error("❌ خطأ في تشغيل الميكروفون:", error);

        alert("يرجى السماح بالوصول إلى الميكروفون.");

    }

});



// ⏹️ إيقاف التسجيل

document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder) {

        mediaRecorder.stopRecording(() => {

            audioBlob = mediaRecorder.getBlob();

            audioUrl = URL.createObjectURL(audioBlob);



            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';



            document.getElementById('preview-audio').src = audioUrl;

            document.getElementById('preview-audio').style.display = 'block';

        });

    }



    document.getElementById('start-recording').disabled = false;

    document.getElementById('stop-recording').disabled = true;

});



// 📷 تحميل الصورة

document.getElementById('upload-image').addEventListener('click', () => {

    const imageInput = document.getElementById('image-upload');

    const previewImage = document.getElementById('preview-image');

    const saveButton = document.getElementById('save-to-camera-roll');



    if (imageInput.files.length > 0) {

        imageFile = imageInput.files[0];

        const reader = new FileReader();



        reader.onload = function(event) {

            previewImage.src = event.target.result;

            previewImage.style.display = 'block';

            saveButton.style.display = 'block';

        };



        reader.readAsDataURL(imageFile);

    } else {

        alert("❌ يرجى تحميل صورة.");

    }

});



// 🎥 حفظ الفيديو مع الصوت

document.getElementById('save-to-camera-roll').addEventListener('click', async () => {

    if (!audioBlob || !imageFile) {

        alert("❌ يرجى تسجيل الصوت وتحميل صورة أولًا.");

        return;

    }



    const canvas = document.createElement('canvas');

    const context = canvas.getContext('2d');

    const image = new Image();



    image.src = URL.createObjectURL(imageFile);

    await new Promise((resolve) => (image.onload = resolve));



    canvas.width = image.width;

    canvas.height = image.height;

    context.drawImage(image, 0, 0);



    const stream = canvas.captureStream(30);

    const videoRecorder = new RecordRTC(stream, {

        type: 'video',

        mimeType: 'video/webm', // استخدام webm لضمان دعم واسع

    });



    videoRecorder.startRecording();



    const audio = new Audio(audioUrl);

    audio.play();



    audio.onended = () => {

        videoRecorder.stopRecording(() => {

            const videoBlob = videoRecorder.getBlob();

            const videoUrl = URL.createObjectURL(videoBlob);



            // عرض الفيديو قبل التنزيل

            const previewVideo = document.createElement('video');

            previewVideo.src = videoUrl;

            previewVideo.controls = true;

            previewVideo.style.width = "100%";

            previewVideo.style.marginTop = "10px";

            document.querySelector('.preview-section').appendChild(previewVideo);



            // زر التنزيل

            const downloadButton = document.createElement('a');

            downloadButton.href = videoUrl;

            downloadButton.download = 'eid_greeting_card.mp4';

            downloadButton.textContent = '📥 تنزيل الفيديو';

            downloadButton.style.display = "block";

            downloadButton.style.marginTop = "10px";

            downloadButton.style.background = "#28a745";

            downloadButton.style.color = "white";

            downloadButton.style.padding = "10px";

            downloadButton.style.textAlign = "center";

            downloadButton.style.borderRadius = "5px";

            document.querySelector('.preview-section').appendChild(downloadButton);



            alert("✅ تم إنشاء الفيديو بنجاح!");

        });

    };

});