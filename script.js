
let mediaRecorder;

let audioChunks = [];

let audioBlob;

let imageFile;



// ⏺️ بدء تسجيل الصوت

document.getElementById('start-recording').addEventListener('click', async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        audioChunks = [];



        mediaRecorder.ondataavailable = event => {

            audioChunks.push(event.data);

        };



        mediaRecorder.start();



        document.getElementById('start-recording').disabled = true;

        document.getElementById('stop-recording').disabled = false;



    } catch (error) {

        console.error("⚠️ خطأ في تشغيل الميكروفون:", error);

        alert("يرجى السماح بالوصول إلى الميكروفون.");

    }

});



// ⏹️ إيقاف تسجيل الصوت

document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder) {

        mediaRecorder.stop();

        mediaRecorder.onstop = () => {

            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            const audioUrl = URL.createObjectURL(audioBlob);



            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';



            const previewAudio = document.getElementById('preview-audio');

            previewAudio.src = audioUrl;

            previewAudio.style.display = 'block';

        };

    }



    document.getElementById('start-recording').disabled = false;

    document.getElementById('stop-recording').disabled = true;

});



// 📷 تحميل الصورة

document.getElementById('upload-image').addEventListener('click', () => {

    const imageInput = document.getElementById('image-upload');

    const previewImage = document.getElementById('preview-image');



    if (imageInput.files.length > 0) {

        imageFile = imageInput.files[0];

        const reader = new FileReader();



        reader.onload = function(event) {

            previewImage.src = event.target.result;

            previewImage.style.display = 'block';

            document.getElementById('save-to-camera-roll').style.display = 'block';

        };



        reader.readAsDataURL(imageFile);

    } else {

        alert("⚠️ يرجى تحميل صورة.");

    }

});



// 🎥 إنشاء الفيديو

document.getElementById('save-to-camera-roll').addEventListener('click', async () => {

    if (!audioBlob || !imageFile) {

        alert("⚠️ يرجى تسجيل الصوت وتحميل صورة أولًا.");

        return;

    }



    const formData = new FormData();

    formData.append('audio', audioBlob, 'audio.webm');

    formData.append('image', imageFile, 'image.png');



    try {

        const response = await fetch('/merge', {

            method: 'POST',

            body: formData,

        });



        if (!response.ok) {

            throw new Error("حدث خطأ أثناء معالجة الفيديو.");

        }



        const videoBlob = await response.blob();

        const videoUrl = URL.createObjectURL(videoBlob);



        // عرض الفيديو

        const previewVideo = document.getElementById('preview-video');

        previewVideo.src = videoUrl;

        previewVideo.style.display = 'block';



        // زر التنزيل

        const downloadButton = document.createElement('a');

        downloadButton.href = videoUrl;

        downloadButton.download = 'eid_greeting_card.mp4';

        downloadButton.textContent = '📥 تنزيل الفيديو';

        downloadButton.style.display = 'block';

        downloadButton.style.background = '#4CAF50';

        downloadButton.style.color = 'white';

        downloadButton.style.padding = '10px';

        downloadButton.style.marginTop = '10px';

        downloadButton.style.textAlign = 'center';

        downloadButton.style.borderRadius = '5px';

        downloadButton.style.textDecoration = 'none';



        document.querySelector('.preview-section').appendChild(downloadButton);



        alert("🎉 تم إنشاء الفيديو بنجاح!");

    } catch (error) {

        console.error("⚠️ خطأ أثناء إنشاء الفيديو:", error);

        alert("حدث خطأ أثناء إنشاء الفيديو. يرجى المحاولة مرة أخرى.");

    }

});

