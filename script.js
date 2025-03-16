let mediaRecorder;

let audioChunks = [];

let audioBlob;

let audioUrl;



document.getElementById('start-recording').addEventListener('click', async () => {

    try {

        console.log("🎤 محاولة الوصول إلى الميكروفون...");

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        console.log("✅ تم تشغيل الميكروفون!");



        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // استخدام تنسيق متوافق

        mediaRecorder.start();



        document.getElementById('start-recording').disabled = true;

        document.getElementById('stop-recording').disabled = false;



        audioChunks = []; // تفريغ أي تسجيلات سابقة

        mediaRecorder.ondataavailable = event => {

            if (event.data.size > 0) {

                audioChunks.push(event.data);

            }

        };



        mediaRecorder.onstop = () => {

            if (audioChunks.length === 0) {

                alert("⚠️ لم يتم تسجيل أي صوت! حاول مرة أخرى.");

                return;

            }



            audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });

            audioUrl = URL.createObjectURL(audioBlob);



            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';

            audioElement.controls = true;

        };

    } catch (error) {

        console.error("❌ خطأ في تشغيل الميكروفون:", error);

        alert("❌ يرجى السماح بالوصول إلى الميكروفون من إعدادات الجهاز.");

    }

});



document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder && mediaRecorder.state !== "inactive") {

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



document.getElementById('save-to-camera-roll').addEventListener('click', () => {

    if (!audioBlob || !document.getElementById('preview-image').src) {

        alert("يرجى تسجيل الصوت وتحميل صورة أولًا.");

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



        const stream = canvas.captureStream(30); // 30 FPS

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });

        const videoChunks = [];



        mediaRecorder.ondataavailable = event => {

            videoChunks.push(event.data);

        };



        mediaRecorder.onstop = () => {

            const videoBlob = new Blob(videoChunks, { type: 'video/mp4' });

            const videoUrl = URL.createObjectURL(videoBlob);

            

            const a = document.createElement('a');

            a.href = videoUrl;

            a.download = 'eid_greeting_card.mp4';

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            

            alert("🎉 تم حفظ الفيديو بنجاح!");

        };



        mediaRecorder.start();

        

        const audio = new Audio(audioUrl);

        audio.play();



        audio.onended = () => {

            mediaRecorder.stop();

        };

    };

});

