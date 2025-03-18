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

            audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // استخدام تنسيق متوافق

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



// 📷 تحميل الصورة

document.getElementById('upload-image').addEventListener('change', () => {

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

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

        const videoChunks = [];



        mediaRecorder.ondataavailable = event => {

            videoChunks.push(event.data);

        };



        mediaRecorder.onstop = async () => {

            const videoBlob = new Blob(videoChunks, { type: 'video/webm' });

            const finalVideoBlob = await mergeAudioWithVideo(videoBlob, audioBlob);

            const finalVideoUrl = URL.createObjectURL(finalVideoBlob);



            // تحميل الفيديو

            const a = document.createElement('a');

            a.href = finalVideoUrl;

            a.download = 'eid_greeting_card.webm';

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



// **🛠️ دمج الصوت مع الفيديو**

async function mergeAudioWithVideo(videoBlob, audioBlob) {

    return new Promise(resolve => {

        const audioContext = new AudioContext();

        const videoSource = audioContext.createMediaElementSource(new Audio(URL.createObjectURL(videoBlob)));

        const audioSource = audioContext.createMediaElementSource(new Audio(URL.createObjectURL(audioBlob)));



        const destination = audioContext.createMediaStreamDestination();

        videoSource.connect(destination);

        audioSource.connect(destination);



        const combinedStream = destination.stream;

        const mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });

        const finalChunks = [];



        mediaRecorder.ondataavailable = event => {

            finalChunks.push(event.data);

        };



        mediaRecorder.onstop = () => {

            resolve(new Blob(finalChunks, { type: 'video/webm' }));

        };



        mediaRecorder.start();

        setTimeout(() => mediaRecorder.stop(), 5000); // طول التسجيل

    });

}

