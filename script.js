let mediaRecorder;

let audioChunks = [];

let audioBlob;

let audioUrl;

let recordedAudio = null;

let videoBlob;



// ⏺️ بدء التسجيل

document.getElementById('start-recording').addEventListener('click', async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/mp4' });

        audioChunks = [];



        mediaRecorder.start();

        document.getElementById('start-recording').disabled = true;

        document.getElementById('stop-recording').disabled = false;



        mediaRecorder.ondataavailable = event => {

            audioChunks.push(event.data);

        };



        mediaRecorder.onstop = () => {

            audioBlob = new Blob(audioChunks, { type: 'audio/mp4' });

            audioUrl = URL.createObjectURL(audioBlob);



            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';

            audioElement.controls = true;



            recordedAudio = new Audio(audioUrl);

        };

    } catch (error) {

        console.error("🎤 خطأ في الميكروفون:", error);

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



// 📷 تحميل الصورة وعرضها

document.getElementById('image-upload').addEventListener('change', function () {

    const imageInput = this;

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

document.getElementById('save-to-camera-roll').addEventListener('click', async () => {

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



        // تحويل الصورة إلى فيديو

        const stream = canvas.captureStream(30);

        const videoRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

        const videoChunks = [];



        videoRecorder.ondataavailable = event => {

            videoChunks.push(event.data);

        };



        videoRecorder.onstop = async () => {

            videoBlob = new Blob(videoChunks, { type: 'video/webm' });



            // **🛠️ استخدام FFmpeg.js لدمج الصوت مع الفيديو**

            const finalVideoBlob = await mergeAudioWithVideo(videoBlob, audioBlob);

            const finalVideoUrl = URL.createObjectURL(finalVideoBlob);



            // تحميل الفيديو

            const a = document.createElement('a');

            a.href = finalVideoUrl;

            a.download = 'eid_greeting_card.mp4';

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            alert("🎉 تم حفظ الفيديو مع الصوت بنجاح!");

        };



        videoRecorder.start();

        recordedAudio.play();



        recordedAudio.onended = () => {

            videoRecorder.stop();

        };

    };

});



// **🛠️ دمج الصوت مع الفيديو باستخدام FFmpeg.js**

async function mergeAudioWithVideo(videoBlob, audioBlob) {

    return new Promise(resolve => {

        const worker = new Worker('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.10.0/dist/ffmpeg.min.js');

        

        worker.onmessage = (event) => {

            if (event.data.type === 'done') {

                resolve(new Blob([event.data.data], { type: 'video/mp4' }));

            }

        };



        worker.postMessage({

            type: 'run',

            arguments: [

                '-i', URL.createObjectURL(videoBlob),

                '-i', URL.createObjectURL(audioBlob),

                '-c:v', 'copy',

                '-c:a', 'aac',

                '-strict', 'experimental',

                'output.mp4'

            ]

        });

    });

}

