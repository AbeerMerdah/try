let mediaRecorder;

let audioChunks = [];

let audioBlob;

let audioUrl;

let recordedAudio = null;

let isRecording = false; // منع تكرار التسجيل أثناء التسجيل

let isSaving = false; // منع الحفظ المتكرر



// ⏺️ **بدء التسجيل**

document.getElementById('start-recording').addEventListener('click', async () => {

    try {

        if (isRecording) return; // منع التشغيل المتكرر

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

            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            audioUrl = URL.createObjectURL(audioBlob);



            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';

            audioElement.controls = true;



            recordedAudio = new Audio(audioUrl);

            isRecording = false;

        };

    } catch (error) {

        console.error("❌ خطأ في تشغيل الميكروفون:", error);

        alert("❌ يرجى السماح بالوصول إلى الميكروفون من إعدادات الجهاز.");

        isRecording = false;

    }

});



// ⏹️ **إيقاف التسجيل**

document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder && isRecording) {

        mediaRecorder.stop();

        isRecording = false;

    }

    document.getElementById('start-recording').disabled = false;

    document.getElementById('stop-recording').disabled = true;

});



// 📷 **تحميل الصورة**

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



// 🎥 **حفظ الفيديو مع الصوت**

document.getElementById('save-to-camera-roll').addEventListener('click', async () => {

    if (!audioBlob || !document.getElementById('preview-image').src) {

        alert("❌ يرجى تسجيل الصوت وتحميل صورة أولًا.");

        return;

    }



    if (isSaving) return; // منع الحفظ المتكرر

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



            // ✅ **تحويل WebM إلى MP4**

            const finalVideoBlob = await convertWebMToMP4(videoBlob, audioBlob);

            const finalVideoUrl = URL.createObjectURL(finalVideoBlob);



            // 📥 **تحميل الفيديو**

            const a = document.createElement('a');

            a.href = finalVideoUrl;

            a.download = 'eid_greeting_card.mp4';

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);



            alert("🎉 تم حفظ الفيديو مع الصوت بنجاح!");

            isSaving = false;

        };



        // 🎵 **تشغيل الصوت أثناء التسجيل**

        recordedAudio.currentTime = 0;

        recordedAudio.play();

        recordedAudio.onended = () => {

            videoRecorder.stop();

        };



        videoRecorder.start();

    };

});



// 🔄 **تحويل WebM إلى MP4 مع الصوت**

async function convertWebMToMP4(videoBlob, audioBlob) {

    return new Promise(resolve => {

        const videoReader = new FileReader();

        const audioReader = new FileReader();



        videoReader.readAsArrayBuffer(videoBlob);

        audioReader.readAsArrayBuffer(audioBlob);



        videoReader.onload = () => {

            audioReader.onload = () => {

                const videoBuffer = new Uint8Array(videoReader.result);

                const audioBuffer = new Uint8Array(audioReader.result);



                const combinedBuffer = new Uint8Array(videoBuffer.length + audioBuffer.length);

                combinedBuffer.set(videoBuffer, 0);

                combinedBuffer.set(audioBuffer, videoBuffer.length);



                resolve(new Blob([combinedBuffer], { type: 'video/mp4' }));

            };

        };

    });

}

