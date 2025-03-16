أنا

let mediaRecorder;

let audioChunks = [];

let audioBlob;

let audioUrl;

let isRecording = false;



document.getElementById('start-recording').addEventListener('click', async () => {

    if (isRecording) return;

    isRecording = true;

    audioChunks = [];



    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });



        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/mp3' }); // استخدام MP3

        mediaRecorder.start();



        document.getElementById('start-recording').disabled = true;

        document.getElementById('stop-recording').disabled = false;



        mediaRecorder.ondataavailable = event => {

            if (event.data.size > 0) {

                audioChunks.push(event.data);

            }

        };



        mediaRecorder.onstop = () => {

            if (audioChunks.length === 0) { 

                alert("⚠️ فشل التسجيل، الرجاء المحاولة مرة أخرى."); 

                return;

            }



            audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });

            audioUrl = URL.createObjectURL(audioBlob);



            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';



            document.getElementById('preview-audio').src = audioUrl;

            document.getElementById('preview-audio').style.display = 'block';



            isRecording = false;

        };



    } catch (error) {

        console.error("❌ خطأ أثناء تشغيل الميكروفون:", error);

        alert("⚠️ تأكد من السماح باستخدام الميكروفون في إعدادات الهاتف.");

        isRecording = false;

    }

});



document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder && isRecording) {

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

        alert("يرجى تحميل صورة.");

    }

});



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



        // 🔹 **إنشاء فيديو من الصورة والصوت معًا**

        const videoStream = canvas.captureStream(30);

        const audioStream = await audioBlob.arrayBuffer();

        const newAudioBlob = new Blob([audioStream], { type: 'audio/mp3' });



        const mediaStream = new MediaStream([...videoStream.getTracks()]);

        const mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/mp4' }); // حفظ بصيغة MP4

        const videoChunks = [];



        mediaRecorder.ondataavailable = event => {

            if (event.data.size > 0) {

                videoChunks.push(event.data);

            }

        };



        mediaRecorder.onstop = async () => {

            const videoBlob = new Blob(videoChunks, { type: 'video/mp4' });

            const finalVideoUrl = URL.createObjectURL(videoBlob);



            const a = document.createElement('a');

            a.href = finalVideoUrl;

            a.download = 'eid_greeting_card.mp4';

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            alert("✅ تم حفظ الفيديو مع الصوت بنجاح!");



            // تشغيل الفيديو بعد الحفظ للتأكد من الصوت

            const videoElement = document.createElement('video');

            videoElement.src = finalVideoUrl;

            videoElement.controls = true;

            document.body.appendChild(videoElement);

        };



        mediaRecorder.start();



        // تشغيل الصوت مع التسجيل

        const audio = new Audio(audioUrl);

        audio.play();



        audio.onended = () => {

            mediaRecorder.stop();

        };

    };

});

