let mediaRecorder;

let audioChunks = [];

let audioBlob;

let audioUrl;

let recordedAudio = null;



// ⏺️ بدء التسجيل

document.getElementById('start-recording').addEventListener('click', async () => {

    try {

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

            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            audioUrl = URL.createObjectURL(audioBlob);



            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';

            audioElement.controls = true;



            recordedAudio = new Audio(audioUrl);

            document.getElementById('save-to-camera-roll').style.display = 'block';

        };

    } catch (error) {

        console.error("حدث خطأ في الميكروفون:", error);

        alert("يرجى السماح بالوصول إلى الميكروفون من إعدادات الجهاز.");

    }

});



// ⏹️ إيقاف التسجيل

document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder) {

        mediaRecorder.stop();

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

        const file = imageInput.files[0];

        const reader = new FileReader();



        reader.onload = function(event) {

            previewImage.src = event.target.result;

            previewImage.style.display = 'block';

            saveButton.style.display = 'block';

        };



        reader.readAsDataURL(file);

    } else {

        alert("يرجى تحميل صورة.");

    }

});



// 🎥 حفظ الفيديو مع الصوت

document.getElementById('save-to-camera-roll').addEventListener('click', () => {

    if (!audioBlob || !document.getElementById('preview-image').src) {

        alert("يرجى تسجيل الصوت وتحميل صورة أولًا.");

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



            // **🛠️ استخدام FFmpeg لدمج الصوت مع الفيديو**

            const mergedVideoBlob = await mergeAudioWithVideo(videoBlob, audioBlob);

            const finalVideoUrl = URL.createObjectURL(mergedVideoBlob);



            // تحميل الفيديو

            const a = document.createElement('a');

            a.href = finalVideoUrl;

            a.download = 'eid_greeting_card.mp4';

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            alert("🎉 تم حفظ الفيديو مع الصوت بنجاح!");

        };



        mediaRecorder.start();

        recordedAudio.play();



        recordedAudio.onended = () => {

            mediaRecorder.stop();

        };

    };

});



// **🛠️ دمج الصوت مع الفيديو باستخدام Web Audio API**

async function mergeAudioWithVideo(videoBlob, audioBlob) {

    const video = document.createElement('video');

    video.src = URL.createObjectURL(videoBlob);

    await video.play();



    const audio = new Audio(URL.createObjectURL(audioBlob));

    await audio.play();



    const combinedStream = new MediaStream([...video.captureStream().getTracks(), ...audio.captureStream().getTracks()]);

    const mediaRecorder = new MediaRecorder(combinedStream);

    const chunks = [];



    return new Promise((resolve) => {

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

        mediaRecorder.onstop = () => {

            const finalBlob = new Blob(chunks, { type: 'video/mp4' });

            resolve(finalBlob);

        };

        mediaRecorder.start();

        setTimeout(() => mediaRecorder.stop(), video.duration * 1000);

    });

}

